import _ from 'lodash';
import teach_and_play from '../containers/basic/lib/settings/teach_and_play.json'
import {actions as gcodeSendActions} from "./gcodeSend";
import {actions as serialPortActions} from "./serialPort";
import FileSaver from 'file-saver';
const ACTION_UPDATE_STATE = 'teachAndPlay/ACTION_UPDATE_STATE';


const INITIAL_STATE = {
    current_front_end: 'air_pick',
    // front_end_state: _.cloneDeep(teach_and_play.front_end.options.air_pick.state.off),
    current_front_end_state: 'state_0',
    laser_power: 100,
    movementMode: 2001,//Fast:M2001,Straight Line:M2000
    speed: 1000,
    stepArray: [],
    teachAndPlayMode: false,
    showFrontEndSelect: false
};
// const step = {
//     x: 0,
//     y: 0,
//     z: 0,
//     delay: 0,
//     current_front_end: '',//string
//     current_front_end_state: '',//on /off
//     laser_power:100
// };

const actions = {
    _updateState: (state) => {
        return {
            type: ACTION_UPDATE_STATE,
            state
        };
    },
    updateStep: (step, index) => (dispatch, getState) => {
        const {stepArray} = getState().teachAndPlay;
        stepArray[index] = step;
        console.log()
        dispatch(actions._updateState({
            stepArray: _.cloneDeep(stepArray)
        }));
    },
    deleteStep: (index) => (dispatch, getState) => {
        const {stepArray} = getState().teachAndPlay;
        stepArray.splice(index, 1);
        dispatch(actions._updateState({
            stepArray: _.cloneDeep(stepArray)
        }));
    },
    exchangeStep: (index1, index2) => (dispatch, getState) => {
        const {stepArray} = getState().teachAndPlay;
        const tmp = stepArray[index1];
        stepArray[index1] = stepArray[index2];
        stepArray[index2] = tmp;
        dispatch(actions._updateState({
            stepArray: _.cloneDeep(stepArray)
        }));
    },
    recordStep: () => (dispatch, getState) => {
        serialPortActions.addPositionListener(
            (x, y, z) => {
                const {current_front_end, laser_power, current_front_end_state, stepArray} = getState().teachAndPlay;
                stepArray.push({
                    x,
                    y,
                    z,
                    delay: 0,
                    current_front_end,
                    current_front_end_state,
                    laser_power
                });

                dispatch(actions._updateState({
                    stepArray: _.cloneDeep(stepArray)
                }));
            }
        );
        dispatch(serialPortActions.write("M893\n"))

    },
    startPlayStep: () => (dispatch, getState) => {
        const {current_front_end, stepArray, laser_power} = getState().teachAndPlay;
        const gcode = actions.stepArray2Gcode(current_front_end, stepArray, laser_power);

        console.log(JSON.stringify(gcode));
        dispatch(gcodeSendActions.start(gcode));
    },
    stopPlayStep: () => (dispatch, getState) => {
        dispatch(gcodeSendActions.stop());
    },
    clearStepArray: () => (dispatch, getstate) => {
        dispatch(actions._updateState({
            stepArray: []
        }));
    },
    stepArray2Gcode: (current_front_end, stepArray, laser_power) => {
        const gcodeArray = [];

        gcodeArray.push(teach_and_play.front_end.options[current_front_end].gcode)//设置前端模块
        if (current_front_end === 'laser') {
            gcodeArray.push(`M3 S${Math.round(laser_power * 2.55)}`)
            gcodeArray.push('M5')
        }
        const front_end_obj = teach_and_play.front_end.options[current_front_end]
        for (let i = 0; i < stepArray.length; i++) {
            const step = stepArray[i];
            gcodeArray.push(front_end_obj.state[step.current_front_end_state].gcode);
            gcodeArray.push(`M894 X${step.x} Y${step.y} Z${step.z}`);
            if (step.delay) {
                gcodeArray.push(`G4 P${step.delay}`);
            }
        }
        return gcodeArray.join("\n") + "\n";
    },
    setTeachAndPlay: (isTeachAndPlayMode) => (dispatch, getState) => {
        dispatch(actions._updateState({
            teachAndPlayMode: isTeachAndPlayMode
        }));
        if (isTeachAndPlayMode) {
            dispatch(serialPortActions.write('M18\n'));
        }
    },
    setShowFrontEndSelect: (show) => (dispatch, getState) => {
        dispatch(actions._updateState({
            showFrontEndSelect: show
        }));
    },
    onSelectFrontEnd: (front_end) => (dispatch, getState) => {
        dispatch(actions._updateState({
            current_front_end: front_end,
            current_front_end_state: 'state_0'
        }));
    },
    setLaserPower: (power) => (dispatch, getState) => {
        dispatch(actions._updateState({
            laser_power: power,
        }));
    },
    setFrontEndState: (current_front_end_state) => (dispatch, getState) => {
        dispatch(actions._updateState({
            current_front_end_state
        }));
    },
    exportGcode: () => (dispatch, getState) => {
        const date = new Date();
        const arr = [date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
        const fileName = arr.join("") + ".gcode";
        const {current_front_end, stepArray, laser_power} = getState().teachAndPlay;
        const gcode = actions.stepArray2Gcode(current_front_end, stepArray, laser_power);
        const blob = new Blob([gcode], {type: 'text/plain;charset=utf-8'});
        FileSaver.saveAs(blob, fileName, true);
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
