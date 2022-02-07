import { ServerSocket } from "../../../../types/socketio";

export const registerBoardHandler = (socket: ServerSocket) => {
    socket.on("board:node:clicked", (payload: number) => {
        console.debug(`node ${payload} clicked`);
    });
    socket.on("board:marble:clicked", (payload: number) => {
        console.debug(`marb ${payload} clicked`);
    });
};
