import EventEmitter from 'events';
import serialPortManager from '../serialPortManager.js';
import {
    SERIAL_PORT_DATA,
    GCODE_STATUS
} from "../../shared/constants.js"

/**
 * 收到数据
 *
 */
class GcodeSender extends EventEmitter {
    constructor() {
        super();
        this.status = "stopped"; //sending/end/stopped/error/paused?
        this.lines = [];
        this.lineCountTotal = 0; //一共多少行
        this.lineCountSend = 0; //已发送多少行；
        this.receivedBuffer = "";
    }

    onData = (data) => {
        console.log("---------------------------------------------------")
        const {received} = data;
        //全部\r\n, \r, 多个\n，都替换为一个\n
        this.receivedBuffer += received.replace(/(\r\n|\r|\n)/g, '\n');
        let buffer = "";
        for (let i = 0; i < this.receivedBuffer.length; i++) {
            const char = this.receivedBuffer.charAt(i);
            if (char === '\n') {
                if (buffer === "ok") {
                    this._sendNextCmd();
                }
                console.log(buffer);
                buffer = "";
            } else {
                buffer += char;
            }
        }
        //剩余的buffer不能丢掉
        this.receivedBuffer = buffer;
    };

    listenerSerialPortData() {
        console.log("gcode sender listener serial port data")
        serialPortManager.on(SERIAL_PORT_DATA, data => {
            this.onData(data)
        })
    }

    getStatus() {
        return this.status;
    }

    //发送注释，固件不会返回ok
    //\n会返回ok
    //空行，注释不发送
    _sendNextCmd() {
        //发完了
        if (line.length === 0) {
            this.lineCountTotal = 0;
            this.lineCountSend = 0;
            this.emit(GCODE_STATUS, "end");
            return;
        }
        console.log("_sendNextCmd: " + this.lineCountSend + "/" + this.lineCountTotal)

        if (this.lineCountTotal === this.lineCountSend && this.lineCountTotal > 0) {
            this.lineCountTotal = 0;
            this.lineCountSend = 0;
            this.emit(GCODE_STATUS, "end");
            return;
        }
        const line = this.lines.shift();
        ++this.lineCountSend;
        console.log("line: " + this.lineCountSend + " -> " + line)
        //注释
        if (line.trim().indexOf(";") === 0) {
            this._sendNextCmd();
            return;
        }
        //空行
        if (line.trim().length === 0) {
            this._sendNextCmd();
            return;
        }
        serialPortManager.write(line + "\n");
    }

    start(gcode) {
        console.log("gcode sender -> start")
        if (typeof gcode !== "string" || gcode.trim().length === 0) {
            this.emit(GCODE_STATUS, "error");
            this.lines = [];
            return;
        }
        this.listenerSerialPortData();
        this.lines = gcode.split('\n');
        this.lineCountTotal = this.lines.length;
        this.lineCountSend = 0;
        this.emit(GCODE_STATUS, "sending");
        this._sendNextCmd();
    }

    stop() {
        console.log("gcode sender -> stop")
        this.lines = [];
        this.lineCountTotal = 0;
        this.lineCountSend = 0;
        this.emit(GCODE_STATUS, "stopped");
    }
}

const gcodeSender = new GcodeSender();

export default gcodeSender;
