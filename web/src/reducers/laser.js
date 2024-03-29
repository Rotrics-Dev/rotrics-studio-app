import _ from 'lodash';
import {computeBoundary} from "../containers/laser/lib/toolPathUtils";
import {generateSvg, uploadImage} from "../api";
import Model2D from "../containers/laser/lib/Model2D";

const ACTION_UPDATE_STATE = 'laser/ACTION_UPDATE_STATE';

const INITIAL_STATE = {
    model: null, //选中的model
    transformation: null,
    config: null,
    working_parameters: null,
    modelCount: 0,
    isAllPreviewed: false, //是否所有model全部previewed
    gcode: null,
    //text独有
    config_text: null,

    // 是否锁定比例
    isLockScale: true
};

let rendererParent = null;

/**
 * 所有模型都preview后才能调用，控制逻辑由ui处理
 * @returns {Array}
 */
const getGcode4runBoundary = () => {
    const min = -Number.MAX_VALUE;
    const max = Number.MAX_VALUE;
    let _minX = max, _minY = max;
    let _maxX = min, _maxY = min;
    for (let i = 0; i < rendererParent.children.length; i++) {
        const model = rendererParent.children[i];
        const {toolPathLines, settings} = model;
        const {minX, maxX, minY, maxY} = computeBoundary(toolPathLines, settings);
        _minX = Math.min(minX, _minX);
        _maxX = Math.max(maxX, _maxX);
        _minY = Math.min(minY, _minY);
        _maxY = Math.max(maxY, _maxY);
    }
    const p1 = {x: _minX.toFixed(1), y: _minY.toFixed(1)};
    const p2 = {x: _maxX.toFixed(1), y: _minY.toFixed(1)};
    const p3 = {x: _maxX.toFixed(1), y: _maxY.toFixed(1)};
    const p4 = {x: _minX.toFixed(1), y: _maxY.toFixed(1)};
    const gcodeArr = [];
    gcodeArr.push("M2000");
    gcodeArr.push("G0 F2000");
    gcodeArr.push(`G0 X${p1.x} Y${p1.y}`);
    // gcodeArr.push("M3 S255");
    gcodeArr.push(`G0 X${p2.x} Y${p2.y}`);
    gcodeArr.push(`G0 X${p3.x} Y${p3.y}`);
    gcodeArr.push(`G0 X${p4.x} Y${p4.y}`);
    gcodeArr.push(`G0 X${p1.x} Y${p1.y}`);
    // gcodeArr.push("M5");
    const gcode = gcodeArr.join("\n") + "\n";
    return gcode;
};

const actions = {
    _updateState: (state) => {
        return {
            type: ACTION_UPDATE_STATE,
            state
        };
    },
    setRendererParent: (object3d) => {
        rendererParent = object3d;
        return {type: null};
    },
    addModel: (fileType, file) => async (dispatch, getState) => {
        if (!["bw", "greyscale", "svg", "text"].includes(fileType)) {
            return {type: null};
        }

        const model = new Model2D(fileType);
        if (fileType === "text") {
            const svg = await generateSvg(model.config_text);
            const filename = "text.svg";
            const blob = new Blob([svg], {type: 'text/plain'});
            file = new File([blob], filename);
        }

        const response = await uploadImage(file);
        const {url, width, height} = response;
        console.log("## response: " + JSON.stringify(response))
        model.loadImg(url, width, height);

        for (const child of rendererParent.children) {
            child.setSelected(false);
        }
        rendererParent.add(model);
        model.setSelected(true);

        const {transformation, config, working_parameters} = model.settings;
        const {config_text} = model;
        dispatch(actions._updateState({
            model,
            transformation,
            config,
            working_parameters,
            modelCount: rendererParent.children.length,
            isAllPreviewed: false,
            gcode: null,
            config_text
        }));

        // preview
        model.addEventListener('preview', (event) => {
            const {isPreviewed} = event.data;
            if (!isPreviewed) {
                dispatch(actions._updateState({isAllPreviewed: false}));
            } else {
                let isAllPreviewed = true;
                for (let i = 0; i < rendererParent.children.length; i++) {
                    const model = rendererParent.children[i];
                    if (!model.isPreviewed) {
                        isAllPreviewed = false;
                        break;
                    }
                }
                dispatch(actions._updateState({isAllPreviewed}));
            }
        });
        model.preview();
    },
    selectModel: (model) => (dispatch, getState) => {
        const selected = getState().laser.model;
        if (model === selected) {
            return {type: null};
        }

        for (const child of rendererParent.children) {
            child.setSelected(false);
        }
        model.setSelected(true);

        const {transformation, config, working_parameters} = model.settings;
        const {config_text} = model;
        dispatch(actions._updateState({
            model,
            transformation,
            config,
            working_parameters,
            config_text
        }));
    },
    removeSelected: () => (dispatch, getState) => {
        const selected = getState().laser.model;
        if (!selected) {
            return {type: null};
        }

        rendererParent.remove(selected);
        dispatch(actions._updateState({
            model: null,
            transformation: null,
            config: null,
            working_parameters: null,
            modelCount: rendererParent.children.length,
            gcode: null,
            config_text: null
        }));
    },
    removeAll: () => (dispatch, getState) => {
        if (rendererParent.children.length === 0) {
            return {type: null};
        }
        rendererParent.remove(...rendererParent.children);
        dispatch(actions._updateState({
            model: null,
            modelCount: rendererParent.children.length,
            transformation: null,
            config: null,
            working_parameters: null,
            gcode: null,
            config_text: null
        }));
    },
    duplicateSelected: () => {
        return {type: null};
    },
    undo: () => {
        return {type: null};
    },
    redo: () => {
        return {type: null};
    },
    //update settings
    updateTransformation: (key, value, preview) => (dispatch, getState) => {
        const selected = getState().laser.model;
        const {workHeightLaser} = getState().persistentData
        const { isLockScale } = getState().laser
        if (!selected) {
            return {type: null};
        }
        //TODO: 是否有更？
        selected.updateTransformation(key, value, preview, workHeightLaser, isLockScale);
        dispatch(actions._updateState({
            transformation: _.cloneDeep(selected.settings.transformation),
            gcode: null
        }));
    },
    updateConfig: (key, value) => (dispatch, getState) => {
        const selected = getState().laser.model;
        if (!selected) {
            return {type: null};
        }
        selected.updateConfig(key, value);
        dispatch(actions._updateState({
            config: _.cloneDeep(selected.settings.config),
            gcode: null
        }));
    },
    updateWorkingParameters: (key, value) => (dispatch, getState) => {
        const selected = getState().laser.model;
        if (!selected) {
            return {type: null};
        }
        selected.updateWorkingParameters(key, value);
        dispatch(actions._updateState({
            working_parameters: _.cloneDeep(selected.settings.working_parameters),
            gcode: null
        }));
    },
    //text独有
    updateConfigText: (key, value) => async (dispatch, getState) => {
        console.log("🔥 输入")
        const {model} = getState().laser;
        if (!model || model.fileType !== "text") {
            return {type: null};
        }

        const {config_text} = model;
        config_text.children[key].default_value = value;

        const svg = await generateSvg(config_text);
        const filename = "text.svg";
        const blob = new Blob([svg], {type: 'text/plain'});
        const file = new File([blob], filename);

        const response = await uploadImage(file);

        const {url, width, height} = response;

        model.loadImg(url, width, height);

        model.preview();

        const {transformation} = model.settings;
        dispatch(actions._updateState({
            config_text: _.cloneDeep(config_text),
            transformation: _.cloneDeep(transformation),
        }));
    },
    //g-code
    generateGcode: () => (dispatch, getState) => {
        const { advance } = getState().persistentData
        const gcodeArr = [];
        for (let i = 0; i < rendererParent.children.length; i++) {
            const model = rendererParent.children[i];
            gcodeArr.push(model.generateGcode(advance));
        }
        const gcode = gcodeArr.join("\n");
        dispatch(actions._updateState({
            gcode
        }));
    },

    // 切换锁定比例
    toggleIsLockScale: () => (dispatch, getState) => {
        const { isLockScale } = getState().laser;
        dispatch(actions._updateState({
            isLockScale: !isLockScale
        }))
    }
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

export {actions, getGcode4runBoundary};
export default reducer;
