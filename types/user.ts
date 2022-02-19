export interface UserBase {
    name: string;
    userId: UserId;
}

// interface for users which are connected via socket.io
export interface User extends UserBase {
    gameId?: string;
}

export type SocketId = string;
export type UserId = string;
