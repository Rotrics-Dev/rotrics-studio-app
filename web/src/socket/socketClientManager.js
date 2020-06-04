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
    TOOL_PATH_GENERATE_WRITE_AND_DRAW
} from "../constants.js"

class SocketClientManager extends EventEmitter {
    constructor() {
        super();
        this.socketClient = null;
    }

    setup(serverIp) {
        this.socketClient = io(serverIp);

        //socket
        this.socketClient.on('connect', () => {
            this.emit('socket', 'connect');
        });

        this.socketClient.on('disconnect', () => {
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
        this.socketClient.on(TOOL_PATH_GENERATE_WRITE_AND_DRAW, (data) => {
            this.emit(TOOL_PATH_GENERATE_WRITE_AND_DRAW, data);
        });

        //gcode
        this.socketClient.on(GCODE_UPDATE_SENDER_STATUS, (status) => {
            console.log("status -> " + status)
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
    /**
     * @param url         model2d的图片url
     * @param settings    model2d.settings
     * @param toolPathId  (uuid)，settings有变化则id也随着变化
     */
    generateGcodeWriteAndDraw(url, settings, toolPathId, fileType) {
        this.socketClient.emit(TOOL_PATH_GENERATE_WRITE_AND_DRAW, {url, settings, toolPathId, fileType});
    }
}

const socketClientManager = new SocketClientManager();

export default socketClientManager;
