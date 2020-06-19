import EventEmitter from 'events';
import SerialPort from 'serialport';
import ReadLineParser from '@serialport/parser-readline';

import {utf8bytes2string} from './utils/index.js';
import {
    SERIAL_PORT_GET_PATH,
    SERIAL_PORT_GET_OPENED,
    SERIAL_PORT_OPEN,
    SERIAL_PORT_CLOSE,
    SERIAL_PORT_ERROR,
    SERIAL_PORT_DATA,
    SERIAL_PORT_WRITE
} from "./constants.js"

const baudRate = 9600;

//TODO: 打开新的串口，应该remove前一个串口的listener；等出bug时候再说
class SerialPortManager extends EventEmitter {
    constructor() {
        super();
        this.serialPort = null;
        this.receivedBuffer = "";
        setInterval(() => {
            SerialPort.list().then(
                (ports) => {
                    const paths = ports.map(item => {
                        return item.path;
                    });
                    this.emit(SERIAL_PORT_GET_PATH, paths);

                    if (this.serialPort && !paths.includes(this.serialPort.path)) {
                        this.emit(SERIAL_PORT_CLOSE, this.serialPort.path);
                        this.serialPort = null;
                    }
                },
                (error) => {
                    this.emit(SERIAL_PORT_ERROR, error);
                }
            )
        }, 300)
    }

    getOpened() {
        if (this.serialPort && this.serialPort.isOpen) {
            this.emit(SERIAL_PORT_GET_OPENED, this.serialPort.path);
        }
    }

    _openNew(path) {
        this.serialPort = new SerialPort(path, {baudRate, autoOpen: false});

        const readLineParser = this.serialPort.pipe(new ReadLineParser({delimiter: '\n'}));
        readLineParser.on('data', (data) => {
            console.log("###: " + JSON.stringify(data));
            this.emit(SERIAL_PORT_DATA, {received: data});
        });

        this.serialPort.on("open", () => {
            console.log("serial port -> open: " + this.serialPort.path);
            this.emit(SERIAL_PORT_OPEN, this.serialPort.path);
        });

        this.serialPort.on("close", () => {
            console.log("serial port -> close: " + this.serialPort.path);
            this.emit(SERIAL_PORT_CLOSE, this.serialPort.path);
            this.serialPort = null;
        });

        this.serialPort.on("error", () => {
            console.log("serial port -> error: " + this.serialPort.path);
            this.emit(SERIAL_PORT_ERROR);
            this.serialPort = null;
        });

        //data: 类型是buffer的数组
        //将buffer转为string，发送到前端
        // this.serialPort.on("data", (buffer) => {
        //     if (Buffer.isBuffer(buffer)) {
        //         const arr = [];
        //         for (let i = 0; i < buffer.length; i++) {
        //             arr.push(buffer[i]);
        //         }
        //
        //         const received = utf8bytes2string(arr);
        //
        //         console.log("received raw: " + received);
        //
        //         //全部\r\n, \r, 多个\n，都替换为一个\n
        //         this.receivedBuffer += received.replace(/(\r\n|\r|\n)/g, '\n');
        //         let bufferStr = "";
        //         for (let i = 0; i < this.receivedBuffer.length; i++) {
        //             const char = this.receivedBuffer.charAt(i);
        //             if (char !== '\n') {
        //                 bufferStr += char;
        //             } else {
        //                 console.log("received: " + bufferStr);
        //                 this.emit(SERIAL_PORT_DATA, {received: bufferStr});
        //                 bufferStr = "";
        //             }
        //         }
        //         //剩余的buffer不能丢掉
        //         this.receivedBuffer = bufferStr;
        //     } else {
        //         console.log("received data is not buffer: " + JSON.stringify(buffer))
        //     }
        // });

        this.serialPort.open((error) => {
            if (error) {
                this.serialPort = null;
                this.emit(SERIAL_PORT_ERROR, error);
            }
        })
    }

    /**
     * 5种情况
     * serialPort===null: [case-1]，开一个新的
     *
     *                           |--path相同 [case-2]，提示已经打开
     *                     --open
     *                     |     |--path不同 [case-3]，关闭之前的，打开新的
     * serialPort!==null --
     *                     |         |--path相同 [case-4]，开一个新的
     *                     --not open
     *                               |--path不同 [case-5]，之前的不用管，开一个新的
     * @param path
     */
    open(path) {
        //case-1
        if (!this.serialPort) {
            this._openNew(path);
            return;
        }

        //case-2
        if (this.serialPort.isOpen && this.serialPort.path === path) {
            console.log("The port " + path + " has been opened");
            this.emit(SERIAL_PORT_OPEN, this.serialPort.path);
            return;
        }

        //case-3
        if (this.serialPort.isOpen && this.serialPort.path !== path) {
            this.close();
            this._openNew(path);
            return;
        }

        //case-4
        if (!this.serialPort.isOpen && this.serialPort.path === path) {
            this._openNew(path);
            return;
        }

        //case-5
        if (!this.serialPort.isOpen && this.serialPort.path !== path) {
            this._openNew(path);
            return;
        }
    }

    close() {
        if (this.serialPort && this.serialPort.isOpen) {
            this.serialPort.close((error) => {
                if (error) {
                    this.emit(SERIAL_PORT_ERROR, error);
                }
            });
        }
    }

    //data: string|Buffer|Array<number>
    write(data) {
        if (this.serialPort && this.serialPort.isOpen) {
            this.serialPort.write(data, (error) => {
                if (error) {
                    console.log("write error: " + data);
                    this.emit(SERIAL_PORT_ERROR, error);
                } else {
                    // console.log("write ok: " + data);
                }
            })
        } else {
            console.log("Port is closed");
        }
    }
}

const serialPortManager = new SerialPortManager();

export default serialPortManager;
