import SocketIoServer from 'socket.io';
import serialPortManager from './serialPortManager.js';
import generateToolPathLines from './toolPath/generateToolPathLines.js';
import {
    SERIAL_PORT_GET_PATH,
    SERIAL_PORT_GET_OPENED,
    SERIAL_PORT_OPEN,
    SERIAL_PORT_CLOSE,
    SERIAL_PORT_ERROR,
    SERIAL_PORT_DATA,
    SERIAL_PORT_WRITE,
    TOOL_PATH_GENERATE_LASER,
    GCODE_SEND_LOAD,
    GCODE_SEND_START,
    GCODE_SEND_STOP,
    GCODE_SEND_ERROR
} from "../shared/constants.js"

import gcodeSender from './gcode/gcodeSender.js';

const port = 3003;
const socketIoServer = new SocketIoServer();

const startSocket = () => {
    socketIoServer.on(
        'connection',
        socket => {
            console.log('socket io server -> connect');

            socket.on('disconnect', () => console.log('socket io server -> disconnect'));

            //注意：最好都使用箭头函数，否则this可能指向其他对象
            //serial port
            socket.on(SERIAL_PORT_GET_PATH, () => serialPortManager.getPaths());
            socket.on(SERIAL_PORT_GET_OPENED, () => serialPortManager.getOpened());
            socket.on(SERIAL_PORT_OPEN, path => serialPortManager.open(path));
            socket.on(SERIAL_PORT_CLOSE, () => serialPortManager.close());
            socket.on(SERIAL_PORT_WRITE, str => serialPortManager.write(str));

            //gcode send
            socket.on(GCODE_SEND_LOAD, data => gcodeSender.load(data.gcode));
            socket.on(GCODE_SEND_START, () => gcodeSender.start());
            socket.on(GCODE_SEND_STOP, () => gcodeSender.stop());

            //gcode generate
            socket.on(
                TOOL_PATH_GENERATE_LASER,
                async (data) => {
                    console.log(TOOL_PATH_GENERATE_LASER)
                    const {url, settings, toolPathId, fileType} = data;
                    const toolPathLines = await generateToolPathLines(fileType, url, settings);
                    socket.emit(TOOL_PATH_GENERATE_LASER, {toolPathLines, toolPathId});
                }
            );

            serialPortManager.on(SERIAL_PORT_GET_PATH, (paths) => {
                socket.emit(SERIAL_PORT_GET_PATH, paths);
            });
            serialPortManager.on(SERIAL_PORT_GET_OPENED, (path) => {
                console.log(SERIAL_PORT_GET_OPENED + " -> " + path)
                socket.emit(SERIAL_PORT_GET_OPENED, path);
            });
            serialPortManager.on(SERIAL_PORT_OPEN, (path) => {
                socket.emit(SERIAL_PORT_OPEN, path);
            });
            serialPortManager.on(SERIAL_PORT_CLOSE, (path) => {
                socket.emit(SERIAL_PORT_CLOSE, path);
            });
            serialPortManager.on(SERIAL_PORT_ERROR, (error) => {
                socket.emit(SERIAL_PORT_ERROR, error);
            });
            serialPortManager.on(SERIAL_PORT_DATA, (data) => {
                socket.emit(SERIAL_PORT_DATA, data);
            });
        }
    );
    socketIoServer.listen(port);
    console.log('start socket io server at port ' + port);
};

export default startSocket;



