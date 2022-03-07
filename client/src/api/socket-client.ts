import { io, Socket } from "socket.io-client";

import { ServerToClientEvents, ClientToServerEvents } from "boomerdog-types";

export type BoomerDogSocket = Socket<
    ServerToClientEvents,
    ClientToServerEvents
>;

export const getAuthenticatedSocket = (token: string) => {
    const backend =
        process.env.REACT_APP_BACKEND_URL || "http://localhost:3002";
    const socket: BoomerDogSocket = io(backend, {
        auth: { token: `${token}` },
    });
    return socket;
};
