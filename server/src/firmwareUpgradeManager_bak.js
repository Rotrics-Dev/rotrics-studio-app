import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import isOnline from "is-online";
import request from 'request';
import SerialPort from 'serialport';
import ReadLineParser from '@serialport/parser-readline';
import {start_frame, end_frame, eot, chunk_frame} from "./frameUtil.js";
import {SERIAL_PORT_DATA} from "./constants.js"
import serialPortManager from './serialPortManager.js';

const baudRate = 9600;

const sleep = time => {
    return new Promise(resolve => {
        setTimeout(resolve, time * 1000)
    })
};

class FirmwareUpgradeManager_bak {
    constructor() {
        this.path = null; //serial port path
        this.serialPort = null;
        this.frames = [];
        this.frameCount = 0;
        this.curFrame = null;
        this.cCount = 0;
        this.ackCount = 0;
        this.onChange = null;
    }


    //onChange(current, status, description)
    //step: 参考web/src/containers/settings/General.jsx
    //status: 和antd step保持一致 https://ant.design/components/steps-cn/
    async start(onChange) {
        this.path = serialPortManager.getOpened();
        this.serialPort = null;
        this.readLineParser = null;
        this.frames = [];
        this.frameCount = 0;
        this.curFrame = null;
        this.cCount = 0;
        this.ackCount = 0;
        this.onChange = onChange;

        //step-0: Check: serial port/internet/is sending gcode
        this.onChange(0, 'process');
        //serial port是否连接
        if (!this.path) {
            this.onChange(0, 'error', 'Connect DexArm first');
            return;
        }
        //断开，重新连接
        serialPortManager.close();
        if (!(await this.openSerialPort())) {
            this.onChange(0, 'error', 'Connect DexArm failed');
            return;
        }
        //网络是否可用
        if (!(await isOnline())) {
            this.onChange(0, 'error', 'Internet is not available');
            return;
        }

        //step-1: Collect DexArm info
        this.onChange(1, 'process');
        //获取设备的固件，硬件版本号
        const deviceInfo = await this.getDeviceInfo();
        if (!deviceInfo) {
            this.onChange(1, 'error', 'Collect DexArm info failed');
            return;
        }
        const {firmwareVersion, hardwareVersion} = deviceInfo;

        //step-2: Check need upgrade
        this.onChange(2, 'process');
        const {isNeedUpgrade, err, url} = await this.isNeedUpgrade(firmwareVersion, hardwareVersion);
        if (err) {
            this.onChange(2, 'error', err);
            return;
        }
        if (!isNeedUpgrade) {
            this.onChange(2, 'finish', 'Firmware is up to date');
            return;
        }

        //step-3: Download firmware
        this.onChange(3, 'process');

        //获取固件升级信息
        const upgradeInfo = await this.downloadFirmware(url);
        //下载固件文件到本地，并准备数据
        let firmwarePath = null;
        firmwarePath = "/Users/liuming/Desktop/firmware/Firmware_V2.1.3/Firmware_V2.1.3_For_Hardware_V3.2_20200521.bin";
        firmwarePath = "/Users/liuming/Desktop/firmware/Firmware_V2.1.2/Firmware_V2.1.2_For_Hardware_V3.2_20200520.bin";
        const firmwareName = "Firmware_V2.1.3_For_Hardware_V3.2_20200521.bin";
        this.frames = this.prepareData(firmwarePath, firmwareName);
        this.frameCount = this.frames.length;


        //step-4: Enter boot loader
        this.onChange(4, 'process');
        if (!(await this.enterBootLoader())) {
            this.onChange(4, 'error', 'Enter boot loader failed');
            return;
        }

        sleep(2);

        //step-5: Connect DexArm
        this.onChange(5, 'process');
        //重新open serial port
        if (!(await this.openSerialPort())) {
            this.onChange(5, 'error', 'Connect DexArm failed');
            return;
        }

        //step-6: Load firmware
        this.onChange(6, 'process');
        if (!(await this.loadFirmware())) {
            this.onChange(6, 'error', 'Load firmware failed');
            return;
        }

        setTimeout(() => {
            this.write("3");
        }, 1000)
    }

    async isInternetAvailable() {
        return await isOnline();
    }

    async downloadFirmware(url) {
        const tryFetchFirmwareUpgradeInfo = () => {
            return new Promise(resolve => {
                const timerId = setTimeout(() => {
                    resolve(false);
                }, 5000);
                let stream = fs.createWriteStream(path.join("/Users/liuming/Desktop/Rotrics", "lm2.bin"));
                request(url).pipe(stream).on("close", (err) => {
                    clearTimeout(timerId);
                    if (err) {
                        console.log("err: ", err);
                        resolve(false);
                        return;
                    }
                    resolve(true);
                    console.log("文件下载完毕");
                });
            });
        };
        return await tryFetchFirmwareUpgradeInfo();
    }

    //获取设备的固件，硬件版本号
    async getDeviceInfo() {
        const tryGetDeviceInfo = () => {
            return new Promise(resolve => {
                let firmwareVersion = null;
                let hardwareVersion = null;
                const timerId = setTimeout(() => {
                    console.log("timeout: getDeviceInfo")
                    this.serialPort.removeAllListeners(["data"]);
                    resolve(false);
                }, 2000);
                const readLineParser = this.serialPort.pipe(new ReadLineParser({delimiter: '\n'}));
                readLineParser.on('data', (line) => {
                    line = line.replace(new RegExp('\r', 'g'), "").trim();
                    if (line !== "ok") {
                        console.log("getDeviceInfo line: " + line)
                        if (line.indexOf("Firmware ") === 0) {
                            firmwareVersion = line.replace("Firmware", "").trim();
                        }
                        if (line.indexOf("Hardware ") === 0) {
                            hardwareVersion = line.replace("Hardware", "").trim();
                        }
                        if (firmwareVersion && hardwareVersion) {
                            this.serialPort.removeAllListeners(["data"]);
                            clearTimeout(timerId);
                            resolve({firmwareVersion, hardwareVersion});
                        }
                    }
                });
                this.write('M2010\nM2011\n');
            });
        };
        return await tryGetDeviceInfo();
    }

    /**
     * 检查是否需要upgrade
     * @param firmwareVersion
     * @param hardwareVersion
     * @returns {isNeedUpgrade: true/false, err, url}
     */
    async isNeedUpgrade(firmwareVersion, hardwareVersion) {
        const exe = () => {
            return new Promise(resolve => {
                const result = {
                    isNeedUpgrade: null,
                    err: null,
                    url: null
                };
                const timerId = setTimeout(() => {
                    result.err = "time out";
                    resolve(result);
                }, 5000);
                const api = `http://api.rotrics.com/version/firmware/version?version=${firmwareVersion}&hardwareVersion=${hardwareVersion}`;
                request(api, (error, response, body) => {
                    clearTimeout(timerId);
                    if (error) {
                        result.err = "request error";
                        resolve(result);
                        return;
                    }
                    if (!response) {
                        result.err = "response is null";
                        resolve(result);
                        return;
                    }
                    if (response.statusCode !== 200) {
                        result.err = "response statusCode is not 200";
                        resolve(result);
                        return;
                    }
                    //body:
                    //无新版本，则data=null
                    // {
                    //     "code": 200,
                    //     "message": "Success",
                    //     "data": {
                    //         "id": 8,
                    //         "version": "V2.1.3",
                    //         "hardwareVersion": "V3.1",
                    //         "status": 1,
                    //         "createUser": null,
                    //         "url": "https://rotrics.oss-cn-shenzhen.aliyuncs.com/frimware/69be4370-f7b5-4ca3-bec7-d12007c82989/Firmware_V2.1.3_For_Hardware_V3.1_20200521.bin",
                    //         "infos": [ ],
                    //         "createTime": 1594175130,
                    //         "updateTime": null
                    //     }
                    // }
                    const bodyJson = JSON.parse(body);
                    //已经是最新版本了
                    if (!bodyJson.data) {
                        resolve(result);
                        return;
                    }
                    if (!bodyJson.data.url) {
                        result.err = "url is null";
                        resolve(result);
                        return;
                    }
                    result.isNeedUpgrade = true;
                    result.url = bodyJson.data.url;
                    resolve(result);
                });
            });
        };
        return await exe();
    }

    async enterBootLoader() {
        const tryEnterBootLoader = () => {
            return new Promise(resolve => {
                const timerId = setTimeout(() => {
                    console.log("timeout: enterBootLoader")
                    this.serialPort.removeAllListeners(["data"]);
                    resolve(false);
                }, 6000);
                const readLineParser = this.serialPort.pipe(new ReadLineParser({delimiter: '\n'}));
                readLineParser.on('data', (line) => {
                    console.log("enterBootLoader line: " + line)
                    if (line.indexOf("Reset to enter update bootloader") !== -1) {
                        console.log("#enterBootLoader -> success")
                        this.serialPort.removeAllListeners(["data"]);

                        this.serialPort.close((error) => {
                            if (error) {
                                console.log("close err ", err)
                            } else {
                                clearTimeout(timerId);
                                resolve(true);
                            }
                        });
                    }
                });
                this.write('M2002\nM2003\n');
            });
        };
        return await tryEnterBootLoader();
    }

    async openSerialPort() {
        const tryOpenSerialPort = () => {
            return new Promise(resolve => {

                const timerId = setTimeout(() => {
                    console.log("timeout: tryOpenSerialPort")
                    resolve(false);
                }, 6000);

                console.log("#this.path: " + this.path)
                this.serialPort = new SerialPort(this.path, {baudRate, autoOpen: false});
                this.serialPort.open((err) => {
                    clearTimeout(timerId);
                    if (err) {
                        console.log("#tryOpenSerialPort -> failed,", err.message)
                        resolve(false);
                        return;
                    }
                    console.log("#tryOpenSerialPort -> success " + this.serialPort.isOpen)
                    resolve(true);
                });
            });
        };
        if (this.serialPort) {
            console.log("@@@this.serialPort.isOpen: " + this.serialPort.isOpen)
        }
        return await tryOpenSerialPort();
    }

    async loadFirmware() {
        const tryLoadFirmware = () => {
            return new Promise(resolve => {
                const timerId = setTimeout(() => {
                    console.log("timeout: tryLoadFirmware")
                    this.serialPort.removeAllListeners(["data"]);
                    resolve(false);
                }, 60000);
                this.serialPort.removeAllListeners(["data"]);
                console.log("######tryLoadFirmware")
                this.serialPort.on("data", (buffer) => {
                    if (Buffer.isBuffer(buffer)) {
                        const value = buffer.readUInt8(0);
                        switch (value) {
                            case 0x43://C
                                console.log("-> C");
                                if (this.cCount === 0) {
                                    ++this.cCount;
                                    this.curFrame = this.frames.shift();
                                    this.write(this.curFrame)
                                    this.printInfo();
                                } else if (this.cCount === 1) {
                                    ++this.cCount;
                                    this.curFrame = this.frames.shift();
                                    this.write(this.curFrame);
                                    this.printInfo();
                                }
                                break;
                            case 0x06: //ACK
                                console.log("-> ACK");
                                if (this.ackCount === 0) {
                                    ++this.ackCount;
                                } else if (this.ackCount === 1) {
                                    this.curFrame = this.frames.shift();
                                    if (this.curFrame) {
                                        this.write(this.curFrame)
                                        this.printInfo();
                                    } else {
                                        //发送完毕
                                        clearTimeout(timerId);
                                        resolve(true);
                                    }
                                }
                                break;
                            case 0x15: //Re-Send
                                console.log("-> Re-Send");
                                if (this.curFrame) {
                                    this.write(this.curFrame);
                                } else {
                                    console.log("# re-send err: curFrame is null")
                                }
                                break;
                            default:
                                console.log("-> Unknown: 0x%s\n", value.toString(16));
                                break;
                        }
                    } else {
                        console.log("received data is not buffer: " + JSON.stringify(buffer))
                    }
                });

                setTimeout(() => {
                    this.write("1");
                }, 1000)
            });
        };
        return await tryLoadFirmware();
    }

    write(data) {
        console.log("@@@write: " + data)
        this.serialPort.write(data, (error) => {
            if (error) {
                console.error("write error: " + data);
            } else {
                console.log("write ok: " + data);
            }
        })
    }

    printInfo() {
        const description = `upgrading ${Math.floor(100 * (1 - this.frames.length / this.frameCount))}%`;
        this.onChange(6, 'process', description);
        console.log("# send: " + (this.frameCount - this.frames.length))
    };

    prepareData(firmwarePath, firmwareName) {
        const buffers = [];
        const file = fs.readFileSync(firmwarePath);

        //start frame
        const startFrame = start_frame(firmwareName, file.length);
        buffers.push(startFrame);

        //chunk frame
        const chunks = _.chunk(file, 128);
        for (let i = 0; i < chunks.length; i++) {
            const data = Buffer.from(chunks[i]);
            const chunkFrame = chunk_frame(data, i + 1);
            buffers.push(chunkFrame)
        }

        //eot
        const eotFrame = eot();
        buffers.push(eotFrame);

        //end frame
        const endFrame = end_frame();
        buffers.push(endFrame);

        console.log("file length: " + file.length)
        console.log("chunks length: " + chunks.length)
        console.log("buffers length: " + buffers.length)

        return buffers;
    };
}

const firmwareUpgradeManager = new FirmwareUpgradeManager_bak();

export default firmwareUpgradeManager;
