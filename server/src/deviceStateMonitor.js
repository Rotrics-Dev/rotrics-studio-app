import EventEmitter from 'events';
import serialPortManager from './serialPortManager.js';
import {SERIAL_PORT_RECEIVED_LINE} from "./constants";

class DeviceStateMonitor extends EventEmitter {
    constructor() {
        super();
        this.isLaserCoverOpened = false;

        serialPortManager.on(SERIAL_PORT_RECEIVED_LINE, (line) => {
            if (line === 'Warning!Laser protection door opened') {
                this.isLaserCoverOpened = true;
            } else if (line === 'Laser protection door closed') {
                this.isLaserCoverOpened = false;
            }
        });
    }
}

const deviceStateMonitor = new DeviceStateMonitor();

export default deviceStateMonitor;
