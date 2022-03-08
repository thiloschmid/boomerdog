import express, { response } from "express";
import cors from "cors";
import fetch from "node-fetch";
import { Server } from "socket.io";
import { createServer } from "http";
import config from "config";

import { emitGameList, registerGameHandler } from "./handlers/game_handler.js";
import { green, red, yellow } from "./utils/colors.js";
// import { registerUserHandler } from "./handlers/user_handler.js";
import { SocketIoServer, ServerSocket } from "./types.js";
import { UserId, User } from "boomerdog-types";
import { registerCardHandler } from "./handlers/card_handler.js";

import BoomerDogClient from "../game/boomerdogclient.js";

export const app = express();

const httpServer = createServer(app);
export const io = new Server(httpServer, {
    cors: {
        // origin: ["http://localhost:3000"]
        origin: "*",
    },
}) as SocketIoServer;

// export const socketIdToUserId = new Map<SocketId, UserId>();
export const userMap = new Map<UserId, User>();
export const tokenMap = new Map<string, UserId>();
export const gamesMap = new Map<string, BoomerDogClient>();

export const getUserFromSocket = (socket: ServerSocket) => {
    const token = socket.handshake.auth.token;
    if (token) {
        const userId = getUserIdFromToken(token);
        if (userId) {
            const user = userMap.get(userId);
            if (user) {
                return user;
            } else {
                console.debug(`user does not exist`);
            }
        } else {
            console.debug(`userId does not exist`);
        }
    } else {
        console.debug(`token does not exist`);
    }
    return null;
};

const getUserIdFromToken = (token: string) => {
    return tokenMap.get(token);
};

export const updateUser = (userId: string) => {
    const user = userMap.get(userId);
    user && io.to(user.userId).emit("user:update", user);
};

const onConnection = async (socket: ServerSocket) => {
    console.log(
        green(
            `Socket connection: ${socket.id} from ${socket.handshake.auth.token}`
        )
    );

    const token = socket.handshake.auth.token;
    const userId = getUserIdFromToken(token);

    let user = userId ? userMap.get(userId) : null;

    // check if the player exists
    if (user) {
        if (user.gameId) {
            // join the game socket for gamestate
            socket.join(user.gameId);
        }
    } else {
        // fetch user data
        const response = await fetch("https://api.github.com/user", {
            method: "get",
            headers: { Authorization: `token ${token}` },
        });

        const data = (await response.json()) as {
            id: number;
            avatar_url: string;
            name: string;
        };

        if (!data) {
            console.warn(`Unable to authenticate token ${token}`);
            return;
        }

        // create User

        user = {
            name: data.name,
            userId: `${data.id}`,
            avatarUrl: data.avatar_url,
        };
        userMap.set(user.userId, user);
        tokenMap.set(token, user.userId);
    }

    socket.join(user.userId); // join a user-specific room

    // show sockets in the userId's room
    // const rooms = io.of("/").adapter.rooms;
    // console.log("room: ", rooms.get(userId));

    registerGameHandler(socket);
    registerCardHandler(socket);
    // registerUserHandler(socket);

    // socketIdToUserId.set(socket.id, user.userId);

    emitGameList();
    updateUser(user.userId);

    socket.on("disconnect", () => {
        console.log(red(`Socket disconnect: ${socket.id}`));
        // console.log("room: ", rooms.get(userId));
    });
};

app.use(cors());
app.get("/token", async function (req, res) {
    // exchange the code for an access token
    // use the gatekeeper proxy for local development
    const oauth_url =
        process.env.NODE_ENV === "production"
            ? "https://github.com/login/oauth/access_token"
            : "http://localhost:9999/authenticate";

    const code = req.query.code;

    const response = await fetch(`${oauth_url}/${code}`);
    const data = (await response.json()) as { token: string };

    if (data && data.token) {
        res.send({ status: 0, token: `${data.token}` });
    } else {
        res.send({
            status: 1,
            message: "Unable to authenticate with github",
        });
    }
});

const port = process.env.port || 3002;
httpServer.listen(port);
console.info(`Listening on port ${port}...`);

io.on("connection", onConnection);
