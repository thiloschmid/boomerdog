import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import config from "config";

import { TwoWayMap } from "./util";
import { green, red } from "./colors";
import { readGames, joinGame } from "./game";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        // origin: ["http://localhost:3000"]
        origin: "*"
    }
});

type SocketId = string;
type UserId = string; // might change later to use numbers
let authenticatedUsers = new TwoWayMap<UserId, SocketId>();

// for testing just increment with each connection
let uid = 0

const onConnection = (socket:Socket<ClientToServerEvents,  ) => {
    console.log(green(`Socket connection: ${socket.id}`));
    uid++;

    authenticatedUsers.set(`${uid}`, socket.id)

    socket.on("game:read", readGames)
    socket.on("game:join", joinGame)

    socket.on("disconnect", () => {
        console.log(red(`Socket disconnect: ${socket.id}`));
        authenticatedUsers.revDelete(socket.id)

    });
});

httpServer.listen(config.get("server.port"));
console.info(`Listening on port ${config.get("server.port")}...`)

io.on("connection", onConnection);