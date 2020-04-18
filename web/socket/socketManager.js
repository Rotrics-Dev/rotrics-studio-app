import io from 'socket.io-client';
import events from "events";

/**
 * 所有的socket相关操作全部封装一层
 */
class SocketManager extends events.EventEmitter {
    constructor() {
        super();
        this.socket = null;
    }

    setupSocket() {
        this.socket = io('http://localhost:3003');

        this.socket.on('connect', () => {
            console.log('socket -> connect')
            this.emit('on-socket-connect');
        });

        this.socket.on('disconnect', () => {
            console.log('socket -> disconnect')
            this.emit('on-socket-disconnect');
        });

        this.socket.on("on-serialPort-query", (data) => {
            this.emit('on-serialPort-query', data);
        });
        this.socket.on("on-serialPort-open", (data) => {
            this.emit('on-serialPort-open', data);
        });
        this.socket.on("on-serialPort-close", (data) => {
            this.emit('on-serialPort-close', data);
        });
        this.socket.on("on-serialPort-error", (data) => {
            this.emit('on-serialPort-error', data);
        });
        this.socket.on("on-serialPort-data", (data) => {
            this.emit('on-serialPort-data', data);
        });
    }

    _sendData(event, data) {
        this.socket.emit(event, data);
    }

    querySerialPort() {
        this._sendData("serialPort-query");
    }

    openSerialPort(path) {
        this._sendData("serialPort-open", {path});
    }

    closeSerialPort() {
        this._sendData("serialPort-close");
    }

    writeGcodeSerialPort(gcode) {
        gcode += "\n";
        this._sendData("serialPort-write-gcode", {gcode});
    }

    generateGcode() {
        this._sendData("gcode-generate");
    }
}

const socketManager = new SocketManager();

export default socketManager;
