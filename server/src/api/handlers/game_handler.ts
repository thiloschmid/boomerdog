import { v4 as uuidv4 } from "uuid";

import {
    CreateGameIoResponse,
    CreateGamePayload,
    GameIdentifierPayload,
    IoCallback,
    IoResponse,
    PerformMovePayload,
} from "boomerdog-types";

import BoomerDogClient from "../../game/boomerdogclient.js";
import { ServerSocket } from "../types.js";
import { io, gamesMap, getUserFromSocket, updateUser } from "../index.js";
import { yellow } from "../utils/colors.js";
import { PerformRemainingMovePayload } from "boomerdog-types/socketio";

export const emitGameList = () => {
    const gameList = Array.from(gamesMap.values()).map((value) =>
        value.getGameData()
    );
    io.emit("games:update", gameList);
};

export const registerGameHandler = (socket: ServerSocket) => {
    const createGame = (
        { gameName, nPlayers }: CreateGamePayload,
        callback: IoCallback<CreateGameIoResponse>
    ) => {
        const user = getUserFromSocket(socket);

        console.log(user);

        if (!user) {
            callback({ status: 1, message: "Player not found" });
            return;
        }

        if (user.gameId) {
            callback({ status: 1, message: "Player is already in a game" });
            return;
        }

        const uuid = uuidv4(); // assign the game a unique id
        const game = new BoomerDogClient(uuid, gameName, nPlayers);

        const response = game.playerJoin(user);

        if (!response.status) {
            gamesMap.set(uuid, game);
            // join the game socket
            socket.join(uuid);

            // emit new game list and user data
            emitGameList();
            updateUser(user.userId);

            // emit game specific data
            game.emitGameData();
            game.emitBoardData();
        }
        console.log(response);
        callback(response);
    };

    const joinGame = (
        { gameId }: GameIdentifierPayload,
        callback: IoCallback<IoResponse>
    ) => {
        const user = getUserFromSocket(socket);

        if (!user) {
            callback({ status: 1, message: "User not found" });
            return;
        }
        if (user.gameId) {
            callback({
                status: 1,
                message:
                    user.gameId === gameId
                        ? "Player is already in this game"
                        : "Player is already in another game",
            });
            return;
        }

        const game = gamesMap.get(gameId);

        if (!game) {
            callback({ status: 1, message: "Game does not exist" });
            return;
        }

        const response = game.playerJoin(user);

        if (!response.status) {
            // join the game socket
            socket.join(gameId);

            // emit new game list and user data
            emitGameList();
            updateUser(user.userId);

            // emit game specific data
            game.emitGameData();
            game.emitBoardData();
        }
        callback(response);
    };

    const quitGame = (
        { gameId }: { gameId: string },
        callback: IoCallback<IoResponse>
    ) => {
        const game = gamesMap.get(gameId);
        if (!game) {
            callback({ status: 1, message: "Game does not exist" });
            return;
        }
        const user = getUserFromSocket(socket);
        if (!user) {
            callback({ status: 1, message: "User not found" });
            return;
        }
        const response = game.playerQuit(user);
        if (!response.status) {
            socket.leave(gameId);

            if (!game.players.length) {
                // clear the game if no players are left
                gamesMap.delete(gameId);
            }

            emitGameList();
            updateUser(user.userId);

            game.emitGameData();
        }
    };

    const startGame = (
        { gameId }: { gameId: string },
        callback: IoCallback<IoResponse>
    ) => {
        const game = gamesMap.get(gameId);
        const user = getUserFromSocket(socket);

        if (!user) {
            callback({ status: 1, message: "User not found" });
            return;
        }
        if (gameId !== user.gameId) {
            callback({ status: 1, message: "User not in game" });
            return;
        }
        if (!game) {
            callback({ status: 1, message: "Game does not exist" });
            return;
        }

        // perhaps check if successful to remove it from the game browser
        callback(game.startGame());
    };

    const performSwap = (payload: number, callback: IoCallback<IoResponse>) => {
        const user = getUserFromSocket(socket);
        if (!user) {
            callback({ status: 1, message: "User not found" });
            return;
        }
        const game = user.gameId ? gamesMap.get(user.gameId) : null;
        if (!game) {
            callback({ status: 1, message: "Game does not exist" });
            return;
        }
        const response = game.playerSwaps(user, payload);

        if (response.status) {
            console.error(response.message);
        }

        callback(response);
    };

    const performMove = (
        payload: PerformMovePayload,
        callback: IoCallback<IoResponse>
    ) => {
        const game = gamesMap.get(payload.gameId);
        if (!game) {
            callback({ status: 1, message: "Game does not exist" });
            return;
        }
        const user = getUserFromSocket(socket);
        if (!user) {
            callback({ status: 1, message: "User not found" });
            return;
        }
        const response = game.playerPerformsMove(
            user.userId,
            payload.c,
            payload.m,
            payload.mi
        );

        if (response.status) {
            console.error(response.message);
        }

        callback(response);
    };

    const performRemainingMove = (
        payload: PerformRemainingMovePayload,
        callback: IoCallback<IoResponse>
    ) => {
        const game = gamesMap.get(payload.gameId);
        if (!game) {
            callback({ status: 1, message: "Game does not exist" });
            return;
        }
        const user = getUserFromSocket(socket);
        if (!user) {
            callback({ status: 1, message: "User not found" });
            return;
        }
        const response = game.playerPerformsRemainingMove(
            user.userId,
            payload.m,
            payload.mi
        );
        if (response.status) {
            console.error(response.message);
        }

        callback(response);
    };

    const fold = (
        payload: GameIdentifierPayload,
        callback: IoCallback<IoResponse>
    ) => {
        const game = gamesMap.get(payload.gameId);
        if (!game) {
            callback({ status: 1, message: "Game does not exist" });
            return;
        }
        const user = getUserFromSocket(socket);
        if (!user) {
            callback({ status: 1, message: "User not found" });
            return;
        }
        const response = game.playerFolds(user.userId);

        if (response.status) {
            console.error(response.message);
        }

        callback(response);
    };

    const updatePlayerOnReconnect = ({ gameId }: { gameId: string }) => {
        const user = getUserFromSocket(socket);
        const game = gamesMap.get(gameId);
        console.log(
            yellow(
                `Player ${user?.userId} tries to reconnect to ${gameId} = ${game?.gameId}`
            )
        );

        if (user && game && game.players.includes(user)) {
            game.emitGameData(user.userId);
            if (game.hasStarted) {
                game.emitGameState(user.userId);
                game.emitCards(user.userId);
                game.emitBoardData(user.userId);
                if (game.getActivePlayer()?.userId === user.userId) {
                    game.emitPossibleMoves();
                    if (game.getGameState().remainingMoves) {
                        game.emitRemainingMoves();
                    }
                }
            }
        }
    };

    socket.on("games:read", emitGameList);
    socket.on("game:create", createGame);
    socket.on("game:join", joinGame);
    socket.on("game:quit", quitGame);
    socket.on("game:start", startGame);
    socket.on("game:swap_card", performSwap);
    socket.on("game:perform_move", performMove);
    socket.on("game:perform_remaining_move", performRemainingMove);
    socket.on("game:fold", fold);
    socket.on("game:reconnect", updatePlayerOnReconnect);
};
