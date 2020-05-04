import startHttpServer from "./start-http-server.js";
import startSocket from "./start-socket-io.js";

//有顺序，必须先http server，再socket
//todo：refactor：https://github.com/socketio/socket.io
/**
 * const app = require('koa')();
   const server = require('http').createServer(app.callback());
   const io = require('socket.io')(server);
   io.on('connection', () => {  });
   server.listen(3000);
 */

startHttpServer();
startSocket();




