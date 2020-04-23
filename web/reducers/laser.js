import laserManager from "../manager/laserManager.js";

const CHANGE_MODEL_STATE = 'laser/CHANGE_MODEL_STATE';

const INITIAL_STATE = {
    x: 0,
    y: 0,
    rotation: 0,
    width: 0,
    height: 0,
    model2d: null
};

export const actions = {
    //todo：监听laserManager的event
    init: () => (dispatch) => {
        console.log("init")
        laserManager.on("onChange", (model2d) => {
            console.log("onChange: " + model2d.fileType)
            dispatch(actions.changeModelState(model2d));
        });
    },
    changeModelState: (model2d) => {
        return {
            type: CHANGE_MODEL_STATE,
            model2d
        };
    },
};

export default function reducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case CHANGE_MODEL_STATE: {
            const {model2d} = action;
            if (model2d) {
                const {width, height, x, y, rotation} = model2d.getState();
                return Object.assign({}, state, {model2d, width, height, x, y, rotation});
            } else {
                return Object.assign({}, state, {model2d: null});
            }
        }
        default:
            return state;
    }
}
