import EventEmitter from 'events';
import serialPortManager from '../serialPortManager.js';
import {utf8bytes2string, string2utf8bytes, calculateXOR} from '../utils/index.js';
import {
    GCODE_UPDATE_SENDER_STATUS
} from "../constants.js"

class GcodeSender extends EventEmitter {
    constructor() {
        super();
        this.lines = [];
        this.lineCountTotal = 0;   // 一共多少行
        this.lineCountSend = 0;    // 已发送多少行；不包括空行和注释
        this.okCount = 0;
        this.status = "idle"; //idle/start/sending/end/stopped/paused
        this.requireStatus = true;
    }

    onSerialPortData(data) {
        if (this.status !== "sending") return;
        // console.log(data.received)
        if (data.received.indexOf("Resend") !== -1){
            console.log("Resend： " + data.received)
        }
        if (data.received === "ok" || data.received.indexOf("ok") === 0) {
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
            serialPortManager.write(line + "\n");
            ++this.lineCountSend;
            this._emitStatus();
            console.log("send: " + [this.lineCountTotal, this.lineCountSend, this.okCount, line].join("/"))
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
        this.lines = this.processGcode(gcode);
        this.lineCountTotal = this.lines.length;
        this.lineCountSend = 0;
        this.okCount = 0;
        this.requireStatus = requireStatus;

        this.status = "start";
        this._emitStatus();

        this.status = "sending";
        this._emitStatus();

        this._sendNextCmd();
    }

    /**
     * 处理g-code，去除comment，empty line；增加单双行校验
     * @param gcode
     * @returns {Array}
     */
    processGcode(gcode) {
        const processLine = (line, lineNumber) => {
            line = `N${lineNumber} ${line}`;
            const xor = calculateXOR(string2utf8bytes(line));
            line = `${line}*${xor}`;
            return line;
        };

        const result = [];
        const lines = gcode.trim().split('\n');
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            // comment or empty
            if (line.indexOf(";") === 0 || line.length === 0) {
                continue;
            }
            // contain comment
            if (line.indexOf(";") !== -1) {
                line = line.substr(0, line.indexOf(";")).trim();
                line = processLine(line, result.length);
                result.push(line)
                continue;
            }
            line = processLine(line, result.length);
            result.push(line)
        }
        result.push("N-1 M110*15");
        result.unshift("N-1 M110*15");
        // console.log("******************");
        // console.log(result.join("\n"));
        // console.log("******************");
        return result;
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
            });
        }
    }

    _reset() {
        this.lines = [];
        this.lineCountTotal = 0;
        this.lineCountSend = 0;
        this.okCount = 0;
        this.status = "idle";
    }
}

const gcodeSender = new GcodeSender();

export default gcodeSender;
