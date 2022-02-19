import { IoCallback, ReadUserIoResponse } from "../../../../types/socketio.js";
import { ServerSocket } from "../types.js";

import { socketIdToUserId, userMap } from "../index.js";

export const registerUserHandler = (socket: ServerSocket) => {
    const readUser = (
        payload: undefined,
        callback: IoCallback<ReadUserIoResponse>
    ) => {
        const userId = socketIdToUserId.get(socket.id);
        const player = userId ? userMap.get(userId) : undefined;
        if (player?.userId) {
            callback({ status: 0, player });
        } else {
            callback({ status: 1, message: "User not found" });
        }
    };
};
