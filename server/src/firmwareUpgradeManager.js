import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import isOnline from "is-online";
import request from 'request';
import SerialPort from 'serialport';
import ReadLineParser from '@serialport/parser-readline';
import {start_frame, end_frame, eot, chunk_frame} from "./frameUtil.js";
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
        this.cache_dir = null;
        this.onChange = null;
        this.serialPort = null;
        this.path = "";
        this.readLineParser = null;
        this.frames = [];
        this.frameCount = 0;
        this.curFrame = null;
        this.cCount = 0;
        this.ackCount = 0;

        this.onReceiveLine = async (line) => {
            // console.log("#onReceiveLine: " + line);
            //"Programming Completed Successfully!": load firmware成功的标志
            if (line.indexOf("Programming Completed Successfully!") !== -1) {
                //step-7: Execute firmware
                this.onChange(7, 'process');

                await sleep(500);
                this.write("3");//execute firmware

                //"Start program execution......": execute firmware成功的标志
                //实际测试发现，有时候可能收不到，此时可认为已经升级成功
                await sleep(2000);
                this.onChange(8, 'finish');

                await sleep(2000);
                serialPortManager.serialPort = null;
                serialPortManager.open(this.path);
            }
        };

        this.onReceiveData = (buffer) => {
            const callbackProgress = () => {
                const description = `upgrading ${Math.floor(100 * (1 - this.frames.length / this.frameCount))}%`;
                this.onChange(6, 'process', description);
            };

            if (Buffer.isBuffer(buffer)) {
                const value = buffer.readUInt8(0);
                switch (value) {
                    case 0x43://C
                        console.log("##-> C :" + this.cCount);
                        if (this.cCount === 0) {
                            ++this.cCount;
                            this.curFrame = this.frames.shift();
                            this.write(this.curFrame);
                            callbackProgress();
                        } else if (this.cCount === 1) {
                            ++this.cCount;
                            this.curFrame = this.frames.shift();
                            this.write(this.curFrame);
                            callbackProgress();
                        }
                        break;
                    case 0x06: //ACK
                        // console.log("##-> ACK");
                        if (this.ackCount === 0) {
                            ++this.ackCount;
                        } else if (this.ackCount === 1) {
                            this.curFrame = this.frames.shift();
                            if (this.curFrame) {
                                this.write(this.curFrame)
                                callbackProgress();
                            }
                        }
                        break;
                    case 0x15: //Re-Send
                        console.log("##-> Re-Send");
                        if (this.curFrame) {
                            this.write(this.curFrame);
                        } else {
                            console.log("## re-send err: curFrame is null")
                        }
                        break;
                    default:
                        console.log("##-> Unknown: 0x%s\n", value.toString(16));
                        break;
                }
            }
        };
    }

    /**
     * @param cache_dir 缓存目录，固件文件将下载到此目录
     * @param onChange 回调函数，onChange(current, status, description)
     * @param isInBootLoader 当前是否处于boot loader模式下
     * step: 和web/src/reducers/firmwareUpgrade保持一致
     * status: 和antd step保持一致 https://ant.design/components/steps-cn/
     * @returns {Promise<void>}
     */
    async start(cache_dir, isInBootLoader, onChange) {
        this.cache_dir = cache_dir;
        this.onChange = onChange;
        this.serialPort = serialPortManager.serialPort;
        this.path = serialPortManager.getOpened();
        this.frames = [];
        this.frameCount = 0;
        this.curFrame = null;
        this.cCount = 0;
        this.ackCount = 0;

        //step-0: Check
        //是否连接，是否正在发送gcode，网络是否可用
        this.onChange(0, 'process');
        if (!this.path) {
            this.onChange(0, 'error', 'Connect DexArm first');
            return;
        }
        if (gcodeSender.getStatus() === "sending") {
            this.onChange(0, 'error', 'Stop sending g-code first');
            return;
        }
        if (!(await isOnline())) {
            this.onChange(0, 'error', 'Internet is not available');
            return;
        }

        //remove all listener
        if (this.serialPort) {
            // this.serialPort.removeAllListeners();
            this.readLineParser = this.serialPort.pipe(new ReadLineParser({delimiter: '\n'}));
        }

        if (isInBootLoader) {
            await this.upgrade4bootLoader();
        } else {
            await this.upgrade4app();
        }
    }

    //跳过step4，5
    async upgrade4bootLoader() {
        //step-1: Collect DexArm info
        this.onChange(1, 'process');
        const {hardwareVersion} = await this.getDeviceInfo4bootLoader();
        if (!hardwareVersion) {
            this.onChange(1, 'error', 'Collect DexArm info failed');
            return;
        }


        //step-2: Check need upgrade
        this.onChange(2, 'process');
        //必须升级，因此指定firmwareVersion为老版本即可
        const firmwareVersion = "V2.1.1";
        const {err: err4needUpgrade, url} = await this.isNeedUpgrade(firmwareVersion, hardwareVersion);
        if (err4needUpgrade) {
            this.onChange(2, 'error', err4needUpgrade);
            return;
        }
        if (!url) {
            this.onChange(2, 'error', "url is null");
            return;
        }

        //step-3: Download firmware
        this.onChange(3, 'process');
        const {savedPath, filename, err: err4downloadFirmware} = await this.downloadFirmware(this.cache_dir, url);
        if (err4downloadFirmware) {
            this.onChange(3, 'error', err4downloadFirmware);
            return;
        }
        this.frames = this.prepareData(savedPath, filename);
        this.frameCount = this.frames.length;

        //step-6: Load firmware
        this.onChange(6, 'process');
        this.serialPort.on("data", this.onReceiveData);
        this.readLineParser.on('data', this.onReceiveLine);
        //start download firmware to flash
        this.write("1");
        //特殊case：发送"1"后，不会执行"download image to the inter flash"
        //5s后重发
        await sleep(5000);
        if (this.cCount === 0) {
            this.write("1");
        }
    }

    async getDeviceInfo4bootLoader() {
        const exe = () => {
            return new Promise(resolve => {
                const timerId = setTimeout(() => {
                    resolve({hardwareVersion: null});
                }, 2000);
                this.readLineParser.on('data', (line) => {
                    console.log("getDeviceInfo4bootLoader received line: " + line);
                    if (line.indexOf("Hardware Version:") === 0) {
                        clearTimeout(timerId);
                        this.readLineParser.removeAllListeners();
                        const hardwareVersion = line.replace("Hardware Version:", "").replace("\r", "").trim();
                        console.log("hardwareVersion: " + hardwareVersion)
                        resolve({hardwareVersion});
                    }
                });
                this.write('a5');
            });
        };
        return await exe();
    }

    async upgrade4app() {
        //step-1: Collect DexArm info
        let {firmwareVersion, hardwareVersion} = await this.getDeviceInfo4app();
        // firmwareVersion = "V2.1.1";
        if (!firmwareVersion || !hardwareVersion) {
            this.onChange(1, 'error', 'Collect DexArm info failed');
            return;
        }

        //step-2: Check need upgrade
        this.onChange(2, 'process');
        const {err: err4needUpgrade, url} = await this.isNeedUpgrade(firmwareVersion, hardwareVersion);
        if (err4needUpgrade) {
            this.onChange(2, 'error', err4needUpgrade);
            return;
        }
        if (!url) {
            this.onChange(2, 'finish', 'Firmware is up to date');
            return;
        }

        //step-3: Download firmware
        this.onChange(3, 'process');
        const {savedPath, filename, err: err4downloadFirmware} = await this.downloadFirmware(this.cache_dir, url);
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
        }

        await sleep(2000);

        //step-5: Connect DexArm
        this.onChange(5, 'process');
        //重新open serial port
        if (!await this.openSerialPort()) {
            this.onChange(5, 'error', "Connect DexArm failed");
            return;
        }

        //断开后需要重新设置监听
        this.serialPort.removeAllListeners();
        this.readLineParser = this.serialPort.pipe(new ReadLineParser({delimiter: '\n'}));

        //step-6: Load firmware
        this.onChange(6, 'process');
        this.serialPort.on("data", this.onReceiveData);
        this.readLineParser.on('data', this.onReceiveLine);

        //start download firmware to flash
        this.write("1");

        //特殊case：发送"1"后，不会执行"download image to the inter flash"
        //5s后重发
        await sleep(5000);
        if (this.cCount === 0) {
            this.write("1");
        }
    }

    /**
     * 检查是否需要upgrade
     * @param firmwareVersion
     * @param hardwareVersion
     * @returns {err, url} 先判断err，再判断url；url为null，则表示不用升级，已经是最新版本；否则需要升级
     */
    async isNeedUpgrade(firmwareVersion, hardwareVersion) {
        const exe = () => {
            return new Promise(resolve => {
                const api = `http://api.rotrics.com/version/firmware/version?version=${firmwareVersion}&hardwareVersion=${hardwareVersion}`;
                const timerId = setTimeout(() => {
                    resolve({err: "request time out", url: null});
                }, 10000);
                request(api, (error, response, body) => {
                    clearTimeout(timerId);
                    if (error) {
                        resolve({err: "request error", url: null});
                        return;
                    }
                    if (!response) {
                        resolve({err: "response is null", url: null});
                        return;
                    }
                    if (response.statusCode !== 200) {
                        resolve({err: "response statusCode is not 200", url: null});
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
                        resolve({err: null, url: null});
                        return;
                    }
                    if (!bodyJson.data.url) {
                        resolve({err: "url is null", url: null});
                        return;
                    }
                    resolve({err: null, url: bodyJson.data.url});
                });
            });
        };
        return await exe();
    }

    /**
     * 下载固件文件
     * @param url
     * @returns {err, savedPath, filename}
     */
    async downloadFirmware(cache_dir, url) {
        const exe = () => {
            return new Promise(resolve => {
                const timerId = setTimeout(() => {
                    resolve({
                        err: "time out",
                        savedPath: null,
                        filename: null
                    });
                }, 15000);
                const segments = url.split('/');
                const filename = segments[segments.length - 1];
                const savedPath = path.join(cache_dir, filename)
                let stream = fs.createWriteStream(savedPath);
                request(url).pipe(stream).on("close", (err) => {
                    clearTimeout(timerId);
                    if (err) {
                        resolve({
                            err: "download failed",
                            savedPath: null,
                            filename: null
                        });
                        return;
                    }
                    resolve({
                        err: null,
                        savedPath,
                        filename
                    });
                });
            });
        };
        return await exe();
    }

    //获取设备的固件，硬件版本号
    async getDeviceInfo4app() {
        const exe = () => {
            return new Promise(resolve => {
                let firmwareVersion = null;
                let hardwareVersion = null;
                const timerId = setTimeout(() => {
                    console.log("timeout: getDeviceInfo4app")
                    resolve({firmwareVersion, hardwareVersion});
                }, 3000);
                this.readLineParser.on('data', (line) => {
                    console.log("getDeviceInfo4app received line: " + line);
                    if (line.indexOf("Firmware ") === 0) {
                        firmwareVersion = line.replace("Firmware", "").replace("\r", "").trim();
                    }
                    if (line.indexOf("Hardware ") === 0) {
                        hardwareVersion = line.replace("Hardware", "").replace("\r", "").trim();
                    }
                    if (firmwareVersion && hardwareVersion) {
                        clearTimeout(timerId);
                        this.readLineParser.removeAllListeners();
                        resolve({firmwareVersion, hardwareVersion});
                    }
                });
                this.write('M2010\nM2011\n');
            });
        };
        return await exe();
    }

    /**
     * 发"a5"，若收到"Hardware Version:"，则表示在boot loader模式下
     * 超时无响应，则在app模式下
     * app模式下，发M2002，M2003进入boot loader模式，串口会断开，需要再次连接
     * @returns {Promise<{connected, hardwareVersion, isBootLoader}>}
     */
    async enterBootLoader() {
        const exe = () => {
            return new Promise(resolve => {
                const timerId = setTimeout(() => {
                    resolve(false);
                }, 6000);
                this.readLineParser.on('data', (line) => {
                    console.log("getDeviceInfo4bootLoader received line: " + line);
                    if (line.indexOf("Reset to enter update bootloader") !== -1) {
                        clearTimeout(timerId);
                        this.readLineParser.removeAllListeners();
                        resolve(true);
                    }
                });
                this.write('M92 E408.16\nM500\nM2002\nM2003\n');
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
                        console.log("open sp failed: " + err.message)
                        resolve(false);
                        return;
                    }
                    resolve(true);
                });
            });
        };
        return await exe();
    }

    write(data) {
        this.serialPort.write(data, (error) => {
            if (error) {
                console.error("write error: " + data);
            } else {
                // console.log("write ok: " + data);
                if (typeof data === "string") {
                    console.log("write ok: " + data);
                }
                // console.log("write ok:");
            }
        })
    }

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
