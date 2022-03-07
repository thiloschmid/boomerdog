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

export const Default = Template.bind({});
Default.args = {
    marbleLocations: [
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
    ],
    possibleMoves: [[[[]], [[]], [[]], [[]]]],
    selectedCard: 0,
    stack: [],
    playerIndex: 0,
    moveSelected: (m: number, t: number) => {},
    moveRemaining: (m: number, t: number) => {},
    stepsRemaining: null,
};

export const TwoMoves = Template.bind({});
TwoMoves.args = {
    marbleLocations: [
        [0, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
    ],
    possibleMoves: [
        [
            [
                [1, 2, 3, 4],
                [63, 62, 61, 62],
            ],
        ],
    ],
    playerIndex: 0,
    selectedCard: 0,
    stack: [],
    moveSelected: (m: number, t: number) => {},
    moveRemaining: (m: number, t: number) => {},
    stepsRemaining: null,
};

export const EnterEndzone = Template.bind({});
EnterEndzone.args = {
    marbleLocations: [
        [62, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
    ],
    possibleMoves: [
        [
            [
                [63, 0, 100, 101, 102],
                [63, 0, 1, 2, 3],
            ],
        ],
    ],
    playerIndex: 0,
    selectedCard: 0,
    stack: [],
    moveSelected: (m: number, t: number) => {},
    moveRemaining: (m: number, t: number) => {},
    stepsRemaining: null,
};

export const AllMarbles = Template.bind({});
AllMarbles.args = {
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
                [63, 0, 100, 101],
                [63, 0, 1, 2],
            ],
            [
                // marble 1
                [14, 15, 16, 17],
            ],
            [[3, 4, 5, 6]],
            [[41, 42, 43, 44]],
        ],
    ],
    playerIndex: 0,
    selectedCard: 0,
    stack: [],
    moveSelected: (m: number, t: number) => {},
    moveRemaining: (m: number, t: number) => {},
    stepsRemaining: null,
};

export const Seven = Template.bind({});
Seven.args = {
    marbleLocations: [
        [0, 13, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
        [-1, -1, -1, -1],
    ],
    possibleMoves: [
        // card 0, say a 5
        [
            [
                // marble 0
                [1001, 1002, 1003, 1004, 1005],
                [1001, 1002, 1003, 1004],
                [1001, 1002, 1003],
                [1001, 1002],
                [1001],
            ],
            [
                // marble 1
                [14, 15, 16, 17],
            ],
            [[3, 4, 5, 6]],
            [[41, 42, 43, 44]],
        ],
    ],
    playerIndex: 0,
    selectedCard: 0,
    stack: [],
    moveSelected: (m: number, t: number) => {},
    moveRemaining: (m: number, t: number) => {},
    stepsRemaining: 5,
    remainingMoves: [
        [
            // marble 0
            [1001, 1002, 1003, 1004, 1005],
            [1001, 1002, 1003, 1004],
            [1001, 1002, 1003],
            [1001, 1002],
            [1001],
        ],
        [
            [1014, 1015, 1016, 1017, 1018],
            [1014, 1015, 1016, 1017],
            [1014, 1015, 1016],
            [1014, 1015],
            [1014],
        ],
        [],
        [],
    ],
};
