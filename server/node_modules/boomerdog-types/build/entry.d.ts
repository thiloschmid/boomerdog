import { IoResponse, AuthenticateUserIoResponse, CardClickedResponse, ClientToServerEvents, CreateGameIoResponse, CreateGamePayload, GameIdentifierPayload, InterServerEvents, IoCallback, PerformMovePayload, ReadUserIoResponse, ServerToClientEvents, SocketData, UserIdentifierPayload } from "./socketio";
interface User {
    name: string;
    userId: string;
    avatarUrl: string;
    gameId?: string;
}
declare type Move = {
    nodes: number[];
    collateral?: number;
};
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
    hasFolded: boolean[];
    isFinished: boolean[];
    remainingMoves?: number;
    playerStartingNext: number;
    numberOfCards?: number[];
    playingWith?: number[];
}
export { User, CardMoves, MarbleMoves, CardBase, GameData, GamePhase, GameState, IoResponse, AuthenticateUserIoResponse, CardClickedResponse, ClientToServerEvents, CreateGameIoResponse, CreateGamePayload, GameIdentifierPayload, InterServerEvents, IoCallback, PerformMovePayload, ReadUserIoResponse, ServerToClientEvents, SocketData, UserIdentifierPayload, };
//# sourceMappingURL=entry.d.ts.map