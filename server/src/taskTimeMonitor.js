import EventEmitter from "events";
import {TASK_TIME_MONITOR} from "./constants";


const TIME_FOR_1MM_DISTANCE_Z = [
    438.771,
    325.857,
    252.771,
    211.571,
    181.1,
    158.257,
    138.486,
    124.043,
    113.371,
    104.214,
    96.629,
    88.986,
    83.629,
    78.343,
    72.271,
    68.443,
    65.029,
    61.629,
    58.929,
    55.9,
    53.643,
    51.7,
    49.786,
    47.929,
    45.214,
    44.457,
    42.586,
    41.814,
    39.914,
    39.171,
    37.257,
    35.9,
    34.971,
    34.229,
    33.3,
    32.357,
    31.629,
    30.8,
    30.4,
    29.6,
    29.1,
    28.471,
    28.129,
    27.414,
    27.029,
    26.571,
    26.4,
    26,
    25.543,
    25.5,
    25.071,
    24.714,
    24.657,
    24.314,
    23.986,
    23.986,
    24,
    23.743,
    23.5,
    23.514,
    23.529,
    23.329,
    23.1,
    23.043,
    22.986,
    22.971,
    22.971,
    22.957,
    23,
    22.986,
    22.971,
    22.986,
    22.986,
    22.986,
    22.986,
    23,
    22.986,
    23.014,
    22.986,
    22.986,
    22.986,
    22.971,
    22.986,
    22.971,
    22.986,
    22.986,
    22.986,
    22.986,
    22.971,
    22.971,
    22.986,
    23,
    22.971,
    22.971,
    23,
    23.014,
    22.986,
    28.943,
    0.286,
    0.157,];//测试数据
const TIME_FOR_1MM_DISTANCE_XY = [
    78.90125,
    78.925,
    76.7225,
    77.58125,
    74.7175,
    68.74,
    61.85625,
    77.53375,
    68.74,
    62.6575,
    59.7725,
    57.595,
    56.1725,
    64.05625,
    71.7275,
    98.28375,
    95.4075,
    92.62,
    90.5275,
    88.6975,
    86.09875,
    84.10375,
    82.32375,
    80.62625,
    79.38,
    77.30875,
    76.52625,
    75.10625,
    73.08875,
    72.05375,
    70.57375,
    69.51875,
    68.38875,
    67.105,
    66.3025,
    65.3975,
    64.54125,
    63.605,
    62.8025,
    62.15625,
    61.32625,
    60.6475,
    59.96375,
    59.28875,
    58.59625,
    57.9025,
    57.295,
    56.8125,
    56.1825,
    55.50375,
    55.035,
    54.6,
    54.06375,
    53.6275,
    53.06375,
    52.59,
    52.21875,
    51.5925,
    51.18125,
    50.4925,
    50.1575,
    49.5675,
    49.23,
    48.965,
    48.45875,
    48.15625,
    47.8125,
    47.35625,
    47.1,
    46.76875,
    46.43625,
    46.1375,
    45.82625,
    45.4575,
    45.2075,
    44.885,
    44.49,
    44.42375,
    43.9975,
    43.67625,
    43.5875,
    43.12625,
    43.06,
    42.6875,
    42.46,
    42.30125,
    41.9075,
    41.79625,
    41.47125,
    41.33,
    40.995,
    40.87,
    40.65375,
    40.47375,
    40.15375,
    40.05,
    39.7775,
    39.5275,
    39.33625,
    39.1775,
    38.9725,
    38.745,
    38.6725,
    38.4388,
    38.2538,
    38.0463,
    37.8563,
    37.6788,
    37.5663,
    37.4338,
    37.28,
    37.0725,
    36.8638,
    36.65,
    36.485,
    36.3325,
    36.2175,
    35.9313,
    35.7513,
    35.6588,
    35.495,
    35.3125,
    35.2,
    35.0213,
    34.9463,
    34.7363,
    34.5825,
    34.4663,
    34.3863,
    34.2113,
    34.1138,
    33.9313,
    33.8338,
    33.74,
    33.5475,
    33.4575,
    33.34,
    33.1838,
    33.0888,
    32.9763,
    32.8763,
    32.7938,
    32.5975,
    32.4913,
    32.375,
    32.3013,
    32.1863,
    32.1163,
    32.0025,
    31.9225,
    31.7088,
    31.6275,
    31.5013,
    31.42,
    31.2813,
    31.2113,
    31.1225,
    30.9975,
    30.905,
    30.9063,
    30.7988,
    30.6988,
    30.6038,
    30.4925,
    30.3875,
    30.2925,
    30.1825,
    30.0563,
    30.055,
    29.9463,
    29.8638,
    29.7638,
    29.6513,
    29.535,
    29.6025,
    29.4138,
    29.3325,
    29.2288,
    29.23,
    29.14,
    28.99,
    28.8613,
    28.8613,
    28.7825,
    28.7038,
    28.7038,
    28.5513,
    28.4238,
    28.3313,
    28.3363,
    28.2575,
    28.2575,
    28.0988,
    28,
    28.0013,
    27.935,
    27.7788,
    27.7763,
    27.64,
    27.6325,
];//测试数据
const MAX_FEED_RATE = 4999;
const MIN_FEED_RATE = 1;
const STEP_DISTANCE = 50;
const TIME_FOR_COMMAND = 4;
const TIME_FOR_G4P0 = 123;//测试数据

class TaskTimeMonitor extends EventEmitter {
    commandCountPast = 0;
    commandCountFuture = 0;

    distancePast = 0;
    distanceFuture = 0;
    distanceTotal = 0;

    distanceLongG0 = 0;
    distanceShortG0 = 0;
    distanceLongG1 = 0;
    distanceShortG1 = 0;


    /**
     *
     * @param gcode
     * @returns {number} time ms predicted time cost
     */
    getPredictedTimeCost = (gcodeString) => {
        if (!gcodeString) return 0;
        if (gcodeString.trim().length === 0) return 0;
        const gcodeArray = gcodeString.split('\n');
        let time = 0;
        for (const gcode of gcodeArray) {
            time += this.getPredictedTimeCostForGcode(gcode);
        }
    }

    getPredictedTimeCostForGcode(gcode) {
        if (gcode.startsWith('G')) {
            return getPre

        } else if (gcode.startsWith('')) {

        } else if (gcode.contains(';')) {
            return 0;
        } else {
            return TIME_FOR_COMMAND;
        }
    }

    /**
     *修正feedRate到1~4999范围，通过测试数据发现速度在5000以上没有明显变化
     * @param feedRate
     * @returns {number|*}
     */
    fixFeedRate = (feedRate) => {
        if (feedRate > MAX_FEED_RATE) return MAX_FEED_RATE;
        if (feedRate < MIN_FEED_RATE) return MIN_FEED_RATE;
        return feedRate;
    }


    timeFor1mm = (feedRate) => {
        feedRate = this.fixFeedRate(feedRate);
        const index = Math.floor(feedRate / STEP_DISTANCE);
        console.log(index);
        return TIME_FOR_1MM_DISTANCE_XY[index];
    }

    timeForDistanceShort = (feedRate) => {
        feedRate = this.fixFeedRate(feedRate);
        const index = Math.floor(feedRate / STEP_DISTANCE_SHORT);
        console.log(index);
        return TIME_FOR_1MM_DISTANCE_XY_SHORT[index];
    }

    /**
     * 对于我们机械臂的情况，一般水平轴和Z轴的移动是分开进行的，
     * 而且由于水平速率与Z轴速率差别很大，计算时间的时候
     * @returns {number} ms
     */
    getTimeForMove = (x1, y1, z1, x2, y2, z2, feedRate) => {
        const distance = getDistance(x1, y1, z1, x2, y2, z2);
        let timeFor1MM = distance > LONG_SHORT_THRESHOLD ?
            timeForDistanceLong(feedRate) :
            timeForDistanceShort(feedRate);
        return distance * timeFor1MM;
    }

    /**
     *
     * @returns {number} ms
     */
    getTimeForCommand = () => {
        return 10;
    }

    getTimeForGcode = (gcode) => {
    }


    positionFilteringWrite = (line) => {
        if (!line) {
            return;
        }

        this.logWrite(line);

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

    positionFilteringRead = (line) => {
        if (!line) {
            return;
        }

        this.logRead(line);

        if (line.startsWith('ok')) {
            this.onReadOk();
        } else if (this.needProcessM114) {
            this.processM114(line);
        } else {
        }
    }

    logWrite = (line) => {
        this.log('logWrite', line)
    }

    logRead = (line) => {
        // this.log('logRead', line);
    }

    log = (tag, line) => {
        console.log(tag, line.trim() + '   ' + new Date().valueOf())
    }


}

/**
 * 动态评估Gcode执行时间
 */
class DynamicTaskTimeMonitor extends EventEmitter {
    setup = () => {

    }
    onTaskStart = () => {

    }
    onWriteGcode = (gcode) => {

    }
    getDistance = (x1, y1, z1, x2, y2, z2) => {
        return {
            xy: Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)),
            z: Math.abs(z2 - z1)
        }
    }
    /**
     * 对于非G0,G1,的Gcode,每一条的执行时间都做一个加权平均
     * 对于G0,G1:将执行距离分为0.5MM一下，和0.5mm以上的
     * 如前面G4P5 执行了n条，平均每条执行执行时间为t,现在执行的这条执行时间为x,则加权平均为:(n*t+x)/(n+1)
     *
     */
    sendTaskTime = () => {
        const taskTime = {
            executedCount: 0,//已执行Gcode数量
            totalCount: 0,//总Gcode数量
            executedTime: 0,//已执行时间
            predictedTimeLeft: 0,//剩余预测执行时间
            dynamicPredictedTimeLeft: 0,//动态预测执行时间
            mixPredictedTimeLeft: 0,//综合剩余执行时间（加权平均）
        };
        this.emit(TASK_TIME_MONITOR, taskTime);
    }
}

/**
 * 预测Gcode执行时间
 * 速度小于400的情形xy距离小于0.2mm的情形，时间乘以二，
 */
class TaskTimePredictor {
    /**
     * @param gcodeString
     * @returns {number}  PredictedTaskTime (ms)
     */
    getPredictedTaskTime = (gcodeString) => {

        return 0
    }
    getDistance = (x1, y1, z1, x2, y2, z2) => {
        return {
            xy: Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)),
            z: Math.abs(z2 - z1)
        }
    }
}


const taskTimeMonitor = new TaskTimeMonitor();
export default taskTimeMonitor;