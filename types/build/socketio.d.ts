import { User } from "./user";
import { CardBase, CardMoves, GameData, GameState, MarbleMoves } from "./entry";
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
    player?: User;
}
export declare type IoCallback<T> = (response: T) => void;
export interface UserIdentifierPayload {
    userId: string;
}
export interface GameIdentifierPayload {
    gameId: string;
}
export interface CreateGamePayload extends UserIdentifierPayload {
    gameName: string;
    nPlayers: number;
}
export interface PerformMovePayload extends GameIdentifierPayload, UserIdentifierPayload {
    c: number;
    m: number;
    mi: number;
}
export interface PerformRemainingMovePayload extends GameIdentifierPayload, UserIdentifierPayload {
    m: number;
    mi: number;
}
export interface ServerToClientEvents {
    "games:update": (payload: GameData[]) => void;
    "user:update": (payload: User) => void;
    "gamedata:update": (payload: GameData) => void;
    "gamestate:update": (payload: GameState) => void;
    "board:update": (payload: number[][]) => void;
    "cards:update": (payload: (CardBase | null)[]) => void;
    "moves:update": (payload: CardMoves[]) => void;
    "remaining_moves:update": (payload: MarbleMoves[]) => void;
}
export interface CardClickedResponse extends IoResponse {
    possibleMoves: number[][][];
}
export interface ClientToServerEvents {
    "user:read": (payload: undefined, callback: IoCallback<ReadUserIoResponse>) => void;
    "user:authenticate": (payload: {
        code: string;
    }, callback: IoCallback<AuthenticateUserIoResponse>) => void;
    "game:create": (payload: CreateGamePayload, callback: IoCallback<CreateGameIoResponse>) => void;
    "game:join": (payload: GameIdentifierPayload, callback: IoCallback<IoResponse>) => void;
    "games:read": () => void;
    "game:start": (payload: {
        gameId: string;
    }, callback: IoCallback<IoResponse>) => void;
    "game:reconnect": (payload: GameIdentifierPayload) => void;
    "board:node:clicked": (payload: number) => void;
    "board:marble:clicked": (payload: number) => void;
    "game:perform_move": (payload: PerformMovePayload, callback: IoCallback<IoResponse>) => void;
    "game:perform_remaining_move": (payload: PerformRemainingMovePayload, callback: IoCallback<IoResponse>) => void;
    "game:fold": (payload: GameIdentifierPayload, callback: IoCallback<IoResponse>) => void;
    "card:clicked": (payload: number, callback: IoCallback<CardClickedResponse>) => void;
}
export interface InterServerEvents {
    ping: () => void;
}
export interface SocketData {
    name: string;
    age: number;
}
//# sourceMappingURL=socketio.d.ts.map