import {uploadFont, deleteFont, listFonts} from "../api";

const ACTION_UPDATE_STATE = 'fonts/ACTION_UPDATE_STATE';

const INITIAL_STATE = {
    buildInFonts: [],
    userFonts: []
};

export const actions = {
    init: () => async (dispatch) => {
        dispatch(actions.loadFonts());
    },
    _updateState: (state) => {
        return {
            type: ACTION_UPDATE_STATE,
            state
        };
    },
    loadFonts: () => async (dispatch, getState) => {
        const {
            buildInFonts,
            userFonts
        } = await listFonts();
        dispatch(actions._updateState({buildInFonts, userFonts}));
    },
    deleteUserFont: (path) => async (dispatch, getState) => {
        const {
            fontName,
            buildInFonts,
            userFonts
        } = await deleteFont(path);
        dispatch(actions._updateState({buildInFonts, userFonts}));
    },
    uploadUserFont: (fontFile) => async (dispatch) => {
        const {
            fontName,
            buildInFonts,
            userFonts
        } = await uploadFont(fontFile);
        dispatch(actions._updateState({buildInFonts, userFonts}));
    }
};

export default function reducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case ACTION_UPDATE_STATE:
            return Object.assign({}, state, action.state);
        default:
            return state;
    }
}
