export interface UserBase {
    name: string;
    userId: UserId;
}
export interface User extends UserBase {
    gameId?: string;
}
export declare type SocketId = string;
export declare type UserId = string;
//# sourceMappingURL=user.d.ts.map