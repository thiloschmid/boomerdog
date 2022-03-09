import {
    IoResponse,
    AuthenticateUserIoResponse,
    CardClickedResponse,
    ClientToServerEvents,
    CreateGameIoResponse,
    CreateGamePayload,
    GameIdentifierPayload,
    InterServerEvents,
    IoCallback,
    PerformMovePayload,
    ReadUserIoResponse,
    ServerToClientEvents,
    SocketData,
    UserIdentifierPayload,
} from "./socketio";

interface User {
    name: string;
    userId: string;
    avatarUrl: string;
    gameId?: string;
}

type Move = { nodes: number[]; collateral?: number };
type MarbleMoves = Move[];
type CardMoves = MarbleMoves[];

interface CardBase {
    cardId: number; // uniquely identifies card
    value: number; // takes values between 1 and 14
    color?: number; // takes values between 0 and 3
}

interface GameData {
    gameId: string;
    gameName: string;
    nPlayers: number; // board size
    players: User[];
    hasStarted: boolean;
}

enum GamePhase {
    Waiting,
    Swapping,
    Playing,
    WaitingForSevenMove,
    Finalizing,
}

interface GameState {
    gamePhase: GamePhase;
    numberOfDistributedCards: number;
    activePlayerUserId: string;
    activePlayerIndex: number;
    stack: CardBase[];
    hasSwapped: boolean[];
    hasFolded: boolean[];
    remainingMoves?: number;
}

export {
    User,
    CardMoves,
    MarbleMoves,
    CardBase,
    GameData,
    GamePhase,
    GameState,
    IoResponse,
    AuthenticateUserIoResponse,
    CardClickedResponse,
    ClientToServerEvents,
    CreateGameIoResponse,
    CreateGamePayload,
    GameIdentifierPayload,
    InterServerEvents,
    IoCallback,
    PerformMovePayload,
    ReadUserIoResponse,
    ServerToClientEvents,
    SocketData,
    UserIdentifierPayload,
};
