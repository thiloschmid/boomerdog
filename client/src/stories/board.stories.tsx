import * as React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import Board, { BoardProps } from "../components/board/board";

export default {
    component: Board,
    title: "Board",
};

const Template: ComponentStory<typeof Board> = (args: BoardProps) => (
    <Board {...args} />
);

const testSevenMove = [
    // card 0, say a 5
    [
        [
            // marble 0
            { nodes: [1001, 1002, 1003, 1004, 1005], collateral: 0 },
            { nodes: [1001, 1002, 1003, 1004], collateral: 0 },
            { nodes: [1001, 1002, 1003], collateral: 0 },
            { nodes: [1001, 1002], collateral: 0 },
            { nodes: [1001], collateral: 0 },
        ],
        [
            // marble 1
            { nodes: [14, 15, 16, 17], collateral: 0 },
        ],
        [{ nodes: [3, 4, 5, 6], collateral: 0 }],
        [{ nodes: [41, 42, 43, 44], collateral: 0 }],
    ],
];
const testRemainingMove = [
    [
        // marble 0
        { nodes: [1001, 1002, 1003, 1004, 1005], collateral: 0 },
        { nodes: [1001, 1002, 1003, 1004], collateral: 0 },
        { nodes: [1001, 1002, 1003], collateral: 0 },
        { nodes: [1001, 1002], collateral: 0 },
        { nodes: [1001], collateral: 0 },
    ],
    [
        { nodes: [1014, 1015, 1016, 1017, 1018], collateral: 0 },
        { nodes: [1014, 1015, 1016, 1017], collateral: 0 },
        { nodes: [1014, 1015, 1016], collateral: 0 },
        { nodes: [1014, 1015], collateral: 0 },
        { nodes: [1014], collateral: 0 },
    ],
    [],
    [],
];

export const Default = Template.bind({});
Default.args = {
    gameData: {
        gameId: "0",
        gameName: "test",
        hasStarted: true,
        nPlayers: 4,
        players: [],
    },
    gameState: {
        gamePhase: 2,
        activePlayerIndex: 3,
        activePlayerUserId: "lel",
        hasSwapped: [false, false, false, false],
        hasFolded: [false, false, true, true],
        numberOfDistributedCards: 6,
        stack: [],
        playerStartingNext: 2,
    },
    cards: [],
    marbleLocations: [
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
    ],
    possibleMoves: [
        [
            [{ nodes: [], collateral: 0 }],
            [{ nodes: [], collateral: 0 }],
            [{ nodes: [], collateral: 0 }],
            [{ nodes: [], collateral: 0 }],
        ],
    ],
    selectedCardIndex: 0,
    stack: [],
    playerIndex: 0,
    moveSelected: (m: number, t: number) => {},
    moveRemaining: (m: number, t: number) => {},
    stepsRemaining: null,
};

export const TwoMoves = Template.bind({});
TwoMoves.args = {
    gameData: {
        gameId: "0",
        gameName: "test",
        hasStarted: true,
        nPlayers: 4,
        players: [],
    },
    cards: [],
    marbleLocations: [
        [0, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
    ],
    possibleMoves: [
        [
            [
                { nodes: [1, 2, 3, 4], collateral: 0 },
                { nodes: [63, 62, 61, 62], collateral: 0 },
            ],
        ],
    ],
    playerIndex: 0,
    selectedCardIndex: 0,
    stack: [],
    moveSelected: (m: number, t: number) => {},
    moveRemaining: (m: number, t: number) => {},
    stepsRemaining: null,
};

export const EnterEndzone = Template.bind({});
EnterEndzone.args = {
    gameData: {
        gameId: "0",
        gameName: "test",
        hasStarted: true,
        nPlayers: 4,
        players: [],
    },
    cards: [],
    marbleLocations: [
        [62, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
    ],
    possibleMoves: [
        [
            [
                { nodes: [63, 0, 100, 101, 102], collateral: 0 },
                { nodes: [63, 0, 1, 2, 3], collateral: 0 },
            ],
        ],
    ],
    playerIndex: 0,
    selectedCardIndex: 0,
    stack: [],
    moveSelected: (m: number, t: number) => {},
    moveRemaining: (m: number, t: number) => {},
    stepsRemaining: null,
};

export const AllMarbles = Template.bind({});
AllMarbles.args = {
    gameData: {
        gameId: "0",
        gameName: "test",
        hasStarted: true,
        nPlayers: 4,
        players: [],
    },
    cards: [],
    marbleLocations: [
        [62, 13, 2, 40],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
    ],
    possibleMoves: [
        // card 0, say a 5
        [
            [
                // marble 0
                { nodes: [63, 0, 100, 101], collateral: 0 },
                { nodes: [63, 0, 1, 2], collateral: 0 },
            ],
            [
                // marble 1
                { nodes: [14, 15, 16, 17], collateral: 0 },
            ],
            [{ nodes: [3, 4, 5, 6], collateral: 0 }],
            [{ nodes: [41, 42, 43, 44], collateral: 0 }],
        ],
    ],
    playerIndex: 0,
    selectedCardIndex: 0,
    stack: [],
    moveSelected: (m: number, t: number) => {},
    moveRemaining: (m: number, t: number) => {},
    stepsRemaining: null,
};

export const Seven = Template.bind({});
Seven.args = {
    gameData: {
        gameId: "0",
        gameName: "test",
        hasStarted: true,
        nPlayers: 4,
        players: [],
    },
    cards: [],
    marbleLocations: [
        [0, 13, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
    ],
    possibleMoves: testSevenMove,
    playerIndex: 0,
    selectedCardIndex: 0,
    stack: [],
    moveSelected: (m: number, t: number) => {},
    moveRemaining: (m: number, t: number) => {},
    stepsRemaining: 5,
    remainingMoves: testRemainingMove,
};

export const Swapping = Template.bind({});
Swapping.args = {
    gameData: {
        gameId: "0",
        gameName: "test",
        hasStarted: true,
        nPlayers: 4,
        players: [],
    },
    gameState: {
        gamePhase: 1,
        activePlayerIndex: 3,
        activePlayerUserId: "lel",
        hasSwapped: [false, true, false, false],
        hasFolded: [false, false, false, false],
        numberOfDistributedCards: 6,
        stack: [],
        playerStartingNext: 2
    },
    cards: [],
    marbleLocations: [
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
    ],
    possibleMoves: [
        [
            [{ nodes: [], collateral: 0 }],
            [{ nodes: [], collateral: 0 }],
            [{ nodes: [], collateral: 0 }],
            [{ nodes: [], collateral: 0 }],
        ],
    ],
    selectedCardIndex: 0,
    stack: [],
    playerIndex: 0,
    moveSelected: (m: number, t: number) => {},
    moveRemaining: (m: number, t: number) => {},
    stepsRemaining: null,
};
