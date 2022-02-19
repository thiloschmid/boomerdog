/**
 * See the NOTES.md for a list of cards and the convention to label the moves.
 */

import { CardBase } from "../../../types/game";

const N_JOKERS = 2;
const N_DECKS = 2;

export default class Deck {
    nPlayers: number;
    nCards = (13 * 4 + N_JOKERS) * N_DECKS;
    cards: CardBase[] = Array(this.nCards);
    hands: (CardBase | null)[][];

    currentCardIndex = 0;
    stack: CardBase[] = [];

    /**
     * Populate the cards array and shuffle it.
     */
    constructor(nPlayers: number) {
        this.nPlayers = nPlayers;
        let id = 0;
        for (let d = 0; d < N_DECKS; d++) {
            // iterate over decks
            for (let color = 0; color <= 3; color++) {
                // iterate over colors
                for (let value = 1; value <= 13; value++) {
                    // iterate over possible values
                    this.cards[id] = {
                        cardId: id,
                        color: color,
                        value: value,
                    };
                    id++;
                }
            }
            // add two jokers
            for (let j = 0; j < N_JOKERS; j++) {
                this.cards[id] = { cardId: id, value: 0 };
                id++;
            }
        }

        this.shuffleCards();
        this.hands = Array.from({ length: nPlayers }, (e) =>
            Array(6).fill(null)
        );
    }

    /**
     * Thanks to
     * https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
     */
    shuffleCards() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    distributeCards(n: number) {
        for (let p = 0; p < this.nPlayers; p++) {
            this.hands[p].fill(null);
            for (let i = 0; i < n; i++) {
                // check if the cards have to be shuffled
                if (this.currentCardIndex >= this.nCards) {
                    this.shuffleCards();
                    this.currentCardIndex = 0;
                    this.stack = [];
                }
                this.hands[p][i] = this.cards[this.currentCardIndex];
                this.currentCardIndex++;
            }
        }
    }

    cardPlayed(p: number, c: number) {
        const card = this.hands[p][c];
        if (card === null) {
            console.error(`Card is null`);
        } else {
            this.stack.push(card);
            this.hands[p][c] = null;
        }
    }

    fold(p: number) {
        for (let i = 0; i < this.hands[p].length; i++) {
            const card = this.hands[p][i];
            if (card !== null) {
                this.stack.push(card);
                this.hands[p][i] = null;
            }
        }
    }

    playerHasCards(p: number) {
        for (const card of this.hands[p]) {
            if (card !== null) {
                return true;
            }
        }
        return false;
    }
}
