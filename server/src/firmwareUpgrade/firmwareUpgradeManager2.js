import fs from 'fs';
import _ from 'lodash';
import isOnline from "is-online";
import SerialPort from 'serialport';
import ReadLineParser from '@serialport/parser-readline';
import {start_frame, end_frame, eot, chunk_frame} from "./frameUtil.js";
import {SERIAL_PORT_DATA} from "../constants.js"
import serialPortManager from '../serialPortManager.js';

const baudRate = 9600;

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

    //onChange(current, status, description)
    //step: 和web/src/reducers/firmwareUpgrade保持一致
    //status: 和antd step保持一致 https://ant.design/components/steps-cn/
    async start(onChange) {
        const path = serialPortManager.getOpened();
        this.path = path;
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
        if (!path) {
            console.log("return: serial port is not opened");
            this.onChange(0, 'error', 'Connect DexArm first');
            return;
        }
        //网络是否可用
        if (!(await isOnline())) {
            console.log("return: Internet is not available");
            this.onChange(0, 'error', 'Internet is not available');
            return;
        }

        //step-1: Fetch firmware
        this.onChange(1, 'process');
        //获取固件升级信息
        const upgradeInfo = await this.fetchFirmwareFromServer();
        //下载固件文件到本地，并准备数据
        let firmwarePath = null;
        firmwarePath = "/Users/liuming/Desktop/firmware/Firmware_V2.1.3/Firmware_V2.1.3_For_Hardware_V3.2_20200521.bin";
        firmwarePath = "/Users/liuming/Desktop/firmware/Firmware_V2.1.2/Firmware_V2.1.2_For_Hardware_V3.2_20200520.bin";
        const firmwareName = "Firmware_V2.1.3_For_Hardware_V3.2_20200521.bin";
        this.frames = this.prepareData(firmwarePath, firmwareName);
        this.frameCount = this.frames.length;

        //step-2: Collect DexArm info
        this.onChange(2, 'process');
        //获取设备的固件，硬件版本号
        const deviceInfo = await this.getDeviceInfo();

        //step-3: Start upgrade
        //是否需要升级
        if (!this.isNeedUpgrade(upgradeInfo, deviceInfo)) {
            console.log("return: no need to upgrade");
            this.onChange(3, 'finish', 'Firmware is up to date');
            return;
        }

        //step-4: Enter boot loader
        this.onChange(4, 'process');
        await this.enterBootLoader();

        //step-5: Connect DexArm
        this.onChange(5, 'process');
        //重新open serial port
        await this.openSerialPort();
        //监听serial port，两种模式都需要，data和line
        this.listenSerialPort();

        //step-6: Load firmware
        this.onChange(6, 'process');
        //开始更新固件
        this.write("1");
    }

    async isInternetAvailable() {
        return await isOnline();
    }

    async fetchFirmwareFromServer() {
        // return {
        //     firmwareVersion: "V2.1.3",
        //     hardwareVersion: "V3.2",
        // }
        const tryFetchFirmwareUpgradeInfo = () => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(true);
                }, 2000);
            });
        };
        const result = await tryFetchFirmwareUpgradeInfo();
        return result;
    }

    //获取设备的固件，硬件版本号
    async getDeviceInfo() {
        let firmwareVersion = null;
        let hardwareVersion = null;
        const callback = (data) => {
            const {received} = data;
            if (received) {
                if (received.indexOf("Firmware ") === 0) {
                    firmwareVersion = received.replace("Firmware", "").replace("\r", "").trim();
                }
                if (received.indexOf("Hardware ") === 0) {
                    hardwareVersion = received.replace("Hardware", "").replace("\r", "").trim();
                }
                if (!firmwareVersion && !hardwareVersion) {
                    serialPortManager.removeListener(SERIAL_PORT_DATA, callback);
                    return {
                        firmwareVersion,
                        hardwareVersion
                    }
                }
            }
        };
        serialPortManager.on(SERIAL_PORT_DATA, callback);
    }

    isNeedUpgrade(upgradeInfo, deviceInfo) {
        //比较
        return true;
    }

    async enterBootLoader() {
        const tryEnterBootLoader = () => {
            return new Promise(resolve => {
                const callback = (data) => {
                    const {received} = data;
                    if (received) {
                        if (received.indexOf("Reset to enter update bootloader ") !== -1) {
                            serialPortManager.removeListener(SERIAL_PORT_DATA, callback);
                            console.log("#tryEnterBootLoader -> success")
                            resolve(true);
                        }
                    }
                };
                //2s超时，认为失败
                setTimeout(() => {
                    console.log("#tryEnterBootLoader -> failed")
                    resolve(false);
                }, 2000);
                serialPortManager.on(SERIAL_PORT_DATA, callback);
                serialPortManager.write('M2002\nM2003\n');
            });
        };
        const result = await tryEnterBootLoader();
        return result;
    }

    async openSerialPort() {
        const tryOpenSerialPort = () => {
            return new Promise(resolve => {
                this.serialPort = new SerialPort(this.path, {baudRate, autoOpen: false});
                this.serialPort.open((err) => {
                    if (err) {
                        console.log("#tryOpenSerialPort -> failed")
                        resolve(false);
                        return;
                    }
                    console.log("#tryOpenSerialPort -> success")
                    resolve(true);
                });
            });
        };
        const result = await tryOpenSerialPort();
        return result;
    }

    async onReadLine(line){
        console.log("##received line: " + JSON.stringify(line));
        switch (line) {
            case "Programming Completed Successfully!": //step-6: Load firmware -> finish
                //step-7: Execute firmware
                this.onChange(7, 'process');
                //发完了
                setTimeout(() => {
                    console.log("## send: exe")
                    this.write("2")
                }, 1000)
                break;
            case "Start program execution......": //step-7: Execute firmware -> finish
                //重新open serial port，获取固件版本号
                await this.openSerialPort();

                break;

        }
    }

    listenSerialPort() {
        const readLineParser = this.serialPort.pipe(new ReadLineParser({delimiter: '\n'}));
        readLineParser.on('data', async (data) => {
            console.log("##received line: " + JSON.stringify(data));
            switch (data) {
                case "Programming Completed Successfully!": //step-6: Load firmware -> finish
                    //step-7: Execute firmware
                    this.onChange(7, 'process');
                    //发完了
                    setTimeout(() => {
                        console.log("## send: exe")
                        this.write("2")
                    }, 1000)
                    break;
                case "Start program execution......": //step-7: Execute firmware -> finish
                    //重新open serial port，获取固件版本号
                    await this.openSerialPort();

                    break;

            }
        });

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
                            }

                            // else {
                            //     console.log("# send finish")
                            //     //step-7: Connect DexArm
                            //     this.onChange(7, 'process');
                            //     //发完了
                            //     setTimeout(() => {
                            //         console.log("## send: exe")
                            //         this.write("3")
                            //     }, 1000)
                            // }
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
                console.log("write ok: ");
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

const firmwareUpgradeManager = new FirmwareUpgradeManager();

export default firmwareUpgradeManager;
