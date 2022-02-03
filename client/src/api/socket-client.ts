import { io } from "socket.io-client";

const socket = io("http://localhost:3002");

socket.on("connect", () => {
    console.debug("socket connected");
});

socket.on("disconnect", () => {
    console.debug("socket disconnected");
});

export interface ServerToClientEvents { noArg: () => void; basicEmit: (a: number, b: string, c: Buffer) => void; withAck: (d: string, callback: (e: number) => void) => void; }
export interface ClientToServerEvents { hello: () => void; }
export interface InterServerEvents { ping: () => void; }
export interface SocketData { name: string; age: number; }

export default socket;