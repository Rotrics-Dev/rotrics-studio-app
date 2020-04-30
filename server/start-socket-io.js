const io = require('socket.io')();
const serialPortManager = require('./serialPortManager');
const generateToolPathLines4BW = require('./laser/generateToolPathLines4BW');
const gcodeSender = require('./gcode/gcodeSender');

const port = 3003;

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
                'gcode-generate-laser-bw',
                async (data) => {
                    const {url, settings, toolPathId} = data;
                    const toolPathLines = await generateToolPathLines4BW(url, settings);
                    client.emit('on-gcode-generate-laser-bw', {toolPathLines, toolPathId});
                }
            );
        }
    );
    io.listen(port);
    console.log('start socket io at port ' + port);
};

module.exports = startSocket;



