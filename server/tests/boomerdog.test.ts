import { jest } from "@jest/globals";
import BoomerDog from "../src/game/boomerdog";
import BoomerDogClient from "../src/game/boomerdogclient";


test("check possible moves", () => {
    let game = new BoomerDogClient("test", "test-name", 4);
    game.startGame();

    game.deck.hands[0] = [
        { value: 7, cardId: 0 },
        { value: 5, cardId: 0 },
        { value: 0, cardId: 0 },
        null,
        null,
        null,
    ];


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
});
