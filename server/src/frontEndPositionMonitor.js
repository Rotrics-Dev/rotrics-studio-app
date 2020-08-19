import {FRONT_END_POSITION_MONITOR} from "./constants";
import EventEmitter from "events";

class FrontEndPositionMonitor extends EventEmitter {
    positionFilteringWrite(line) {
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

    positionFilteringRead(line) {
        if (!line) {
            return;
        }
        if (line.startsWith('ok')) {
            this.onReadOk();
        } else if (this.needProcessM114) {
            this.processM114(line);
        }
    }

    sendPosition() {
        this.currentX = Math.round((this.currentX) * 10) / 10
        this.currentY = Math.round((this.currentY) * 10) / 10
        this.currentZ = Math.round((this.currentZ) * 10) / 10

        const position = {x: this.currentX, y: this.currentY, z: this.currentZ};
        console.log(position)
        this.emit(FRONT_END_POSITION_MONITOR, position);

    }

    resetPosition() {
        this.currentX = 0;
        this.currentY = 0
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

    onReadOk() {
        this.currentX = this.nextX;
        this.currentY = this.nextY;
        this.currentZ = this.nextZ;
        this.sendPosition();
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
    }

    onWriteG92_1(line) {//将原点设置为机器原点
    }

    onWriteM1112() {
        this.nextX = 0;
        this.nextY = 300;
        this.nextZ = 0;
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

// console.log(Math.round((0.1+0.2)*10)/10);
