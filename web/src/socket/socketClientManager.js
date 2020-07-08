import io from 'socket.io-client';

class SocketClientManager {
    constructor() {
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
     * @param eventName
     * @param data 数据对象，不使用[, ...args]
     * @param ack 回调函数。注意：只能回调一次，即使server多次调用
     * @returns {boolean} 是否成功
     */
    emitToServer(eventName, data, ack) {
        if (this.isSocketConnected) {
            this.socketClient.emit(eventName, data, ack);
            return true;
        }
        return false;
    }

    addServerListener(eventName, listener) {
        this.socketClient.on(eventName, (data) => {
            listener(data);
        });
    }

    removeServerListener(eventName, listener) {
        console.log("@@@@@")
        this.socketClient.removeEventListener(eventName, listener);
    }

    removeAllServerListener(eventName) {
        this.socketClient.removeAllListeners(eventName)
    }
}

const socketClientManager = new SocketClientManager();

export default socketClientManager;
