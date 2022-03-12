import {
    User,
    GameData,
    GamePhase,
    GameState,
    CardMoves,
    MarbleMoves,
    GameEvent,
} from "boomerdog-types";
import { io } from "../api/index.js";
import { blue, green, red, yellow } from "../api/utils/colors.js";
import BoomerDog from "./boomerdog.js";

const CARD_WEIGHTS = [10, 5, 0, 0, 1, 0, 3, 0, 0, 0, 3, 0, 5];

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

    emitGameEvent(event: GameEvent, userId?: string) {
        // e.g. sounds
        io.to(userId || this.gameId).emit("game:event", event);
    }

    handleResponse(response: {
        collateral?: number;
        swap?: boolean;
        enterEndzone?: boolean;
        from?: number;
        to?: number;
        wentOut?: boolean;
    }) {
        if (response.collateral) {
            this.emitGameEvent({ name: "marble:hit" });
        }
        if (response.swap) {
            this.emitGameEvent({ name: "marble:swap" });
        } else if (response.enterEndzone) {
            this.emitGameEvent({ name: "marble:enter_endzone" });
        } else if (response.wentOut) {
            this.emitGameEvent({ name: "player:went_out" });
        } else {
            this.emitGameEvent({
                name: "marble:moved",
                data: { from: response.from, to: response.to },
            });
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
            numberOfCards: this.deck.numberOfCards,
            activePlayerIndex: this.activePlayerIndex,
            activePlayerUserId: activePlayer ? activePlayer.userId : "",
            stack: this.deck.stack,
            hasSwapped: this.swapCards.map((c) => c !== -1),
            hasFolded: this.hasFolded,
            isFinished: this.isFinished,
            playerStartingNext: this.playerStartingNext,
            playingWith: this.playingWith,
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
        if (this.players.includes(user)) {
            return { status: 1, message: "Player is already in the game" };
        }

        user.gameId = this.gameId;
        this.players.push(user);

        return { status: 0 };
    }

    playerQuit(user: User) {
        // if (this.hasStarted) {
        //     return { status: 1, message: "Game has already started" };
        // }
        const index = this.players.indexOf(user);
        if (index === -1) {
            return { status: 1, message: "Player is not in the game" };
        }
        this.players.splice(index);
        delete user.gameId;

        console.log(blue(`${user.name} quit`));
        return { status: 0 };
    }

    startGame() {
        if (this.hasStarted) {
            return { status: 1, message: "Game has already started" };
        }
        super.startGame(); // for now does nothing
        this.hasStarted = true;

        this.emitBoardData();
        this.emitGameData();
        this.startRound();
    }

    /* ⚽ handle gameplay */

    startRound() {
        super.setupRound();
        this.emitCards();

        for (let p = this.players.length; p < this.nPlayers; p++) {
            // swap random card for AI players
            const nCards = this.deck.hands[p].reduce(
                (prev, current) => (current === null ? prev : ++prev),
                0
            );
            const randomCard = Math.floor(Math.random() * nCards);

            super.storeSwapCard(p, randomCard);
        }

        this.emitGameState();
    }

    startTurn() {
        super.setupTurn(); // this sets the possible moves
        const activePlayer = this.getActivePlayer();
        if (activePlayer) {
            this.emitGameEvent({ name: "player:active" }, activePlayer.userId);
            this.emitPossibleMoves();
        } else {
            // AI opponent
            setTimeout(() => {
                this.aiMoves();
            }, 1000);
        }
    }

    endTurn() {
        super.finalizeTurn();

        this.emitBoardData();

        if (super.gameIsFinished()) {
            this.emitGameEvent({
                name: "game:finished",
                data: { victoriousTeam: this.getVictoriousTeam() },
            });
            return;
        }
        if (super.roundIsFinished()) {
            this.endRound();
            return;
        }
        super.moveToNextPlayer();
        this.emitGameState();
        this.startTurn();
    }

    endRound() {
        super.finalizeRound();
        this.startRound();
    }

    /* 🤗 Handle player interaction */

    playerSwaps(user: User, c: number) {
        if (this.gamePhase !== GamePhase.Swapping) {
            return {
                status: 1,
                message: `Wrong game phase ${this.gamePhase}`,
            };
        }
        const index = this.players.indexOf(user);

        if (index === -1) {
            return {
                status: 1,
                message: `Player does not exist`,
            };
        }
        super.storeSwapCard(index, c);

        if (super.swapIsComplete()) {
            super.swap();
            this.emitCards();
            this.startTurn();
        }
        this.emitGameState();

        return { status: 0 };
    }

    playerPerformsMove(userId: string, c: number, m: number, mi: number) {
        const gamePhase = this.gamePhase;
        if (gamePhase !== GamePhase.Playing) {
            return {
                status: 1,
                message: `Wrong game phase ${this.gamePhase}`,
            };
        }
        const activePlayer = this.getActivePlayer();
        if (userId !== activePlayer?.userId) {
            return {
                status: 1,
                message: `${userId} is not the active player`,
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

            // emit appropriate game events
            this.handleResponse(response);

            if (this.gamePhase === GamePhase.WaitingForSevenMove) {
                this.emitBoardData();
                this.emitGameState();
                this.emitRemainingMoves();
            } else {
                // only end the turn when not waiting for the seven moves to
                // complete
                this.endTurn();
            }
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
                message: `Wrong game phase ${this.gamePhase}. Invalid request to complete the seven steps`,
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
            response.collateral && this.emitGameEvent({ name: "marble:hit" });

            this.emitBoardData();
            this.emitGameState();

            if (this.gamePhase === GamePhase.WaitingForSevenMove) {
                this.emitRemainingMoves();
            } else {
                // only end the turn when not waiting for the seven moves to
                // complete
                this.endTurn();
            }
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
        this.emitGameEvent({ name: "player:fold" });

        this.endTurn();

        return { status: 0 };
    }

    orderMoves(allMoves: CardMoves[]) {
        /*
        Returns an 4-tuple for every possible move. 
        [card index, marble index, move index, move weight]
        */
        const movesList = [];
        for (let c = 0; c < allMoves.length; c++) {
            for (let m = 0; m < allMoves[c].length; m++) {
                for (let mi = 0; mi < allMoves[c][m].length; mi++) {
                    const move = allMoves[c][m][mi];
                    if (!move) {
                        break;
                    }
                    movesList.push({
                        card: c,
                        marble: m,
                        move: mi,
                        weight: this.computeMoveWeight(
                            this.activePlayerIndex,
                            move,
                            c
                        ),
                    });
                }
            }
        }

        movesList.sort((first, second) => second.weight - first.weight);

        return movesList;
    }

    orderRemainingMoves(allMoves: MarbleMoves[]) {
        const movesList = [];

        for (let m = 0; m < allMoves.length; m++) {
            for (let mi = 0; mi < allMoves[m].length; mi++) {
                const move = allMoves[m][mi];
                movesList.push({
                    marble: m,
                    move: mi,
                    weight: this.computeMoveWeight(
                        this.activePlayerIndex,
                        move
                    ),
                });
            }
        }

        movesList.sort((first, second) => second.weight - first.weight);

        return movesList;
    }

    aiMoves() {
        console.log(`${green(`Select AI ${this.activePlayerIndex} move`)}`);
        const allMoves = super.getPossibleMoves();
        const movesList = this.orderMoves(allMoves);

        if (!movesList.length) {
            super.fold();

            this.emitGameEvent({ name: "player:fold" });
            this.endTurn();
            return;
        }

        const bestMove = movesList[0];

        const response = super.performMove(
            bestMove.card,
            bestMove.marble,
            bestMove.move
        );

        if (response.status) {
            console.warn(response.message);
        } else {
            this.handleResponse(response);
            this.emitBoardData();
            this.emitGameState();

            const currentGamePhase = this.gamePhase;
            if (currentGamePhase === GamePhase.WaitingForSevenMove) {
                console.log(`waiting for seven?`);
                for (let i = 0; i < 7; i++) {
                    if (this.gamePhase === GamePhase.Playing) {
                        break;
                    }

                    const remainingMoves = super.getRemainingMoves();

                    if (remainingMoves === null) {
                        console.error(red(`No remaining moves found`));
                        return;
                    }
                    const remainingMovesList =
                        this.orderRemainingMoves(remainingMoves);

                    const bestRem = remainingMovesList[0];

                    if (typeof bestRem.marble === "undefined") {
                        console.error(`remaining moves error!`);
                        return;
                    }
                    const response = super.performRemainingMove(
                        bestRem.marble,
                        bestRem.move
                    );

                    if (!response.status) {
                        response.collateral &&
                            this.emitGameEvent({ name: "marble:hit" });
                    }

                    this.emitBoardData();
                    this.emitGameState();
                }
            }
        }

        // only end the turn when not waiting for the seven moves to
        // complete
        this.endTurn();
    }

    computeMoveWeight(
        p: number,
        move: { nodes: number[]; collateral?: number },
        c?: number
    ) {
        let moveWeight = 0;
        if (move.nodes[0] === -1) {
            moveWeight += 0.5;
        }

        // destination of the move
        const nNew = move.nodes[move.nodes.length - 1];
        const toEntry = this.board.getDistanceToEntryNode(p, nNew);

        if (toEntry !== null) {
            moveWeight += 16 * this.nPlayers - toEntry;
        }

        if (move.collateral) {
            // 💣
            moveWeight += 100 * move.collateral;
        }
        if (nNew >= 100) {
            // value entering the endzone higher with the first node yielding
            // the weight 2, and the final node yielding 5
            moveWeight += (nNew % 10) + 1;
        }

        /* subtract card value */
        if (typeof c !== "undefined") {
            const card = this.deck.hands[p][c];
            if (card !== null) {
                moveWeight -= card.value;
            }
        }

        return moveWeight;
    }
}
