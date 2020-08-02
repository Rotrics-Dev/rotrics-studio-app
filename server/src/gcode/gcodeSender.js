import EventEmitter from 'events';
import serialPortManager from '../serialPortManager.js';
import {string2utf8bytes, calculateXOR} from '../utils/index.js';
import {GCODE_SENDER_STATUS_CHANGE} from "../constants.js"

let lastStatus = null;

class GcodeSender extends EventEmitter {
    constructor() {
        super();
        this.requireStatus = true;
        this.lines = [];
        this.lineCountTotal = 0;   // 一共多少行
        this.lineCountSend = 0;    // 已发送多少行；不包括空行和注释
        this.okCount = 0;
        // idle: 空闲，只有处于此状态，才可以开始发送
        // sending: 正在发送
        // end: 发送结束
        // stopping: 正在停止
        // stopped: 已经停止，然后马上切换到idle
        this.status = "idle";
    }

    onSerialPortData(data) {
        if (data.received === "ok" || data.received.indexOf("ok") === 0) {
            switch (this.status) {
                case "stopping":
                case "sending":
                    ++this.okCount;
                    this._sendNextLine();
                    break;
            }
        }
        // console.log(data.received)
        if (data.received.indexOf("Resend:") === 0) {
            const index = parseInt(data.received.replace("Resend:", "").trim());
            if (Number.isNaN(index)) {
                console.error("error: can not parse resend index. " + data.received);
                return;
            }
            if (index > this.lines.length - 1) {
                console.error(`error: index > this.lines.length - 1. index=${index}, this.lines.length=${this.lines.length}`);
                return;
            }
            const line = this.lines[index];
            if (!line || line.length === 0){
                console.error(`error: line is empty`);
                return;
            }
            console.log(this.lines)
            console.log("#Resend: ", index, line)
            serialPortManager.write(`${line}\n`);
        }
    }

    getStatus() {
        return this.status;
    }

    //注意：发送注释，固件不会返回ok，因此必须把注释过滤掉
    //\n会返回ok
    //空行，注释不发送
    _sendNextLine() {
        //发完了
        if (this.lineCountSend === this.lineCountTotal) {
            this.status === "stopping" && (this.status = "stopped");
            this.status === "sending" && (this.status = "end");
            this._emitStatusChange();
            //reset
            this.requireStatus = true;
            this.lines = [];
            this.lineCountTotal = 0;
            this.lineCountSend = 0;
            this.okCount = 0;
            this.status = "idle";
            this._emitStatusChange();
        } else if (this.lineCountSend < this.lineCountTotal) {
            const line = this.lines[this.lineCountSend++];
            serialPortManager.write(`${line}\n`);
            this._emitStatusChange();
            console.log("send: " + [this.lineCountTotal, this.lineCountSend, this.okCount, line].join("/"))
        } else {
            console.error("error: this.lineCountSend > this.lineCountTotal")
        }
    }

    start(gcode, requireStatus = true) {
        if (this.status !== "idle") {
            console.warn("gcode sender: busy, can not send");
            return;
        }
        this.requireStatus = requireStatus;
        this.lines = this.processGcode(gcode);
        this.lineCountTotal = this.lines.length;
        this.lineCountSend = 0;
        this.okCount = 0;
        this.status = "sending";
        this._emitStatusChange();
        this._sendNextLine();
    }

    /**
     * 处理g-code，去除comment，empty line；增加单双行校验
     * @param gcode
     * @returns {Array}
     */
    processGcode(gcode) {
        const addNumberCheck = (line, lineNumber) => {
            line = `N${lineNumber} ${line}`;
            const xor = calculateXOR(string2utf8bytes(line));
            line = `${line}*${xor}`;
            return line;
        };

        const linesProcessed = [];
        linesProcessed.push(addNumberCheck("M110", 0));
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
                const lineNumber = linesProcessed.length;
                line = addNumberCheck(line, lineNumber);
                linesProcessed.push(line);
                continue;
            }
            line = addNumberCheck(line, linesProcessed.length);
            linesProcessed.push(line)
        }
        linesProcessed.push(addNumberCheck("M110", 0));
        console.log(linesProcessed);
        return linesProcessed;
    }

    stop() {
        this.status = "stopping";
        //目前不区分前端头，laser off，move up 10mm，set 3dp front end temperature to 0
        const gcode = ['M5', 'G91', 'G0 Z10', 'G90', 'M104 S0'].join("\n");
        const linesNumberChecked = this.processGcode(gcode);
        this.lines = linesNumberChecked;
        this.lineCountTotal = this.lines.length;
        this.lineCountSend = 0;
        this.okCount = 0;
        this._emitStatusChange();
    }

    append(gcode) {

    }

    _emitStatusChange() {
        if (this.status !== lastStatus) {
            console.log("gcode sender status -> " + this.status);
            lastStatus = this.status;
        }
        if (this.requireStatus) {
            this.emit(GCODE_SENDER_STATUS_CHANGE, {
                status: this.status,
                lineCountTotal: this.lineCountTotal,
                lineCountSend: this.lineCountSend,
            });
        }
    }
}

const gcodeSender = new GcodeSender();

export default gcodeSender;
