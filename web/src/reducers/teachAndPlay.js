import _ from 'lodash';
import teach_and_play from '../containers/basic/lib/settings/teach_and_play.json'
import {actions as gcodeSendActions} from "./gcodeSend";
import {actions as serialPortActions} from "./serialPort";
import FileSaver from 'file-saver';

const ACTION_UPDATE_STATE = 'teachAndPlay/ACTION_UPDATE_STATE';


const INITIAL_STATE = {
    currentFrontEnd: teach_and_play.front_end.default_value,
    currentFrontEndState: teach_and_play.front_end.options[teach_and_play.front_end.default_value].default_value,
    laserPower: teach_and_play.front_end.options.laser.power.default_value,
    movementMode: 2001,//Fast:M2001,Straight Line:M2000
    speed: 1000,
    stepArray: [],
    teachAndPlayMode: false,
    showFrontEndSelect: false,
    repeatCount: 1
};
// const step = {// REFERENCE DO NOT DELETE
//     x: 0,
//     y: 0,
//     z: 0,
//     delay: 0,
//     currentFrontEnd: '',//string
//     currentFrontEndState: '',//string
//     laserPower:100
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
        console.log('recordStep')
        console.log(this)
        console.log(dispatch)
        console.log(getState)
        serialPortActions.addPositionListener(
            (x, y, z) => {
                const {currentFrontEnd, laserPower, currentFrontEndState, stepArray} = getState().teachAndPlay;
                stepArray.push({
                    x,
                    y,
                    z,
                    delay: 0,
                    currentFrontEnd,
                    currentFrontEndState,
                    laserPower
                });

                dispatch(actions._updateState({
                    stepArray: _.cloneDeep(stepArray)
                }));
            }
        );
        dispatch(serialPortActions.write("M893\n"))

    },
    startPlayStep: (startIndex, doRepeat) => (dispatch, getState) => {
        const {currentFrontEnd, stepArray, laserPower, repeatCount} = getState().teachAndPlay;
        const gcode = actions.stepArray2Gcode(
            currentFrontEnd, stepArray, laserPower, startIndex, repeatCount, doRepeat
        );
        dispatch(gcodeSendActions.start(gcode, false, false));
    },
    stopPlayStep: () => (dispatch, getState) => {
        dispatch(gcodeSendActions.stopTask());
    },
    clearStepArray: () => (dispatch, getstate) => {
        dispatch(actions._updateState({
            stepArray: []
        }));
    },
    stepArray2Gcode: (currentFrontEnd, stepArray, laserPower, startIndex, repeatCount, doRepeat) => {
        const header = teach_and_play.front_end.options[currentFrontEnd].gcode + '\n';//设置前端模块
        const gcodeArray = [];
        for (let index = startIndex; index < stepArray.length; index++) {
            const step = stepArray[index];
            gcodeArray.push(`M894 X${step.x} Y${step.y} Z${step.z}`);
            const frontEndObj = teach_and_play.front_end.options[step.currentFrontEnd];
            if (step.currentFrontEnd === 'laser' && step.currentFrontEndState === 'state_1') {//laser on
                gcodeArray.push(`${frontEndObj.state[step.currentFrontEndState].gcode} S${Math.round(laserPower * 2.55)}`);
            } else {
                gcodeArray.push(frontEndObj.state[step.currentFrontEndState].gcode);
            }

            if (step.delay) {
                gcodeArray.push(`G4 P${step.delay}`);
            }
        }

        if (doRepeat) {
            const gcode = gcodeArray.join("\n") + "\n";
            let tempGcode = '';
            for (let index = 0; index < repeatCount; index++) {
                tempGcode += gcode;
            }
            return (header + tempGcode);
        } else {
            return header + gcodeArray.join("\n") + "\n";
        }
    },
    setTeachAndPlay: (isTeachAndPlayMode) => (dispatch, getState) => {
        dispatch(actions._updateState({
            teachAndPlayMode: isTeachAndPlayMode
        }));
        if (isTeachAndPlayMode) {
            dispatch(serialPortActions.write('M18\n'));//shut the power of motor down
        }
    },
    setShowFrontEndSelect: (show) => (dispatch, getState) => {
        dispatch(actions._updateState({
            showFrontEndSelect: show
        }));
    },
    onSelectFrontEnd: (frontEnd) => (dispatch, getState) => {
        const currentFrontEnd = teach_and_play.front_end.options[frontEnd];
        const currentFrontEndState = currentFrontEnd.state[currentFrontEnd['default_value']];
        const gcodeArr = [currentFrontEnd.gcode, currentFrontEndState.gcode];

        dispatch(serialPortActions.write(gcodeArr.join('\n') + '\n'));
        dispatch(actions._updateState({
            currentFrontEnd: frontEnd,
            currentFrontEndState: currentFrontEnd['default_value'],
            repeatCount: 1,
            laserPower: 1
        }));

    },
    setLaserPower: (power) => (dispatch, getState) => {
        dispatch(serialPortActions.write(
            `M3 S${Math.round(power * 2.55)}\n`
        ));
        dispatch(actions._updateState({
            laserPower: power,
            currentFrontEndState: 'state_1'//switch to  laser on
        }));
    },
    setRepeatCount: (repeatCount) => (dispatch, getState) => {
        dispatch(actions._updateState({
            repeatCount
        }));
    },
    setFrontEndState: (currentFrontEndState) => (dispatch, getState) => {
        const {currentFrontEnd} = getState().teachAndPlay;
        const gcode = teach_and_play.front_end.options[currentFrontEnd].state[currentFrontEndState].gcode
        dispatch(serialPortActions.write(
            gcode + '\n'
        ));
        dispatch(actions._updateState({
            currentFrontEndState
        }));
    },
    exportGcode: () => (dispatch, getState) => {
        const date = new Date();
        const arr = [date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()];
        const fileName = arr.join("") + ".gcode";
        const {currentFrontEnd, stepArray, laserPower, repeatCount} = getState().teachAndPlay;
        const gcode = actions.stepArray2Gcode(currentFrontEnd, stepArray, laserPower, 0, repeatCount);
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
