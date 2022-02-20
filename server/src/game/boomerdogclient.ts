import { GameData, GamePhase, GameState } from "boomerdog-types";
import { User } from "../../../types/user.js";
import { io, userMap } from "../api/index.js";
import { green, yellow } from "../api/utils/colors.js";
import BoomerDog from "./boomerdog.js";

export default class BoomerDogHandler extends BoomerDog {
    gameId: string;
    gameName: string;
    nPlayers: number;
    players: User[];
    hasStarted: boolean;

    constructor(gameId: string, gameName: string, nPlayers: number) {
        super(nPlayers);

        this.gameId = gameId;
        this.gameName = gameName;
        this.nPlayers = nPlayers;
        this.players = new Array<User>();
        this.hasStarted = false;
    }

    /* ☎️ EMITTER METHODS
     * Emit game specific information. The optional argument userId specifies
     * a particular recipient. If it is not specified, all players will
     * receive the data.
     */

    emitGameData(userId?: string) {
        // console.debug(yellow(`Emit game data`))
        io.to(userId || this.gameId).emit(
            "gamedata:update",
            this.getGameData()
        );
    }

    emitGameState(userId?: string) {
        // console.debug(yellow(`Emit game state`))
        io.to(userId || this.gameId).emit(
            "gamestate:update",
            this.getGameState()
        );
    }

    emitBoardData(userId?: string) {
        // console.debug(yellow(`Emit board data`))
        io.to(userId || this.gameId).emit("board:update", super.getBoardData());
    }

    emitPossibleMoves() {
        // this is only well defined after startTurn from the parent class has
        // been called!
        const activePlayer = this.getActivePlayer();
        if (activePlayer && this.possibleMoves) {
            // console.debug(yellow(`Emit possible moves`))
            io.to(activePlayer.userId).emit(
                "moves:update",
                super.getPossibleMoves()
            );
        }
    }

    emitRemainingMoves() {
        // emission if a seven is played and the seven moves are not completed
        const activePlayer = this.getActivePlayer();
        if (activePlayer) {
            const remainingMoves = super.getRemainingMoves();
            remainingMoves &&
                io
                    .to(activePlayer.userId)
                    .emit("remaining_moves:update", remainingMoves);
        }
    }

    emitCards(userId?: string) {
        for (let p = 0; p < this.players.length; p++) {
            // send always if userId is not defined
            // if userId is defined, only send to that particular userId
            (!userId || userId === this.players[p].userId) &&
                io
                    .to(this.players[p].userId)
                    .emit("cards:update", super.getPlayerCards(p));
        }
    }

    /* 💦 get data */

    getGameData(): GameData {
        return {
            gameId: this.gameId,
            gameName: this.gameName,
            nPlayers: this.nPlayers,
            players: this.players,
            hasStarted: this.hasStarted,
        };
    }

    getGameState(): GameState {
        const activePlayer = this.getActivePlayer();

        const gameState: GameState = {
            gamePhase: this.gamePhase,
            numberOfDistributedCards: 6 - (this.roundNumber % 5),
            activePlayerUserId: activePlayer ? activePlayer.userId : "",
            stack: this.deck.stack,
        };

        if (this.gamePhase === GamePhase.WaitingForSevenMove) {
            gameState.remainingMoves = this.remainderForSevenCard;
        }

        return gameState;
    }

    getActivePlayer() {
        if (this.activePlayerIndex < this.players.length) {
            return this.players[this.activePlayerIndex];
        }
        // AI player
        return null;
    }

    /* 👋 Handle player joining etc. */

    playerJoin(user: User) {
        // check if the game is full
        if (this.players.length >= this.nPlayers) {
            return { status: 1, message: "The game is full" };
        }

        // check if the player is already in the game
        if (this.players.map((player) => player.userId).includes(user.userId)) {
            return { status: 1, message: "Player is already in the game" };
        }

        user.gameId = this.gameId;
        this.players.push(user);

        return { status: 0 };
    }

    playerQuit(user: User) {}

    startGame() {
        if (this.hasStarted) {
            return { status: 1, message: "Game has already started" };
        }
        super.startGame();
        this.hasStarted = true;

        this.emitBoardData();
        this.emitGameData();
        this.emitGameState();
        this.startRound();
    }

    /* ⚽ handle gameplay */

    startRound() {
        super.setupRound();

        this.emitCards();
        this.startTurn();
    }

    startTurn() {
        super.setupTurn(); // this sets the possible moves
        const activePlayer = this.getActivePlayer();
        if (activePlayer) {
            this.emitPossibleMoves();
            console.log(`${green(`${activePlayer.name}'s turn`)}`);
        } else {
            // AI opponent
            console.log(`${green(`AI ${this.activePlayerIndex} folding`)}`);
            super.fold();
            this.endTurn();
        }
    }

    endTurn() {
        super.finalizeTurn();

        if (super.gameIsFinished()) {
            // never happens
        }
        if (super.roundIsFinished()) {
            this.endRound();
            return;
        }
        super.moveToNextPlayer();
        this.startTurn();
    }

    endRound() {
        super.finalizeRound();
        this.startRound();
    }

    playerPerformsMove(userId: string, c: number, m: number, mi: number) {
        const activePlayer = this.getActivePlayer();
        if (userId !== activePlayer?.userId) {
            return {
                status: 1,
                message: `It is not player ${activePlayer?.name}'s turn`,
            };
        }
        if (this.deck.hands[this.activePlayerIndex][c] === null) {
            return {
                status: 1,
                message: `Card does not exist`,
            };
        }
        if (!this.possibleMoves[c][m][mi]) {
            return {
                status: 1,
                message: `Move is empty`,
            };
        }

        const response = super.performMove(c, m, mi);

        if (!response.status) {
            this.emitCards(activePlayer.userId);
            this.emitBoardData();
            this.emitGameState();

            if (this.gamePhase === GamePhase.WaitingForSevenMove) {
                this.emitRemainingMoves();
            } else {
                // only end the turn when not waiting for the seven moves to
                // complete
                this.endTurn();
            }
        } else if (response.status === 7) {
            this.emitCards(activePlayer.userId);
            this.emitBoardData();
            this.emitGameState();
            this.emitPossibleMoves();
        }

        return response;
    }

    playerPerformsRemainingMove(userId: string, m: number, mi: number) {
        const activePlayer = this.getActivePlayer();
        if (userId !== activePlayer?.userId) {
            return {
                status: 1,
                message: `It is not player ${activePlayer?.name}'s turn`,
            };
        }
        if (this.gamePhase !== GamePhase.WaitingForSevenMove) {
            return {
                status: 1,
                message: `Wrong call. Invalid request to complete the seven steps`,
            };
        }
        if (!this.remainingMoves || !this.remainingMoves[m][mi]) {
            return {
                status: 1,
                message: `Move is empty or undefined`,
            };
        }

        const response = super.performRemainingMove(m, mi);

        if (!response.status) {
            this.emitCards(activePlayer.userId);
            this.emitBoardData();
            this.emitGameState();

            if (this.gamePhase === GamePhase.WaitingForSevenMove) {
                this.emitRemainingMoves();
            } else {
                // only end the turn when not waiting for the seven moves to
                // complete
                this.endTurn();
            }
        } else if (response.status === 7) {
            this.emitCards(activePlayer.userId);
            this.emitBoardData();
            this.emitGameState();
            this.emitPossibleMoves();
        }

        return response;
    }

    playerFolds(userId: string) {
        const activePlayer = this.getActivePlayer();
        if (userId !== activePlayer?.userId) {
            return {
                status: 1,
                message: `It is not player ${userId}'s turn`,
            };
        }
        super.fold();

        this.emitCards(activePlayer.userId);
        this.emitBoardData();
        this.emitGameState();

        this.endTurn();

        return { status: 0 };
    }
}
