import EventEmitter from 'events';
import serialPortManager from '../serialPortManager.js';
import deviceStateMonitor from '../deviceStateMonitor.js';
import {GCODE_SENDER_REFUSE, GCODE_SENDER_STATUS_CHANGE, GCODE_SENDER_PROGRESS_CHANGE} from "../constants";

// 不限制状态命令
const noStatusLimitGcodes = ['M105']

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
        this.lines = [];
        this.total = 0; // line count of gcode
        this.sent = 0;  // line count of gcode sent
        this.preStatus = null;
        this.curStatus = "idle"; // idle, started, paused, stopping
        this.taskId = null;
        this.isAckChange = false;
        this.isLaser = false;
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

    //TODO: serial port断开时候的处理
    //TODO: 逻辑，laser cover, 打开的情况下，再执行laser task。应该监听serial port data，构造其中就监听
    async start(gcode, isAckChange, isLaser, taskId) {
        if (!serialPortManager.getOpened()) {
            const msg = "Please connect DexArm first";
            this.emit(GCODE_SENDER_REFUSE, {msg});
            return;
        }
        if (!serialPortManager.readLineParser) {
            const msg = "Param error: readLineParser is null";
            this.emit(GCODE_SENDER_REFUSE, {msg});
            return;
        }
        if (deviceStateMonitor.isLaserCoverOpened && isLaser) {
            const msg = "Laser cover opened, please close first";
            this.emit(GCODE_SENDER_REFUSE, {msg});
            return;
        }
        console.log(`当前状态 ${this.curStatus}`)

        // 无状态限制指令：当状态不为准备且第一条命令不相同时，加入至命令队列首位
        if (noStatusLimitGcodes.includes(gcode) 
            && this.curStatus !== 'idle'
            && this.lines[0] !== gcode) {
            const gcodeLines = gcode
                .trim().split('\n')
                .filter((line) => line.trim().indexOf(";") !== 0 && line.trim().length > 0);
            this.lines.unshift(...gcodeLines)

            console.log('加入不限制状态命令至lines头部 ' + gcode)
            console.log(gcodeLines)
            return
        }


        switch (this.curStatus) {
            case "idle": {
                this.lines = gcode
                    .trim()
                    .split('\n')
                    .filter((line) => {
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
                this.emit(GCODE_SENDER_REFUSE, {msg});
                break;
            }
            case "paused": {
                const msg = "G-code sending task paused, please resume or stop first";
                this.emit(GCODE_SENDER_REFUSE, {msg});
                break;
            }
            case "stopping": {
                const msg = "G-code sending task stopping, please wait";
                this.emit(GCODE_SENDER_REFUSE, {msg});
                break;
            }
        }
    }

    _reset() {
        console.log('server reset')

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
        console.log('服务器开始发送')

        while (this.curStatus === "started") {
            const line = this.lines.shift();
            if (line) {
                console.log('行存在')
                ++this.sent;
                await this._sendLine(line);
                console.log('发送行结束')
                this._emitProgress();
            } else {
                console.log('行不存在')
                this.preStatus = this.curStatus;
                this.curStatus = "idle";
                this._emitStatus();
                this._reset();
                break;
            }
        }
    }

    _sendLine(line) {
        console.log(`发送行 ${line}`)

        return new Promise((resolve) => {
            serialPortManager.write(`${line}\n`);
            console.log(`串口写入行 ${line}`)
            const onData = (data) => {
                data = data.trim();
                console.log(`串口返回信息 ${data}`)
                
                if (data.startsWith('T:')) {
                    data = `ok ${data}`
                }

                if (data.indexOf("ok") === 0) {
                    serialPortManager.readLineParser.removeListener('data', onData);
                    console.log(`串口返回ok 移除data监听器`)
                    resolve();
                } else if (data.indexOf("wait") === 0) {
                    serialPortManager.write(`${line}\n`)
                    console.log(`串口返回wait 再次写入行 ${line}`)
                } else if (data === 'Warning!Laser protection door opened') {
                    console.log('激光警告')
                    if (this.isLaser) {
                        this.pause();
                    }
                }
            };
            serialPortManager.readLineParser.on('data', onData);
        });
    }

    pause() {
        console.log('server pause')

        switch (this.curStatus) {
            case "idle": {
                const msg = "No G-code sending task";
                this.emit(GCODE_SENDER_REFUSE, {msg});
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
                this.emit(GCODE_SENDER_REFUSE, {msg});
                break;
            }
            case "stopping": {
                const msg = "G-code sending task stopping, please wait";
                this.emit(GCODE_SENDER_REFUSE, {msg});
                break;
            }
        }
    }

    async resume() {
        console.log('server resume')

        if (deviceStateMonitor.isLaserCoverOpened && this.isLaser) {
            const msg = "Laser cover opened, please close first";
            this.emit(GCODE_SENDER_REFUSE, {msg});
            return;
        }
        switch (this.curStatus) {
            case "idle": {
                const msg = "No G-code sending task";
                this.emit(GCODE_SENDER_REFUSE, {msg});
                break;
            }
            case "started": {
                const msg = "G-code sending task started, no need resume";
                this.emit(GCODE_SENDER_REFUSE, {msg});
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
                this.emit(GCODE_SENDER_REFUSE, {msg});
                break;
            }
        }
    }

    async stop() {
        console.log('server stop')

        switch (this.curStatus) {
            case "idle": {
                const msg = "No G-code sending task";
                this.emit(GCODE_SENDER_REFUSE, {msg});
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
                this.emit(GCODE_SENDER_REFUSE, {msg});
                break;
            }
        }
    }
}

const gcodeSender = new GcodeSender();
export default gcodeSender;