import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import config from "config";

import { green, red } from "./utils/colors";
import { registerGameHandler } from "./handlers/game_handler";

import { User, Player, SocketId, UserId } from "../../../types/user";
import { SocketIoServer, ServerSocket } from "../../../types/socketio";
import { registerBoardHandler } from "./handlers/board_handler";
import { registerUserHandler } from "./handlers/user_handler";
import BoomerDogClient from "../game/boomerdogclient";
import { CardBase } from "../../../types/game";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        // origin: ["http://localhost:3000"]
        origin: "*",
    },
}) as SocketIoServer;

const socketIdToUserId = new Map<SocketId, UserId>();
const userMap = new Map<UserId, User>();

const gamesMap = new Map<string, BoomerDogClient>();

const updatePlayer = (playerId: string) => {
    const user = userMap.get(playerId);
    user && io.to(user.socketId).emit("player:update", user as Player);
};

const testHand = [
    { id: 0, value: 9, color: 1 },
    { id: 1, value: 0 },
    { id: 2, value: 2, color: 3 },
    { id: 3, value: 11, color: 2 },
] as CardBase[];

const updateCards = (gameId: string, playerId: string) => {
    const user = userMap.get(playerId);
    const game = gamesMap.get(gameId);
    console.log(user && game && `emit to ${user.socketId}`)
    user && game && io.to(user.socketId).emit("cards:update", testHand); // game.getPlayerCards(playerId));
};

// for testing just increment with each connection
const onConnection = (socket: ServerSocket) => {
    const clientId = io.engine.clientsCount;
    console.log(green(`Socket connection: [${clientId}] ${socket.id}`));

    const client = userMap.get(clientId);
    if (client) {
        console.debug(`Recover client ${clientId}`);
    } else {
        const player: User = {
            name: clientId,
            uuid: clientId,
            socketId: socket.id,
            gameId: null,
        };
        userMap.set(clientId, player);
    }

    socketIdToUserId.set(socket.id, clientId);

    registerGameHandler(
        io,
        socket,
        gamesMap,
        userMap,
        updatePlayer,
        updateCards
    );
    registerBoardHandler(socket);
    registerUserHandler(socket, socketIdToUserId, userMap);

    socket.on("disconnect", () => {
        console.log(red(`Socket disconnect: ${socket.id}`));
        socketIdToUserId.delete(socket.id);
    });
};

httpServer.listen(config.get("server.port"));
console.info(`Listening on port ${config.get("server.port")}...`);

io.on("connection", onConnection);
