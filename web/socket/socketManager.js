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

        //socket
        this.socket.on('connect', () => {
            console.log('socket -> connect')
            this.emit('on-socket-connect');
        });

        this.socket.on('disconnect', () => {
            console.log('socket -> disconnect')
            this.emit('on-socket-disconnect');
        });

        //serial port
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

        //gcode
        this.socket.on("on-gcode-generate-laser", (data) => {
            this.emit('on-gcode-generate-laser', data);
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

    /**
     *
     * @param url       model2d的图片url
     * @param settings  model2d.settings
     * @param id        model2d的状态id(uuid)，settings有变化则id也随着变化
     */
    generateGcodeLaser(url, settings, updateId) {
        this._sendData("gcode-generate-laser", {url, settings, updateId});
    }

    generateGcode3dp() {
        this._sendData("gcode-generate-3dp");
    }
}

const socketManager = new SocketManager();

export default socketManager;
