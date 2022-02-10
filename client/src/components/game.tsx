import * as React from "react";
import { Box, Button, Heading } from "@chakra-ui/react";
import { Player } from "../../../types/user";
import Console from "./console";
import GameBrowser from "./game_browser";
import Board from "./board/board";
import Cards from "./cards/cards";
import { BoomerDogSocket, getAuthenticatedSocket } from "../api/socket-client";

import { AuthContext } from "../App";
import { GameData } from "../../../types/game";
import { IoResponse } from "../../../types/socketio";

interface GameProps {
    authToken: string;
}

const Game = ({ authToken }: GameProps) => {
    const [socket, setSocket] = React.useState<BoomerDogSocket | null>(null);
    const { state, dispatch } = React.useContext(AuthContext);
    const [isConnected, setIsConnected] = React.useState(false);
    const [player, setPlayer] = React.useState<Player>({} as Player);
    const [gameData, setGameData] = React.useState<GameData>({} as GameData);

    const startGame = () => {
        socket &&
            player.gameId &&
            socket.emit(
                "game:start",
                { gameId: player.gameId },
                (response: IoResponse) => {
                    if (response.status) {
                        console.error(response.message);
                    }
                }
            );
    };

    React.useEffect(() => {
        const socket = getAuthenticatedSocket(authToken);
        socket.on("connect", () => {
            console.debug("Socket connected");
            setIsConnected(true);
        });
        socket.on("disconnect", () => {
            console.debug("Socket disconnected");
            setIsConnected(false);
        });
        socket.on("user:update", (payload: Player) => {
            console.debug("player updated");
            console.debug(payload);
            setPlayer(payload);
        });
        socket.on("gamedata:update", (payload) => {
            setGameData(payload);
        });
        setSocket(socket);
    }, [state.user]);
    return (
        <Box>
            {socket && player && (
                <>
                    <Console {...{ isConnected, player, socket }} />
                    <GameBrowser {...{ socket, player }} />
                    {player.gameId && (
                        <>
                            <Heading>{`${gameData.gameName} [${gameData.uuid}]`}</Heading>
                            <Button
                                colorScheme="teal"
                                m={5}
                                onClick={startGame}
                            >
                                Start game
                            </Button>
                            {gameData.players && (
                                <>
                                    <Board
                                        socket={socket}
                                        nPlayers={4}
                                        playerIndex={
                                            gameData.order[
                                                gameData.players
                                                    .map((p) => p.uuid)
                                                    .indexOf(player.uuid)
                                            ]
                                        }
                                    />
                                    <Cards
                                        socket={socket}
                                        hasStarted={gameData.hasStarted}
                                    />
                                </>
                            )}
                        </>
                    )}
                </>
            )}
        </Box>
    );
};

export default Game;
