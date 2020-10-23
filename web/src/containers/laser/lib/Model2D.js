import * as THREE from 'three';
import _ from 'lodash';

import settingsBw from "./settings/bw.json";
import settingsGs from "./settings/greyscale.json";
import settingsSvg from "./settings/svg.json";
import config_text from "./settings/config_text.json";

import {degree2radian, getUuid, getAvailableSize} from '../../../utils/index.js';
import socketClientManager from "../../../socket/socketClientManager"
import toolPathRenderer from './toolPathRenderer';
import toolPathLines2gcode from "./toolPathLines2gcode";

import {TOOL_PATH_GENERATE_LASER} from "../../../constants.js"
import inWorkArea2D from "../../../utils/inWorkArea2D";
import {FRONT_END, getLimit} from "../../../utils/workAreaUtils";

const getSizeRestriction = (fileType) => {
    let settings = null;
    switch (fileType) {
        case "bw":
            settings = settingsBw;
            break;
        case "greyscale":
            settings = settingsGs;
            break;
        case "svg":
        case "text":
            settings = settingsSvg;
            break;
    }
    const children = settings.transformation.children;
    const min_width = children.width.minimum_value;
    const max_width = children.width.maximum_value;
    const min_height = children.height.minimum_value;
    const max_height = children.height.maximum_value;
    return {min_width, max_width, min_height, max_height}
};

/**
 * Model2D作为容器，一直保持：rotation=0, scale=1, position会变化
 * 三个child：toolPathObj3d，imgObj3d，edgeObj3d
 * remove(null)是OK的：https://github.com/mrdoob/three.js/blob/master/src/core/Object3D.js
 */
class Model2D extends THREE.Group {
    constructor(fileType) {
        super();
        this.fileType = fileType; // bw, greyscale, svg, text
        this.url = "";
        //图片原始的size
        this.img_width = 1;
        this.img_height = 1;
        this._isSelected = false;
        this.settings = null;

        this.sizeRestriction = getSizeRestriction(fileType);

        //tool path
        this.toolPathObj3d = null; //tool path渲染的结果，Object3D
        this.toolPathLines = null; //Array
        this.toolPathId = ""; //每次preview的tool path id

        this.imgObj3d = new THREE.Mesh();//图片渲染的结果，Object3D

        this.edgeObj3d = null; //模型的边界线；选中时候，显示模型的边框线

        this.isPreviewed = false;
        this.inWorkArea = true;
        //需要deep clone
        switch (this.fileType) {
            case "bw":
                this.settings = _.cloneDeep(settingsBw);
                break;
            case "greyscale":
                this.settings = _.cloneDeep(settingsGs);
                break;
            case "svg":
            case "text":
                this.settings = _.cloneDeep(settingsSvg);
                break;
        }

        if (this.fileType === "text") {
            this.config_text = _.cloneDeep(config_text);
        }

        //data: {toolPathLines, toolPathId}
        socketClientManager.addServerListener(TOOL_PATH_GENERATE_LASER, (data) => {
            // console.timeEnd(this.toolPathId);
            if (this.toolPathId === data.toolPathId) {
                this.loadToolPath(data.toolPathLines);
                this.isPreviewed = true;
                this.dispatchEvent({type: 'preview', data: {isPreviewed: this.isPreviewed}});
            }
        });
        this.position.y = this.settings.transformation.children.y.default_value;//获取默认threeObj的位置
    }

    //url: 支持svg，raster
    loadImg(url, img_width, img_height) {
        this.url = url;
        this.img_width = img_width;
        this.img_height = img_height;

        const {width, height} = getAvailableSize(img_width, img_height, this.sizeRestriction);

        // loader.setCrossOrigin("anonymous");
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

        //reset transformation的部分配置
        this.settings.transformation.children.img_width.default_value = img_width;
        this.settings.transformation.children.img_height.default_value = img_height;

        this.settings.transformation.children.width.default_value = width;
        this.settings.transformation.children.height.default_value = height;

        this.settings.transformation.children.rotation.default_value = 0;

        this._display('img');
        this._display('edge');
    }

    loadToolPath(toolPathLines) {
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
                    const color = this.inWorkArea ? 0x007700 : 0xFF0000;
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
    updateTransformation(key, value, preview, workHeight) {
        switch (key) {
            case "width": {
                const mWidth = value;
                const mHeight = this.img_height * (mWidth / this.img_width);
                const {width, height} = getAvailableSize(mWidth, mHeight, this.sizeRestriction);

                this.settings.transformation.children.width.default_value = width;
                this.settings.transformation.children.height.default_value = height;
                const rotation = this.settings.transformation.children.rotation.default_value;
                this.imgObj3d.geometry = new THREE.PlaneGeometry(width, height).rotateZ(degree2radian(rotation));
                break;
            }
            case "height": {
                const mHeight = value;
                const mWidth = this.img_width * (mHeight / this.img_height);
                const {width, height} = getAvailableSize(mWidth, mHeight, this.sizeRestriction);

                this.settings.transformation.children.width.default_value = width;
                this.settings.transformation.children.height.default_value = height;
                const rotation = this.settings.transformation.children.rotation.default_value;
                this.imgObj3d.geometry = new THREE.PlaneGeometry(width, height).rotateZ(degree2radian(rotation));
                break;
            }
            case "rotation": {
                const width = this.settings.transformation.children.width.default_value;
                const height = this.settings.transformation.children.height.default_value;
                //rotation unit is degree
                this.imgObj3d.geometry = new THREE.PlaneGeometry(width, height).rotateZ(degree2radian(value));
                this.settings.transformation.children[key].default_value = value;
                break;
            }
            case "x":
                this.position.x = value;
                this.settings.transformation.children[key].default_value = value;
                break;
            case "y":
                this.position.y = value;
                this.settings.transformation.children[key].default_value = value;
                break;
            case "flip_model":
                this.settings.transformation.children[key].default_value = value;
                break;
        }

        const {outerRadius, innerRadius} = getLimit(workHeight, FRONT_END.LASER)

        this.inWorkArea = inWorkArea2D(
            innerRadius, outerRadius,
            this.position.x, this.position.y,
            this.settings.transformation.children.width.default_value,
            this.settings.transformation.children.height.default_value,
            this.settings.transformation.children.rotation.default_value
        );


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
            this.settings.config.children[keyParent].children[keyChild].default_value = value;
        } else {
            this.settings.config.children[key].default_value = value;
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
            this.settings.working_parameters.children[keyParent].children[keyChild].default_value = value;
            return;
        }
        this.settings.working_parameters.children[key].default_value = value;
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
            settings: this.settings,
            toolPathId: this.toolPathId,
            fileType: this.fileType
        });
        console.time(this.toolPathId);

        this.isPreviewed = false;
        this.dispatchEvent({type: 'preview', data: {isPreviewed: this.isPreviewed}});
    }

    generateGcode() {
        return toolPathLines2gcode(this.toolPathLines, this.settings);
    }

    clone() {
        const instance = new Model2D(this.fileType);

        const url = this.url;
        const img_width = this.settings.transformation.children.img_width.default_value;
        const img_height = this.settings.transformation.children.img_height.default_value;

        instance.loadImg(url, img_width, img_height);

        return instance;
    }
}

export default Model2D;
