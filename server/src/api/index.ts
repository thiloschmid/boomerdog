import * as express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

import config from "../../config/config";

const io = new Server(config.port,)
const app = express();
const httpServer = createServer(app);

io.on("connection", (socket) => {
    console.log(socket);
});

httpServer.listen(config.port);
console.info(`Listening on port ${config.port}...`)