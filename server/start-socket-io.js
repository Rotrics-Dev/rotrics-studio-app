const io = require('socket.io')();
const serialPortManager = require('./serialPortManager');
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
                    serialPortManager.removeAllListeners();
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
            // client.on(
            //     'serialPort-write',
            //     (data) => {
            //         serialPortManager.write(data);
            //     }
            // );
            client.on(
                'serialPort-write-gcode',
                (data) => {
                    serialPortManager.write(data.gcode);
                }
            );

            //gcode generate
            client.on(
                'gcode-generate-laser',
                (data) => {
                    console.log("gcode-generate-laser: " + JSON.stringify(data, null, 2))
                }
            );
        }
    );
    io.listen(port);
    console.log('start socket io at port ' + port);
};

module.exports = startSocket;



