import { Socket, Server } from "socket.io";
import { Player, UserBase } from "./user";
import { CardBase, GameBase } from "./game";

/**
 * 0 : ok
 * 1 : not ok lol
 */
export interface IoResponse {
    status: number;
    message?: string;
}

export interface CreateGameIoResponse extends IoResponse {
    gameId?: string;
}

export interface ReadUserIoResponse extends IoResponse {
    player?: Player;
}

export type IoCallback<T> = (response: T) => void;

export interface CreateGamePayload {
    gameName: string;
    nPlayers: number;
    playerId: string;
}

export interface JoinGamePayload {
    gameId: string;
    playerId: string;
}

export interface BoardUpdatePayload {
    marbles: number[][];
}

export interface ServerToClientEvents {
    "games:update": (payload: GameBase[]) => void;
    "board:update": (payload: BoardUpdatePayload) => void;
    "cards:update": (payload: CardBase[]) => void;

    "player:update": (payload: Player) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
}
export interface ClientToServerEvents {
    "user:read": (
        payload: undefined,
        callback: IoCallback<ReadUserIoResponse>
    ) => void;

    "user:authenticate": (
        payload: { code: string },
        callback: IoCallback<IoResponse>
    ) => void;

    "game:create": (
        payload: CreateGamePayload,
        callback: IoCallback<CreateGameIoResponse>
    ) => void;
    "game:join": (
        payload: JoinGamePayload,
        callback: IoCallback<IoResponse>
    ) => void;
    "games:read": () => void;
    "game:start": (uuid: string, callback: IoCallback<IoResponse>) => void;

    "board:node:clicked": (payload: number) => void;
    "board:marble:clicked": (payload: number) => void;

    "card:clicked": (payload: any) => void;
}
export interface InterServerEvents {
    ping: () => void;
}
export interface SocketData {
    name: string;
    age: number;
}

export type SocketIoServer = Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>;

export type ServerSocket = Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>;
