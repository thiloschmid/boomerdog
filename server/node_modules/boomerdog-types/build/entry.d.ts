import { User, UserId } from "./user";
import { IoResponse, AuthenticateUserIoResponse, CardClickedResponse, ClientToServerEvents, CreateGameIoResponse, CreateGamePayload, GameIdentifierPayload, InterServerEvents, IoCallback, PerformMovePayload, ReadUserIoResponse, ServerToClientEvents, SocketData, UserIdentifierPayload } from "./socketio";
declare type Move = number[];
declare type MarbleMoves = Move[];
declare type CardMoves = MarbleMoves[];
interface CardBase {
    cardId: number;
    value: number;
    color?: number;
}
interface GameData {
    gameId: string;
    gameName: string;
    nPlayers: number;
    players: User[];
    hasStarted: boolean;
}
declare enum GamePhase {
    Waiting = 0,
    Swapping = 1,
    Playing = 2,
    WaitingForSevenMove = 3,
    Finalizing = 4
}
interface GameState {
    gamePhase: GamePhase;
    numberOfDistributedCards: number;
    activePlayerUserId: string;
    activePlayerIndex: number;
    stack: CardBase[];
    hasSwapped: boolean[];
    remainingMoves?: number;
}
export { CardMoves, MarbleMoves, CardBase, GameData, GamePhase, GameState, User, IoResponse, AuthenticateUserIoResponse, CardClickedResponse, ClientToServerEvents, CreateGameIoResponse, CreateGamePayload, GameIdentifierPayload, InterServerEvents, IoCallback, PerformMovePayload, ReadUserIoResponse, ServerToClientEvents, SocketData, UserIdentifierPayload, UserId, };
//# sourceMappingURL=entry.d.ts.map