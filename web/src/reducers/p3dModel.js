import * as THREE from 'three';
import _ from 'lodash';
import File3dToBufferGeometryWorker from '../containers/p3d/lib/File3dToBufferGeometry.worker';
import Model3D from "../containers/p3d/lib/Model3D";
import ModelExporter from "../containers/p3d/lib/ModelExporter";
import {uploadFile} from "../api";
import {getUuid} from "../utils";
import socketClientManager from "../socket/socketClientManager";
import {P3D_SLICE_START, P3D_SLICE_STATUS} from "../constants";
import gcodeBufferGeometryToObj3d from "../containers/p3d/lib/GcodeToBufferGeometry/gcodeBufferGeometryToObj3d";
import GcodeToBufferGeometryWorker from '../containers/p3d/lib/GcodeToBufferGeometry.worker';
import messageI18n from "../utils/messageI18n";

const ACTION_UPDATE_STATE = 'p3dModel/ACTION_UPDATE_STATE';

const INITIAL_STATE = {
    rendererParent4model: null,
    model: null,
    boundingBox: null,
    filePath: null,
    modelCount: 0,
    transformation: null,
    //gcode
    gcodeObj3d: null,
    layerCount: 0, //gcode渲染后，一共多少层
    layerCountVisible: 0, //当前显示的多少层gcode line
    lineTypeVisibility: null, //gcode渲染后，不同type的visibility
    bounds: null,
    //slice progress or load model progress
    progress: 0,
    //slice result: {gcodeFileName, printTime, filamentLength, filamentWeight, gcodeFilePath}
    gcodeFileName: null,
    printTime: 0,
    filamentLength: 0,
    filamentWeight: 0,
    gcodeFilePath: null,
    gcodeUrl: null
};

const gcodeRenderingWorker = new GcodeToBufferGeometryWorker();

let rendererParent4gcode = null;

const _computeAvailableXZ = (rendererParent4model, model) => {
    const _isBox3IntersectOthers = (box3, box3Arr) => {
        // check intersect with other box3
        for (const otherBox3 of box3Arr) {
            if (box3.intersectsBox(otherBox3)) {
                return true;
            }
        }
        return false;
    };

    const _getPositionBetween = (p1, p2, step) => {
        const positions = [];
        if (p1.x !== p2.x) {
            const z = p1.z;
            const minX = Math.min(p1.x, p2.x) + step;
            const maxX = Math.max(p1.x, p2.x);
            for (let x = minX; x < maxX; x += step) {
                positions.push(new THREE.Vector3(x, 1, z));
            }
        } else if (p1.z !== p2.z) {
            const x = p1.x;
            const minZ = Math.min(p1.z, p2.z) + step;
            const maxZ = Math.max(p1.z, p2.z);
            for (let z = minZ; z < maxZ; z += step) {
                positions.push(new THREE.Vector3(x, 1, z));
            }
        }
        return positions;
    };

    const _getCheckPositions = (p1, p2, p3, p4, step) => {
        const arr1 = _getPositionBetween(p1, p2, step);
        const arr2 = _getPositionBetween(p2, p3, step);
        const arr3 = _getPositionBetween(p3, p4, step);
        const arr4 = _getPositionBetween(p4, p1, step);
        return [p1].concat(arr1, [p2], arr2, [p3], arr3, arr4, [p4]);
    };

    if (rendererParent4model.children.length === 0) {
        return {x: 0, z: 0};
    }
    model.computeBoundingBox();
    const modelBox3 = model.boundingBox;
    const box3Arr = [];
    for (const model of rendererParent4model.children) {
        model.computeBoundingBox();
        box3Arr.push(model.boundingBox);
    }

    const length = 65;
    const step = 5; // min distance of models
    const y = 1;
    for (let stepCount = 1; stepCount < length / step; stepCount++) {
        // check the 4 positions on x&z axis first
        const positionsOnAxis = [
            new THREE.Vector3(0, y, stepCount * step),
            new THREE.Vector3(0, y, -stepCount * step),
            new THREE.Vector3(stepCount * step, y, 0),
            new THREE.Vector3(-stepCount * step, y, 0)
        ];
        // clock direction
        const p1 = new THREE.Vector3(stepCount * step, y, stepCount * step);
        const p2 = new THREE.Vector3(stepCount * step, y, -stepCount * step);
        const p3 = new THREE.Vector3(-stepCount * step, y, -stepCount * step);
        const p4 = new THREE.Vector3(-stepCount * step, y, stepCount * step);
        const positionsOnSquare = _getCheckPositions(p1, p2, p3, p4, step);
        const checkPositions = [].concat(positionsOnAxis);
        // no duplicates
        for (const item of positionsOnSquare) {
            if (!(item.x === 0 || item.z === 0)) {
                checkPositions.push(item);
            }
        }
        // {
        //     const geometry = new THREE.Geometry();
        //     for (const vector3 of checkPositions) {
        //         geometry.vertices.push(vector3);
        //     }
        //     const material = new THREE.PointsMaterial({ color: 0xff0000 });
        //     const points = new THREE.Points(geometry, material);
        //     points.position.y = -1;
        //     this.add(points);
        // }

        for (const position of checkPositions) {
            const modelBox3Clone = modelBox3.clone();
            modelBox3Clone.translate(new THREE.Vector3(position.x, 0, position.z));
            // if (modelBox3Clone.min.x < this._bbox.min.x ||
            //     modelBox3Clone.max.x > this._bbox.max.x ||
            //     modelBox3Clone.min.z < this._bbox.min.z ||
            //     modelBox3Clone.max.z > this._bbox.max.z) {
            //     continue;
            // }
            if (!_isBox3IntersectOthers(modelBox3Clone, box3Arr)) {
                return {x: position.x, z: position.z};
            }
        }
    }
    return {x: 0, z: 0};
};

const actions = {
    _updateState: (state) => {
        return {
            type: ACTION_UPDATE_STATE,
            state
        };
    },
    setRendererParent4model: (object3d) => (dispatch, getState) => {
        dispatch(actions._updateState({
            rendererParent4model: object3d
        }));
    },
    setRendererParent4gcode: (object3d) => {
        rendererParent4gcode = object3d;
        return {type: null};
    },
    loadModel: (url, filePath) => (dispatch, getState) => {
        const worker = new File3dToBufferGeometryWorker();
        worker.postMessage({url});
        worker.onmessage = (e) => {
            const data = e.data;
            const {status, value} = data;
            switch (status) {
                case 'succeed': {
                    messageI18n.success('Loading model succeeded');

                    worker.terminate();
                    destoryGcodeObj3d();

                    const {modelPositions, modelConvexPositions} = value;

                    const bufferGeometry = new THREE.BufferGeometry();
                    const convexBufferGeometry = new THREE.BufferGeometry();

                    const modelPositionAttribute = new THREE.BufferAttribute(modelPositions, 3);
                    const modelConvexPositionAttribute = new THREE.BufferAttribute(modelConvexPositions, 3);

                    bufferGeometry.addAttribute('position', modelPositionAttribute);
                    bufferGeometry.computeVertexNormals();
                    convexBufferGeometry.addAttribute('position', modelConvexPositionAttribute);

                    const model = new Model3D(bufferGeometry, convexBufferGeometry);
                    const {rendererParent4model} = getState().p3dModel;
                    const xz = _computeAvailableXZ(rendererParent4model, model);
                    model.position.x = xz.x;
                    model.position.z = xz.z;
                    model.computeBoundingBox();
                    rendererParent4model.add(model);

                    for (const child of rendererParent4model.children) {
                        child.setSelected(false);
                        child.setMode('prepare');
                    }
                    model.setSelected(true);

                    const {transformation, boundingBox, filePath} = model;
                    const modelCount = rendererParent4model.children.length;

                    dispatch(actions._updateState({
                        model,
                        boundingBox,
                        filePath,
                        modelCount,
                        transformation,
                        gcodeObj3d: null,
                        layerCount: 0,
                        layerCountVisible: 0,
                        lineTypeVisibility: null,
                        bounds: null,
                        progress: 100,
                        gcodeFileName: null,
                        printTime: 0,
                        filamentLength: 0,
                        filamentWeight: 0,
                        gcodeFilePath: null,
                        gcodeUrl: null
                    }));
                    break;
                }
                case 'progress':
                    dispatch(actions._updateState({progress: value * 100}));
                    break;
                case 'err':
                    worker.terminate();
                    console.error(value);
                    messageI18n.error('Loading model failed');
                    dispatch(actions._updateState({progress: 0}));
                    break;
                default:
                    break;
            }
        };
    },
    selectModel: (model) => (dispatch, getState) => {
        const {rendererParent4model} = getState().p3dModel;
        for (const child of rendererParent4model.children) {
            child.setSelected(false);
        }
        model.setSelected(true);
        const {transformation, boundingBox, filePath} = model;
        dispatch(actions._updateState({
            model,
            boundingBox,
            filePath,
            transformation
        }));
    },
    removeSelected: () => (dispatch, getState) => {
        const {rendererParent4model} = getState().p3dModel;
        destoryGcodeObj3d();
        const {model} = getState().p3dModel;
        rendererParent4model.remove(model);
        const modelCount = rendererParent4model.children.length;
        dispatch(actions._updateState({
            model: null,
            boundingBox: null,
            filePath: null,
            modelCount,
            transformation: null,
            gcodeObj3d: null,
            layerCount: 0,
            layerCountVisible: 0,
            lineTypeVisibility: null,
            bounds: null,
            gcodeFileName: null,
            printTime: 0,
            filamentLength: 0,
            filamentWeight: 0,
            gcodeFilePath: null,
            gcodeUrl: null
        }));
    },
    removeAll: () => (dispatch, getState) => {
        const {rendererParent4model} = getState().p3dModel;
        destoryGcodeObj3d();
        rendererParent4model.remove(...rendererParent4model.children);
        dispatch(actions._updateState({
            model: null,
            boundingBox: null,
            filePath: null,
            modelCount: 0,
            transformation: null,
            gcodeObj3d: null,
            layerCount: 0,
            layerCountVisible: 0,
            lineTypeVisibility: null,
            bounds: null,
            gcodeFileName: null,
            printTime: 0,
            filamentLength: 0,
            filamentWeight: 0,
            gcodeFilePath: null,
            gcodeUrl: null
        }));
    },
    duplicateSelected: () => (dispatch, getState) => {
        const {rendererParent4model} = getState().p3dModel;
        destoryGcodeObj3d();
        const {model} = getState().p3dModel;
        const newModel = model.clone();
        newModel.position.x = 0;
        newModel.position.z = 0;
        const xz = _computeAvailableXZ(rendererParent4model, newModel);
        newModel.position.x = xz.x;
        newModel.position.z = xz.z;
        rendererParent4model.add(newModel);

        for (const child of rendererParent4model.children) {
            child.setMode('prepare');
        }
        const modelCount = rendererParent4model.children.length;
        dispatch(actions._updateState({
            modelCount,
            gcodeObj3d: null,
            layerCount: 0,
            layerCountVisible: 0,
            lineTypeVisibility: null,
            bounds: null,
            gcodeFileName: null,
            printTime: 0,
            filamentLength: 0,
            filamentWeight: 0,
            gcodeFilePath: null,
            gcodeUrl: null
        }));
    },
    undo: () => {
        console.log("undo");
        return {type: null};
    },
    redo: () => {
        console.log("redo");
        return {type: null};
    },
    layFlat: () => (dispatch, getState) => {
        const {rendererParent4model} = getState().p3dModel;
        destoryGcodeObj3d();
        const {model} = getState().p3dModel;
        model.layFlat();
        const transformation = _.cloneDeep(model.transformation);
        for (const child of rendererParent4model.children) {
            child.setMode('prepare');
        }
        dispatch(actions._updateState({
            boundingBox: model.boundingBox,
            filePath: model.filePath,
            transformation,
            gcodeObj3d: null,
            layerCount: 0,
            layerCountVisible: 0,
            lineTypeVisibility: null,
            bounds: null,
            gcodeFileName: null,
            printTime: 0,
            filamentLength: 0,
            filamentWeight: 0,
            gcodeFilePath: null,
            gcodeUrl: null
        }));
    },
    updateTransformation: (key, value) => (dispatch, getState) => {
        const {rendererParent4model} = getState().p3dModel;
        destoryGcodeObj3d();
        const {model} = getState().p3dModel;
        model.updateTransformation(key, value);
        for (const child of rendererParent4model.children) {
            child.setMode('prepare');
        }
        const transformation = _.cloneDeep(model.transformation);
        dispatch(actions._updateState({
            transformation,
            gcodeObj3d: null,
            gcodeFileName: null,
            printTime: 0,
            filamentLength: 0,
            filamentWeight: 0,
            gcodeFilePath: null,
            gcodeUrl: null
        }));
    },
    afterUpdateTransformation: (key, value) => (dispatch, getState) => {
        const {rendererParent4model} = getState().p3dModel;
        destoryGcodeObj3d();
        const {model} = getState().p3dModel;
        model.updateTransformation(key, value);
        model.stickToPlate();
        for (const child of rendererParent4model.children) {
            child.setMode('prepare');
        }
        const transformation = _.cloneDeep(model.transformation);
        dispatch(actions._updateState({
            boundingBox: model.boundingBox,
            transformation,
            gcodeObj3d: null,
            gcodeFileName: null,
            printTime: 0,
            filamentLength: 0,
            filamentWeight: 0,
            gcodeFilePath: null,
            gcodeUrl: null
        }));
    },
    //g-code
    generateGcode: () => async (dispatch, getState) => {
        messageI18n.info('Generating G-code started');

        destoryGcodeObj3d();

        dispatch(actions._updateState({
            gcodeObj3d: null,
        }));

        //导出数据并上传到server
        const {rendererParent4model} = getState().p3dModel;
        const file = exportModelsToFile(rendererParent4model);
        const response = await uploadFile(file);
        const {url: stlUrl} = response;

        //设置初始状态
        dispatch(actions._updateState({
            progress: 0,
            gcodeFileName: null,
            printTime: 0,
            filamentLength: 0,
            filamentWeight: 0,
            gcodeFilePath: null,
            gcodeUrl: null
        }));

        //异步切片
        const materialSettingFilename = getState().p3dMaterialSettings.selected.filename;
        const printSettingFilename = getState().p3dPrintSettings.selected.filename;
        const id = getUuid();
        socketClientManager.removeAllServerListener(P3D_SLICE_STATUS);
        socketClientManager.addServerListener(P3D_SLICE_STATUS, (data) => {
            if (data.id !== id) {
                return;
            }
            const {progress, error, result} = data;
            if (error) {
                messageI18n.error('Generating G-code failed');
                dispatch(actions._updateState({progress: 0}));
            } else if (progress) {
                dispatch(actions._updateState({progress}));
            } else if (result) {
                messageI18n.success('Generating G-code succeeded');
                const {gcodeName, printTime, filamentLength, filamentWeight, gcodePath} = result;
                const gcodeUrl = window.serverCacheAddress + result.gcodeName;
                dispatch(actions._updateState({
                    progress: 1,
                    gcodeName,
                    printTime,
                    filamentLength,
                    filamentWeight,
                    gcodePath,
                    gcodeUrl
                }));
                dispatch(actions._renderGcode(gcodeUrl));
            }
        });
        socketClientManager.emitToServer(P3D_SLICE_START, {stlUrl, materialSettingFilename, printSettingFilename, id})
    },
    _renderGcode: (gcodeUrl) => (dispatch, getState) => {
        messageI18n.info('Rendering G-code started');

        dispatch(actions._updateState({progress: 0}));

        gcodeRenderingWorker.postMessage({fileUrl: gcodeUrl});
        gcodeRenderingWorker.onmessage = (e) => {
            const data = e.data;
            const {status, value} = data;
            switch (status) {
                case 'succeed': {
                    messageI18n.success('Rendering G-code succeeded');

                    const {positions, colors, layerIndices, typeCodes, layerCount, bounds} = value;
                    const bufferGeometry = new THREE.BufferGeometry();
                    const positionAttribute = new THREE.Float32BufferAttribute(positions, 3);
                    const colorAttribute = new THREE.Uint8BufferAttribute(colors, 3);
                    // this will map the buffer values to 0.0f - +1.0f in the shader
                    colorAttribute.normalized = true;
                    const layerIndexAttribute = new THREE.Float32BufferAttribute(layerIndices, 1);
                    const typeCodeAttribute = new THREE.Float32BufferAttribute(typeCodes, 1);

                    //a_layer_index: 某个position对应的layer index
                    //a_type_code: 某个position对应的type code
                    bufferGeometry.addAttribute('position', positionAttribute);
                    bufferGeometry.addAttribute('a_color', colorAttribute);
                    bufferGeometry.addAttribute('a_layer_index', layerIndexAttribute);
                    bufferGeometry.addAttribute('a_type_code', typeCodeAttribute);

                    const gcodeObj3d = gcodeBufferGeometryToObj3d(bufferGeometry);

                    const layerCountVisible = layerCount;
                    gcodeObj3d.material.uniforms.u_visible_layer_count.value = layerCountVisible;

                    addGcodeObj3d(gcodeObj3d)

                    const lineTypeVisibility = {
                        'WALL-INNER': {
                            rgb: [0, 255, 0],
                            visible: true
                        },
                        'WALL-OUTER': {
                            rgb: [255, 33, 33],
                            visible: true
                        },
                        'SKIN': {
                            rgb: [255, 255, 0],
                            visible: true
                        },
                        'SKIRT': {
                            rgb: [250, 140, 53],
                            visible: true
                        },
                        'SUPPORT': {
                            rgb: [75, 0, 130],
                            visible: true
                        },
                        'FILL': {
                            rgb: [141, 75, 187],
                            visible: true
                        },
                        'TRAVEL': {
                            rgb: [68, 206, 246],
                            visible: false
                        },
                        'UNKNOWN': {
                            rgb: [75, 0, 130],
                            visible: true
                        }
                    };

                    const {rendererParent4model} = getState().p3dModel;
                    for (const child of rendererParent4model.children) {
                        child.setMode('preview');
                    }

                    dispatch(actions._updateState({
                        gcodeObj3d,
                        layerCount,
                        layerCountVisible,
                        bounds,
                        lineTypeVisibility,
                        progress: 1
                    }));
                    break;
                }
                case 'progress': {
                    dispatch(actions._updateState({progress: value}));
                    break;
                }
                case 'err': {
                    console.error(value);
                    messageI18n.error('Rendering G-code failed');
                    dispatch(actions._updateState({progress: 0}));
                    break;
                }
            }
        };
    },
    setLayerCountVisible: (value) => (dispatch, getState) => {
        const {gcodeObj3d} = getState().p3dModel;
        gcodeObj3d.material.uniforms.u_visible_layer_count.value = value;
        dispatch(actions._updateState({layerCountVisible: value}));
    },
    updateLineTypeVisibility: (key, value) => (dispatch, getState) => {
        const visibility = _.cloneDeep(getState().p3dModel.lineTypeVisibility);
        visibility[key].visible = value;

        const {gcodeObj3d} = getState().p3dModel;
        const uniforms = gcodeObj3d.material.uniforms;
        uniforms.u_wall_inner_visible.value = visibility['WALL-INNER'].visible ? 1 : 0;
        uniforms.u_wall_outer_visible.value = visibility['WALL-OUTER'].visible ? 1 : 0;
        uniforms.u_skin_visible.value = visibility['SKIN'].visible ? 1 : 0;
        uniforms.u_skirt_visible.value = visibility['SKIRT'].visible ? 1 : 0;
        uniforms.u_support_visible.value = visibility['SUPPORT'].visible ? 1 : 0;
        uniforms.u_fill_visible.value = visibility['FILL'].visible ? 1 : 0;
        uniforms.u_travel_visible.value = visibility['TRAVEL'].visible ? 1 : 0;
        uniforms.u_unknown_visible.value = visibility['UNKNOWN'].visible ? 1 : 0;

        dispatch(actions._updateState({lineTypeVisibility: visibility}));
    },
};

const destoryGcodeObj3d = () => {
    //todo: dispose geometry
    rendererParent4gcode.remove(...rendererParent4gcode.children);
};

const addGcodeObj3d = (object3d) => {
    rendererParent4gcode.remove(...rendererParent4gcode.children);
    rendererParent4gcode.add(object3d);
};

const exportModelsToFile = (rendererParent4model) => {
    const blob = exportModelsToBlob(rendererParent4model);
    const fileName = "output.stl";
    return new File([blob], fileName);
};

const exportModelsToBlob = (rendererParent4model) => {
    const output = new ModelExporter().parseToBinaryStl(rendererParent4model);
    return new Blob([output], {type: 'text/plain'});
};

const reducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case ACTION_UPDATE_STATE: {
            return Object.assign({}, state, action.state);
        }
        default:
            return state;
    }
};

export {actions, exportModelsToFile, exportModelsToBlob};
export default reducer;
