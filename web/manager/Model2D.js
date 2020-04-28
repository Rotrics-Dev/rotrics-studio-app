import * as THREE from 'three';
import _ from 'lodash';
import bwSettings from "./laser_settings_bw.json";
import greyscaleSettings from "./laser_settings_greyscale.json";
import vectorSettings from "./laser_settings_vector.json";
import txtSettings from "./laser_settings_txt.json";
import {degree2radian} from '../lib/numeric-utils';
import {getUuid} from '../lib/utils';
import socketManager from "../socket/socketManager"
import toolPathRenderer from './toolPathRenderer';

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
            settings = bwSettings;
            break;
        case "greyscale":
            settings = greyscaleSettings;
            break;
        case "vector":
            settings = vectorSettings;
            break;
        case "txt":
            settings = txtSettings;
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
 * Model2D作为容器，一直保持：rotation=0, scale=1
 */
class Model2D extends THREE.Mesh {
    constructor(fileType) {
        super();
        this.fileType = fileType; // bw, greyscale, vector, text
        this.url = "";
        this.imageRatio = 1; // 图片原始的比例: width/height
        this._isSelected = false;
        this.edgesLine = null;// 模型selected状态下的边框线
        this.settings = null;

        const {min_width, max_width, min_height, max_height} = getSizeRestriction(fileType);
        this.min_width = min_width;
        this.max_width = max_width;
        this.min_height = min_height;
        this.max_height = max_height;

        this.toolPathId = "";

        this.toolPathObj3d = null;

        //data: {toolPathLines, toolPathId}
        socketManager.on('on-gcode-generate-laser-bw', (data) => {
            if (this.toolPathId === data.toolPathId) {
                const {toolPathLines} = data;
                this.toolPathObj3d && this.remove(this.toolPathObj3d);
                this.toolPathObj3d = toolPathRenderer.render(toolPathLines);
                this.toolPathObj3d.position.set(100, 0, 0);
                this.add(this.toolPathObj3d)
            }
        });
    }

    loadImage(url, mWidth, mHeight) {
        this.url = url;
        this.imageRatio = mWidth / mHeight;
        const {width, height} = resize(mWidth, mHeight, this.imageRatio, this.min_width, this.max_width, this.min_height, this.max_height);
        const loader = new THREE.TextureLoader();
        // loader.setCrossOrigin("anonymous");
        const texture = loader.load(url);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 1,
            map: texture,
            side: THREE.DoubleSide
        });

        this.geometry = new THREE.PlaneGeometry(width, height); //PlaneGeometry is Geometry: https://github.com/mrdoob/three.js/blob/master/src/geometries/PlaneGeometry.js
        this.material = material;
        this._initSettings(width, height);
        this._preview();
    }

    //必须等loadImage，并resize后再设置
    _initSettings(width, height) {
        //需要deep clone
        switch (this.fileType) {
            case "bw":
                this.settings = _.cloneDeep(bwSettings);
                break;
            case "greyscale":
                this.settings = _.cloneDeep(greyscaleSettings);
                break;
            case "vector":
                this.settings = _.cloneDeep(vectorSettings);
                break;
            case "txt":
                this.settings = _.cloneDeep(txtSettings);
                break;
        }
        this.settings.transformation.children.width.default_value = width;
        this.settings.transformation.children.height.default_value = height;
    }

    //todo: 增加返回值，是否有修改
    //修改model2d，并修改settings
    updateTransformation(key, value) {
        console.log(key + "-->" + value);
        switch (key) {
            case "width": {
                const mWidth = value;
                const mHeight = mWidth / this.imageRatio;
                const {width, height} = resize(mWidth, mHeight, this.imageRatio, this.min_width, this.max_width, this.min_height, this.max_height);
                this.settings.transformation.children.width.default_value = width;
                this.settings.transformation.children.height.default_value = height;
                this.geometry = new THREE.PlaneGeometry(width, height);
                this._updateEdges();
                break;
            }
            case "height": {
                const mHeight = value;
                const mWidth = mHeight * this.imageRatio;
                const {width, height} = resize(mWidth, mHeight, this.imageRatio, this.min_width, this.max_width, this.min_height, this.max_height);
                this.settings.transformation.children.width.default_value = width;
                this.settings.transformation.children.height.default_value = height;
                this.geometry = new THREE.PlaneGeometry(width, height);
                this._updateEdges();
                break;
            }
            case "rotate":
            {
                //todo: 从其他地方获取width，height
                const width = this.settings.transformation.children.width.default_value;
                const height = this.settings.transformation.children.height.default_value;
                //rotate unit is degree
                this.geometry = new THREE.PlaneGeometry(width, height).rotateZ(degree2radian(value));
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
        //todo: setting是否变化，决定preview
        this._preview();
    }

    updateConfig(key, value) {
        console.log(key + "-->" + value);
        this.settings.config.children[key].default_value = value;

        //todo: config是否变化，决定preview
        this._preview();
    }

    updateWorkingParameters(key, value) {
        console.log(key + "-->" + value);
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
        if (!this.edgesLine) {
            const edges = new THREE.EdgesGeometry(this.geometry);
            this.edgesLine = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({color: 0xff0000}));
            this.add(this.edgesLine)
        }
    }

    _updateEdges() {
        this.edgesLine.geometry = new THREE.EdgesGeometry(this.geometry)
    }

    //生成tool path
    _preview() {
        this.toolPathId = getUuid();
        socketManager.generateGcodeLaser(this.url, this.settings, this.toolPathId)
    }
}

export default Model2D;
