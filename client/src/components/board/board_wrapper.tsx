import * as React from "react";
import { CardBase, CardMoves } from "boomerdog-types/entry";
import { IoResponse, MarbleMoves } from "boomerdog-types";

import { BoomerDogSocket } from "../../api/socket-client";
import Board from "./board";

const placeHolderMarbleLocations = [
    [100, 101, 102, 103],
    [110, 111, 112, 113],
    [120, 121, 122, 123],
    [130, 131, 132, 133],
];
interface BoardWrapperProps {
    userId: string;
    gameId: string;
    socket?: BoomerDogSocket;
    nPlayers: number;
    isActive: boolean;
    playerIndex: number;
    stepsRemaining: number | null; // only relevant for the 7️⃣ card
    selectedCard: number | null;
    deselectCard: () => void;
    stack: CardBase[];
    fold: () => void;
}
const BoardWrapper = ({
    userId,
    gameId,
    socket,
    nPlayers,
    isActive,
    playerIndex,
    selectedCard,
    deselectCard,
    stack,
    stepsRemaining,
    fold,
}: BoardWrapperProps) => {
    const [possibleMoves, setPossibleMoves] = React.useState<CardMoves[]>([
        [[]],
        [[]],
        [[]],
        [[]],
    ]);
    const [remainingMoves, setRemainingMoves] = React.useState<MarbleMoves[]>([
        [],
        [],
        [],
        [],
    ]);
    const [marbleLocations, setMarbleLocations] = React.useState<number[][]>(
        placeHolderMarbleLocations
    );

    const boardClicked = () => {};

    const onNodeClick = (n: number) => {
        console.log(`node ${n} clicked`);
        // socket && socket.emit("board:node:clicked", n);
    };

    const onMarbleClick = (n: number) => {
        console.log(`node ${n} clicked`);
        // socket && socket.emit("board:marble:clicked", n);
    };

    const moveSelected = (m: number, mi: number) => {
        socket &&
            selectedCard !== null &&
            socket.emit(
                "game:perform_move",
                {
                    userId: userId,
                    gameId: gameId,
                    c: selectedCard,
                    m: m,
                    mi: mi,
                },
                (response: IoResponse) => {
                    console.log(response);

                    if(!response.status) {
                        deselectCard()
                    }
                }
            );
    };

    const moveRemaining = (m: number, mi: number) => {
        socket &&
            socket.emit(
                "game:perform_remaining_move",
                { userId: userId, gameId: gameId, m: m, mi: mi },
                (response: IoResponse) => {
                    console.log(response);
                }
            );
    };

    React.useEffect(() => {
        if (socket) {
            socket.on("board:update", (payload) => {
                console.debug("update board", payload);
                setMarbleLocations(payload);
            });
            socket.on("moves:update", (payload) => {
                console.debug("update moves", payload);
                setPossibleMoves(payload);
            });
            socket.on("remaining_moves:update", (payload) => {
                console.debug("update moves", payload);
                setRemainingMoves(payload);
            });
        }
    }, [socket, gameId]);

    return (
        <Board
            {...{
                marbleLocations,
                possibleMoves,
                selectedCard,
                nPlayers,
                isActive,
                playerIndex,
                onNodeClick,
                onMarbleClick,
                stepsRemaining,
                remainingMoves,
                moveSelected, // move with the selected marble
                moveRemaining, // move rest of the seven steps 7️⃣
                stack,
                fold,
            }}
        />
    );
};

export default BoardWrapper;
