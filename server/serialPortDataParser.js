import EventEmitter from 'events';
import SerialPort from 'serialport';
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

export default serialPortDataParser;
