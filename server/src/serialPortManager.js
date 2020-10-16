import EventEmitter from 'events';
import SerialPort from 'serialport';
import ReadLineParser from '@serialport/parser-readline';
import _ from 'lodash';
import {
    SERIAL_PORT_ON_GET_ALL_PATHS,
    SERIAL_PORT_ON_OPEN,
    SERIAL_PORT_ON_CLOSE,
    SERIAL_PORT_ON_ERROR,
    SERIAL_PORT_ON_WRITE_ERROR,
    SERIAL_PORT_ON_WRITE_OK,
    SERIAL_PORT_ON_WARNING,
    SERIAL_PORT_ON_RECEIVED_LINE,
    SERIAL_PORT_ON_INSERT,
    SERIAL_PORT_ON_PULL_OUT
} from "./constants.js"

const MANUFACTURER_DEX_ARM = 'STMicroelectronics';

/**
 * serial port断电，不会触发任何event，port.isOpen依旧是true；只能用通过比对SerialPort.list监测
 * TODO: 打开新的串口，应该remove前一个串口的listener；等出bug时候再说
 * 触发error callback时候，其中的参数error可能为null
 * 也可能是标准的Error：https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
 */
class SerialPortManager extends EventEmitter {
    constructor() {
        super();
        this.port = null;
        this.readLineParser = null;
        this._prePaths = [];
        this._curPaths = [];

        //监测port插拔
        setInterval(() => {
            SerialPort.list().then(
                (ports) => {
                    ports = ports.filter(({manufacturer}) => {
                        return manufacturer === MANUFACTURER_DEX_ARM;
                    });
                    //逻辑不够严谨，但实际使用中没问题
                    this._curPaths = ports.map(port => {
                        return port.path;
                    });
                    if (this._curPaths.length < this._prePaths.length) {
                        if (this.isOpen()) {
                            const openPath = this.getOpenPath();
                            if (!this._curPaths.includes(openPath)) {
                                console.log("serial port -> open port is pulled out: " + openPath);
                                this.port = null;
                                this.readLineParser = null;
                                this.emit(SERIAL_PORT_ON_CLOSE, openPath);
                            }
                        }

                        const paths = _.difference(this._prePaths, this._curPaths);
                        this.emit(SERIAL_PORT_ON_PULL_OUT, paths);
                        this._prePaths = this._curPaths;
                    } else if (this._curPaths.length > this._prePaths.length) {
                        const paths = _.difference(this._curPaths, this._prePaths);
                        this.emit(SERIAL_PORT_ON_INSERT, paths);
                        this._prePaths = this._curPaths;
                    }
                },
                (error) => {
                    if (error) {
                        this.emit(SERIAL_PORT_ON_ERROR, {message: error.message});
                    } else {
                        this.emit(SERIAL_PORT_ON_ERROR, {message: 'serial port error occurs when list path: unknown error'});
                    }
                }
            )
        }, 1000)
    }

    getAllPaths() {
        SerialPort.list().then(
            (ports) => {
                ports = ports.filter(({manufacturer}) => {
                    return manufacturer === MANUFACTURER_DEX_ARM;
                });
                const paths = ports.map(item => {
                    return item.path;
                });
                this.emit(SERIAL_PORT_ON_GET_ALL_PATHS, paths);
            },
            (error) => {
                if (error) {
                    this.emit(SERIAL_PORT_ON_ERROR, {message: error.message});
                } else {
                    this.emit(SERIAL_PORT_ON_ERROR, {message: 'serial port error occurs when list path: unknown error'});
                }
            });
    }

    isOpen() {
        return !!this.getOpenPath()
    }

    getOpenPath() {
        if (this.port && this.port.isOpen) {
            return this.port.path;
        } else {
            return null;
        }
    }

    _openNew(path, baudRate) {
        if (typeof path !== 'string') {
            this.emit(SERIAL_PORT_ON_WARNING, {message: "can not open serial port: path must be string"});
            return;
        }

        this.port = new SerialPort(path, {baudRate, autoOpen: false});

        this.port.on("open", () => {
            console.log("serial port -> open: " + this.port.path);
            this.emit(SERIAL_PORT_ON_OPEN, this.port.path);
        });

        this.port.on("close", (error) => {
            console.log("serial port -> close: " + this.port.path);
            this.emit(SERIAL_PORT_ON_CLOSE, this.port.path);
            this.port = null;
            this.readLineParser = null;
            if (error) {
                this.emit(SERIAL_PORT_ON_ERROR, {message: error.message});
            }
        });

        this.port.on("error", (error) => {
            this.port = null;
            this.readLineParser = null;
            if (error) {
                this.emit(SERIAL_PORT_ON_ERROR, {message: error.message});
            } else {
                this.emit(SERIAL_PORT_ON_ERROR, {message: 'serial port error occurs: unknown error'});
            }
        });

        this.readLineParser = this.port.pipe(new ReadLineParser({delimiter: '\n'}));
        this.readLineParser.on('data', (line) => {
            this.emit(SERIAL_PORT_ON_RECEIVED_LINE, line);
        });

        this.port.open((error) => {
            if (error) {
                this.emit(SERIAL_PORT_ON_ERROR, {message: error.message});
            }
        });
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
    open(path, baudRate = 9600) {
        //case-1
        if (!this.port) {
            this._openNew(path, baudRate);
            return;
        }

        //case-2
        if (this.port.isOpen && this.port.path === path) {
            this.emit(SERIAL_PORT_ON_WARNING, {message: "the port already open"});
            return;
        }

        //case-3
        if (this.port.isOpen && this.port.path !== path) {
            this.close();
            this._openNew(path, baudRate);
            return;
        }

        //case-4
        if (!this.port.isOpen && this.port.path === path) {
            this._openNew(path, baudRate);
            return;
        }

        //case-5
        if (!this.port.isOpen && this.port.path !== path) {
            this._openNew(path, baudRate);
            return;
        }
    }

    close() {
        if (this.isOpen()) {
            this.port.close((error) => {
                if (error) {
                    this.emit(SERIAL_PORT_ON_ERROR, {message: error.message});
                }
            });
        } else {
            this.emit(SERIAL_PORT_ON_WARNING, {message: "can not close serial port: no port open"});
        }
    }

    //data: string|Buffer|Array<number>
    write(data) {
        if (this.isOpen()) {
            this.port.write(data, (error) => {
                if (error) {
                    this.emit(SERIAL_PORT_ON_WRITE_ERROR, {message: error.message, data});
                    this.emit(SERIAL_PORT_ON_CLOSE, this.port.path);
                    this.port = null;
                    this.readLineParser = null;
                } else {
                    this.emit(SERIAL_PORT_ON_WRITE_OK, {data});
                }
            });
        } else {
            this.emit(SERIAL_PORT_ON_WARNING, {message: "can not write serial port: port closed"});
        }
    }
}

const serialPortManager = new SerialPortManager();

export default serialPortManager;
