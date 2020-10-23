import _ from 'lodash';
import {uploadImage, generateSvg} from "../api";
import Model2D from "../containers/writeAndDraw/lib/Model2D";

const ACTION_UPDATE_STATE = 'writeAndDraw/ACTION_UPDATE_STATE';

const INITIAL_STATE = {
    rendererParent: null,
    model: null, //选中的model
    transformation: null,
    config: null,
    working_parameters: null,
    modelCount: 0,
    isAllPreviewed: false, //是否所有model全部previewed
    gcode: null,
    //text独有
    config_text: null,
};

const actions = {
    _updateState: (state) => {
        return {
            type: ACTION_UPDATE_STATE,
            state
        };
    },
    setRendererParent: (object3d) => (dispatch, getState) => {
        dispatch(actions._updateState({
            rendererParent: object3d
        }));
    },
    addModel: (fileType, file) => async (dispatch, getState) => {
        if (!["svg", "text"].includes(fileType)) {
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

        const {rendererParent} = getState().writeAndDraw;
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
        const selected = getState().writeAndDraw.model;
        const {rendererParent} = getState().writeAndDraw;
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
        const selected = getState().writeAndDraw.model;
        const {rendererParent} = getState().writeAndDraw;
        if (!selected) {
            return {type: null};
        }

        rendererParent.remove(selected);
        selected.dispose()
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
        const {rendererParent} = getState().writeAndDraw;
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
        const selected = getState().writeAndDraw.model;
        const {workHeightPen} = getState().persistentData
        if (!selected) {
            return {type: null};
        }
        //TODO: 是否有更？
        selected.updateTransformation(key, value, preview, workHeightPen);
        dispatch(actions._updateState({
            transformation: _.cloneDeep(selected.settings.transformation),
            gcode: null
        }));
    },
    updateConfig: (key, value) => (dispatch, getState) => {
        const selected = getState().writeAndDraw.model;
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
        const selected = getState().writeAndDraw.model;
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
        const {model} = getState().writeAndDraw;
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
        const {rendererParent} = getState().writeAndDraw;
        const gcodeArr = [];
        for (let i = 0; i < rendererParent.children.length; i++) {
            const model = rendererParent.children[i];
            gcodeArr.push(model.generateGcode());
        }
        const gcode = gcodeArr.join("\n");
        dispatch(actions._updateState({
            gcode
        }));
    },
};

const reducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case ACTION_UPDATE_STATE:
            return Object.assign({}, state, action.state)
        default:
            return state;
    }
};

export {actions};
export default reducer;
