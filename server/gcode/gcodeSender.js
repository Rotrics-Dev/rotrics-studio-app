import EventEmitter from 'events';
import serialPortManager from '../serialPortManager.js';

/**
 * 收到数据
 *
 */
class GcodeSender extends EventEmitter {
    constructor() {
        super();
        this.lines = [];
        this.receivedBuffer = "";

        this.setupListener();
    }

    setupListener() {
        console.log("##### GcodeSender linstener")
        serialPortManager.on("on-serialPort-data", data => {
            console.log("---------------------------------------------------")
            console.log("gcode sender parsed: ");
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
        })
    }

    load(gcode) {
        console.log("# load")
        if (typeof gcode !== "string" || gcode.length === 0) {
            console.log("gcode-send-err")
            this.emit('gcode-send-err', {msg: "gcode is empty"});
            this.lines = [];
            return;
        }
        this.lines = gcode.split('\n');
    }

    //发送注释，固件不会返回ok
    //\n会返回ok
    //空行，注释不发送
    _sendNextCmd() {
        const line = this.lines.shift();
        //发完了
        if (line === null || line === undefined) {
            this.emit('gcode-send-end', {id: "gcode id"});
            return;
        }
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

    start() {
        console.log("# start")
        this._sendNextCmd();
    }

    stop() {
        console.log("# stop")
        this.lines = [];
    }
}

const gcodeSender = new GcodeSender();

export default gcodeSender;
