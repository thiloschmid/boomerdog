import { io, Socket } from "socket.io-client";

import {
    ServerToClientEvents,
    ClientToServerEvents,
} from "../../../types/socketio";

export type BoomerDogSocket = Socket<
    ServerToClientEvents,
    ClientToServerEvents
>;
export const socket: BoomerDogSocket = io("http://localhost:3002");

