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
    GCODE_SEND_LOAD,
    GCODE_SEND_START,
    GCODE_SEND_STOP,
    TOOL_PATH_GENERATE_LASER
} from "../../shared/constants.js"

class SocketClientManager extends EventEmitter {
    constructor() {
        super();
        this.socketClient = null;
    }

    onConnect() {

    }

    onDisconnect() {

    }


    setup() {
        this.socketClient = io('http://localhost:3003');

        //socket
        this.socketClient.on('connect', () => {
            console.log('socket io client -> connect')
            this.emit('socket-connect');

            this.socketClient.emit(SERIAL_PORT_GET_OPENED);
        });

        this.socketClient.on('disconnect', () => {
            console.log('socket io client -> disconnect')
            this.emit('socket-disconnect');
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
    }

    getSerialPortPath() {
        this.socketClient.emit(SERIAL_PORT_GET_PATH);
    }

    openSerialPort(path) {
        this.socketClient.emit(SERIAL_PORT_OPEN, path);
    }

    closeSerialPort() {
        this.socketClient.emit(SERIAL_PORT_CLOSE);
    }

    writeGcodeSerialPort(str) {
        str += "\n";
        this.socketClient.emit(SERIAL_PORT_WRITE, str);
    }

    loadGcode(gcode) {
        this.socketClient.emit(GCODE_SEND_LOAD, {gcode});
    }

    startSendGcode() {
        this.socketClient.emit(GCODE_SEND_START);
    }

    stopSendGcode() {
        this.socketClient.emit(GCODE_SEND_STOP);
    }

    /**
     *
     * @param url         model2d的图片url
     * @param settings    model2d.settings
     * @param toolPathId  (uuid)，settings有变化则id也随着变化
     */
    generateGcodeLaser(url, settings, toolPathId, fileType) {
        this.socketClient.emit(TOOL_PATH_GENERATE_LASER, {url, settings, toolPathId, fileType});
    }
}

const socketClientManager = new SocketClientManager();

export default socketClientManager;
