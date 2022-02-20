import { jest } from "@jest/globals";
import Board from "../src/game/board";

test("Check endzone index", () => {
    let board = new Board(4);

    expect(board.indexToEndzoneIndex(111)).toStrictEqual([1, 1]);
    expect(board.indexToEndzoneIndex(100)).toStrictEqual([0, 0]);
});

test("Check setMarble", () => {
    let board = new Board(4);

    board.setMarble(0, 0, 13); // 🔴-1 => 🔴13 going out
    expect(board.marbleLocations[0]).toStrictEqual([13, -1, -1, -1]);

    board.setMarble(1, 0, 111);
    expect(board.marbleLocations[1]).toStrictEqual([111, -1, -1, -1]);
    expect(board.endzones[1]).toStrictEqual([false, true, false, false]);
});

test("check the intermediate nodes function", () => {
    let board = new Board(4);

    expect(board.getIntermediateNodeIndices(62, 3)).toStrictEqual([
        63, 0, 1, 2, 3,
    ]);
    expect(board.getIntermediateNodeIndices(12, 16)).toStrictEqual([
        13, 14, 15, 16,
    ]);
    expect(board.getIntermediateNodeIndices(2, 62, true)).toStrictEqual([
        1, 0, 63, 62,
    ]);
    expect(board.getIntermediateNodeIndices(8, 4, true)).toStrictEqual([
        7, 6, 5, 4,
    ]);

    // check indices for entering the endzone
    expect(board.getIntermediateNodeIndices(62, 102)).toStrictEqual([
        63, 0, 100, 101, 102,
    ]);

    expect(board.getIntermediateNodeIndices(62, 100)).toStrictEqual([
        63, 0, 100,
    ]);
});

test("check distance to entry node", () => {
    const board = new Board(4);

    expect(board.getDistanceToEntryNode(0, 60)).toBe(4);
    expect(board.getDistanceToEntryNode(0, 101)).toBe(-2);
    expect(board.getDistanceToEntryNode(0, 111)).toBe(null);
    expect(board.getDistanceToEntryNode(1, 112)).toBe(-3);
});

test("Check switcheroo", () => {
    let board = new Board(4);

    board.setMarble(0, 0, 23); // 23🔴
    board.setMarble(1, 0, 20); // 20🔵

    // expect 23🔴
    expect(board.marbleLocations[0][0]).toBe(23);
    expect(board.nodes[23]).toBe(0);
    // expect 20🔵
    expect(board.nodes[20]).toBe(1);
    expect(board.marbleLocations[1][0]).toBe(20);

    // players 0 and 1 should be able to swap their 1st marble
    expect(board.playerCanSwitch(0)).toBe(true);
    expect(board.playerCanSwitch(1)).toBe(true);
    expect(board.playerCanSwitch(2)).toBe(false);
    expect(board.playerCanSwitch(3)).toBe(false);

    expect(board.getSwitchCandidates(0)).toStrictEqual([20]);
    expect(board.getSwitchCandidates(1)).toStrictEqual([23]);

    board.executeMove(0, 0, [320]);
    // expect 20🔴
    expect(board.marbleLocations[0][0]).toBe(20);
    expect(board.nodes[20]).toBe(0);
    // expect 23🔵
    expect(board.nodes[23]).toBe(1);
    expect(board.marbleLocations[1][0]).toBe(23);
});

test("Check possible destinations", () => {
    let board = new Board(4);

    expect(board.getEndzoneDestination(1, 110, 3)).toStrictEqual(113);
    expect(board.getEndzoneDestination(1, 20, 3)).toStrictEqual(null);

    board.setMarble(0, 0, 62); // 62 🔴

    // note the order, the endzone destination comes last

    expect(board.getPossibleDestinations(0, 62, 4)).toStrictEqual([
        [63, 0, 1, 2],
        [63, 0, 100, 101],
    ]);
    expect(board.getPossibleDestinations(0, 62, 5)).toStrictEqual([
        [63, 0, 1, 2, 3],
        [63, 0, 100, 101, 102],
    ]);
    expect(board.getPossibleDestinations(0, 62, 8)).toStrictEqual([
        [63, 0, 1, 2, 3, 4, 5, 6],
    ]);

    board.setMarble(1, 0, 62); // 62 🔵 => should clear 62 🔴
    expect(board.marbleLocations[0][0]).toBe(-1);
    expect(board.getPossibleDestinations(1, 62, 4)).toStrictEqual([
        [63, 0, 1, 2],
    ]);

    board.setMarble(1, 1, 110);
    expect(board.getPossibleDestinations(1, 110, 3)).toStrictEqual([
        [111, 112, 113],
    ]);

    board.setMarble(2, 0, 32);
    expect(board.nodes[32]).toBe(2);
    expect(board.getEndzoneDestination(2, 32, 3)).toBe(122);
    expect(board.getPossibleDestinations(2, 32, 3)).toStrictEqual([
        [33, 34, 35],
        [120, 121, 122],
    ]);

    board.setMarble(0, 2, 60);
    expect(board.nodes[60]).toBe(0);
    expect(board.getPossibleDestinations(0, 60, 5)).toStrictEqual([
        [61, 62, 63, 0, 1],
        [61, 62, 63, 0, 100],
    ]);
});

test("Check if a player can complete the seven card", () => {
    let board = new Board(4);

    // no marbles on the board
    expect(board.playerCanMove(3, 3)).toBe(false);

    board.setMarble(0, 0, 13);
    expect(board.getPossibleDestinations(0, 13, 10)).toStrictEqual([
        [14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    ]);
    expect(board.playerCanMove(0, 10)).toBe(true);
    expect(board.playerCanCompleteSeven(0)).toBe(true);

    board.executeMove(1, 0, [-1, 16]);
    expect(board.nodes[16]).toBe(11);
    expect(board.nodes[13]).toBe(0);
    expect(board.getPossibleDestinations(0, 13, 7)).toStrictEqual([]);
    expect(board.getIntermediateNodeIndices(13, 20)).toStrictEqual([
        14, 15, 16, 17, 18, 19, 20,
    ]);
    expect(board.isReachable(0, [14, 15, 16, 17, 18, 19, 20])).toBe(false);
    expect(board.playerCanMove(0, 7)).toBe(false);
    expect(board.playerCanCompleteSeven(0)).toBe(false);
});

test("Check entering endzone", () => {
    const board = new Board(4);

    // moving three forward should not be possible
    board.setMarble(0, 1, 62);
    console.log(board.getPossibleDestinations(0, 62, 5));
    board.setMarble(0, 0, 102);
    console.log(board.getPossibleDestinations(0, 62, 5));
    board.setMarble(0, 1, 103)
    console.log(board.isReachable(0, [63,0,100, 101, 102, 103]))
});
