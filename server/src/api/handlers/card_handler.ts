import { CardBase } from "../../../../types/game";
import { ServerSocket } from "../types.js";

const testHand = [
    { id: 0, value: 9, color: 1 },
    { id: 1, value: 0 },
    { id: 2, value: 2, color: 3 },
    { id: 3, value: 11, color: 2 }
] as CardBase[];

export const registerCardHandler = (socket: ServerSocket) => {
    socket.on("card:clicked", (payload: CardBase) => {
        console.debug(`${payload.value} ${payload.color && payload.color} clicked`);
    });
};
