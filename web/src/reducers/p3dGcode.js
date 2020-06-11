import File3dToBufferGeometryWorker from '../containers/p3d/lib/File3dToBufferGeometry.worker';
import * as THREE from 'three';
import p3dGcodeManager from "../containers/p3d/lib/p3dGcodeManager";
import p3dModelManager from "../containers/p3d/lib/p3dModelManager";

import Model3D from "../containers/p3d/lib/Model3D";
import {uploadFile} from "../api";
import {P3D_SLICE_STATUS} from "../constants";

import GcodeToBufferGeometryWorker from '../containers/p3d/lib/GcodeToBufferGeometry.worker';

const SELECT_MODEL = 'p3dGcode/SELECT_MODEL';
const SET_MODEL_COUNT = 'p3dGcode/SET_MODEL_COUNT';

const SET_TRANSFORMATION = 'p3dGcode/SET_TRANSFORMATION';

const SET_PROGRESS_INFO = 'p3dGcode/SET_PROGRESS_INFO';
const SET_RESULT = 'p3dGcode/SET_RESULT';

const INITIAL_STATE = {
    progress: 0,
    progressTitle: "",
    result: null, //切片结果：{gcodeFileName, printTime, filamentLength, filamentWeight, gcodeFilePath}
};

const gcodeRenderingWorker = new GcodeToBufferGeometryWorker();

export const actions = {
    init: () => (dispatch) => {
        p3dGcodeManager.on(P3D_SLICE_STATUS, (data) => {
            const {progress, error, result} = data;
            // console.log(P3D_SLICE_STATUS + " => " + JSON.stringify(data));
            if (error) {
                dispatch(actions._setProgressInfo({progressTitle: "slicing error"}));
            } else if (progress && progress > 0) {
                dispatch(actions._setProgressInfo({progress, progressTitle: "slicing"}));
            } else if (result) {
                dispatch(actions._setResult(result));
                dispatch(actions._setProgressInfo({progress: 1, progressTitle: "slicing completed"}));
                const gcodeFileUrl = "http://localhost:9000/cache/" + result.gcodeFileName;
                dispatch(actions._renderGcode(gcodeFileUrl))
            }
        });

        gcodeRenderingWorker.onmessage = (e) => {
            const data = e.data;
            // console.log("onmessage: " + JSON.stringify(data))
            // return;
            const { status, value } = data;
            switch (status) {
                case 'succeed': {
                    const { positions, colors, layerIndices, typeCodes, layerCount, bounds } = value;

                    const bufferGeometry = new THREE.BufferGeometry();
                    const positionAttribute = new THREE.Float32BufferAttribute(positions, 3);
                    const colorAttribute = new THREE.Uint8BufferAttribute(colors, 3);
                    // this will map the buffer values to 0.0f - +1.0f in the shader
                    colorAttribute.normalized = true;
                    const layerIndexAttribute = new THREE.Float32BufferAttribute(layerIndices, 1);
                    const typeCodeAttribute = new THREE.Float32BufferAttribute(typeCodes, 1);

                    bufferGeometry.addAttribute('position', positionAttribute);
                    bufferGeometry.addAttribute('a_color', colorAttribute);
                    bufferGeometry.addAttribute('a_layer_index', layerIndexAttribute);
                    bufferGeometry.addAttribute('a_type_code', typeCodeAttribute);

                    const object3D = gcodeBufferGeometryToObj3d('3DP', bufferGeometry);

                    dispatch(actions.destroyGcodeLine());
                    gcodeLineGroup.add(object3D);
                    object3D.position.copy(new THREE.Vector3());
                    const gcodeTypeInitialVisibility = {
                        'WALL-INNER': true,
                        'WALL-OUTER': true,
                        SKIN: true,
                        SKIRT: true,
                        SUPPORT: true,
                        FILL: true,
                        TRAVEL: false,
                        UNKNOWN: true
                    };
                    dispatch(actions.updateState({
                        layerCount,
                        layerCountDisplayed: layerCount - 1,
                        gcodeTypeInitialVisibility,
                        gcodeLine: object3D
                    }));

                    Object.keys(gcodeTypeInitialVisibility).forEach((type) => {
                        const visible = gcodeTypeInitialVisibility[type];
                        const value = visible ? 1 : 0;
                        dispatch(actions.setGcodeVisibilityByType(type, value));
                    });

                    const { minX, minY, minZ, maxX, maxY, maxZ } = bounds;
                    dispatch(actions.checkGcodeBoundary(minX, minY, minZ, maxX, maxY, maxZ));
                    dispatch(actions.showGcodeLayers(layerCount - 1));
                    dispatch(actions.displayGcode());

                    dispatch(actions.updateState({
                        stage: PRINTING_STAGE.PREVIEW_SUCCEED
                    }));
                    break;
                }
                case 'progress': {
                    const state = getState().printing;
                    if (value - state.progress > 0.01 || value > 1 - EPSILON) {
                        dispatch(actions.updateState({ progress: value }));
                    }
                    break;
                }
                case 'err': {
                    console.error(value);
                    dispatch(actions.updateState({
                        stage: PRINTING_STAGE.PREVIEW_FAILED,
                        progress: 0
                    }));
                    break;
                }
                default:
                    break;
            }
        };
    },
    setRendererParent: (object3d) => {
        p3dGcodeManager.setRendererParent(object3d);
        return {type: null};
    },
    startSlice: () => async (dispatch, getState) => {
        const file = p3dModelManager.exportModelsToFile();
        const response = await uploadFile(file);
        const {url} = response;
        console.log("url: " + url);

        const materialName = getState().p3dMaterial.name;
        const settingName = getState().p3dSetting.name;

        p3dGcodeManager.scheduleSliceTask(url, materialName, settingName);

        dispatch(actions._setProgressInfo({progress: 0, progressTitle: "slicing"}));
        dispatch(actions._setResult(null));
    },
    _setProgressInfo: (data) => {
        return {
            type: SET_PROGRESS_INFO,
            data
        };
    },
    _setResult: (data) => {
        return {
            type: SET_RESULT,
            data
        };
    },
    _renderGcode: (gcodeFileUrl) => (dispatch) => {
        console.log("_renderGcode: " + gcodeFileUrl)
        gcodeRenderingWorker.postMessage({ fileUrl: gcodeFileUrl });
        dispatch(actions._setProgressInfo({progress: 0, progressTitle: "rendering gcode"}));
    }
};

export default function reducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case SELECT_MODEL:
            const model3d = action.value;
            if (model3d) {
                const {transformation} = model3d.settings;
                return Object.assign({}, state, {model3d, transformation, config, working_parameters});
            } else {
                return Object.assign({}, state, {
                    model3d: null,
                    transformation: null,
                });
            }
        case SET_PROGRESS_INFO:
            const {progress, progressTitle} = action.data;
            return Object.assign({}, state, {progress, progressTitle});
        case SET_RESULT:
            return Object.assign({}, state, {result: action.data});
        default:
            return state;
    }
}
