import * as THREE from 'three';
import _ from 'lodash';

import settingsBw from "./settings/bw.json";
import settingsGs from "./settings/greyscale.json";
import settingsSvg from "./settings/svg.json";

import {degree2radian} from '../../../../shared/lib/numeric-utils.js';
import {getUuid} from '../../../../shared/lib/utils.js';
import socketManager from "../../../socket/socketManager"
import toolPathRenderer from './toolPathRenderer';
import toolPathLines2gcode from "./toolPathLines2gcode";

/**
 * 根据限制，重新计算width，height
 * 可以参考jimp的代码
 * todo: 最小值也要限制
 */
const resize = (width, height, ratio, min_width, max_width, min_height, max_height) => {
    //在范围内
    if (width >= min_width && width <= max_width &&
        height >= min_height && height <= max_height) {
        return {width, height}
    }
    //todo: 找个开源项目，看看别人怎么处理的
    if (width < min_width || height < min_height) {
        width = min_width;
        height = width / ratio;
    } else if (width > max_width || height < max_height) {
        width = max_width;
        height = width / ratio;
    }
    return {width, height}
};

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
        this._imgRatio = 1; // 图片原始的比例: width/height
        this._isSelected = false;
        this.settings = null;

        const {min_width, max_width, min_height, max_height} = getSizeRestriction(fileType);
        this.min_width = min_width;
        this.max_width = max_width;
        this.min_height = min_height;
        this.max_height = max_height;

        //tool path
        this.toolPathObj3d = null; //tool path渲染的结果，Object3D
        this.toolPathLines = null; //Array
        this.toolPathId = ""; //每次preview的tool path id

        this.imgObj3d = new THREE.Mesh();//图片渲染的结果，Object3D

        this.edgeObj3d = null; //模型的边界线；选中时候，显示模型的边框线

        this.gcode = null;

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

        //data: {toolPathLines, toolPathId}
        socketManager.on('on-tool-path-generate-laser', (data) => {
            console.timeEnd(this.toolPathId);
            if (this.toolPathId === data.toolPathId) {
                this.loadToolPath(data.toolPathLines)
            }
        });
    }

    //url: 支持svg，raster
    loadImg(url, img_width, img_height) {
        this.url = url;
        this._imgRatio = img_width / img_height;
        const {width, height} = resize(img_width, img_height, this._imgRatio, this.min_width, this.max_width, this.min_height, this.max_height);

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

        this._preview();
    }

    loadToolPath(toolPathLines) {
        this.remove(this.toolPathObj3d);
        this.toolPathLines = toolPathLines;

        this.toolPathObj3d = toolPathRenderer.render(this.toolPathLines);
        this.toolPathObj3d.position.set(0, 100, 0);
        this.add(this.toolPathObj3d);

        this._display('toolPath');
    }

    //obj3d: img, toolPath, edge
    _display(type) {
        switch (type) {
            case "img":
                this.imgObj3d && (this.imgObj3d.visible = true);
                // this.toolPathObj3d && (this.toolPathObj3d.visible = false);
                break;
            case "toolPath":
                // this.imgObj3d && (this.imgObj3d.visible = false);
                this.toolPathObj3d && (this.toolPathObj3d.visible = true);
                break;
            case "edge":
                if (this._isSelected) {
                    this.remove(this.edgeObj3d);
                    const geometry = new THREE.EdgesGeometry(this.imgObj3d.geometry);
                    this.edgeObj3d = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({color: 0xff0000}));
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
        // console.log(key + " -> " + value)
        switch (key) {
            case "img_width":
                this.settings.transformation.children.img_width.default_value = value;
                break;
            case "img_height":
                this.settings.transformation.children.img_height.default_value = value;
                break;
            case "width": {
                const mWidth = value;
                const mHeight = mWidth / this._imgRatio;
                const {width, height} = resize(mWidth, mHeight, this._imgRatio, this.min_width, this.max_width, this.min_height, this.max_height);
                this.settings.transformation.children.width.default_value = width;
                this.settings.transformation.children.height.default_value = height;
                const rotation = this.settings.transformation.children.rotation.default_value;
                this.imgObj3d.geometry = new THREE.PlaneGeometry(width, height).rotateZ(degree2radian(rotation));
                break;
            }
            case "height": {
                const mHeight = value;
                const mWidth = mHeight * this._imgRatio;
                const {width, height} = resize(mWidth, mHeight, this._imgRatio, this.min_width, this.max_width, this.min_height, this.max_height);
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


        this._display("img");
        this._display("edge");

        //todo: setting是否变化，决定preview
        preview && this._preview();
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
        this._preview();
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
    _preview() {
        console.log("preview")
        this.toolPathId = getUuid();
        socketManager.generateGcodeLaser(this.url, this.settings, this.toolPathId, this.fileType)
        console.time(this.toolPathId)
    }

    generateGcode() {
        this.gcode = toolPathLines2gcode(this.toolPathLines, this.settings);
    }

    // clone() {
    //     const instance = super.clone();
    //
    //
    //     instance.fileType = this.fileType; // bw, greyscale, svg, text
    //     instance.url = this.url;
    //     instance._imgRatio = this._imgRatio; // 图片原始的比例: width/height
    //     instance._isSelected = false;
    //     instance.settings = this.settings;
    //
    //     instance.min_width = this.min_width;
    //     instance.max_width = this.max_width;
    //     instance.min_height = this.min_height;
    //     instance.max_height = this.max_height;
    //
    //     //tool path
    //     instance.toolPathId = ""; //每次preview的tool path id
    //
    //     instance.gcode = null;
    //
    //     return instance;
    //
    // }

    clone() {
        const instance = new Model2D(this.fileType);

        const url = this.url;
        const img_width = this.settings.transformation.children.img_width.default_value;
        const img_height = this.settings.transformation.children.img_height.default_value;

        instance.loadImg(url, img_width, img_height)

        return instance;
    }
}

export default Model2D;
