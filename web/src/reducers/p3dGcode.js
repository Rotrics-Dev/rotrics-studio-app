import File3dToBufferGeometryWorker from '../containers/p3d/lib/File3dToBufferGeometry.worker';
import * as THREE from 'three';
import p3dGcodeManager from "../containers/p3d/lib/p3dGcodeManager";
import p3dModelManager from "../containers/p3d/lib/p3dModelManager";

import Model3D from "../containers/p3d/lib/Model3D";
import {uploadFile} from "../api";
import {P3D_SLICE_STATUS} from "../constants";

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

export const actions = {
    init: () => (dispatch) => {
        p3dGcodeManager.on(P3D_SLICE_STATUS, (data) => {
            const {progress, error, result} = data;
            console.log(P3D_SLICE_STATUS + " => " + JSON.stringify(data));
            if (error) {
                dispatch(actions._setProgressInfo({progressTitle: "slicing error"}));
            } else if (progress && progress > 0) {
                dispatch(actions._setProgressInfo({progress, progressTitle: "slicing"}));
            } else if (result) {
                dispatch(actions._setResult(result));
                dispatch(actions._setProgressInfo({progress: 1, progressTitle: "slicing completed"}));
            }
        });
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
