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
import gcodeSender from "./gcode/gcodeSender.js";

const baudRate = 9600;

const sleep = (time) => {
    return new Promise(resolve => {
        setTimeout(resolve, time)
    })
};

class FirmwareUpgradeManager {
    constructor() {
        this.serialPort = null;
        this.frames = [];
        this.frameCount = 0;
        this.curFrame = null;
        this.cCount = 0;
        this.ackCount = 0;
        this.onChange = null;
        this.path = "";
    }

    /**
     * @param cache_dir 缓存目录，固件文件将下载到此目录
     * @param onChange 回调函数，onChange(current, status, description)
     * step: 和web/src/reducers/firmwareUpgrade保持一致
     * status: 和antd step保持一致 https://ant.design/components/steps-cn/
     * @returns {Promise<void>}
     */
    async start(cache_dir, onChange) {
        this.path = serialPortManager.getOpened();
        this.serialPort = null;
        this.frames = [];
        this.frameCount = 0;
        this.curFrame = null;
        this.cCount = 0;
        this.ackCount = 0;
        this.onChange = onChange;

        //step-0: Check
        this.onChange(0, 'process');
        //serial port是否连接
        if (!this.path) {
            this.onChange(0, 'error', 'Connect DexArm first');
            return;
        }
        //是否正在发送gcode
        if (gcodeSender.getStatus() === "sending") {
            this.onChange(0, 'error', 'Stop sending g-code first');
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
        let {firmwareVersion, hardwareVersion} = deviceInfo;
        // firmwareVersion = "V2.1.2";

        //step-2: Check need upgrade
        this.onChange(2, 'process');
        const {isNeedUpgrade, err: err4needUpgrade, url} = await this.isNeedUpgrade(firmwareVersion, hardwareVersion);
        if (err4needUpgrade) {
            this.onChange(2, 'error', err4needUpgrade);
            return;
        }
        if (!isNeedUpgrade) {
            this.onChange(2, 'finish', 'Firmware is up to date');
            return;
        }

        //step-3: Download firmware
        this.onChange(3, 'process');
        const {savedPath, filename, err: err4downloadFirmware} = await this.downloadFirmware(cache_dir, url);
        if (err4downloadFirmware) {
            this.onChange(3, 'error', err4downloadFirmware);
            return;
        }
        this.frames = this.prepareData(savedPath, filename);
        this.frameCount = this.frames.length;

        //step-4: Enter boot loader
        this.onChange(4, 'process');
        if (!await this.enterBootLoader()) {
            this.onChange(4, 'error', "Enter boot loader failed");
            return;
        }

        await sleep(3000);

        //step-5: Connect DexArm
        this.onChange(5, 'process');
        //重新open serial port
        if (!await this.openSerialPort()) {
            this.onChange(5, 'error', "Connect DexArm failed");
            return;
        }
        //监听serial port，两种模式都需要，data和line
        this.listenSerialPort();

        //step-6: Load firmware
        this.onChange(6, 'process');

        //start download firmware to flash
        this.write("1");

        setTimeout(() => {
            if (this.cCount === 0) {
                this.write("1");
            }
        }, 5000)
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

    /**
     * 下载固件文件
     * @param url
     * @returns {savedPath, filename, err}
     */
    async downloadFirmware(cache_dir, url) {
        const exe = () => {
            return new Promise(resolve => {
                const result = {
                    savedPath: null,
                    filename: null,
                    err: null
                };
                const timerId = setTimeout(() => {
                    result.err = "time out";
                    resolve(result);
                }, 5000);
                const segments = url.split('/');
                const filename = segments[segments.length - 1];
                const savedPath = path.join(cache_dir, filename)
                let stream = fs.createWriteStream(savedPath);
                request(url).pipe(stream).on("close", (err) => {
                    clearTimeout(timerId);
                    if (err) {
                        result.err = "download failed";
                        resolve(result);
                        return;
                    }
                    result.savedPath = savedPath;
                    result.filename = filename;
                    resolve(result);
                });
            });
        };
        return await exe();
    }

    //获取设备的固件，硬件版本号
    async getDeviceInfo() {
        const exe = () => {
            return new Promise(resolve => {
                let firmwareVersion = null;
                let hardwareVersion = null;
                const timerId = setTimeout(() => {
                    console.log("timeout: getDeviceInfo")
                    resolve(null);
                }, 3000);
                const callback = (data) => {
                    const {received} = data;
                    if (received) {
                        if (received.indexOf("Firmware ") === 0) {
                            firmwareVersion = received.replace("Firmware", "").replace("\r", "").trim();
                        }
                        if (received.indexOf("Hardware ") === 0) {
                            hardwareVersion = received.replace("Hardware", "").replace("\r", "").trim();
                        }
                        if (firmwareVersion && hardwareVersion) {
                            clearTimeout(timerId);
                            serialPortManager.removeListener(SERIAL_PORT_DATA, callback);
                            resolve({firmwareVersion, hardwareVersion});
                        }
                    }
                };
                serialPortManager.on(SERIAL_PORT_DATA, callback);
                serialPortManager.write('M2010\nM2011\n');
            });
        };
        return await exe();
    }

    async enterBootLoader() {
        const exe = () => {
            return new Promise(resolve => {
                const timerId = setTimeout(() => {
                    console.log("timeout: enterBootLoader")
                    resolve(false);
                }, 3000);
                const callback = (data) => {
                    const {received} = data;
                    if (received) {
                        if (received.indexOf("Reset to enter update bootloader") !== -1) {
                            serialPortManager.removeListener(SERIAL_PORT_DATA, callback);
                            clearTimeout(timerId);
                            resolve(true);
                        }
                    }
                };
                serialPortManager.on(SERIAL_PORT_DATA, callback);
                //设置E轴步进，是固定参数；是marlin cmd
                //M92 E408.16  设置
                //M500  保存settings
                //查询E轴步进：M92
                serialPortManager.write('M92 E408.16\nM500\nM2002\nM2003\n');
            });
        };
        return await exe();
    }

    async openSerialPort() {
        const exe = () => {
            return new Promise(resolve => {
                this.serialPort = new SerialPort(this.path, {baudRate, autoOpen: false});
                this.serialPort.open((err) => {
                    if (err) {
                        console.log("!!!! open sp failed: " + err.message)
                        resolve(false);
                        return;
                    }

                    console.log("!!!! open sp ok")
                    resolve(true);
                });
            });
        };
        return await exe();
    }

    listenSerialPort() {
        const readLineParser = this.serialPort.pipe(new ReadLineParser({delimiter: '\n'}));
        readLineParser.on('data', async (data) => {
            console.log("#line: " + data)
            //step-6: Load firmware -> finish
            if (data.indexOf("Programming Completed Successfully!") !== -1) {
                //step-7: Execute firmware
                this.onChange(7, 'process');
                setTimeout(() => {
                    console.log("## send: execute firmware")
                    this.write("3")
                }, 1000)

                setTimeout(() => {
                    this.onChange(8, 'finish');
                }, 2000)
            }

            //有时候可能收不到"Start program execution......"
            //step-7: Execute firmware -> finish
            // if (data.indexOf("Start program execution......") !== -1) {
            //     this.onChange(8, 'finish');
            // }
        });

        this.serialPort.on("data", (buffer) => {
            if (Buffer.isBuffer(buffer)) {
                const value = buffer.readUInt8(0);
                switch (value) {
                    case 0x43://C
                        // console.log("-> C");
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
                        // console.log("-> ACK");
                        if (this.ackCount === 0) {
                            ++this.ackCount;
                        } else if (this.ackCount === 1) {
                            this.curFrame = this.frames.shift();
                            if (this.curFrame) {
                                this.write(this.curFrame)
                                this.printInfo();
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
    }

    write(data) {
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
        // console.log("# send: " + (this.frameCount - this.frames.length))
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

const firmwareUpgradeManager = new FirmwareUpgradeManager();

export default firmwareUpgradeManager;
