import io from 'socket.io-client';
import {EventEmitter} from "events"; //api和node event一样，但是可以运行在browser环境中，https://github.com/Gozala/events#readme

class SocketClientManager extends EventEmitter {
    constructor() {
        super();
        this.socketClient = null;
        this.isSocketConnected = false;
    }

    initSocketClient(serverIp) {
        this.socketClient = io(serverIp);
        this.socketClient.on('connect', () => {
            this.isSocketConnected = true;
        });
        this.socketClient.on('disconnect', () => {
            this.isSocketConnected = false;
        });
    }

    /**
     * emit event to server vis this.socketClient
     * @param event
     * @param data
     * @returns {boolean} 是否成功
     */
    emitToServer(event, data) {
        if (this.isSocketConnected) {
            this.socketClient.emit(event, data);
            return true;
        }
        return false;
    }

    addServerListener(eventName, listener) {
        this.socketClient.on(eventName, (data) => {
            listener(data);
        });
    }
}

const socketClientManager = new SocketClientManager();

export default socketClientManager;
