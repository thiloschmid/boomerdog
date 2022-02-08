import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";

import {
    CreateGameIoResponse,
    CreateGamePayload,
    IoCallback,
    IoResponse,
    JoinGamePayload,
} from "../../../../types/socketio.js";

import BoomerDogClient from "../../game/boomerdogclient.js";
import { SocketIoServer, ServerSocket } from "../types.js";
import { Player, UserId } from "../../../../types/user.js";
import { io, gamesMap, getUserFromSocket, userMap } from "../index.js";
import { CardBase } from "../../../../types/game.js";

const testHand = [
    { id: 0, value: 9, color: 1 },
    { id: 1, value: 0 },
    { id: 2, value: 2, color: 3 },
    { id: 3, value: 11, color: 2 },
] as CardBase[];

const updateCards = (gameId: string, userId: string) => {
    const user = userMap.get(userId);
    const game = gamesMap.get(gameId);
    console.log(user && game && `emit to ${user.socketId}`);
    user && game && io.to(user.socketId).emit("cards:update", testHand); // game.getPlayerCards(userId));
};

const updateGameData = (gameId: string) => {
    const game = gamesMap.get(gameId);
    game && io.to(gameId).emit("gamedata:update", game.getGameData());
};

export const registerGameHandler = (
    io: SocketIoServer,
    socket: ServerSocket,
    gamesMap: Map<string, BoomerDogClient>,
    userMap: Map<UserId, Player>,
    updatePlayer: (userId: string) => void,
    updateCards: (gameId: string, userId: string) => void
) => {
    const emitGameList = (broadcast?: boolean) => {
        // if no receiver specified, send to all connected clients
        const destination = broadcast ? io : socket;

        const gameList = Array.from(gamesMap.values()).map(
            (value) => value.gameInfo
        );
        destination.emit("games:update", gameList);
    };

    const createGame = (
        { gameName, nPlayers, userId }: CreateGamePayload,
        callback: IoCallback<CreateGameIoResponse>
    ) => {
        const player = userMap.get(userId);

        if (!player) {
            callback({ status: 1, message: "Player not found" });
            return;
        }

        if (player.gameId) {
            callback({ status: 1, message: "Player is already in a game" });
            return;
        }

        const uuid = uuidv4(); // assign the game a unique id
        const game = new BoomerDogClient(uuid, gameName, nPlayers);

        const response = game.playerJoin(player);
        if (response) {
            // something went wrong
            callback({ status: 1, message: response });
            return;
        }

        player.gameId = uuid;
        gamesMap.set(uuid, game);
        emitGameList(true);
        updatePlayer(userId);
        socket.join(uuid);
        updateGameData(uuid);

        callback({ status: 0, gameId: uuid });
    };

    const joinGame = (
        { gameId, userId }: JoinGamePayload,
        callback: IoCallback<IoResponse>
    ) => {
        const player = userMap.get(userId);

        if (!player) {
            callback({ status: 1, message: "Player not found" });
            return;
        }
        if (player.gameId) {
            callback({ status: 1, message: "Player is already in a game" });
            return;
        }

        const game = gamesMap.get(gameId);

        const response = game ? game.playerJoin(player) : "Game not found";

        if (response) {
            // something went wrong
            callback({ status: 1, message: response });
            return;
        }

        player.gameId = gameId;
        emitGameList(true);
        updatePlayer(userId);
        updateGameData(gameId);
        callback({ status: 0 });
    };

    const startGame = (
        { uuid }: { uuid: string },
        callback: IoCallback<IoResponse>
    ) => {
        const game = gamesMap.get(uuid);
        const user = getUserFromSocket(socket);

        if (!user) {
            callback({ status: 1, message: "User not found" });
            return;
        }
        if (uuid !== user.gameId) {
            callback({ status: 1, message: "User not in game" });
            return;
        }
        if (!game) {
            callback({ status: 1, message: "Game does not exist" });
            return;
        }
        game.setupGame();
        updateGameData(uuid);
        // updateGameState(uuid);
        for (const player of game.gameInfo.players) {
            updateCards(game.gameInfo.uuid, player.uuid);
        }
        callback({ status: 0 });
    };

    socket.on("games:read", emitGameList);
    socket.on("game:create", createGame);
    socket.on("game:join", joinGame);
    socket.on("game:start", startGame);
};
