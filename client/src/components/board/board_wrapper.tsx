import * as React from "react";
import { CardBase, CardMoves } from "boomerdog-types/entry";
import { IoResponse, MarbleMoves } from "boomerdog-types";

import { BoomerDogSocket } from "../../api/socket-client";
import Board from "./board";

import { GameData, GameState, GamePhase, User } from "boomerdog-types";

const placeHolderMarbleLocations = [
    { p: 0, m: 0, n: 100 },
    { p: 0, m: 1, n: 101 },
    { p: 0, m: 2, n: 102 },
    { p: 0, m: 3, n: 103 },
    { p: 1, m: 0, n: 110 },
    { p: 1, m: 1, n: 111 },
    { p: 1, m: 2, n: 112 },
    { p: 1, m: 3, n: 113 },
    { p: 2, m: 0, n: 120 },
    { p: 2, m: 1, n: 121 },
    { p: 2, m: 2, n: 122 },
    { p: 2, m: 3, n: 123 },
    { p: 3, m: 0, n: 130 },
    { p: 3, m: 1, n: 131 },
    { p: 3, m: 2, n: 132 },
    { p: 3, m: 3, n: 133 },
];
interface BoardWrapperProps {
    gameData: GameData;
    gameState: GameState | null;
    player: User;
    socket?: BoomerDogSocket;
    isActive: boolean;
    playerIndex: number;
    stepsRemaining: number | null; // only relevant for the 7️⃣ card
    selectedCardIndex: number | null;
    cards: (CardBase | null)[];
    deselectCard: () => void;
    stack: CardBase[];
    fold: () => void;
    isSwapping: boolean;
}
const BoardWrapper = ({
    gameData,
    gameState,
    player,
    socket,
    isActive,
    playerIndex,
    selectedCardIndex,
    cards,
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
    const [marbleLocations, setMarbleLocations] = React.useState<
        { p: number; m: number; n: number }[]
    >(placeHolderMarbleLocations);

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
            selectedCardIndex !== null &&
            socket.emit(
                "game:perform_move",
                {
                    userId: player.userId,
                    gameId: gameData.gameId,
                    c: selectedCardIndex,
                    m: m,
                    mi: mi,
                },
                (response: IoResponse) => {
                    console.log(response);

                    if (!response.status) {
                        deselectCard();
                    }
                }
            );
    };

    const moveRemaining = (m: number, mi: number) => {
        socket &&
            socket.emit(
                "game:perform_remaining_move",
                {
                    userId: player.userId,
                    gameId: gameData.gameId,
                    m: m,
                    mi: mi,
                },
                (response: IoResponse) => {
                    console.log(response);
                }
            );
    };

    const swap = () => {
        socket &&
            selectedCardIndex !== null &&
            socket.emit(
                "game:swap_card",
                selectedCardIndex,
                (response: IoResponse) => {
                    {
                        if (response.status) {
                            console.error(response.message);
                        }
                    }
                }
            );
    };

    React.useEffect(() => {
        if (socket) {
            socket.on("board:update", (payload) => {
                console.debug("update board", payload);
                const marbleLocations = payload.flatMap((nodes, p) =>
                    nodes.map((n, m) => ({
                        ...{
                            // ...getCoords(n, p, m),
                            // color: p,
                            n: n,
                            p: p,
                            m: m,
                        },
                    }))
                );
                setMarbleLocations(marbleLocations);
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
    }, [socket]);

    return (
        <Board
            {...{
                gameData,
                gameState,
                marbleLocations,
                possibleMoves,
                selectedCardIndex,
                cards,
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
                swap,
            }}
        />
    );
};

export default BoardWrapper;
