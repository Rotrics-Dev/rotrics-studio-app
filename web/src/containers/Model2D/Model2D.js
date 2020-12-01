import * as THREE from 'three';
import _ from 'lodash';
import configBW from "./settings/config/bw.json";
import configGS from "./settings/config/greyscale.json";
import configSvg from "./settings/config/svg.json";
import configText from "./settings/config/text.json";
import transformation from "./settings/transformation.json";
import working_parameters_laser from "./settings/working_parameters_laser.json";
import working_parameters_laser_greyscale_dot from "./settings/working_parameters_laser_greyscale_dot.json";
import working_parameters_write_draw from "./settings/working_parameters_write_draw.json";
import socketClientManager from "../../socket/socketClientManager"
import toolPathRenderer from './toolPath/toolPathRenderer';
import toolPathLines2gcode4laser from "./toolPath/toolPathLines2gcode4laser";
import toolPathLines2gcode4writeDraw from "./toolPath/toolPathLines2gcode4writeDraw";
import {degree2radian, getUuid} from '../../utils/index.js';
import {TOOL_PATH_GENERATE_LASER} from "../../constants.js"
import {generateSvg2, uploadImage} from "../../api";

/**
 * Model2D is a container，always keep rotation=0, scale=1, but position will be changed
 * Model2D has 3 children：toolPathObj3d，imgObj3d，edgeObj3d
 * remove(null/undefined) can work：https://github.com/mrdoob/three.js/blob/master/src/core/Object3D.js
 */
class Model2D extends THREE.Group {
    /**
     * @param fileType: bw, greyscale, svg, text
     * @param front_end: laser, write_draw
     * @param file: null when fileType=text; not null if fileType in [bw, greyscale, svg]
     */
    constructor(fileType, front_end, file) {
        super();

        this.fileType = fileType;
        this.front_end = front_end;
        this.file = file;

        this.url = null;

        this._isSelected = false;

        this.toolPathObj3d = null;
        this.toolPathLines = null; // Array
        this.toolPathId = ""; // preview tool path id

        this.imgObj3d = new THREE.Mesh();
        this.edgeObj3d = null; // edge line of model; show when model is selected

        this.transformation = transformation;

        this.working_parameters = null;
        switch (front_end) {
            case "laser":
                this.working_parameters = _.cloneDeep(working_parameters_laser);
                break;
            case "write_draw":
                this.working_parameters = _.cloneDeep(working_parameters_write_draw);
                break;
        }

        this.config = null;
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

        socketClientManager.addServerListener(TOOL_PATH_GENERATE_LASER, ({toolPathLines, toolPathId}) => {
            if (this.toolPathId === toolPathId) {
                this.remove(this.toolPathObj3d);
                this.toolPathLines = toolPathLines;

                if (this.config.children.movement_mode && this.config.children.movement_mode.default_value === "greyscale-dot") {
                    this.toolPathObj3d = toolPathRenderer.renderToPoints(this.toolPathLines);
                } else {
                    this.toolPathObj3d = toolPathRenderer.renderToLine(this.toolPathLines);
                }

                // this.toolPathObj3d.position.set(0, 100, 0);
                this.add(this.toolPathObj3d);
                this._display('toolPath');
                this.dispatchEvent({type: 'preview', data: {isPreviewed: true}});
            }
        });
    }

    // add return value to mark success/failed
    async init() {
        if (this.fileType == "text") {
            const text = configText.children.text.default_value;
            const font = configText.children.font.default_value;
            const font_size = configText.children.font_size.default_value;
            const svg = await generateSvg2(text, font, font_size);
            const blob = new Blob([svg], {type: 'text/plain'});
            this.file = new File([blob], null);
        }

        // width, height: image size of pixel
        const response = await uploadImage(this.file);
        const {url, width, height} = response;

        this.url = url;
        this.transformation.children.width_pixel.default_value = width;
        this.transformation.children.height_pixel.default_value = height;
        this.transformation.children.width_mm.default_value = width;
        this.transformation.children.height_mm.default_value = height;
        this.transformation.children.rotation.default_value = 0;

        this.imgObj3d.geometry = new THREE.PlaneGeometry(width, height);
        this.imgObj3d.material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            map: new THREE.TextureLoader().load(url)
        });
        this.add(this.imgObj3d);

        this._display('img');
        this._display('edge');
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

    //todo: add return value to mark whether changed
    updateTransformation(key, value, preview) {
        console.log("updateTransformation: ", key, value, preview)

        switch (key) {
            case "width_mm":
                if (this.transformation.children.width_mm.default_value === value) {
                    return false;
                }
                break;
            case "height_mm":
                if (this.transformation.children.height_mm.default_value === value) {
                    return false;
                }
                break;
            case "rotation":
                if (this.transformation.children.rotation.default_value === value) {
                    return false;
                }
                break;
            case "x":
                if (this.transformation.children.x.default_value === value) {
                    return false;
                }
                break;
            case "y":
                if (this.transformation.children.y.default_value === value) {
                    return false;
                }
                break;
            case "flip_model":
                if (this.transformation.children.flip_model.default_value === value) {
                    return false;
                }
                break;
        }

        switch (key) {
            case "width_mm": {
                const width = value;
                const height = this.transformation.children.height_pixel.default_value * (width / this.transformation.children.width_pixel.default_value);
                this.transformation.children.width_mm.default_value = width;
                this.transformation.children.height_mm.default_value = height;
                this.imgObj3d.geometry = new THREE.PlaneGeometry(width, height).rotateZ(degree2radian(this.transformation.children.rotation.default_value));
                break;
            }
            case "height_mm": {
                const height = value;
                const width = this.transformation.children.width_pixel.default_value * (height / this.transformation.children.height_pixel.default_value);
                this.transformation.children.width_mm.default_value = width;
                this.transformation.children.height_mm.default_value = height;
                this.imgObj3d.geometry = new THREE.PlaneGeometry(width, height).rotateZ(degree2radian(this.transformation.children.rotation.default_value));
                break;
            }
            case "rotation": {
                const width = this.transformation.children.width_mm.default_value;
                const height = this.transformation.children.height_mm.default_value;
                this.imgObj3d.geometry = new THREE.PlaneGeometry(width, height).rotateZ(degree2radian(value));
                this.transformation.children.rotation.default_value = value;
                break;
            }
            case "x":
                // no need to preview
                this.position.x = value;
                this.transformation.children.x.default_value = value;
                return false;
            case "y":
                // no need to preview
                this.position.y = value;
                this.transformation.children.y.default_value = value;
                return false;
            case "flip_model":
                this.transformation.children.flip_model.default_value = value;
                break;
        }

        this.toolPathLines = null;
        this._display("edge");

        //todo: setting是否变化，决定preview
        if (preview) {
            this._display("img");
            this.preview();
        }

        console.log("#preview")

        return true;
    }


    async updateConfig(key, value) {
        console.log("updateConfig: ", key, value)
        switch (this.fileType) {
            case "greyscale":
                if (key === 'movement_mode' && value === 'greyscale-dot') {
                    this.working_parameters = _.cloneDeep(working_parameters_laser_greyscale_dot);
                } else {
                    this.working_parameters = _.cloneDeep(working_parameters_laser);
                }
                break;
            case "text":
                if (["font", "font_size", "text"].includes(key)) {
                    this.config.children[key].default_value = value;
                    const text = this.config.children.text.default_value;
                    const font = this.config.children.font.default_value;
                    const font_size = this.config.children.font_size.default_value;
                    const svg = await generateSvg2(text, font, font_size);
                    const blob = new Blob([svg], {type: 'text/plain'});
                    this.file = new File([blob], null);

                    // width, height: image size of pixel
                    const response = await uploadImage(this.file);
                    const {url, width, height} = response;

                    this.url = url;
                    this.transformation.children.width_pixel.default_value = width;
                    this.transformation.children.height_pixel.default_value = height;
                    this.transformation.children.width_mm.default_value = width;
                    this.transformation.children.height_mm.default_value = height;
                    this.transformation.children.rotation.default_value = 0;

                    this.imgObj3d.geometry = new THREE.PlaneGeometry(width, height);
                    this.imgObj3d.material = new THREE.MeshBasicMaterial({
                        color: 0xffffff,
                        transparent: true,
                        map: new THREE.TextureLoader().load(url)
                    });
                    this.add(this.imgObj3d);

                    this._display('img');
                    this._display('edge');
                }
                break;
        }

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
        console.log("updateWorkingParameters: ", key, value)

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

    //todo: put edge in controls
    setSelected(isSelected) {
        this._isSelected = isSelected;
        this._display("edge");
    }

    preview() {
        this.toolPathId = getUuid();
        this.dispatchEvent({type: 'preview', data: {isPreviewed: false}});
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
    }

    generateGcode() {
        const settings = {
            config: this.config,
            transformation: this.transformation,
            working_parameters: this.working_parameters
        };
        switch (this.front_end) {
            case "laser":
                return toolPathLines2gcode4laser(this.toolPathLines, settings);
            case "write_draw":
                return toolPathLines2gcode4writeDraw(this.toolPathLines, settings);
        }
        return null;
    }
}

export default Model2D;
