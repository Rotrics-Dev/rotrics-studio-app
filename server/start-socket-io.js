import IO from 'socket.io';
import serialPortManager from './serialPortManager.js';
import generateToolPathLines from './toolPath/generateToolPathLines.js';


import gcodeSender from'./gcode/gcodeSender.js';

const port = 3003;
const io = new IO();

const startSocket = () => {
    io.on(
        'connection',
        client => {
            console.log('-> socket connect');

            serialPortManager.on("on-serialPort-query", (data) => {
                client.emit('on-serialPort-query', data);
            });
            serialPortManager.on("on-serialPort-open", (data) => {
                client.emit('on-serialPort-open', data);
            });
            serialPortManager.on("on-serialPort-close", (data) => {
                client.emit('on-serialPort-close', data);
            });
            serialPortManager.on("on-serialPort-error", (data) => {
                client.emit('on-serialPort-error', data);
            });
            serialPortManager.on("on-serialPort-data", (data) => {
                client.emit('on-serialPort-data', data);
            });

            client.on(
                'disconnect',
                () => {
                    console.log('-> socket disconnect');
                    // serialPortManager.removeAllListeners();
                }
            );

            //serial port
            client.on(
                'serialPort-query',
                () => {
                    serialPortManager.list();
                }
            );
            client.on(
                'serialPort-open',
                (data) => {
                    serialPortManager.open(data.path);

                }
            );
            client.on(
                'serialPort-close',
                () => {
                    serialPortManager.close();
                }
            );
            client.on(
                'serialPort-write',
                (data) => {
                    serialPortManager.write(data.gcode);
                }
            );

            //gcode send
            client.on(
                'gcode-send-load',
                (data) => {
                    const {gcode} = data;
                    gcodeSender.load(gcode);
                }
            );
            client.on(
                'gcode-send-start',
                () => {
                    gcodeSender.start();
                }
            );
            client.on(
                'gcode-send-stop',
                () => {
                    gcodeSender.stop();
                }
            );

            //gcode generate
            client.on(
                'tool-path-generate-laser',
                async (data) => {
                    console.log("tool-path-generate-laser")
                    const {url, settings, toolPathId, fileType} = data;
                    const toolPathLines = await generateToolPathLines(fileType, url, settings);
                    client.emit('on-tool-path-generate-laser', {toolPathLines, toolPathId});
                }
            );
        }
    );
    io.listen(port);
    console.log('start socket io at port ' + port);
};

export default  startSocket;



