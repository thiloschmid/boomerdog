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
    nPlayers: 4,
    playerIndex: 0,
    onNodeClick: (n: number) => {},
    onMarbleClick: (m: number) => {},
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
    nPlayers: 4,
    playerIndex: 0,
    selectedCard: 0,
    onNodeClick: (n: number) => {},
    onMarbleClick: (m: number) => {},
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
    nPlayers: 4,
    playerIndex: 0,
    selectedCard: 0,
    onNodeClick: (n: number) => {},
    onMarbleClick: (m: number) => {},
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
    nPlayers: 4,
    playerIndex: 0,
    selectedCard: 0,
    onNodeClick: (n: number) => {},
    onMarbleClick: (m: number) => {},
};
