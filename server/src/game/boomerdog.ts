import { blue } from "../api/utils/colors.js";
import Board, { SEVEN_MOVE_OFFSET } from "./board.js";
import Deck from "./deck.js";

import { CardMoves, GamePhase, MarbleMoves } from "boomerdog-types";

const CARD_OPTIONS = [
    [
        0, 1, 2, 3, 4, -4, 5, 6, 71, 72, 73, 74, 75, 76, 77, 8, 9, 10, 11, 12,
        13, 14,
    ], // joker
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
    nPlayers;
    board;
    deck;

    activePlayerIndex: number;

    possibleMoves: CardMoves[];

    gamePhase: GamePhase;
    roundNumber: number;

    // initially true, becomes false after folding or playing all cards
    isPlaying: boolean[];

    // store the distance that was moved with a seven card
    remainderForSevenCard;
    remainingMoves: MarbleMoves[] | null;

    swapCards: number[];

    constructor(nPlayers: number) {
        this.nPlayers = nPlayers;
        this.board = new Board(nPlayers);
        this.deck = new Deck(nPlayers);

        this.possibleMoves = Array.from({ length: 6 }, (e) => [[], [], [], []]);
        this.remainingMoves = null;

        this.activePlayerIndex = 0;
        this.gamePhase = GamePhase.Waiting;
        this.roundNumber = 0;

        this.isPlaying = [true, true, true, true];
        this.swapCards = [-1, -1, -1, -1]; // store the card index

        this.remainderForSevenCard = 7;
    }

    startGame() {}

    setupRound() {
        console.debug(`${blue(`Round ${this.roundNumber} started`)}`);
        // first distribute 6 cards, then 5, ..., down to 2 cards
        this.deck.distributeCards(6 - (this.roundNumber % 5));

        // set new game phase
        this.gamePhase = GamePhase.Swapping;
    }

    setupTurn() {
        console.debug(`${blue(`Player ${this.activePlayerIndex}'s turn`)}`);
        this.possibleMoves = this.computePossibleMoves();
    }

    roundIsFinished() {
        return !this.isPlaying.includes(true);
    }

    gameIsFinished() {
        return false; // the game never finishes lol 🏁
    }

    storeSwapCard(p: number, c: number) {
        console.debug(`${blue(`Player ${p} swaps card ${c}`)}`);
        this.swapCards[p] = c;
    }

    swapIsComplete() {
        return !this.swapCards.includes(-1);
    }

    swap() {
        console.debug(blue(`Swapping cards`));
        for (let p = 0; p < this.nPlayers / 2; p++) {
            // exchange cards between player p and player p + nPlayers/2, i.e.
            // for four plazers 0<=>2, and 1<=>3
            const c = this.swapCards[p];
            const p2 = p + this.nPlayers / 2;
            const c2 = this.swapCards[p2];
            // swap the cards
            [this.deck.hands[p][c], this.deck.hands[p2][c2]] = [
                this.deck.hands[p2][c2],
                this.deck.hands[p][c],
            ];
        }

        this.swapCards = [-1, -1, -1, -1];
        this.gamePhase = GamePhase.Playing;

        this.activePlayerIndex = this.roundNumber % 4;
        this.isPlaying = [true, true, true, true];
    }

    moveToNextPlayer() {
        if (this.remainderForSevenCard !== 7) {
            console.error(
                `Cannot move to next player. The seven card is not completed!`
            );
            return;
        }
        if (this.roundIsFinished()) {
            console.warn(`Cannot move to next player. The round is finished!`);
            return;
        }

        do {
            this.activePlayerIndex = ++this.activePlayerIndex % this.nPlayers;
        } while (!this.isPlaying[this.activePlayerIndex]);
    }

    finalizeTurn() {
        console.debug(
            `${blue(`Player ${this.activePlayerIndex}'s turn ended`)}`
        );
        // check if the player still has cards left
        if (!this.deck.playerHasCards(this.activePlayerIndex)) {
            this.isPlaying[this.activePlayerIndex] = false;
        }
    }

    finalizeRound() {
        this.roundNumber++;
    }

    getPlayerCards(p: number) {
        return this.deck.hands[p];
    }

    getBoardData() {
        return this.board.getBoardData();
    }

    /**
     * If the card is a regular move card (e.g. a '3') the move contains the
     * whole path of length 3 to the target node. For instance moving 3 with
     * a marble at 20 yields [21, 22, 23]
     *
     * If walking forward with a 7, 100 is added, i.e. walking 3 forward with
     * a 7 starting at 20 yields [121, 122, 123]
     *
     * Going out is [-1, player-specific out node]
     *
     * Swapping with a marble on node n is encoded as 200+n, i.e. swapping with
     * a node at n=23 is [223]
     *
     * @returns An array of moves for each combination of cards and marbles.
     *
     */
    computePossibleMoves() {
        return this.deck.hands[this.activePlayerIndex].map((card) => {
            if (card === null) {
                return [[], [], [], []];
            } else if (
                card.value === 7 &&
                !this.board.playerCanCompleteSeven(this.activePlayerIndex)
            ) {
                return [[], [], [], []];
            }

            return this.board.marbleLocations[this.activePlayerIndex].map((n) =>
                CARD_OPTIONS[card.value].flatMap((move) =>
                    this.board.getPossibleDestinations(
                        this.activePlayerIndex,
                        n,
                        move
                    )
                )
            );
        });
    }

    getPossibleMoves() {
        return this.possibleMoves;
    }

    computeRemainingMoves() {
        const remainingCardOptions = CARD_OPTIONS[7].filter(
            (co) => co - 70 <= this.remainderForSevenCard
        );
        this.remainingMoves = this.board.marbleLocations[
            this.activePlayerIndex
        ].map((n) =>
            remainingCardOptions.flatMap((move) =>
                this.board.getPossibleDestinations(
                    this.activePlayerIndex,
                    n,
                    move
                )
            )
        );
    }

    getRemainingMoves() {
        return this.remainingMoves;
    }

    /**
     *
     * @param c - The card
     * @param m - The marble
     * @param mi - The move index
     */
    performMove(c: number, m: number, mi: number) {
        // make sure the card exists
        if (this.deck.hands[this.activePlayerIndex][c] === null) {
            return { status: 1, message: `Card ${c} does not exist.` };
        }
        // if ()

        const moves = this.possibleMoves[c][m];
        console.log(
            `${blue(
                `Player ${this.activePlayerIndex} plays card ${
                    this.deck.hands[this.activePlayerIndex][c]?.value
                } and moves [${moves?.[mi]}]`
            )}`
        );

        this.board.executeMove(this.activePlayerIndex, m, moves[mi]);
        this.deck.cardPlayed(this.activePlayerIndex, c);

        /* if the move comes from a 7️⃣, or a joker 🃏 acting as a 7️⃣ */
        if (moves[mi][0] >= SEVEN_MOVE_OFFSET) {
            console.log(`seven-move`)
            this.remainderForSevenCard -= moves[mi].length;

            if (this.remainderForSevenCard) {
                this.gamePhase = GamePhase.WaitingForSevenMove;
                this.computeRemainingMoves();
                return { status: 0 };
            } else {
                this.gamePhase = GamePhase.Playing;
                this.remainderForSevenCard = 7; // reset to previous value
            }
        }

        // check if the player is finished playing
        if (!this.deck.playerHasCards(this.activePlayerIndex)) {
            this.isPlaying[this.activePlayerIndex] = false;
        }
        return { status: 0 };
    }

    performRemainingMove(m: number, mi: number) {
        if (!this.remainingMoves) {
            return { status: 1, message: "Remaining moves are not defined" };
        }
        const moves = this.remainingMoves[m];
        console.log(
            `${blue(`Player moves ${moves?.[mi]} from a seven card`)}`
        );

        this.board.executeMove(this.activePlayerIndex, m, moves[mi]);

        if (moves[mi].length > this.remainderForSevenCard) {
            console.error("Invalid move, not enough moves left");
            return {
                status: 1,
                message: "Invalid move, not enough moves left",
            };
        }
        this.remainderForSevenCard -= moves[mi].length;

        if (this.remainderForSevenCard) {
            this.gamePhase = GamePhase.WaitingForSevenMove;
            this.computeRemainingMoves();

            return { status: 0 };
        } else {
            this.gamePhase = GamePhase.Playing;
            this.remainderForSevenCard = 7; // reset to previous value
        }

        // check if the player is finished playing
        if (!this.deck.playerHasCards(this.activePlayerIndex)) {
            this.isPlaying[this.activePlayerIndex] = false;
        }
        return { status: 0 };
    }

    fold() {
        if (this.remainderForSevenCard !== 7) {
            return {
                status: 1,
                message: `Cannot fold before completing the seven moves`,
            };
        }
        console.debug(`${blue(`Player ${this.activePlayerIndex} folds`)}`);
        this.deck.fold(this.activePlayerIndex);
        this.isPlaying[this.activePlayerIndex] = false;
        return { status: 0 };
    }
}
