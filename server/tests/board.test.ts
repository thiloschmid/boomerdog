import {jest} from "@jest/globals";

import Board from "../src/game/board";



test("check the intermediate nodes function", () => {
    let board = new Board(4);

    expect(board.getIntermediateNodeIndices(62, 3)).toStrictEqual([63, 0, 1, 2, 3]);
    expect(board.getIntermediateNodeIndices(12, 16)).toStrictEqual([13, 14, 15, 16]);
    expect(board.getIntermediateNodeIndices(2, 62, true)).toStrictEqual([1, 0, 63, 62]);
    expect(board.getIntermediateNodeIndices(8, 4, true)).toStrictEqual([7, 6, 5, 4]);

    // check indices for entering the endzone
    expect(board.getIntermediateNodeIndices(62, 102)).toStrictEqual([63, 0, 100, 101, 102])
})

test("check moves", () => {
    let board = Board.fromObject({
        nPlayers: 4,
        nodes: Array(64).fill(4),
        playerInfo: Array(4).fill(
            {
                endzone: [0, 0, 0, 0],
                marbles: new Set(),
                base: 4
            }
        )
    })

    let nodesBetween;

    // 1. let player 0 have his marble on position 13 and try to move it 6 forward
    board.setMarble(0, 13);

    nodesBetween = board.getIntermediateNodeIndices(13, 19);
    expect(board.validateMove(0, 13, 6)[0]).toBe(true);

    // 2. now set a blocking marble by player 1 to position 16
    board._goOut(1);
    expect(board.nodes[16]).toBe(11)
    expect(board.getIntermediateNodeIndices(13, 19)).toStrictEqual([14, 15, 16, 17, 18, 19])
    expect(board.getIntermediateNodeIndices(13, 19).map(n => board.nodes[n])).toStrictEqual([4, 4, 11, 4, 4, 4])
    expect(board.validateMove(0, 13, 6)[0]).toBe(false);

    // 3.   Now try to enter the 🏁 endzone from position 62 to the third spot, 
    //      i.e. by playing a 5️⃣ to pass over nodes 63, 0, 100, 101, 102.
    board.setMarble(0, 62)
    expect(board.validateMove(0, 62, 5, true)[0]).toBe(true)
    // expect(board.playerInfo[0].endzone).toStrictEqual([false, false, true, false])

    // 4.   Now there is already a marble at 101
    board.playerInfo[0].endzone[1] = true;
    expect(board.getIntermediateNodeIndices(62, 102)).toStrictEqual([63, 0, 100, 101, 102])
    expect(board.validateMove(0, 62, 5, true)[0]).toBe(false)
})

test("Check switcheroo", () => {
    let board = Board.fromObject({
        nPlayers: 4,
        nodes: Array(64).fill(4),
        playerInfo: Array(4).fill(
            {
                endzone: [0, 0, 0, 0],
                marbles: new Set(),
                base: 4
            }
        )
    })

    board.setMarble(0, 12)
    board.setMarble(0, 23)
    board.setMarble(1, 20)

    // should be able to swap the first and third marble but not the first and
    // the second

    let validation = board.validateSwitch(0, 12, 23)
    expect(validation[0]).toBe(false)

    validation = board.validateSwitch(0, 12, 20)
    expect(validation[0]).toBe(true)

    validation[0] && validation[1]()
    expect(board.nodes[12]).toBe(1)
    expect(board.nodes[20]).toBe(0)

    // player three should not be able to switch these marbles
    validation = board.validateSwitch(3, 12, 23)
    expect(validation[0]).toBe(false)
})

test("Check possible destinations", () => {
    let board = Board.fromObject({
        nPlayers: 4,
        nodes: Array(64).fill(4),
        playerInfo: Array(4).fill(
            {
                endzone: [0, 0, 0, 0],
                marbles: new Set(),
                base: 4
            }
        )
    })

    board.setMarble(0, 62)
    // note the order, the endzone destination comes last
    expect(board.getPossibleDestinations(0, 62, 4)).toStrictEqual([2, 101])
    expect(board.getPossibleDestinations(0, 62, 5)).toStrictEqual([3, 102])
    expect(board.getPossibleDestinations(0, 62, 8)).toStrictEqual([6])

    board.setMarble(1, 62)
    expect(board.getPossibleDestinations(1, 62, 4)).toStrictEqual([2])

    board.setMarble(1, 110)
    expect(board.getEndzoneDestination(1, 110, 3)).toStrictEqual(113)
    expect(board.getPossibleDestinations(1, 110, 3)).toStrictEqual([113])

    board.setMarble(2, 32);
    expect(board.nodes[32]).toBe(2);
    expect(board.getPossibleDestinations(2, 32, 3)).toStrictEqual([35, 122])
    board._goOut(2) // marble at 32, cannot enter house
    expect(board.getPossibleDestinations(2, 32, 3)).toStrictEqual([35])
})

test("Check if a player can switch", () => {
    let board = Board.fromObject({
        nPlayers: 4,
        nodes: Array(64).fill(4),
        playerInfo: Array(4).fill(
            {
                endzone: [0, 0, 0, 0],
                marbles: new Set(),
                base: 4
            }
        )
    })

    board.setMarble(0, 12)
    board._goOut(1)

    expect(board.playerCanSwitch(0)).toBe(false)
    expect(board.playerCanSwitch(1)).toBe(false)

    board.setMarble(2, 28)
    expect(board.playerCanSwitch(0)).toBe(true)
    expect(board.playerCanSwitch(1)).toBe(false)
})

test("Check if a player can complete the seven card", () => {
    let myboard = new Board(4);

    // no marbles on the myboard
    expect(myboard.playerCanMove(3, 3)).toBe(false);

    myboard.setMarble(0, 13)
    expect(myboard.playerCanCompleteSeven(0)).toBe(true)
    myboard._goOut(1)
    expect(myboard.nodes[16]).toBe(11)
    expect(myboard.nodes[13]).toBe(0)
    expect(myboard.getPossibleDestinations(0, 13, 7)).toStrictEqual([])
    expect(myboard.getIntermediateNodeIndices(13, 20)).toStrictEqual([14, 15, 16, 17, 18, 19, 20])
    expect(myboard.isReachable(0, [14, 15, 16, 17, 18, 19, 20])).toBe(false);
    expect(myboard.playerCanMove(0, 7)).toBe(false)
    expect(myboard.playerCanCompleteSeven(0)).toBe(false)
})