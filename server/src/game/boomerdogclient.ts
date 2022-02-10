import { GameBase } from "../../../types/game.js";
import { Player } from "../../../types/user.js";
import BoomerDog from "./boomerdog.js";

export default class BoomerDogClient extends BoomerDog {
    gameInfo: GameBase;
    userIdToIndex;
    order;
    constructor(uuid: string, gameName: string, nPlayers: number) {
        super(nPlayers);

        this.gameInfo = {
            uuid: uuid,
            gameName: gameName,
            nPlayers: nPlayers,
            players: new Array<Player>(),
            hasStarted: false,
        };

        this.order = [...Array(nPlayers).keys()]; // defaults to [0, 1, ... , nPlayers-1]
        this.userIdToIndex = new Map<string, number>();
    }

    /**
     *
     * @param userId The user id
     * @returns The index with respect to the underlying BoomerDog instance.
     */
    getPlayerIndex(userId: string) {
        const index = this.userIdToIndex.get(userId);
        if (typeof index === "undefined") return null;
        return this.order[index];
    }

    playerJoin(player: Player) {
        // check if the game is full
        if (this.gameInfo.players.length >= this.gameInfo.nPlayers) {
            return "The game is full";
        }

        // check if the player is already in the game
        if (
            this.gameInfo.players
                .map((player) => player.uuid)
                .includes(player.uuid)
        ) {
            return "Player is already in the game";
        }

        this.gameInfo.players.push(player);
        this.userIdToIndex.set(player.uuid, this.gameInfo.players.length);
        return "";
    }

    getPlayerCardsByUserId(userId: string) {
        const index = this.getPlayerIndex(userId);

        if (index === null) {
            return [];
        }
        return super.getPlayerCards(index);
    }

    getGameData() {
        return { ...this.gameInfo, order: this.order };
    }

    setupGame() {
        super.setupGame();
        this.gameInfo.hasStarted = true;
    }
}
