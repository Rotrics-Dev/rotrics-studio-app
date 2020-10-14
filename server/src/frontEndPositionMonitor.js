import {
    FRONT_END_POSITION_MONITOR,
    SERIAL_PORT_CLOSE,
    SERIAL_PORT_RECEIVED_LINE,
    SERIAL_PORT_ERROR,
    SERIAL_PORT_OPEN,
    SERIAL_PORT_WRITE_ERROR,
    SERIAL_PORT_WRITE_OK
} from "./constants";
import EventEmitter from "events";
import serialPortManager from "./serialPortManager";

class FrontEndPositionMonitor extends EventEmitter {
    registerListeners() {
        serialPortManager.on(SERIAL_PORT_OPEN, () => {
            this.onOpen();
        });
        serialPortManager.on(SERIAL_PORT_CLOSE, () => {
            this.onClose();
        });
        serialPortManager.on(SERIAL_PORT_ERROR, () => {
            this.onError();
        });
        serialPortManager.on(SERIAL_PORT_RECEIVED_LINE, (line) => {
            this.onRead(line);
        });
        serialPortManager.on(SERIAL_PORT_WRITE_OK, (data) => {
            this.onWrite(data);
        });
        serialPortManager.on(SERIAL_PORT_WRITE_ERROR, (data) => {
            this.onWriteError();
        });
    }

    resetPosition() {
        this.currentX = 0;
        this.currentY = 0;
        this.currentZ = 0;
        this.nextX = 0;
        this.nextY = 0;
        this.nextZ = 0;
        this.isAbsolutePosition = true;
        this.needProcessM114 = false;
    }

    onOpen() {
        this.resetPosition();
        this.sendPosition();
    }

    onClose() {
        this.resetPosition();
        this.sendPosition();
    }

    onError() {
        this.resetPosition();
        this.sendPosition();
    }

    onWriteError() {
        this.resetPosition();
        this.sendPosition();
    }

    onReadOk() {
        this.currentX = this.nextX;
        this.currentY = this.nextY;
        this.currentZ = this.nextZ;
        this.sendPosition();
    }

    onWrite(line) {
        if (!line) {
            return;
        }

        if (line.startsWith('N')) {
            const indexOfSpace = line.indexOf(' ');
            line = line.slice(indexOfSpace + 1, line.length)
        }
        if (line.lastIndexOf('*') > 0) {
            const lastIndexOfStar = line.lastIndexOf('*');
            line = line.slice(0, lastIndexOfStar);
        }
        line = line.trim();
        if (line.startsWith('G0')) {
            this.onWriteG0(line);
        } else if (line.startsWith('G1')) {
            this.onWriteG1(line);
        } else if (line.startsWith('G90')) {
            this.onWriteG90();
        } else if (line.startsWith('G91')) {
            this.onWriteG91();
        } else if (line.startsWith('G92')) {
            this.onWriteG92(line);
        } else if (line.startsWith('G92.1')) {
            this.onWriteG92_1(line);
        } else if (line.startsWith('M1112')) {
            this.onWriteM1112();
        } else if (line.startsWith('M114')) {
            this.onWriteM114();
        }
    }

    onRead(line) {
        if (!line) {
            return;
        }
        if (line.startsWith('ok')) {
            this.onReadOk();
        } else if (this.needProcessM114) {
            this.processM114(line);
        } else {
        }
    }

    sendPosition() {
        this.currentX = Math.round((this.currentX) * 10) / 10
        this.currentY = Math.round((this.currentY) * 10) / 10
        this.currentZ = Math.round((this.currentZ) * 10) / 10

        const position = {x: this.currentX, y: this.currentY, z: this.currentZ};
        this.emit(FRONT_END_POSITION_MONITOR, position);

    }

    onWriteG0(line) {
        this.setNextPosition(line);
    }

    onWriteG1(line) {
        this.setNextPosition(line);
    }

    onWriteG90() {//Absolute Positioning
        this.isAbsolutePosition = true;
    }

    onWriteG91() {//Relative Positioning
        this.isAbsolutePosition = false;
    }

    onWriteG92(line) {//设置原点可以带参数
        //todo
        this.currentZ = this.nextZ = 0;
        //设置工作高度前会发送M114,由于数据传输是基于事件的，整个过程不是同步的，
        // M114和上面设置的值会相互覆盖，引起UI显示不正常，这是上位机和下位机没有一个合理的传输协议引起的混乱
        this.needProcessM114 = false;
        this.sendPosition();
    }

    onWriteG92_1(line) {//将原点设置为机器原点
        //todo
    }

    onWriteM1112() {
        // this.nextX = 0;
        // this.nextY = 300;
        // this.nextZ = 0;
    }

    onWriteM114() {
        this.needProcessM114 = true;
    }

    processM114(line) {
        if (!line.startsWith('X:')) return;
        const split = line.trim().split(' ');
        if (!split[1].startsWith('Y:')) return;
        if (!split[2].startsWith('Z:')) return;
        this.nextX = parseFloat(split[0].split(':')[1]);
        this.nextY = parseFloat(split[1].split(':')[1]);
        this.nextZ = parseFloat(split[2].split(':')[1]);
        this.needProcessM114 = false;
        this.sendPosition();
    }

    setNextPosition(line) {
        let x = Number.MIN_VALUE;
        let y = Number.MIN_VALUE;
        let z = Number.MIN_VALUE;
        line.split(' ').forEach((value) => {
            if (value.startsWith('X')) {
                x = parseFloat(value.slice(1, value.length));
            } else if (value.startsWith('Y')) {
                y = parseFloat(value.slice(1, value.length));

            } else if (value.startsWith('Z')) {
                z = parseFloat(value.slice(1, value.length));
            }
        });

        if (this.isAbsolutePosition) {
            this.nextX = (x === Number.MIN_VALUE || x.isNaN) ? this.nextX : x;
            this.nextY = (y === Number.MIN_VALUE || x.isNaN) ? this.nextY : y;
            this.nextZ = (z === Number.MIN_VALUE || x.isNaN) ? this.nextZ : z;
        } else {
            this.nextX += (x === Number.MIN_VALUE || x.isNaN) ? 0 : x;
            this.nextY += (y === Number.MIN_VALUE || x.isNaN) ? 0 : y;
            this.nextZ += (z === Number.MIN_VALUE || x.isNaN) ? 0 : z;
        }
    }
}

const frontEndPositionMonitor = new FrontEndPositionMonitor();
export default frontEndPositionMonitor;
