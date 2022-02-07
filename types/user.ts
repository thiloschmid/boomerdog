export interface UserBase {
    name: string;
    uuid: UserId;
}

// interface to be used on the frontend
export interface Player extends UserBase {
    gameId?: string | null;
}

// interface for users which are connected via socket.io
export interface User extends Player {
    socketId: string;
}

export type SocketId = string;
export type UserId = string;

