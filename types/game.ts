import { Player } from "./user";

export interface CardBase {
    id: number; // uniquely identifies card
    value: number; // takes values between 1 and 14
    color?: number; // takes values between 0 and 3
}

export interface GameBase {
    uuid: string;
    gameName: string;
    nPlayers: number; // board size
    players: Player[];
    hasStarted: boolean;
}

export enum GamePhase {
    Swapping,
    Playing,
    Finalizing,
}

export interface GameData extends GameBase {
    hasStarted: boolean;
    order: number[];
}

export interface GameState {
    gamePhase: GamePhase;
    cardsToDistribute: 1 | 2 | 3 | 4 | 5 | 6;
    activePlayerIndex: number;
    stack?: CardBase[];
}
