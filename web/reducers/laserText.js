import laserManager from "../laser/laserManager.js";
import _ from 'lodash';
import {generateSvg} from "../containers/Laser/svgUtils";
import {uploadImage} from "../api";

const SET_CONFIG_TEXT = 'SET_CONFIG_TEXT';
const UPDATE_CONFIG_TEXT = 'UPDATE_CONFIG_TEXT';

const INITIAL_STATE = {
    config_text: {},
};

export const actions = {
    init: () => (dispatch, getState) => {
        laserManager.on("onChange", (model2d) => {
            if (model2d && model2d.fileType === "text") {
                const config_text = _.cloneDeep(model2d.userData.config_text);
                dispatch(actions.setConfigText(config_text));
            }
        });
        return {
            type: ""
        };
    },
    setConfigText: (config_text) => {
        return {
            type: SET_CONFIG_TEXT,
            value: config_text
        };
    },
    updateConfigText: (key, value) => async (dispatch, getState) => {
        laserManager._selected.userData.config_text.children[key].default_value = value;
        const config_text = _.cloneDeep(laserManager._selected.userData.config_text);

        const svg = await generateSvg(config_text);
        const filename = "test.svg";
        const blob = new Blob([svg], {type: 'text/plain'});
        const file = new File([blob], filename);

        const response = await uploadImage(file);

        const {url, width, height} = response;

        laserManager._selected.setImage(url, width, height);
        laserManager._emmitChangeEvent();

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
        case SET_CONFIG_TEXT:
            return Object.assign({}, state, {config_text: action.value});
        case UPDATE_CONFIG_TEXT:
            const {key, value} = action.value;
            laserManager._selected.userData.config_text.children[key].default_value = value;
            const config_text = _.cloneDeep(laserManager._selected.userData.config_text);
            return Object.assign({}, state, {config_text});
        default:
            return state;
    }
}
