import { Player } from "./user";
import { CardBase, GameBase, GameData, GameState } from "./game";

/**
 * 0 : ok
 * 1 : not ok lol
 */
export interface IoResponse {
    status: number;
    message?: string;
}

export interface AuthenticateUserIoResponse extends IoResponse {
    token?: string;
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
    userId: string;
}

export interface JoinGamePayload {
    gameId: string;
    userId: string;
}

export interface ServerToClientEvents {
    // for the game browser
    "games:update": (payload: GameBase[]) => void;
    "user:update": (payload: Player) => void;

    // events relevant once in a game
    "gamedata:update": (payload: GameData) => void;
    "gamestate:update": (payload: GameState) => void;
    "board:update": (payload: number[][]) => void;
    "cards:update": (payload: (CardBase | null)[]) => void;
}

interface CardClickedResponse extends IoResponse {
    possibleMoves: number[][][];
}

export interface ClientToServerEvents {
    "user:read": (
        payload: undefined,
        callback: IoCallback<ReadUserIoResponse>
    ) => void;

    "user:authenticate": (
        payload: { code: string },
        callback: IoCallback<AuthenticateUserIoResponse>
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
    "game:start": (
        payload: { gameId: string },
        callback: IoCallback<IoResponse>
    ) => void;

    "board:node:clicked": (payload: number) => void;
    "board:marble:clicked": (payload: number) => void;

    "card:clicked": (
        payload: number,
        callback: IoCallback<CardClickedResponse>
    ) => void;
}
export interface InterServerEvents {
    ping: () => void;
}
export interface SocketData {
    name: string;
    age: number;
}
