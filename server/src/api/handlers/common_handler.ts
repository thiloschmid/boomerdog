import BoomerDogClient from "../../game/boomerdogclient";
import { ServerSocket, SocketIoServer } from "../types";

export const commonHandler = (
    io: SocketIoServer,
    socket: ServerSocket,
    gamesMap: Map<string, BoomerDogClient>
) => {
    const emitGameList = (broadcast?: boolean) => {
        // if no receiver specified, send to all connected clients
        const destination = broadcast ? io : socket;

        const gameList = Array.from(gamesMap.values()).map(
            (value) => value.gameInfo
        );
        destination.emit("games:update", gameList);
    };
    socket.on("games:read", emitGameList);
};
