import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";

import BoomerDog from "../../game/boomerdog";

import {
    CreateGameIoResponse,
    CreateGamePayload,
    IoCallback,
    IoResponse,
    JoinGamePayload,
} from "../../../../types/socketio";

import { SocketIoServer, ServerSocket } from "../../../../types/socketio";
import { Player, UserId } from "../../../../types/user";
import BoomerDogClient from "../../game/boomerdogclient";

export const registerGameHandler = (
    io: SocketIoServer,
    socket: ServerSocket,
    gamesMap: Map<string, BoomerDogClient>,
    userMap: Map<UserId, Player>,
    updatePlayer: (playerId: string) => void,
    updateCards: (gameId: string, playerId: string) => void
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
        { gameName, nPlayers, playerId }: CreateGamePayload,
        callback: IoCallback<CreateGameIoResponse>
    ) => {
        const player = userMap.get(playerId);

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
        updatePlayer(playerId);
        callback({ status: 0, gameId: uuid });
    };

    const joinGame = (
        { gameId, playerId }: JoinGamePayload,
        callback: IoCallback<IoResponse>
    ) => {
        const player = userMap.get(playerId);

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
        updatePlayer(playerId);
        callback({ status: 0 });
    };

    const startGame = (
        { uuid }: { uuid: string },
        callback: IoCallback<IoResponse>
    ) => {
        const game = gamesMap.get(uuid);

        if (game) {
            game.setupGame();
            for (const player of game.gameInfo.players) {
                console.log("update cards");
                updateCards(game.gameInfo.uuid, player.uuid);
            }
            callback({ status: 0 });
        } else {
            callback({ status: 1, message: "Game does not exist" });
        }
    };

    socket.on("games:read", emitGameList);
    socket.on("game:create", createGame);
    socket.on("game:join", joinGame);
    socket.on("game:start", startGame);
};
