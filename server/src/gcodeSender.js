import EventEmitter from 'events';
import serialPortManager from './serialPortManager.js';
import deviceStateMonitor from './deviceStateMonitor.js';
import {
    GCODE_SENDER_WARNING,
    GCODE_SENDER_STATUS_CHANGE,
    GCODE_SENDER_PROGRESS_CHANGE,
    SERIAL_PORT_CLOSE
} from "./constants";

/**
 *     idle<-----------
 *       A            |
 *       |            |
 *       v            |
 *     started---->stopping
 *       A            A
 *       |            |
 *       v            |
 *     paused----------
 */
class GcodeSender extends EventEmitter {
    constructor() {
        super();
        this.lines = []; // g-code string split to lines
        this.total = 0; // line count of g-code
        this.sent = 0;  // line count of g-code sent
        this.preStatus = null; // status: idle, started, paused, stopping
        this.curStatus = "idle";
        this.taskId = null;
        this.isAckChange = false;
        this.isLaser = false;

        serialPortManager.on(SERIAL_PORT_CLOSE, () => {
            if (["started", "paused"].includes(this.curStatus)) {
                const msg = "DexArm disconnected, G-code sending task has been removed.";
                this.emit(GCODE_SENDER_WARNING, {msg});
            }
            this._reset();
        });
    }

    _emitStatus() {
        if (this.isAckChange) {
            const {preStatus, curStatus, taskId} = this;
            this.emit(GCODE_SENDER_STATUS_CHANGE, {preStatus, curStatus, taskId});
        }
    }

    _emitProgress() {
        if (this.isAckChange) {
            const {total, sent, taskId} = this;
            this.emit(GCODE_SENDER_PROGRESS_CHANGE, {total, sent, taskId});
        }
    }

    //TODO: 逻辑，laser cover, 打开的情况下，再执行laser task。应该监听serial port data，构造其中就监听
    async start(gcode, isAckChange, isLaser, taskId) {
        if (!serialPortManager.getOpened()) {
            const msg = "Please connect DexArm first";
            this.emit(GCODE_SENDER_WARNING, {msg});
            return;
        }
        if (!serialPortManager.readLineParser) {
            const msg = "Param error: readLineParser is null";
            this.emit(GCODE_SENDER_WARNING, {msg});
            return;
        }
        if (deviceStateMonitor.isLaserCoverOpened && isLaser) {
            const msg = "Laser cover opened, please close first";
            this.emit(GCODE_SENDER_WARNING, {msg});
            return;
        }
        switch (this.curStatus) {
            case "idle": {
                this.lines = gcode.trim().split('\n').filter((line) => {
                    return (line.trim().indexOf(";") !== 0 && line.trim().length > 0)
                });
                this.total = this.lines.length;
                this.sent = 0;
                this.preStatus = this.curStatus;
                this.curStatus = "started";
                this.taskId = taskId;
                this.isAckChange = isAckChange;
                this.isLaser = isLaser;
                this._emitStatus();
                await this._startSend();
                break;
            }
            case "started": {
                const msg = "G-code sending task started, please do not repeat";
                this.emit(GCODE_SENDER_WARNING, {msg});
                break;
            }
            case "paused": {
                const msg = "G-code sending task paused, please resume or stop first";
                this.emit(GCODE_SENDER_WARNING, {msg});
                break;
            }
            case "stopping": {
                const msg = "G-code sending task stopping, please wait";
                this.emit(GCODE_SENDER_WARNING, {msg});
                break;
            }
        }
    }

    _reset() {
        this.lines = [];
        this.total = 0;
        this.sent = 0;
        this.preStatus = null;
        this.curStatus = "idle";
        this.taskId = null;
        this.isAckChange = false;
        this.isLaser = false;
    }

    async _startSend() {
        while (this.curStatus === "started") {
            const line = this.lines.shift();
            if (line) {
                ++this.sent;
                await this._sendLine(line);
                this._emitProgress();
            } else {
                this.preStatus = this.curStatus;
                this.curStatus = "idle";
                this._emitStatus();
                this._reset();
                break;
            }
        }
    }

    _sendLine(line) {
        return new Promise((resolve) => {
            serialPortManager.write(`${line}\n`);
            const onData = (data) => {
                data = data.trim();
                if (data.indexOf("ok") === 0) {
                    serialPortManager.readLineParser.removeListener('data', onData);
                    resolve();
                } else if (data.indexOf("wait") === 0) {
                    serialPortManager.write(`${line}\n`)
                } else if (data === 'Warning!Laser protection door opened') {
                    if (this.isLaser) {
                        this.pause();
                    }
                }
            };
            serialPortManager.readLineParser.on('data', onData);
        });
    }

    pause() {
        switch (this.curStatus) {
            case "idle": {
                const msg = "No G-code sending task";
                this.emit(GCODE_SENDER_WARNING, {msg});
                break;
            }
            case "started": {
                this.preStatus = this.curStatus;
                this.curStatus = "paused";
                this._emitStatus();
                break;
            }
            case "paused": {
                const msg = "G-code sending task paused, please do not repeat";
                this.emit(GCODE_SENDER_WARNING, {msg});
                break;
            }
            case "stopping": {
                const msg = "G-code sending task stopping, please wait";
                this.emit(GCODE_SENDER_WARNING, {msg});
                break;
            }
        }
    }

    async resume() {
        if (deviceStateMonitor.isLaserCoverOpened && this.isLaser) {
            const msg = "Laser cover opened, please close first";
            this.emit(GCODE_SENDER_WARNING, {msg});
            return;
        }
        switch (this.curStatus) {
            case "idle": {
                const msg = "No G-code sending task";
                this.emit(GCODE_SENDER_WARNING, {msg});
                break;
            }
            case "started": {
                const msg = "G-code sending task started, no need resume";
                this.emit(GCODE_SENDER_WARNING, {msg});
                break;
            }
            case "paused": {
                this.preStatus = this.curStatus;
                this.curStatus = "started";
                this._emitStatus();
                await this._startSend();
                break;
            }
            case "stopping": {
                const msg = "G-code sending task stopping, please wait";
                this.emit(GCODE_SENDER_WARNING, {msg});
                break;
            }
        }
    }

    async stop() {
        switch (this.curStatus) {
            case "idle": {
                const msg = "No G-code sending task";
                this.emit(GCODE_SENDER_WARNING, {msg});
                break;
            }
            case "started":
            case "paused": {
                this.lines = [];
                this.preStatus = this.curStatus;
                this.curStatus = "stopping";
                this._emitStatus();

                //目前不区分前端头: laser off，move up 10mm，set 3dp front end temperature to 0
                const lines = ['M5', 'M104 S0', 'G91', 'G0 Z10', 'G90'];
                while (true) {
                    const line = lines.shift();
                    if (line) {
                        await this._sendLine(line);
                    } else {
                        this.preStatus = "stopping";
                        this.curStatus = "idle";
                        this._emitStatus();
                        this._reset();
                        break;
                    }
                }
                break;
            }
            case "stopping": {
                const msg = "G-code sending task paused, please do not repeat";
                this.emit(GCODE_SENDER_WARNING, {msg});
                break;
            }
        }
    }
}

const gcodeSender = new GcodeSender();

export default gcodeSender;
