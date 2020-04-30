const EventEmitter = require('events');
const SerialPort = require('serialport');

const {utf8bytes2string} = require('./utils');

const baudRate = 115200;

class SerialPortManager extends EventEmitter {
    constructor() {
        super();
        this.serialPort = null;
    }

    list() {
        SerialPort.list().then(
            (ports) => {
                const paths = ports.map(item => {
                    return item.path;
                });
                this.emit('on-serialPort-query', {paths});
            },
            (error) => {
                this.emit('on-serialPort-error', {error});
            }
        )
    }

    //todo：打开不同的串口
    open(path) {
        if (this.serialPort && this.serialPort.isOpen) {
            console.log("do not re-open");
            return;
        }
        this.serialPort = new SerialPort(path, {baudRate, autoOpen: false});
        this.serialPort.open((error) => {
            if (error) {
                this.serialPort = null;
                this.emit('on-serialPort-error', {error});
                return;
            }
            this.emit('on-serialPort-open', {path});
            this._setupListener();
        })
    }

    close() {
        if (this.serialPort && this.serialPort.isOpen) {
            this.serialPort.close((error) => {
                if (error) {
                    this.emit('on-serialPort-error', {error});
                }
            });
        }
    }

    //data: string|Buffer|Array<number>
    write(data) {
        console.log("write: " + data)
        if (this.serialPort && this.serialPort.isOpen) {
            this.serialPort.write(data, (err) => {
                if (err) {
                    this.emit('on-serialPort-error', {err});
                    //todo: this.serialPort = null; ?
                } else {
                    console.log("write ok")
                }
            })
        }
    }

    _setupListener() {
        console.log("# _setupListener")
        this.serialPort.on("open", () => {
            this.emit('on-serialPort-open', {path: this.serialPort.path});
        });

        this.serialPort.on("close", () => {
            this.emit('on-serialPort-close', {path: this.serialPort.path});
            this.serialPort = null;
        });

        this.serialPort.on("error", () => {
            this.emit('on-serialPort-error');
            this.serialPort = null;
        });

        //data: 类型是buffer的数组
        //将buffer转为string，发送到前端
        this.serialPort.on("data", (buffer) => {
            console.log("# serialPort.on data")
            if (Buffer.isBuffer(buffer)){
                const arr = [];
                for (let i = 0; i < buffer.length; i++){
                    arr.push(buffer[i]);
                }

                console.log("serialPort received: " + utf8bytes2string(arr));
                this.emit('on-serialPort-data', {received: utf8bytes2string(arr)});
            }
        });
    }
}

const serialPortManager = new SerialPortManager();

module.exports = serialPortManager;
