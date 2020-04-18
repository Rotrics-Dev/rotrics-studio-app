const EventEmitter = require('events');
const SerialPort = require('serialport');
const baudRate = 115200;

class serialPortDataParser extends EventEmitter {
    constructor() {
        super();
    }

    parse(data){
        this.emit('on-serialPort-error', {error});
    }
}

const serialPortDataParser = new serialPortDataParser();

module.exports = serialPortDataParser;
