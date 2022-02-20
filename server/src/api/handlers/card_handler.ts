import { CardBase } from "boomerdog-types";
import { ServerSocket } from "../types.js";

const testHand = [
    { cardId: 0, value: 9, color: 1 },
    { cardId: 1, value: 0 },
    { cardId: 2, value: 2, color: 3 },
    { cardId: 3, value: 11, color: 2 },
] as CardBase[];

export const registerCardHandler = (socket: ServerSocket) => {
    socket.on("card:clicked", (payload: number) => {
        console.log(`${payload} clicked`);
    });
};
