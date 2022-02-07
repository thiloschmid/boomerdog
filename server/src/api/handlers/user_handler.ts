import fetch from "node-fetch";
import {
    IoCallback,
    IoResponse,
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

    const authenticateUser = (
        payload: { code: string },
        callback: IoCallback<IoResponse>
    ) => {
        const proxy_url = "http://localhost:9999/authenticate";

        fetch(`${proxy_url}/${payload.code}`)
            .then((response) => response.json())
            .then((data) => {
                console.log((data as {token: string}).token);
            })
            .catch((error) => {
                console.error("Failed to fetch OAuth token");
            });
    };

    socket.on("user:read", readUser);
    socket.on("user:authenticate", authenticateUser);
};
