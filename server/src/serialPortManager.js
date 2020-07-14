import EventEmitter from 'events';
import SerialPort from 'serialport';
import ReadLineParser from '@serialport/parser-readline';
import {
    SERIAL_PORT_PATH_UPDATE,
    SERIAL_PORT_GET_OPENED,
    SERIAL_PORT_OPEN,
    SERIAL_PORT_CLOSE,
    SERIAL_PORT_ERROR,
    SERIAL_PORT_DATA,
} from "./constants.js"

const baudRate = 9600;

//TODO: 打开新的串口，应该remove前一个串口的listener；等出bug时候再说
class SerialPortManager extends EventEmitter {
    constructor() {
        super();
        this.serialPort = null;
        setInterval(() => {
            //定期返回paths
            SerialPort.list().then(
                (ports) => {
                    const paths = ports.map(item => {
                        return item.path;
                    });
                    this.emit(SERIAL_PORT_PATH_UPDATE, paths);

                    //serial port open后，被拔掉
                    if (this.serialPort && this.serialPort.isOpen && !paths.includes(this.serialPort.path)) {
                        console.log("serial port -> close: opened port is pulled out: " + this.serialPort.path);
                        this.emit(SERIAL_PORT_CLOSE, this.serialPort.path);
                        this.serialPort = null;
                    }
                },
                (error) => {
                    this.emit(SERIAL_PORT_ERROR, error);
                }
            )
        }, 500)
    }

    getOpened() {
        if (this.serialPort && this.serialPort.isOpen) {
            return this.serialPort.path;
        } else {
            return null;
        }
    }

    _openNew(path) {
        this.serialPort = new SerialPort(path, {baudRate, autoOpen: false});

        const readLineParser = this.serialPort.pipe(new ReadLineParser({delimiter: '\n'}));
        readLineParser.on('data', (data) => {
            console.log("received line: " + JSON.stringify(data));
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
                    console.error("write error: " + data);
                    this.emit(SERIAL_PORT_ERROR, error);
                } else {
                    console.log("write ok: " + data);
                }
            })
        } else {
            console.warn("Port is closed");
        }
    }
}

const serialPortManager = new SerialPortManager();

export default serialPortManager;
