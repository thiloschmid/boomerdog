import { CardBase } from "../../../types/game";
import Board, { MoveValidation } from "./board";
import Deck from "./deck";

const POSSIBLE_MOVES = [
    [0, 1, 2, 3, 4, -4, 5, 6, 71, 72, 73, 74, 75, 76, 77, 8, 9, 10, 11, 12, 13, 14], // joker
    [0, 1, 11], // ace
    [2],
    [3],
    [4, -4],
    [5],
    [6],
    [71, 72, 73, 74, 75, 76, 77],
    [8],
    [9],
    [10],
    [14], // jack, 14 = swap
    [12], // queen
    [0, 13], // king
];

export default class BoomerDog {
    board;
    deck;

    constructor(nPlayers: number) {
        this.board = new Board(nPlayers);
        this.deck = new Deck(nPlayers);
    }

    setupGame() {
        this.deck.distributeCards(6);
    }

    getPlayerCards(p: number) {
        return this.deck.hands[p];
    }

    getBoardData() {
        return this.board.getBoardData();
    }

    getAllMoves(p: number) {
        return this.deck.hands[p].map((card) =>
            card
                ? this.board.marbleLocations[p].map((n) =>
                      POSSIBLE_MOVES[card.value].flatMap((move) =>
                          this.board.getPossibleDestinations(p, n, move)
                      )
                  )
                : null
        );
    }

    performMove(
        p: number,
        m: number,
        card: CardBase,
        move: number,
        nTarget: number | undefined,
        mTarget: number | undefined,
        enterEndzone: boolean | undefined
    ) {
        if (!POSSIBLE_MOVES[card.value].includes(move)) {
            throw new Error("Card does not allow the specified move");
        }

        let validation: MoveValidation;
        switch (move) {
            // first handle regular moves
            case 1:
            case 2:
            case 3:
            case 4:
            case -4:
            case 5:
            case 6:
            case 8:
            case 9:
            case 10:
            case 11:
            case 12:
            case 13:
                validation = this.board.validateMove(p, m, move, enterEndzone);
                break;

            // handle going out
            case 0:
                validation = this.board.validateOut(p);
                break;

            // handle switcheroos
            case 14:
                if (!nTarget || !mTarget) {
                    throw new Error("A second node needs to be specified");
                }
                validation = this.board.validateSwitch(p, m, nTarget, mTarget);
                break;

            case 71:
            case 72:
            case 73:
            case 74:
            case 75:
            case 76:
            case 77:
                // TODO: check if the 7 moves can be completed
                validation = this.board.validateMove(p, m, move);
                break;
            default:
                validation = [false, "Invalid move"];
        }
        if (validation[0]) {
            // callback to execute the move
            validation[1]();
        } else {
            throw new Error(validation[1]);
        }
    }
}
