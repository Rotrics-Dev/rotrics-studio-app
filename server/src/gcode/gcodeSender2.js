import EventEmitter from 'events';
import serialPortManager from '../serialPortManager.js';
import {string2utf8bytes, calculateXOR} from '../utils/index.js';
import {GCODE_SENDER_REFUSE, GCODE_SENDER_STATUS_CHANGE} from "../constants";

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
        this.isTask = false;
        this.lines = [];
        this.lineCountTotal = 0;   // 一共多少行
        this.lineCountSend = 0;    // 已发送多少行；不包括空行和注释
        this.okCount = 0;
        // idle: 空闲，只有处于此状态，才可以开始发送
        // start: 开始发送
        // sending: 正在发送
        // pause: 暂停
        // end: 发送结束
        // stopping: 正在停止
        // stopped: 已经停止，然后马上切换到idle
        this.preStatus = null;
        this.curStatus = "idle";
        this.isLaserCoverOpened = false;
        this.isLaser = false;
    }

    onSerialPortData(data) {
        console.log('server 监听串口数据')

        if (data.received === "ok" || data.received.indexOf("ok") === 0 || data.received.indexOf("wait") === 0) {
            const seconds = new Date().getSeconds();
            console.log(`${data.received} # ${this.okCount} # ${seconds}`);
        }

        // Warning!Laser protection door opened
        // Laser protection door closed
        switch (data.received) {
            case "Warning!Laser protection door opened":
                this.isLaserCoverOpened = true;
                console.log("open " + this.isTask + "--" + this.isLaser)
                if (this.curStatus === "started" && this.isTask && this.isLaser) {
                    this.preStatus = "started";
                    this.curStatus = "paused";
                    this.emitStatus();
                }
                break;
            case "Laser protection door closed":
                this.isLaserCoverOpened = false;
                break;
        }

        if (data.received === "ok" || data.received.indexOf("ok") === 0) {
            switch (this.curStatus) {
                case "started":
                case "stopping":
                    ++this.okCount;
                    this.sendNextLine();
                    break;
            }
        }
        if (data.received.indexOf("Resend:") === 0) {
            console.log("#####: " + data.received)
            const index = parseInt(data.received.replace("Resend:", "").trim());
            if (Number.isNaN(index)) {
                console.error("error: can not parse resend index. " + data.received);
                return;
            }
            // if (index > this.lines.length - 1) {
            //     console.error(`error: index > this.lines.length - 1. index=${index}, this.lines.length=${this.lines.length}`);
            //     return;
            // }
            // const line = this.lines[index];
            // if (!line || line.length === 0) {
            //     console.error(`error: line is empty`);
            //     return;
            // }
            // // console.log(this.lines)
            // console.log("#Resend: ", index, line)
            // serialPortManager.write(`${line}\n`);
        }
    }

    getStatus() {
        return this.curStatus;
    }

    //注意：发送注释，固件不会返回ok，因此必须把注释过滤掉
    //\n会返回ok
    //空行，注释不发送
    sendNextLine() {
        //发完了
        if (this.lineCountSend === this.lineCountTotal && this.lineCountTotal > 0) {
            if (this.curStatus === "stopping") {
                this.preStatus = "stopping";
                this.curStatus = "idle";
                this.emitStatus();
            } else if (this.curStatus === "started") {
                this.preStatus = "started";
                this.curStatus = "idle";
                this.emitStatus();
            } else {
                console.error("status err");
            }
            //reset
            this.isTask = false;
            this.lines = [];
            this.lineCountTotal = 0;
            this.lineCountSend = 0;
            this.okCount = 0;
            this.curStatus = "idle";
        } else if (this.lineCountSend < this.lineCountTotal && this.lineCountTotal > 0) {
            const line = this.lines[this.lineCountSend++];
            serialPortManager.write(`${line}\n`);
            const seconds = new Date().getSeconds();
            console.log("send: " + [this.lineCountTotal, this.lineCountSend, this.okCount, line, seconds].join("/"))
        } else {
            console.error("error: this.lineCountSend > this.lineCountTotal")
        }
    }

    /**
     *
     * @param gcode
     * @param isTask 是否是task
     */
    start(gcode, isTask, isLaser) {
        console.log("# start")
        if (!serialPortManager.getOpened()) {
            const msg = "Please connect DexArm first";
            this.emit(GCODE_SENDER_REFUSE, {msg});
            return;
        }
        //case-0: laser cover opened + task
        //case-1: started + task
        //case-2: started + not task
        //case-3: stopping + task
        //case-4: stopping + not task
        //case-5: paused + not task
        //case-6: paused + task
        //case-7: idle
        if (this.isLaserCoverOpened && this.isTask) {
            const msg = "Laser cover opened, please close first";
            this.emit(GCODE_SENDER_REFUSE, {msg});
            return;
        }
        if (this.curStatus === "started" && this.isTask) {
            const msg = "Task started, please stop first";
            this.emit(GCODE_SENDER_REFUSE, {msg});
            return;
        }
        if (this.curStatus === "started" && !this.isTask) {
            const msg = "Gcode started, please wait a second";
            this.emit(GCODE_SENDER_REFUSE, {msg});
            return;
        }
        if (this.curStatus === "stopping" && this.isTask) {
            const msg = "Task stopping, please wait a second";
            this.emit(GCODE_SENDER_REFUSE, {msg});
            return;
        }
        if (this.curStatus === "stopping" && !this.isTask) {
            console.error("start logic err 1");
            return;
        }
        if (this.curStatus === "paused" && this.isTask) {
            const msg = "Task paused, please stop first";
            console.warn(msg);
            this.emit(GCODE_SENDER_REFUSE, {msg});
            return;
        }
        if (this.curStatus === "paused" && !this.isTask) {
            console.error("start logic err 2");
            return;
        }
        if (this.curStatus === "idle") {
            this.isLaser = isLaser;
            this.isTask = isTask;
            this.lines = this.processGcode(gcode);
            this.lineCountTotal = this.lines.length;
            this.lineCountSend = 0;
            this.okCount = 0;
            this.preStatus = "idle";
            this.curStatus = "started";
            this.emitStatus();
            this.sendNextLine();
            return;
        }
        console.error("start logic err 3");
    }

    /**
     * laser：off
     * write draw：move up
     */
    pauseTask() {
        console.log("# pauseTask")
        if (!serialPortManager.getOpened()) {
            const msg = "Please connect DexArm first";
            this.emit(GCODE_SENDER_REFUSE, {msg});
            return;
        }
        if (this.curStatus === "started" && this.isTask) {
            this.preStatus = "started";
            this.curStatus = "paused";
            this.emitStatus();
            this.sendNextLine();
            return;
        }
        if (this.curStatus === "started" && !this.isTask) {
            const msg = "No task to pause";
            this.emit(GCODE_SENDER_REFUSE, {msg});
            return;
        }
        if (this.curStatus === "stopping" && this.isTask) {
            const msg = "Task stopping, can not pause";
            this.emit(GCODE_SENDER_REFUSE, {msg});
            return;
        }
        if (this.curStatus === "stopping" && !this.isTask) {
            console.error("pauseTask logic err 2");
            return;
        }
        if (this.curStatus === "paused" && this.isTask) {
            const msg = "Task paused, do not pause again";
            this.emit(GCODE_SENDER_REFUSE, {msg});
            return;
        }
        if (this.curStatus === "paused" && !this.isTask) {
            console.error("pauseTask logic err 3");
            return;
        }
        if (this.curStatus === "idle") {
            const msg = "No task to pause";
            this.emit(GCODE_SENDER_REFUSE, {msg});
            return;
        }
        console.error("pauseTask logic err 4");
    }

    resumeTask() {
        console.log("# resumeTask")
        if (!serialPortManager.getOpened()) {
            const msg = "Please connect DexArm first";
            this.emit(GCODE_SENDER_REFUSE, {msg});
            return;
        }
        if (this.isLaserCoverOpened && this.isTask) {
            const msg = "Laser cover opened, please close first";
            this.emit(GCODE_SENDER_REFUSE, {msg});
            return;
        }
        if (this.curStatus === "started" && this.isTask) {
            const msg = "Task started, no need resume";
            this.emit(GCODE_SENDER_REFUSE, {msg});
            return;
        }
        if (this.curStatus === "started" && !this.isTask) {
            const msg = "No task to resume";
            this.emit(GCODE_SENDER_REFUSE, {msg});
            return;
        }
        if (this.curStatus === "stopping" && this.isTask) {
            const msg = "Task stopping, can not resume";
            this.emit(GCODE_SENDER_REFUSE, {msg});
            return;
        }
        if (this.curStatus === "stopping" && !this.isTask) {
            console.error("resumeTask logic err 1");
            return;
        }
        if (this.curStatus === "paused" && this.isTask) {
            this.preStatus = "paused";
            this.curStatus = "started";
            this.emitStatus();
            this.sendNextLine();
            return;
        }
        if (this.curStatus === "paused" && !this.isTask) {
            console.error("resumeTask logic err 2");
            return;
        }
        if (this.curStatus === "idle") {
            const msg = "No task to resume";
            this.emit(GCODE_SENDER_REFUSE, {msg});
            return;
        }
        console.error("resumeTask logic err 3");
    }

    stopTask() {
        console.log("# stopTask")
        if (!serialPortManager.getOpened()) {
            const msg = "Please connect DexArm first";
            this.emit(GCODE_SENDER_REFUSE, {msg});
            return;
        }
        if (this.curStatus === "started" && this.isTask) {
            this.preStatus = "started";
            this.curStatus = "stopping";
            this.emitStatus();
            //目前不区分前端头，laser off，move up 10mm，set 3dp front end temperature to 0, turn off cover fan
            const gcode = ['M5', 'G91', 'G0 Z10', 'G90', 'M104 S0', 'M888 P15'].join("\n");
            const linesNumberChecked = this.processGcode(gcode);
            this.lines = linesNumberChecked;
            this.lineCountTotal = this.lines.length;
            this.lineCountSend = 0;
            this.okCount = 0;
            this.sendNextLine();
            return;
        }
        if (this.curStatus === "started" && !this.isTask) {
            const msg = "No task to stop";
            this.emit(GCODE_SENDER_REFUSE, {msg});
            return;
        }
        if (this.curStatus === "stopping" && this.isTask) {
            const msg = "Task stopping, no need to stop again";
            this.emit(GCODE_SENDER_REFUSE, {msg});
            return;
        }
        if (this.curStatus === "stopping" && !this.isTask) {
            console.error("logic err 1");
            return;
        }
        if (this.curStatus === "paused" && this.isTask) {
            this.preStatus = "paused";
            this.curStatus = "stopping";
            this.emitStatus();
            //目前不区分前端头，laser off，move up 10mm，set 3dp front end temperature to 0
            const gcode = ['M5', 'G91', 'G0 Z10', 'G90', 'M104 S0'].join("\n");
            const linesNumberChecked = this.processGcode(gcode);
            this.lines = linesNumberChecked;
            this.lineCountTotal = this.lines.length;
            this.lineCountSend = 0;
            this.okCount = 0;
            this.sendNextLine();
            return;
        }
        if (this.curStatus === "paused" && !this.isTask) {
            console.error("stopTask logic err 2");
            return;
        }
        if (this.curStatus === "idle") {
            const msg = "No task to stop";
            this.emit(GCODE_SENDER_REFUSE, {msg});
            return;
        }
        console.error("stopTask logic err 3");
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

    emitStatus() {
        const {preStatus, curStatus} = this;
        console.log("gcode sender status: " + preStatus + " -> " + curStatus);
        if (this.isTask) {
            this.emit(GCODE_SENDER_STATUS_CHANGE, {
                preStatus,
                curStatus,
            });
        }
    }
}

const gcodeSender = new GcodeSender();

export default gcodeSender;
