import { io, gamesMap } from "../index.js";
import { ServerSocket } from "../types.js";

const testBoard = [
    [-1, -1, -1, -1],
    [-1, -1, -1, -1],
    [-1, -1, -1, -1],
    [-1, -1, -1, -1],
];

export const updateBoard = (gameId: string, socketId?: string) => {
    const game = gamesMap.get(gameId);
    console.log("update_board")
    // if socketId is supplied, send only to socketId, otherwise update all in the gameId room
    game && io.to(socketId || gameId).emit("board:update", game.getBoardData());
};
export const registerBoardHandler = (socket: ServerSocket) => {
    socket.on("board:node:clicked", (payload: number) => {
        console.debug(`node ${payload} clicked`);
    });
    socket.on("board:marble:clicked", (payload: number) => {
        console.debug(`marb ${payload} clicked`);
    });
};
