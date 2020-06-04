import writeAndDrawManager from "../containers/writeAndDraw/lib/writeAndDrawManager.js";
import _ from 'lodash';
import {uploadImage, generateSvg} from "../api";

const SET_MODEL = 'writeAndDraw/SET_MODEL';
const SET_CONFIG_TEXT = 'writeAndDraw/SET_CONFIG_TEXT';
const UPDATE_CONFIG_TEXT = 'writeAndDraw/UPDATE_CONFIG_TEXT';

const INITIAL_STATE = {
    config_text: null,
    model: null,
};

export const actions = {
    init: () => (dispatch) => {
        writeAndDrawManager.on("onChangeModel", (model2d) => {
            console.log("writeAndDrawText_onChangeModel_ON"+JSON.stringify(model2d));
            if (model2d && model2d.fileType === "text") {
                const config_text = _.cloneDeep(model2d.userData.config_text);
                dispatch(actions._setConfigText(config_text));
                dispatch(actions._setModel(model2d));
            } else {
                dispatch(actions._setConfigText(null));
                dispatch(actions._setModel(null));
            }
        });
    },
    _setModel: (model) => {
        return {
            type: SET_MODEL,
            value: model
        };
    },
    _setConfigText: (config_text) => {
        return {
            type: SET_CONFIG_TEXT,
            value: config_text
        };
    },
    updateConfigText: (key, value) => async (dispatch, getState) => {
        const {model} = getState().writeAndDrawText;
        if (!model || model.fileType !== "text") {
            return {type: null};
        }

        model.userData.config_text.children[key].default_value = value;
        const config_text = _.cloneDeep(model.userData.config_text);

        const svg = await generateSvg(config_text);
        const filename = "text.svg";
        const blob = new Blob([svg], {type: 'text/plain'});
        const file = new File([blob], filename);

        const response = await uploadImage(file);

        const {url, width, height} = response;

        model.loadImg(url, width, height);

        //TODO: emit不应该放在writeAndDrawManager之外调用
        writeAndDrawManager.emit('onChangeTransformation', model.settings.transformation);

        dispatch(actions._updateConfigText(key, value));
    },
    _updateConfigText: (key, value) => {
        return {
            type: UPDATE_CONFIG_TEXT,
            value: {key, value}
        };
    }
};

export default function reducer(state = INITIAL_STATE, action) {

    switch (action.type) {
        case SET_MODEL:
            return Object.assign({}, state, {model: action.value});
        case SET_CONFIG_TEXT:
            console.log("writeAndDrawText setConfigText "+JSON.stringify(action));
            return Object.assign({}, state, {config_text: action.value});
        case UPDATE_CONFIG_TEXT:
            const {key, value} = action.value;
            writeAndDrawManager._selected.userData.config_text.children[key].default_value = value;
            const config_text = _.cloneDeep(writeAndDrawManager._selected.userData.config_text);
            return Object.assign({}, state, {config_text});
        default:
            return state;
    }
}
