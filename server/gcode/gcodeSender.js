const EventEmitter = require('events');
const serialPortManager = require('../serialPortManager');

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
            const {received} = data;
            console.log("# received: " + JSON.stringify(received))

            this.receivedBuffer += received.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

            //全部\r\n, \r, 都替换为\n
            console.log("# 1 receivedBuffer：" + this.receivedBuffer)

            let buffer = "";
            for (let i = 0; i < this.receivedBuffer.length; i++) {
                const char = this.receivedBuffer.charAt(i);
                if (char === '\n') {
                    if (buffer === "ok") {
                        this._sendNextCmd();
                    }
                    console.log("buffer: " + buffer);
                    buffer = "";
                } else {
                    buffer += char;
                }
            }
            this.receivedBuffer = buffer;
            console.log("# 2 receivedBuffer：" + this.receivedBuffer)

            console.log("-----------------------------------")
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

    _sendNextCmd() {
        //todo: 不发送注释，空行等
        const line = this.lines.shift();
        if (line === null || line === undefined) {
            this.emit('gcode-send-end', {id: "gcode id"});
        } else {
            console.log("# send: " + line + "\n")
            serialPortManager.write(line + "\n");
        }
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

module.exports = gcodeSender;
