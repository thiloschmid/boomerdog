import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { Server } from "socket.io";
import { createServer } from "http";
import config from "config";

import {
    registerGameHandler,
    updateCards,
    updateGameData,
    updateGameState,
} from "./handlers/game_handler.js";
import { green, red } from "./utils/colors.js";

import { registerBoardHandler } from "./handlers/board_handler.js";
import { registerUserHandler } from "./handlers/user_handler.js";
import BoomerDogClient from "../game/boomerdogclient.js";
import { CardBase, GameState } from "../../../types/game.js";
import { SocketIoServer, ServerSocket } from "./types.js";
import { SocketId, UserId, User } from "../../../types/user.js";
import { registerCardHandler } from "./handlers/card_handler.js";

export const app = express();

const httpServer = createServer(app);
export const io = new Server(httpServer, {
    cors: {
        // origin: ["http://localhost:3000"]
        origin: "*",
    },
}) as SocketIoServer;

export const socketIdToUserId = new Map<SocketId, UserId>();
export const userMap = new Map<UserId, User>();
export const gamesMap = new Map<string, BoomerDogClient>();

export const getUserFromSocket = (socket: ServerSocket) => {
    const token = socket.handshake.auth.token;
    if (token) {
        const user = userMap.get(token);
        if (user) {
            return user;
        }
    }
    return null;
};

export const updateUser = (userId: string) => {
    const user = userMap.get(userId);
    user && io.to(user.socketId).emit("user:update", user);
};

const onConnection = (socket: ServerSocket) => {
    console.log(
        green(
            `Socket connection: ${socket.id} from ${socket.handshake.auth.token}`
        )
    );
    const userId = socket.handshake.auth.token;
    socketIdToUserId.set(socket.id, userId);

    let user: User;

    // check if the player has already a defined state
    if (userMap.has(userId)) {
        user = userMap.get(userId) as User;
        user!.socketId = socket.id;
        // TODO handle case that user has already an assigned socket
    } else {
        // create User
        user = {
            name: userId,
            uuid: userId,
            socketId: socket.id,
        };
        userMap.set(userId, user);
    }

    updateUser(userId);

    // check if the user was in a game
    if (user.gameId) {
        updateGameData(user.gameId, user.socketId);
        const game = gamesMap.get(user.gameId);
        if (game?.gameInfo.hasStarted) {
            updateGameState(user.gameId, user.socketId);
            updateCards(user.gameId, userId);
        }
    }

    registerGameHandler(socket);
    registerBoardHandler(socket);
    registerCardHandler(socket);
    registerUserHandler(socket);

    socket.on("disconnect", () => {
        console.log(red(`Socket disconnect: ${socket.id}`));
        const userId = socketIdToUserId.get(socket.id);
        const user = userId && userMap.get(userId);
        if (user) {
            user.socketId = "";
        }
        socketIdToUserId.delete(socket.id);
    });
};

app.use(cors());
app.get("/token", async function (req, res) {
    const proxy_url = "http://localhost:9999/authenticate";

    const code = req.query.code;

    const response = await fetch(`${proxy_url}/${code}`);
    const data = (await response.json()) as { token: string };

    // could get some user data here
    // const responseToken = await fetch("https://api.github.com/user", {
    //     headers: {
    //         Authorization: `token ${data.token}`,
    //     },
    // });

    if (data && data.token) {
        res.send({ status: 0, token: `${data.token}` });
    } else {
        res.send({
            status: 1,
            message: "Unable to authenticate with github",
        });
    }
});

httpServer.listen(config.get("server.port"));
console.info(`Listening on port ${config.get("server.port")}...`);

io.on("connection", onConnection);
