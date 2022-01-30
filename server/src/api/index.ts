import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

import config from "config";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {});

io.on("connection", (socket) => {
    console.log(socket);
});

httpServer.listen(config.get("server.port"));
console.info(`Listening on port ${config.get("server.port")}...`)