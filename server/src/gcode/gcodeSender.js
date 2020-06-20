import EventEmitter from 'events';
import serialPortManager from '../serialPortManager.js';
import {
    GCODE_UPDATE_SENDER_STATUS
} from "../constants.js"

class GcodeSender extends EventEmitter {
    constructor() {
        super();
        this.lines = [];
        this.lineCountTotal = 0;   // 一共多少行
        this.lineCountSend = 0;    // 已发送多少行；不包括空行和注释
        this.lineCountSkipped = 0; // 当前跳过多少行
        this.okCount = 0;
        this.status = "idle"; //idle/start/sending/end/stopped/paused
        this.requireStatus = true;
    }

    onSerialPortData(data) {
        if (this.status !== "sending") return;
        if (data.received === "ok") {
            ++this.okCount;
            this._sendNextCmd();
        }
    }

    getStatus() {
        return this.status;
    }

    //注意：发送注释，固件不会返回ok，因此必须把注释过滤掉
    //\n会返回ok
    //空行，注释不发送
    _sendNextCmd() {
        const line = this.lines.shift();
        //发完了
        if (line === undefined) {
            console.log("gcode sender status -> end")
            console.log("\n")
            this.status = "end";
            this._emitStatus();
            this._reset();
        } else {
            //注释 or 空行，跳过不发
            if (line.trim().indexOf(";") === 0 || line.trim().length === 0) {
                ++this.lineCountSkipped;
                this._sendNextCmd();
            } else {
                serialPortManager.write(line + "\n");
                ++this.lineCountSend;
                this._emitStatus();
                console.log("send: " + [this.lineCountTotal, this.lineCountSend, this.lineCountSkipped, this.okCount, line].join("/"))
            }
        }
    }

    start(gcode, requireStatus) {
        if (this.status !== "idle") {
            console.warn("gcode sender: busy, can not send");
            return;
        }

        console.log("\n")
        console.log("gcode sender status -> start")
        this._reset();
        this.lines = gcode.trim().split('\n');
        this.lineCountTotal = this.lines.length;
        this.lineCountSend = 0;
        this.lineCountSkipped = 0;
        this.okCount = 0;
        this.requireStatus = requireStatus;

        this.status = "start";
        this._emitStatus();

        this.status = "sending";
        this._emitStatus();

        this._sendNextCmd();
    }

    stop() {
        console.log("gcode sender status -> stopped")
        console.log("\n")
        this.status = "stopped";
        this._emitStatus();
        this._reset();
    }

    append(gcode) {

    }

    _emitStatus() {
        if (this.requireStatus) {
            this.emit(GCODE_UPDATE_SENDER_STATUS, {
                status: this.status,
                lineCountTotal: this.lineCountTotal,
                lineCountSend: this.lineCountSend,
                lineCountSkipped: this.lineCountSkipped,
            });
        }
    }

    _reset() {
        this.lines = [];
        this.lineCountTotal = 0;
        this.lineCountSend = 0;
        this.lineCountSkipped = 0;
        this.okCount = 0;
        this.status = "idle";
    }
}

const gcodeSender = new GcodeSender();

export default gcodeSender;
