import { GameBase } from "../../../types/game";
import { Player } from "../../../types/user";
import BoomerDog from "./boomerdog";

export default class BoomerDogClient extends BoomerDog {
    gameInfo: GameBase;
    playerIdToIndex;

    constructor(uuid: string, gameName: string, nPlayers: number) {
        super(nPlayers);

        this.gameInfo = {
            uuid: uuid,
            gameName: gameName,
            nPlayers: nPlayers,
            players: new Array<Player>(),
        };

        this.playerIdToIndex = new Map<string, number>();
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
        this.playerIdToIndex.set(player.uuid, this.gameInfo.players.length);
        return "";
    }

    getPlayerCards(playerId: string) {
        const index = this.playerIdToIndex.get(playerId);

        if (typeof index === "number") {
            return this.deck.hands[index];
        }
        return [];
    }
}
