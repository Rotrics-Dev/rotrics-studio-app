import io from 'socket.io-client';
import {EventEmitter} from "events"; //api和node event一样，但是可以运行在browser环境中，https://github.com/Gozala/events#readme
import {
    SERIAL_PORT_GET_PATH,
    SERIAL_PORT_GET_OPENED,
    SERIAL_PORT_OPEN,
    SERIAL_PORT_CLOSE,
    SERIAL_PORT_ERROR,
    SERIAL_PORT_DATA,
    SERIAL_PORT_WRITE,
    GCODE_UPDATE_SENDER_STATUS,
    GCODE_START_SEND,
    GCODE_APPEND_SEND,
    GCODE_STOP_SEND,
    TOOL_PATH_GENERATE_LASER,
    P3D_MATERIAL_FETCH_ALL,
    P3D_MATERIAL_UPDATE,
    P3D_MATERIAL_DELETE,
    P3D_MATERIAL_CLONE,
    P3D_SETTING_FETCH_ALL,
    P3D_SETTING_UPDATE,
    P3D_SETTING_DELETE,
    P3D_SETTING_CLONE,
    P3D_SLICE_START,
    P3D_SLICE_STATUS
} from "../constants.js"

class SocketClientManager extends EventEmitter {
    constructor() {
        super();
        this.socketClient = null;
        this.isSocketConnected = false;
    }

    setup(serverIp) {
        this.socketClient = io(serverIp);

        //socket
        this.socketClient.on('connect', () => {
            this.isSocketConnected = true;
            this.emit('socket', 'connect');
        });

        this.socketClient.on('disconnect', () => {
            this.isSocketConnected = false;
            this.emit('socket', 'disconnect');
        });

        //serial port
        this.socketClient.on(SERIAL_PORT_GET_PATH, (paths) => {
            this.emit(SERIAL_PORT_GET_PATH, paths);
        });
        this.socketClient.on(SERIAL_PORT_GET_OPENED, (path) => {
            this.emit(SERIAL_PORT_GET_OPENED, path);
        });
        this.socketClient.on(SERIAL_PORT_OPEN, (path) => {
            this.emit(SERIAL_PORT_OPEN, path);
        });
        this.socketClient.on(SERIAL_PORT_CLOSE, (path) => {
            this.emit(SERIAL_PORT_CLOSE, path);
        });
        this.socketClient.on(SERIAL_PORT_ERROR, (error) => {
            this.emit(SERIAL_PORT_ERROR, error);
        });
        this.socketClient.on(SERIAL_PORT_DATA, (data) => {
            this.emit(SERIAL_PORT_DATA, data);
        });

        //tool path
        this.socketClient.on(TOOL_PATH_GENERATE_LASER, (data) => {
            this.emit(TOOL_PATH_GENERATE_LASER, data);
        });

        //gcode
        this.socketClient.on(GCODE_UPDATE_SENDER_STATUS, (status) => {
            console.log("status -> " + status)
        });

        // p3d material
        this.socketClient.on(P3D_MATERIAL_FETCH_ALL, (data) => {
            this.emit(P3D_MATERIAL_FETCH_ALL, data);
        });

        // p3d setting
        this.socketClient.on(P3D_SETTING_FETCH_ALL, (data) => {
            this.emit(P3D_SETTING_FETCH_ALL, data);
        });

        // p3d slice
        this.socketClient.on(P3D_SLICE_STATUS, (data) => {
            this.emit(P3D_SLICE_STATUS, data);
        });

    }

    //serial port
    getSerialPortPath() {
        this.socketClient.emit(SERIAL_PORT_GET_PATH);
    }

    getSerialPortOpened() {
        this.socketClient.emit(SERIAL_PORT_GET_OPENED);
    }

    openSerialPort(path) {
        this.socketClient.emit(SERIAL_PORT_OPEN, path);
    }

    closeSerialPort() {
        this.socketClient.emit(SERIAL_PORT_CLOSE);
    }

    writeSerialPort(data) {
        console.log("writeSerialPort: " + data)
        this.socketClient.emit(SERIAL_PORT_WRITE, data);
    }

    //g-code
    updateGcodeSenderStatus() {
        this.socketClient.emit(GCODE_UPDATE_SENDER_STATUS);
    }

    startSendGcode(gcode) {
        console.log("startSendGcode: " + gcode)
        this.socketClient.emit(GCODE_START_SEND, gcode);
    }

    appendSendGcode(gcode) {
        console.log("appendSendGcode: " + gcode)
        this.socketClient.emit(GCODE_APPEND_SEND, gcode);
    }

    stopSendGcode() {
        console.log("stopSendGcode")
        this.socketClient.emit(GCODE_STOP_SEND);
    }

    /**
     * @param url         model2d的图片url
     * @param settings    model2d.settings
     * @param toolPathId  (uuid)，settings有变化则id也随着变化
     */
    generateGcodeLaser(url, settings, toolPathId, fileType) {
        this.socketClient.emit(TOOL_PATH_GENERATE_LASER, {url, settings, toolPathId, fileType});
    }

    // p3d material
    p3dMaterialFetchAll() {
        this.socketClient.emit(P3D_MATERIAL_FETCH_ALL);
    }

    p3dMaterialUpdate(name, key, value) {
        const data = {name, key, value};
        this.socketClient.emit(P3D_MATERIAL_UPDATE, data);
    }

    p3dMaterialDelete(name) {
        const data = {name};
        this.socketClient.emit(P3D_MATERIAL_DELETE, data);
    }

    p3dMaterialClone(sourceName, targetName) {
        const data = {sourceName, targetName}
        this.socketClient.emit(P3D_MATERIAL_CLONE, data);
    }

    // p3d setting
    p3dSettingFetchAll() {
        this.socketClient.emit(P3D_SETTING_FETCH_ALL);
    }

    p3dSettingUpdate(name, key, value) {
        const data = {name, key, value};
        this.socketClient.emit(P3D_SETTING_UPDATE, data);
    }

    p3dSettingDelete(name) {
        // const data = {name};
        // this.socketClient.emit(P3D_SETTING_DELETE, data);
    }

    p3dSettingClone(sourceName, targetName) {
        // const data = {sourceName, targetName}
        // this.socketClient.emit(P3D_SETTING_CLONE, data);
    }

    /**
     * emit event to server
     * @param event
     * @param data
     * @returns {boolean} 是否成功
     */
    emitToServer(event, data) {
        if (this.isSocketConnected){
            this.socketClient.emit(event, data);
            return true;
        }
        return false;
    }
}

const socketClientManager = new SocketClientManager();

export default socketClientManager;
