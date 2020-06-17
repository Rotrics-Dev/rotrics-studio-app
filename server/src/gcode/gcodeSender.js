import EventEmitter from 'events';
import serialPortManager from '../serialPortManager.js';
import {
    GCODE_UPDATE_SENDER_STATUS
} from "../constants.js"


class GcodeSender extends EventEmitter {
    constructor() {
        super();
        this.status = "stopped"; //sending/end/stopped/paused?
        this.lines = [];
        this.lineCountTotal = 0; //一共多少行
        this.lineCountSend = 0; //已发送多少行；不包括空行和注释
        this.okCount = 0;
        this.emptyCount = 0;
    }

    onSerialPortData(data) {
        if (this.status !== "sending") return;

        const {received} = data;
        if (received === "ok") {
            ++this.okCount;
            this._sendNextCmd();
        }
    }

    getStatus() {
        return this.status;
    }

    //发送注释，固件不会返回ok
    //\n会返回ok
    //空行，注释不发送
    _sendNextCmd() {
        //发完了
        if (this.lines.length === 0) {
            this.lineCountTotal = 0;
            this.lineCountSend = 0;
            this.okCount = 0;
            this.status = "end";
            this.emit(GCODE_UPDATE_SENDER_STATUS, this.status);
            return;
        }

        const line = this.lines.shift();
        //注释
        if (line.trim().indexOf(";") === 0) {
            ++this.emptyCount;
            this._sendNextCmd();
            return;
        }
        //空行
        if (line.trim().length === 0) {
            ++this.emptyCount;
            this._sendNextCmd();
            return;
        }

        ++this.lineCountSend;
        console.log("_sendNextCmd: " + this.lineCountTotal + "/" + this.lineCountSend + "/" + this.emptyCount + "/" + this.okCount + "#" + line)
        serialPortManager.write(line + "\n");
    }

    start(gcode) {
        console.log("gcode sender -> start")
        this.okCount = 0;
        this.emptyCount = 0;
        this.lines = gcode.trim().split('\n');
        this.lineCountTotal = this.lines.length;
        this.lineCountSend = 0;
        this.status = "sending";
        this.emit(GCODE_UPDATE_SENDER_STATUS, this.status);
        this._sendNextCmd();
    }

    stop() {
        console.log("gcode sender -> stop")
        this.lines = [];
        this.lineCountTotal = 0;
        this.lineCountSend = 0;
        this.okCount = 0;
        this.emptyCount = 0;
        this.status = "stopped";
        this.emit(GCODE_UPDATE_SENDER_STATUS, this.status);
    }

    append(gcode) {

    }

}

const gcodeSender = new GcodeSender();

export default gcodeSender;
