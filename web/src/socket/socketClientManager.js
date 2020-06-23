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
     * @param data
     * @returns {boolean} 是否成功
     */
    emitToServer(eventName, data) {
        if (this.isSocketConnected) {
            this.socketClient.emit(eventName, data);
            return true;
        }
        return false;
    }

    addServerListener(eventName, listener) {
        this.socketClient.on(eventName, (data) => {
            listener(data);
        });
    }

    removeAllServerListener(eventName) {
        this.socketClient.removeAllListeners(eventName)
    }
}

const socketClientManager = new SocketClientManager();

export default socketClientManager;
