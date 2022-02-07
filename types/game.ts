import { Player } from "./user";

export interface CardBase {
    id: number; // uniquely identifies card
    value: number; // takes values between 1 and 14
    color?: number; // takes values between 0 and 3
}

export interface GameBase {
    uuid: string;
    gameName: string;
    nPlayers: number;
    players: Player[];
}

export interface GameState {}
