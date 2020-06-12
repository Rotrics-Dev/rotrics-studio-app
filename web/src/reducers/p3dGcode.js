import _ from 'lodash';
import p3dGcodeManager from "../containers/p3d/lib/p3dGcodeManager";
import p3dModelManager from "../containers/p3d/lib/p3dModelManager";
import {uploadFile} from "../api";

const ACTION_UPDATE_STATE = 'p3dGcode/ACTION_UPDATE_STATE';

// lineTypeVisibility: {
//     'WALL-INNER': {
//         rgb: [0, 255, 0],
//             visible: true
//     },
//     'WALL-OUTER': {
//         rgb: [255, 33, 33],
//             visible: true
//     },
//     'SKIN': {
//         rgb: [255, 255, 0],
//             visible: true
//     },
//     'SKIRT': {
//         rgb: [250, 140, 53],
//             visible: true
//     },
//     'SUPPORT': {
//         rgb: [75, 0, 130],
//             visible: true
//     },
//     'FILL': {
//         rgb: [141, 75, 187],
//             visible: true
//     },
//     'TRAVEL': {
//         rgb: [68, 206, 246],
//             visible: false
//     },
//     'UNKNOWN': {
//         rgb: [75, 0, 130],
//             visible: true
//     }
// }
const INITIAL_STATE = {
    progress: 0,
    progressTitle: "",
    result: null, //切片结果：{gcodeFileName, printTime, filamentLength, filamentWeight, gcodeFilePath}
    layerCount: 0, //gcode渲染后，一共多少层
    layerCountVisible: 0, //当前显示的多少层gcode line
    lineTypeVisibility: null, //gcode渲染后，不同type的visibility
    bounds: null
};

export const actions = {
    init: () => (dispatch) => {
    },
    _updateState: (state) => {
        return {
            type: ACTION_UPDATE_STATE,
            state
        };
    },
    setRendererParent: (object3d) => {
        p3dGcodeManager.setRendererParent(object3d);
        return {type: null};
    },
    startSlice: () => async (dispatch, getState) => {
        //导出数据并上传到server
        const file = p3dModelManager.exportModelsToFile();
        const response = await uploadFile(file);
        const {url} = response;

        //设置初始状态
        dispatch(actions._updateState({progress: 0, progressTitle: "slicing", result: null}));

        //异步切片
        const materialName = getState().p3dMaterial.name;
        const settingName = getState().p3dSetting.name;
        p3dGcodeManager.startSlice(
            url,
            materialName,
            settingName,
            (result) => {
                const gcodeUrl = "http://localhost:9000/cache/" + result.gcodeFileName;
                dispatch(actions._updateState({progress: 1, progressTitle: "slicing completed", result}));
                dispatch(actions._renderGcode(gcodeUrl));
            },
            (progress) => {
                dispatch(actions._updateState({progress, progressTitle: "slicing"}));
            },
            (error) => {
                dispatch(actions._updateState({progress: 0, progressTitle: "slicing error"}));
            }
        );
    },
    _renderGcode: (gcodeUrl) => (dispatch) => {
        dispatch(actions._updateState({progress: 0, progressTitle: "rendering g-code"}));
        p3dGcodeManager.rendererGcode(
            gcodeUrl,
            (data) => {
                const {layerCount, layerCountVisible, bounds, lineTypeVisibility} = data;
                dispatch(actions._updateState({
                    progress: 1,
                    progressTitle: "renderer g-code completed",
                    layerCount,
                    layerCountVisible,
                    bounds,
                    lineTypeVisibility
                }));
            },
            (progress) => {
                dispatch(actions._updateState({progress, progressTitle: "rendering g-code"}));
            },
            (error) => {
                dispatch(actions._updateState({progress: 0, progressTitle: "renderer g-code error"}));
            });
    },
    setLayerCountVisible: (value) => (dispatch) => {
        p3dGcodeManager.setLayerCountVisible(value);
        dispatch(actions._updateState({layerCountVisible: value}));
    },
    updateLineTypeVisibility: (key, value) => (dispatch, getState) => {
        const lineTypeVisibility = _.cloneDeep(getState().p3dGcode.lineTypeVisibility);
        lineTypeVisibility[key].visible = value;
        p3dGcodeManager.setLineTypeVisibility(lineTypeVisibility);
        dispatch(actions._updateState({lineTypeVisibility}));
    },
};

export default function reducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case ACTION_UPDATE_STATE: {
            return Object.assign({}, state, action.state);
        }
        default:
            return state;
    }
}
