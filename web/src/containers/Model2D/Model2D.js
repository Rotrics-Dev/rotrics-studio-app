import * as THREE from 'three';
import _ from 'lodash';

import configBW from "./settings/config/bw.json";
import configGS from "./settings/config/greyscale.json";
import configSvg from "./settings/config/svg.json";
import configText from "./settings/config/text.json";
import transformation from "./settings/transformation.json";
import working_parameters from "./settings/working_parameters.json";

import {degree2radian, getUuid} from '../../utils/index.js';
import socketClientManager from "../../socket/socketClientManager"
import toolPathRenderer from './toolPath/toolPathRenderer';
import toolPathLines2gcode from "./toolPath/toolPathLines2gcode";

import {TOOL_PATH_GENERATE_LASER} from "../../constants.js"

/**
 * Model2D is container，always keep rotation=0, scale=1; position will changed
 * Model2D has 3 children：toolPathObj3d，imgObj3d，edgeObj3d
 * remove(null) can work：https://github.com/mrdoob/three.js/blob/master/src/core/Object3D.js
 */
class Model2D extends THREE.Group {
    /**
     * @param fileType: bw, greyscale, svg, text
     */
    constructor(fileType) {
        super();
        this.fileType = fileType;

        this._isSelected = false;
        //tool path
        this.toolPathObj3d = null; //tool path渲染的结果，Object3D
        this.toolPathLines = null; //Array
        this.toolPathId = ""; //每次preview的tool path id

        this.imgObj3d = new THREE.Mesh();//图片渲染的结果，Object3D
        this.edgeObj3d = null; //模型的边界线；选中时候，显示模型的边框线
        this.isPreviewed = false;

        this.config = null;
        this.transformation = transformation;
        this.working_parameters = working_parameters;
        switch (fileType) {
            case "bw":
                this.config = _.cloneDeep(configBW);
                break;
            case "greyscale":
                this.config = _.cloneDeep(configGS);
                break;
            case "svg":
                this.config = _.cloneDeep(configSvg);
                break;
            case "text":
                this.config = _.cloneDeep(configText);
                break;
        }

        //data: {toolPathLines, toolPathId}
        socketClientManager.addServerListener(TOOL_PATH_GENERATE_LASER, (data) => {
            if (this.toolPathId === data.toolPathId) {
                this._loadToolPath(data.toolPathLines);
                this.isPreviewed = true;
                this.dispatchEvent({type: 'preview', data: {isPreviewed: this.isPreviewed}});
            }
        });
    }

    /**
     * @param url
     * @param width
     * @param height
     */
    loadImg(url, width, height) {
        //TODO: resize image
        const loader = new THREE.TextureLoader();
        const texture = loader.load(url);

        //PlaneGeometry is Geometry: https://github.com/mrdoob/three.js/blob/master/src/geometries/PlaneGeometry.js
        this.imgObj3d.geometry = new THREE.PlaneGeometry(width, height);
        this.imgObj3d.material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 1,
            map: texture,
            side: THREE.DoubleSide
        });
        this.add(this.imgObj3d);

        this.transformation.children.img_width.default_value = width;
        this.transformation.children.img_height.default_value = height;
        this.transformation.children.width.default_value = width;
        this.transformation.children.height.default_value = width;
        this.transformation.children.rotation.default_value = 0;

        this._display('img');
        this._display('edge');
    }

    _loadToolPath(toolPathLines) {
        this.remove(this.toolPathObj3d);
        this.toolPathLines = toolPathLines;
        this.toolPathObj3d = toolPathRenderer.render(this.toolPathLines);
        // this.toolPathObj3d.position.set(0, 100, 0);
        this.add(this.toolPathObj3d);
        this._display('toolPath');
    }

    //obj3d: img, toolPath, edge
    _display(type) {
        switch (type) {
            case "img":
                this.imgObj3d && (this.imgObj3d.visible = true);
                this.toolPathObj3d && (this.toolPathObj3d.visible = false);
                break;
            case "toolPath":
                this.imgObj3d && (this.imgObj3d.visible = false);
                this.toolPathObj3d && (this.toolPathObj3d.visible = true);
                break;
            case "edge":
                if (this._isSelected) {
                    this.remove(this.edgeObj3d);
                    const geometry = new THREE.EdgesGeometry(this.imgObj3d.geometry);
                    const color = 0x007700;
                    this.edgeObj3d = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({color: color}));
                    this.add(this.edgeObj3d);
                } else {
                    this.edgeObj3d && (this.edgeObj3d.visible = false);
                }
                break;
        }
    }

    //todo: 增加返回值，是否有修改
    //修改model2d，并修改settings
    updateTransformation(key, value, preview) {
        switch (key) {
            case "width": {
                const width = value;
                const height = this.transformation.img_height.default_value * (width / this.transformation.img_width.default_value);
                this.transformation.children.width.default_value = width;
                this.transformation.children.height.default_value = height;
                this.imgObj3d.geometry = new THREE.PlaneGeometry(width, height).rotateZ(degree2radian(this.transformation.children.rotation.default_value));
                break;
            }
            case "height": {
                const height = value;
                const width = this.transformation.img_width.default_value * (height / this.transformation.img_height.default_value);
                this.transformation.children.width.default_value = width;
                this.transformation.children.height.default_value = height;
                this.imgObj3d.geometry = new THREE.PlaneGeometry(width, height).rotateZ(degree2radian(this.transformation.children.rotation.default_value));
                break;
            }
            case "rotation": {
                const width = this.transformation.children.width.default_value;
                const height = this.transformation.children.height.default_value;
                this.imgObj3d.geometry = new THREE.PlaneGeometry(width, height).rotateZ(degree2radian(value));
                this.transformation.children.rotation.default_value = value;
                break;
            }
            case "x":
                this.position.x = value;
                this.transformation.children.x.default_value = value;
                break;
            case "y":
                this.position.y = value;
                this.transformation.children.y.default_value = value;
                break;
            case "flip_model":
                this.transformation.children.flip_model.default_value = value;
                break;
        }

        this._display("edge");

        //todo: setting是否变化，决定preview
        if (preview) {
            this._display("img");
            this.preview();
        }
    }

    updateConfig(key, value) {
        //fill.fill_density
        if (key.indexOf(".") !== -1) {
            const arr = key.split(".");
            const keyParent = arr[0];
            const keyChild = arr[1];
            this.config.children[keyParent].children[keyChild].default_value = value;
        } else {
            this.config.children[key].default_value = value;
        }

        //todo: config是否变化，决定preview
        this.preview();
    }

    updateWorkingParameters(key, value) {
        //multi_pass.passes
        //multi_pass.pass_depth
        //fixed_power.power
        if (key.indexOf(".") !== -1) {
            const arr = key.split(".");
            const keyParent = arr[0];
            const keyChild = arr[1];
            this.working_parameters.children[keyParent].children[keyChild].default_value = value;
            return;
        }
        this.working_parameters.children[key].default_value = value;
    }

    //todo: 使用controls替换
    setSelected(isSelected) {
        this._isSelected = isSelected;
        this._display("edge");
    }

    //生成tool path
    preview() {
        this.toolPathId = getUuid();
        socketClientManager.emitToServer(TOOL_PATH_GENERATE_LASER, {
            url: this.url,
            fileType: this.fileType,
            toolPathId: this.toolPathId,
            settings: {
                config: this.config,
                transformation: this.transformation,
                working_parameters: this.working_parameters
            }
        });
        this.isPreviewed = false;
        this.dispatchEvent({type: 'preview', data: {isPreviewed: this.isPreviewed}});
    }

    generateGcode() {
        const settings = {
            config: this.config,
            transformation: this.transformation,
            working_parameters: this.working_parameters
        };
        return toolPathLines2gcode(this.toolPathLines, settings);
    }
}

export default Model2D;
