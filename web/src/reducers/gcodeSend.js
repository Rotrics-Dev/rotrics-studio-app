import messageI18n from "../utils/messageI18n";
import socketClientManager from "../socket/socketClientManager";
import {TAP_LASER} from "../constants.js";
import {
    GCODE_SENDER_ACTION_START,
    GCODE_SENDER_ACTION_PAUSE,
    GCODE_SENDER_ACTION_RESUME,
    GCODE_SENDER_ACTION_STOP,
    GCODE_SENDER_ACTION_GET_STATUS,
    GCODE_SENDER_ACTION_GET_PROGRESS,
    GCODE_SENDER_ON_WARNING,
    GCODE_SENDER_ON_STATUS_CHANGE,
    GCODE_SENDER_ON_PROGRESS_CHANGE, SERIAL_PORT_ON_OPEN, SERIAL_PORT_ON_CLOSE, SERIAL_PORT_ON_ERROR,
} from "../constants";

const ACTION_UPDATE_STATE = 'gcodeSend/ACTION_UPDATE_STATE';

const INITIAL_STATE = {
    preStatus: "",
    curStatus: "",
    total: 0,
    sent: 0,
    task: null, //{gcode, tap}, tap: TAP_LASER, TAP_P3D, TAB_WRITE_AND_DRAW
};

export const actions = {
    init: () => (dispatch, getState) => {
        socketClientManager.addServerListener("connect", () => {
            socketClientManager.emitToServer(GCODE_SENDER_ACTION_GET_STATUS);
            socketClientManager.emitToServer(GCODE_SENDER_ACTION_GET_PROGRESS);
        });
        socketClientManager.addServerListener("disconnect", () => {
            dispatch(actions._updateState({
                preStatus: "",
                curStatus: "",
                total: 0,
                sent: 0,
                task: null
            }));
        });
        socketClientManager.addServerListener(SERIAL_PORT_ON_OPEN, () => {
            socketClientManager.emitToServer(GCODE_SENDER_ACTION_GET_STATUS);
            socketClientManager.emitToServer(GCODE_SENDER_ACTION_GET_PROGRESS);
        });
        socketClientManager.addServerListener(SERIAL_PORT_ON_CLOSE, () => {
            dispatch(actions._updateState({
                preStatus: "",
                curStatus: "",
                total: 0,
                sent: 0,
                task: null
            }));
        });
        socketClientManager.addServerListener(SERIAL_PORT_ON_ERROR, () => {
            dispatch(actions._updateState({
                preStatus: "",
                curStatus: "",
                total: 0,
                sent: 0,
                task: null
            }));
        });
        socketClientManager.addServerListener(GCODE_SENDER_ON_WARNING, ({msg}) => {
            messageI18n.warning(msg);
        });
        socketClientManager.addServerListener(GCODE_SENDER_ON_STATUS_CHANGE, ({preStatus, curStatus}) => {
            console.log(`gcode sender status: ${preStatus} => ${curStatus}`);
            dispatch(actions._updateState({preStatus, curStatus}));
            //见: gcodeSender.js emitStatus
            //只有执行task时候，才弹出状态提示信息
            if (getState().gcodeSend.task) {
                if (preStatus === "idle" && curStatus === "started") {
                    messageI18n.info("Task started");
                } else if (preStatus === "started" && curStatus === "idle") {
                    messageI18n.info("Task completed");
                    dispatch(actions._updateState({
                        task: null
                    }));
                } else if (preStatus === "started" && curStatus === "stopping") {
                    messageI18n.info("Task stopping");
                } else if (preStatus === "stopping" && curStatus === "idle") {
                    messageI18n.info("Task stopped");
                    dispatch(actions._updateState({
                        total: 0,
                        sent: 0,
                        task: null
                    }));
                } else if (preStatus === "started" && curStatus === "paused") {
                    messageI18n.info("Task paused");
                } else if (preStatus === "paused" && curStatus === "started") {
                    messageI18n.info("Task resumed");
                } else if (preStatus === "paused" && curStatus === "stopping") {
                    messageI18n.info("Task stopping");
                }
            }
        });
        socketClientManager.addServerListener(GCODE_SENDER_ON_PROGRESS_CHANGE, ({total, sent}) => {
            dispatch(actions._updateState({total, sent}));
        });
    },
    _updateState: (state) => {
        return {
            type: ACTION_UPDATE_STATE,
            state
        };
    },
    /**
     * 发送普通的简短的gcode，比如dev-control-panel中的gcode
     * @param gcode
     * @returns {Function}
     */
    send: (gcode) => (dispatch) => {
        socketClientManager.emitToServer(GCODE_SENDER_ACTION_START, {gcode, taskId: null, isLaser: false});
        dispatch(actions._updateState({task: null}));
    },
    /**
     * 发送code中block对应的gcode；每个block对应一个promise，当对应的task的发送完毕后，promise resolve
     * @param gcode
     * @param taskId
     * @returns {Function}
     */
    send4code: (gcode, taskId) => (dispatch) => {
        socketClientManager.emitToServer(GCODE_SENDER_ACTION_START, {gcode, taskId, isLaser: false});
        dispatch(actions._updateState({task: null}));
    },
    /**
     * 发送长的gcode，比如p3d，laser，write draw等发送任务
     * @param gcode
     * @param tap
     * @returns {Function}
     */
    startTask: (gcode, tap) => (dispatch, getState) => {
        dispatch(actions._updateState({task: {gcode, tap}}));
        const isLaser = (tap === TAP_LASER);
        socketClientManager.emitToServer(GCODE_SENDER_ACTION_START, {gcode, taskId: null, isLaser});
    },
    stopTask: () => {
        socketClientManager.emitToServer(GCODE_SENDER_ACTION_STOP);
        return {type: null};
    },
    pauseTask: () => {
        socketClientManager.emitToServer(GCODE_SENDER_ACTION_PAUSE);
        return {type: null};
    },
    resumeTask: () => {
        socketClientManager.emitToServer(GCODE_SENDER_ACTION_RESUME);
        return {type: null};
    }
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
