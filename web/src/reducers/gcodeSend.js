import messageI18n from "../utils/messageI18n";
import socketClientManager from "../socket/socketClientManager";
import {
    GCODE_SENDER_STATUS_CHANGE,
    GCODE_SENDER_REFUSE,
    GCODE_SENDER_START,
    GCODE_SENDER_STOP,
    GCODE_SENDER_PAUSE,
    GCODE_SENDER_RESUME,
    GCODE_SENDER_PROGRESS_CHANGE,
    MSG_SERIAL_PORT_CLOSE_TOAST, SERIAL_PORT_WRITE
} from "../constants";

const ACTION_UPDATE_STATE = 'gcodeSend/ACTION_UPDATE_STATE';

const INITIAL_STATE = {
    status: "",
    lineCountTotal: 0,
    lineCountSend: 0,
    lineCountSkipped: 0
};

export const actions = {
    init: () => (dispatch, getState) => {
        socketClientManager.addServerListener("connect", () => {
            socketClientManager.emitToServer(GCODE_SENDER_STATUS_CHANGE);
        });
        socketClientManager.addServerListener(GCODE_SENDER_PROGRESS_CHANGE, ({total, sent, taskId}) => {
            console.log("progress: " + (sent / total))
        });
        socketClientManager.addServerListener(GCODE_SENDER_STATUS_CHANGE, ({preStatus, curStatus, taskId}) => {
            console.log(`gcode sender status: ${preStatus} => ${curStatus}`);
            //见: gcodeSender.js emitStatus
            if (preStatus === "idle" && curStatus === "started") {
                messageI18n.success("Task started");
            } else if (preStatus === "started" && curStatus === "idle") {
                messageI18n.success("Task completed");
            } else if (preStatus === "started" && curStatus === "stopping") {
                messageI18n.success("Task stopping");
            } else if (preStatus === "stopping" && curStatus === "idle") {
                messageI18n.success("Task stopped");
            } else if (preStatus === "started" && curStatus === "paused") {
                messageI18n.success("Task paused");
            } else if (preStatus === "paused" && curStatus === "started") {
                messageI18n.success("Task resumed");
            } else if (preStatus === "paused" && curStatus === "stopping") {
                messageI18n.success("Task stopping");
            }
        });
        socketClientManager.addServerListener(GCODE_SENDER_REFUSE, (data) => {
            messageI18n.warning(data.msg);
        });
    },
    _updateState: (state) => {
        return {
            type: ACTION_UPDATE_STATE,
            state
        };
    },
    /**
     * 启动gcode send task
     * @param gcode
     * @param isAckChange 是否callback change(status change, progress change)
     * @param taskId
     * @param isLaser
     * @returns {{type: null}}
     */
    startTask: (gcode, isAckChange = false, isLaser = false, taskId = null) => {
        socketClientManager.emitToServer(GCODE_SENDER_START, {gcode, isAckChange, isLaser, taskId});
        return {type: null};
    },
    stopTask: () => {
        socketClientManager.emitToServer(GCODE_SENDER_STOP);
        return {type: null};
    },
    pauseTask: () => {
        socketClientManager.emitToServer(GCODE_SENDER_PAUSE);
        return {type: null};
    },
    resumeTask: () => {
        socketClientManager.emitToServer(GCODE_SENDER_RESUME);
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
