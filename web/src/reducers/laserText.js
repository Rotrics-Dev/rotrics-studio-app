import laserManager from "../containers/laser/lib/laserManager.js";
import _ from 'lodash';
import {uploadImage, generateSvg} from "../api";

const SET_MODEL = 'laserText/SET_MODEL';
const SET_CONFIG_TEXT = 'laserText/SET_CONFIG_TEXT';

const INITIAL_STATE = {
    config_text: null
};

export const actions = {
    init: () => (dispatch) => {
        laserManager.on("onChangeModel", (model) => {
            dispatch(actions._setModel(model));
        });
    },
    _setModel: (model) => {
        return {
            type: SET_MODEL,
            value: model
        };
    },
    updateConfigText: (key, value) => async (dispatch, getState) => {
        const {model} = getState().laser;
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

        //TODO: emit不应该放在laserManager之外调用
        laserManager.emit('onChangeTransformation', model.settings.transformation);

        dispatch(actions._setConfigText(config_text));
    },
    _setConfigText: (config_text) => {
        return {
            type: SET_CONFIG_TEXT,
            value: config_text
        };
    }
};

export default function reducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case SET_MODEL:
            const model = action.value;
            if (model && model.fileType === "text") {
                const config_text = model.userData.config_text; //laserManager "onChangeModel": 选中的模型有变化，因此不需要deepClone
                return Object.assign({}, state, {config_text});
            } else {
                return Object.assign({}, state, {config_text: null});
            }
        case SET_CONFIG_TEXT:
            return Object.assign({}, state, {config_text: action.value});
        default:
            return state;
    }
}
