import { Socket } from "socket.io";
import {
    IoCallback,
    ReadUserIoResponse,
    ServerSocket,
} from "../../../../types/socketio";
import { Player, SocketId, UserId } from "../../../../types/user";

export const registerUserHandler = (
    socket: ServerSocket,
    socketIdToUserId: Map<SocketId, UserId>,
    userMap: Map<UserId, Player>
) => {
    const readUser = (
        payload: undefined,
        callback: IoCallback<ReadUserIoResponse>
    ) => {
        const uuid = socketIdToUserId.get(socket.id);
        const player = uuid ? userMap.get(uuid) : undefined;
        if (player?.uuid) {
            callback({ status: 0, player });
        } else {
            callback({ status: 1, message: "User not found" });
        }
    };

    socket.on("user:read", readUser);
};
