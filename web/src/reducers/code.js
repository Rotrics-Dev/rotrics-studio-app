import VM from 'rotrics-scratch-vm';
import defaultProjectJson from "./default_sc_project.json";
import {actions as gcodeSendActions} from './gcodeSend';
import {actions as codeProjectActions} from "./codeProject";
import {getUuid} from '../utils/index.js';
import socketClientManager from "../socket/socketClientManager";
import {GCODE_SENDER_STATUS_CHANGE, SERIAL_PORT_DATA} from "../constants";
import {str2Number} from '../utils/index.js';
import messageI18n from "../utils/messageI18n";
import {} from './taps'
import i18next from 'i18next'


const ACTION_UPDATE_STATE = 'code/ACTION_UPDATE_STATE';

const INIT_VM = 'code/INIT_VM';
const SET_RUNNING = "code/SET_RUNNING";

const INITIAL_STATE = {
    vm: null,
    running: false,
    variables: [] //item={visible, id, value, name}
};

const generateGcode = (blockName, args) => {
    console.log(blockName, args)
    switch (blockName) {
        //rs motion
        case "RS_MOTION_SAY_HELLO":
            return ['M1112', 'G91', 'G0 Z20', 'G0 Z-20', 'G0 Z0', 'G90'].join("\n");
        case "RS_MOTION_MOVE_HOME":
            return 'M1112';
        case "RS_MOTION_MOVE_ORIGIN":
            return 'G0 X0 Y0 Z0';
        case "RS_MOTION_MOVE_POSITION": {
            const {VALUE1, VALUE2, VALUE3} = args;
            return `G0 X${VALUE1} Y${VALUE2} Z${VALUE3}`;
        }
        case "RS_MOTION_MOVE_RELATIVE": {
            const {VALUE1, VALUE2, VALUE3} = args;
            const moveCmd = `G0 X${VALUE1} Y${VALUE2} Z${VALUE3}`;
            return ['G91', moveCmd, 'G90'].join("\n");
        }
        case "RS_MOTION_MOVE_RECTANGLE": {
            const {VALUE1: anchor, VALUE2: width, VALUE3: height} = args;
            let moveCmd = null;
            switch (anchor) {
                case 'left-top':
                    moveCmd = [
                        `G0 Y${height}`,
                        `G0 X${-width}`,
                        `G0 Y${-height}`,
                        `G0 X${width}`
                    ].join("\n");
                    break;
                case 'left-bottom':
                    moveCmd = [
                        `G0 Y${-height}`,
                        `G0 X${-width}`,
                        `G0 Y${height}`,
                        `G0 X${width}`
                    ].join("\n");
                    break;
                case 'right-top':
                    moveCmd = [
                        `G0 Y${height}`,
                        `G0 X${width}`,
                        `G0 Y${-height}`,
                        `G0 X${-width}`
                    ].join("\n");
                    break;
                case 'right-bottom':
                    moveCmd = [
                        `G0 Y${-height}`,
                        `G0 X${width}`,
                        `G0 Y${height}`,
                        `G0 X${-width}`
                    ].join("\n");
                    break;
            }
            return ['G91', moveCmd, 'G90'].join("\n");
        }
        case "RS_MOTION_MOVE_CIRCLE": {
            const {VALUE1: anchor, VALUE2: radius} = args;
            switch (anchor) {
                case 'left':
                    return `G2 I${-radius} J0`;
                case 'right':
                    return `G2 I${radius} J0`;
                case 'top':
                    return `G2 I0 J${radius}`;
                case 'bottom':
                    return `G2 I0 J${-radius}`;
                default:
                    return null;
            }
        }
        case "RS_MOTION_ROTATE_WRIST": {
            const { VALUE1: direction, VALUE2: speed } = args
            return `M2101 ${direction === 'clockwise' ? 'R' : 'R-'}${speed}`
        }
        case "RS_MOTION_ROTATE_WRIST_TO": {
            const { VALUE1: radius } = args;
            return `M2101 P${radius}`
        }
        case "RS_MOTION_KEEP_ROTATE": {
            const { VALUE1: direction, VALUE2: speed } = args
            return `M2101 ${direction === 'clockwise' ? 'S' : 'S-'}${speed}`
        }

        //rs module
        case "RS_FRONT_END_AIR_PICKER": {
            const {VALUE1: status} = args;
            switch (status) {
                case 'pick':
                    return 'M1000';
                case 'release':
                    return 'M1002';
                case 'off':
                    return 'M1003';
                default:
                    return null;
            }
        }
        case "RS_FRONT_END_SOFT_GRIPPER": {
            const {VALUE1: status} = args;
            switch (status) {
                case 'grip':
                    return 'M1001';
                case 'release':
                    return 'M1000';
                case 'neutral':
                    return 'M1002';
                case 'off':
                    return 'M1003';
                default:
                    return null;
            }
        }
        case "RS_FRONT_END_WRIST_ROTATE":
            break;

        //rs settings
        case "RS_SETTINGS_SELECT_FRONT_END": {
            const {VALUE1: module} = args;
            switch (module) {
                case 'pen holder':
                    return 'M888 P0';
                case 'air picker':
                    return 'M888 P2';
                case 'soft gripper':
                    return 'M888 P2';
                case 'rotary air picker': 
                    return 'M888 P6';
                case 'rotary soft gripper': 
                    return 'M888 P6';
                default:
                    return null;
            }
        }
        case "RS_SETTINGS_SET_SPEED": {
            const {VALUE1: speed} = args;

            return [`G0 F${speed}`, `G1 F${speed}`].join("\n");
        }
        case "RS_SETTINGS_SET_ACCELERATION": {
            const {VALUE1: prt, VALUE2: acceleration} = args;
            switch (prt) {
                case 'printing':
                    return `M204 P${acceleration}`;
                case 'retract':
                    return `M204 R${acceleration}`;
                case 'travel':
                    return `M204 T${acceleration}`;
                default:
                    return null;
            }
        }
        case "RS_SETTINGS_SET_MOTION_MODE": {
            const {VALUE1: mode} = args;
            if (mode === 'fast') {
                return 'M2001';
            } else if (mode === 'linear') {
                return 'M2000';
            } else {
                return null;
            }
        }
        case "RS_SETTINGS_SET_WORK_ORIGIN":
            return "G92 X0 Y0 Z0";

        //rs sensing
        case "RS_SENSING_CURRENT_POSITION":
            return "M114";
        case "RS_SENSING_CURRENT_ACCELERATION":
            return "M204";
        case "RS_SENSING_CURRENT_SPEED":
            return null;

        //rs sliding rail
        case "RS_SLIDING_RAIL_SET_ACCELERATION":
            break;
        case "RS_SLIDING_RAIL_MOVE":
            // const { VALUE1: direction, VALUE2: speedLength , VALUE3: speed } = args
            const gcode = `G1 E${args.VALUE1 === 'forward' ? '' : '-'}${args.VALUE2} F${args.VALUE3}`
            return `G91\n${gcode}\nG90\nM114`
        case "RS_SLIDING_RAIL_MOVE_TO_ORIGIN":
            return "M2005"
        case "RS_SLIDING_RAIL_STALL_GUARD_DETECTED":
            break;
        case "RS_SLIDING_RAIL_STOP":
            break;

        //rs conveyor belt
        case "RS_CONVEYOR_BELT_MOVE":
            const {VALUE1: direction, VALUE2: speed} = args;
            switch (direction) {
                case 'forward':
                    return `M2012 F${speed} D0`;
                case 'backward':
                    return `M2012 F${speed} D1`;
                default:
                    return null;
            }
        case "RS_CONVEYOR_BELT_STOP":
            return 'M2013';
    }
    return null;
};

export const actions = {
    init: () => (dispatch) => {
        dispatch(actions._init());
        dispatch(actions.loadEmptyProject());
        dispatch(actions._setupListener());
    },
    _init: () => {
        return {
            type: INIT_VM
        };
    },
    _setupListener: () => (dispatch, getState) => {
        const vm = getState().code.vm;
        //参考：scratch-gui/lib/vm-listener-hoc.jsx
        document.addEventListener('keydown', (e) => {
            // Don't capture keys intended for Blockly inputs.
            if (e.target !== document && e.target !== document.body) return;
            vm.postIOData('keyboard', {
                keyCode: e.keyCode,
                key: e.key,
                isDown: true
            });
            // Prevent space/arrow key from scrolling the page.
            if (e.keyCode === 32 || // 32=space
                (e.keyCode >= 37 && e.keyCode <= 40)) { // 37, 38, 39, 40 are arrows
                e.preventDefault();
            }
        });
        document.addEventListener('keyup', (e) => {
            // Always capture up events,
            // even those that have switched to other targets.
            vm.postIOData('keyboard', {
                keyCode: e.keyCode,
                key: e.key,
                isDown: false
            });
            // E.g., prevent scroll.
            if (e.target !== document && e.target !== document.body) {
                e.preventDefault();
            }
        });
        vm.on(
            'PROJECT_RUN_START',
            () => {
                dispatch(actions._setRunning(true));
            }
        );
        vm.on(
            'PROJECT_RUN_STOP',
            () => {
                dispatch(actions._setRunning(false));
            }
        );
        vm.on(
            'PROJECT_CHANGED',
            () => {
                //TODO: move to codeProject
                dispatch(codeProjectActions.onProjectChanged());
            }
        );
        vm.on(
            'MONITORS_UPDATE',
            (monitorList) => {
                console.log(monitorList)
                //variable count: monitorList._list._tail.array.length
                const variables = [];
                const array = monitorList._list && 
                    monitorList._list._tail && 
                    monitorList._list._tail.array 
                    ? monitorList._list._tail.array 
                    : [];
                    
                for (let i = 0; i < array.length; i++) {
                    const {visible, id, value, params} = array[i][1];
                    const name = params.VARIABLE; //for example: 我的变量
                    variables.push({visible, id, value, name})
                }
                
                // TEST 
                dispatch(actions._updateState({variables}));
            }
        );
        //自定义block发送消息
        vm.runtime.on(
            'rotrics-async',
            (data) => {
                console.log('rotrics-async 自定义block发送消息')
                console.log(data)
                const {blockName, args, resolve} = data;
                if (!getState().serialPort.path) {
                    messageI18n.warn("Please connect DexArm first");
                    resolve();
                    return;
                }
                console.log(blockName, args);
                const gcode = generateGcode(blockName, args);
                console.log(gcode);
                if (!getState().serialPort.path) {
                    messageI18n.warn("Please connect DexArm first");
                    resolve();
                    return;
                }

                console.log(`执行Gcode = ${gcode}`)

                if (!gcode) return
                const taskIdLocal = getUuid();
                dispatch(
                    gcodeSendActions.startTask(gcode, true, false, taskIdLocal, false, false)
                );
                
                if (blockName.indexOf('RS_SENSING') === -1) {
                    console.log('非侦测类 RS_SENSING')
                    socketClientManager.addServerListener(GCODE_SENDER_STATUS_CHANGE, ({preStatus, curStatus, taskId}) => {
                        if (preStatus === "started" && curStatus === "idle" && taskId === taskIdLocal) {
                            resolve();
                        }
                    });
                } else {
                    console.log('属于侦测类 RS_SENSING')
                    switch (blockName) {
                        case "RS_SENSING_CURRENT_POSITION": {
                            console.log('当前位置的x/y/z')
                            const onData = (data) => {
                                console.log(data)
                                let {received} = data; //X:0.00 Y:0.00 Z:0.00 E:0.00 Count A:0 B:0 C:0
                                //TODO: 使用正则表达式匹配
                                if (received.indexOf('X:') != -1 &&
                                    received.indexOf('Y:') != -1 &&
                                    received.indexOf('Z:') != -1 &&
                                    received.indexOf('E:') != -1
                                ) {
                                    const segments = received.trim().split(' ');
                                    const values = segments.map((segment) => {
                                        return str2Number(segment.slice(2))
                                    });

                                    // hack: socketClient.off(eventName, fun) not work
                                    // use pop();
                                    // 存在风险
                                    // socketClientManager.socketClient.off(SERIAL_PORT_DATA, onData);
                                    socketClientManager.socketClient.listeners(SERIAL_PORT_DATA).pop()
                                    const {VALUE1: axis} = args;
                                    switch (axis) {
                                        case 'x':
                                            console.log(`x = ${values[0]}`)
                                            resolve(values[0]);
                                            break;
                                        case 'y':
                                            console.log(`y = ${values[1]}`)
                                            resolve(values[1]);
                                            break;
                                        case 'z':
                                            console.log(`z = ${values[2]}`)
                                            resolve(values[2]);
                                            break;
                                        default:
                                            console.log('默认值')
                                            resolve(0)
                                    }
                                }
                            };
                            socketClientManager.addServerListener(SERIAL_PORT_DATA, onData);
                            break;
                        }
                        case "RS_SENSING_CURRENT_ACCELERATION":
                            const onData = (data) => {
                                let {received} = data; //Acceleration: P60.00 R80.00 T60.00
                                //TODO: 使用正则表达式匹配
                                if (received.indexOf('Acceleration:') != -1 &&
                                    received.indexOf('P') != -1 &&
                                    received.indexOf('R') != -1 &&
                                    received.indexOf('T') != -1
                                ) {
                                    const segments = received.replace('Acceleration:', '').trim().split(' ');
                                    const values = segments.map((segment) => {
                                        return str2Number(segment.slice(1))
                                    });

                                    socketClientManager.socketClient.listeners(SERIAL_PORT_DATA).pop()
                                    const {VALUE1: prt} = args;
                                    switch (prt) {
                                        case 'Printing':
                                            resolve(values[0]);
                                            break;
                                        case 'Retract':
                                            resolve(values[1]);
                                            break;
                                        case 'Travel':
                                            resolve(values[2]);
                                            break;
                                    }
                                }
                            };
                            socketClientManager.addServerListener(SERIAL_PORT_DATA, onData);
                            break;
                        case "RS_SENSING_CURRENT_SPEED":
                            break;
                    }
                }
            }
        );
    },
    _setRunning: (value) => {
        return {
            type: SET_RUNNING,
            value
        };
    },
    loadEmptyProject: () => (dispatch, getState) => {
        defaultProjectJson.targets[0].variables['`jEk@4|i[#Fk?(8x)AV.-my variable'][0] = i18next.t('My Variables')
        getState().code.vm.loadProject(defaultProjectJson);
        return {type: null};
    },
    _updateState: (state) => {
        return {
            type: ACTION_UPDATE_STATE,
            state
        };
    },
    // 将下位机返回消息广播至Scratch
    broadcastSerialPortReceive: (receive) => (dispatch, getState) => {
        const { taps } = getState()
        const { tap } = taps

        // 判断当前页面是否为TAP_CODE
        if (tap !== 'TAP_CODE') {
            // console.log('当前不是code页面 => 取消广播')
            return
        }

        // 过滤不广播列表
        const ignoreReceives = ['ok', 'wait']
        if (ignoreReceives.includes(receive)) {
            // console.log(`${receive}被过滤 => 取消广播`)
            return
        }

        // console.log(window.broadcast_serial_port_receive)
        // console.log('广播消息 ' + receive)
        window.broadcast_serial_port_receive(receive)
    }
};

export default function reducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case INIT_VM:
            const vm = new VM();
            vm.start();
            // 为了正常使用blocks，至少load一个project，保证至少有一个target
            // 为了方便，直接生成一个默认的项目，json格式，加载即可
            // default_sc_project.json的生成：使用官方的scratch-gui，const json = vm.toJSON();
            return Object.assign({}, state, {vm});
        case SET_RUNNING:
            const {value} = action;
            return Object.assign({}, state, {running: value});
        default:
            return state;
    }
}
