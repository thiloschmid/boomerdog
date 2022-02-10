import { jest } from "@jest/globals";
import BoomerDog from "../src/game/boomerdog";

test("check possible moves", () => {
    let game = new BoomerDog(4);
    game.setupGame();

    game.deck.hands[0] = [
        { value: 4, id: 0 },
        { value: 5, id: 0 },
        { value: 0, id: 0 },
        null,
        null,
        null,
    ];

    game.board._goOut(0); // 0🔴
    game.board.setMarble(0, 1, 12); // 12🔴

    /* get all moves => 
    [   
        card 0: 
        [
            marble 0: [move 0, ...], 
            marble 1: [move 0, ...], 
            ...
        ],
        card 1:
        [
            marble 0: [move 0, ...],
            marble 1: [move 0, ...],
            ...
        ],
        ...
    ]
    */
    // print for card 0 and marble 0
    const moves = game.getAllMoves(0);
    if (moves[0]) {
        console.log(moves[0][0]);
        console.log(moves[0][1]);
    }
    if (moves[2]) {
        console.log(moves[2][0]);
    }
});
