import fs from 'fs';
import _ from 'lodash';
import path from 'path';
import isOnline from "is-online";
import request from 'request';
import SerialPort from 'serialport';
import ReadLineParser from '@serialport/parser-readline';
import {start_frame, end_frame, eot, chunk_frame} from "./frameUtil.js";
import serialPortManager from './serialPortManager.js';
import gcodeSender from "./gcodeSender.js";

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

        this.onReceiveLine = async (line) => {
            // console.log("#onReceiveLine: " + line);
            //"Programming Completed Successfully!": load firmware成功的标志
            if (line.includes("Programming Completed Successfully!")) {
                //step-7: Execute firmware
                this.onChange(7, 'process');

                await sleep(1000);
                this.write("3");//execute firmware

                //"Start program execution......": execute firmware成功的标志
                //实际测试发现，有时候可能收不到，此时可认为已经升级成功
                await sleep(2000);
                this.onChange(8, 'finish');

                await sleep(2000);
                serialPortManager.port = null;
                serialPortManager.open(this.path);
            }
        };

        this.onReceiveData = (buffer) => {
            const callbackProgress = () => {
                const description = `${Math.floor(100 * (1 - this.frames.length / this.frameCount))}%`;
                this.onChange(6, 'process', description);
            };

            //上位机收到第1个C，则发送frame-0
            //下位机收到frame-0，依次发送ACK，C
            //上位机收到第2个C，发送frame-1
            //下位机收到frame-1，发送ACK
            //后面都是收到则发送ACK
            if (Buffer.isBuffer(buffer)) {
                const value = buffer.readUInt8(0);
                switch (value) {
                    case 0x43://C
                        console.log("##-> C :" + this.cCount);
                        if (this.cCount === 0) {
                            ++this.cCount;
                            this.curFrame = this.frames.shift(); //frame-0
                            this.write(this.curFrame);
                            callbackProgress();
                        } else if (this.cCount === 1) {
                            ++this.cCount;
                            this.curFrame = this.frames.shift(); //frame-1
                            this.write(this.curFrame);
                            callbackProgress();
                        }
                        break;
                    case 0x06: //ACK
                        // console.log("##-> ACK");
                        if (this.cCount === 2) {
                            this.curFrame = this.frames.shift();
                            if (this.curFrame) {
                                this.write(this.curFrame);
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
        console.log("# firmware -> start")
        this.cache_dir = cache_dir;
        this.onChange = onChange;
        this.serialPort = serialPortManager.port;
        this.path = serialPortManager.getOpenPath();
        this.frames = [];
        this.frameCount = 0;
        this.curFrame = null;
        this.cCount = 0;

        //step-0: Check
        //是否连接，是否正在发送gcode，网络是否可用
        this.onChange(0, 'process');
        if (!this.path) {
            this.onChange(0, 'error', 'Please connect DexArm first');
            return;
        }
        if (gcodeSender.curStatus !== "idle") {
            this.onChange(0, 'error', 'Stop g-code sending task first');
            return;
        }
        if (!(await isOnline())) {
            this.onChange(0, 'error', 'Network unavailable');
            return;
        }

        //remove all listener
        this.serialPort.removeAllListeners();
        this.readLineParser = this.serialPort.pipe(new ReadLineParser({delimiter: '\n'}));

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
            this.onChange(1, 'error', 'Time out, please retry');
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
            this.onChange(2, 'error', "Url is null");
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
        if (this.frameCount === 0) {
            this.onChange(3, 'error', 'Data is empty');
            return;
        }

        //step-6: Load firmware
        this.onChange(6, 'process');
        this.serialPort.on("data", this.onReceiveData);
        this.readLineParser.on('data', this.onReceiveLine);
        await sleep(2000);
        //start download firmware to flash
        this.write("1");
        //特殊case：发送"1"后，不会执行"download image to the inter flash"
        //5s后重发
        await sleep(7000);
        if (this.cCount === 0) {
            this.write("1");
        }
        await sleep(12000);
        if (this.cCount === 0) {
            this.write("1");
        }
        if (this.cCount < 2) {
            this.onChange(6, 'error', "Download firmware to flash failed, please retry");
        }
    }

    async getDeviceInfo4bootLoader() {
        const exe = () => {
            return new Promise(resolve => {
                const timerId = setTimeout(() => {
                    resolve({hardwareVersion: null});
                }, 15000);
                this.readLineParser.on('data', (line) => {
                    console.log("getDeviceInfo4bootLoader received line: " + line);
                    if (line.startsWith("Hardware Version:")) {
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
        console.log("# firmware -> firmwareVersion: " + firmwareVersion)
        console.log("# firmware -> hardwareVersion: " + hardwareVersion)

        firmwareVersion = "V2.1.1";
        if (!firmwareVersion || !hardwareVersion) {
            this.onChange(1, 'error', 'Time out, please retry');
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
        if (this.frameCount === 0) {
            this.onChange(3, 'error', 'Data is empty');
            return;
        }

        //step-4: Enter boot loader
        this.onChange(4, 'process');
        if (!await this.enterBootLoader()) {
            this.onChange(4, 'error', "Enter boot loader failed, please retry");
            return;
        }

        await sleep(3000);

        //step-5: Connect DexArm
        this.onChange(5, 'process');
        //重新open serial port
        const {err: err4openSerialPort} = await this.openSerialPort();
        if (err4openSerialPort) {
            this.onChange(5, 'error', "Connect DexArm failed, please retry. Error message: " + err4openSerialPort);
            return;
        }

        //断开后需要重新设置监听
        this.serialPort.removeAllListeners();
        this.readLineParser = this.serialPort.pipe(new ReadLineParser({delimiter: '\n'}));

        //step-6: Load firmware
        this.onChange(6, 'process');
        this.serialPort.on("data", this.onReceiveData);
        this.readLineParser.on('data', this.onReceiveLine);

        await sleep(2000);
        //start download firmware to flash
        this.write("1");

        //特殊case：发送"1"后，不会执行"download image to the inter flash"
        //5s后重发
        await sleep(7000);
        if (this.cCount === 0) {
            this.write("1");
        }

        await sleep(12000);
        if (this.cCount === 0) {
            this.write("1");
        }

        if (this.cCount < 2) {
            this.onChange(6, 'error', "Download firmware to flash failed, please retry");
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
                }, 20000);
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
                        resolve({err: "response status code is not 200", url: null});
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
                }, 40000);
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
                    if (!fs.readFileSync(savedPath)) {
                        resolve({
                            err: "file not exist",
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
                    resolve({firmwareVersion: null, hardwareVersion: null});
                }, 10000);
                this.readLineParser.on('data', (line) => {
                    console.log("getDeviceInfo4app received line: " + line);
                    if (line.startsWith("Firmware ")) {
                        firmwareVersion = line.replace("Firmware", "").replace("\r", "").trim();
                    }
                    if (line.startsWith("Hardware ")) {
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
                }, 20000);
                this.readLineParser.on('data', (line) => {
                    console.log("enterBootLoader received line: " + line);
                    //Ready to enter update bootloader, please use M2003 confirm or M2004 cancel
                    //测试发现，"Reset to enter update bootloader"可能收不到，但是已经进入boot loader
                    if (line.includes("Reset to enter update bootloader") || line.includes("Ready to enter update bootloader") ) {
                        clearTimeout(timerId);
                        this.readLineParser.removeAllListeners();
                        resolve(true);
                    }
                });
                this.write('M203 X300 Y300 Z300 E100\nM205 X10 Y10 Z10 E20\nM92 E379.20\nM500\nM2002\nM2003\n');
            });
        };
        return await exe();
    }

    async openSerialPort() {
        const exe = () => {
            return new Promise(resolve => {
                this.serialPort = new SerialPort(this.path, {baudRate, autoOpen: false});
                this.serialPort.open((error) => {
                    if (error) {
                        console.log("open sp failed: " + error.message)
                        resolve({err: error.message});
                        return;
                    }
                    resolve({err: null});
                });
            });
        };
        return await exe();
    }

    write(data) {
        this.serialPort.write(data, (error) => {
            if (error) {
                console.error("###write error: " + data);
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
