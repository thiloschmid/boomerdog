import * as React from "react";
import { Box, Button, Flex, Heading, HStack, Stack } from "@chakra-ui/react";
import GameBrowser from "./game_browser";
import BoardWrapper from "./board/board_wrapper";
import Cards from "./cards/cards";
import { BoomerDogSocket, getAuthenticatedSocket } from "../api/socket-client";

import { AuthContext } from "../App";

import {
    CardBase,
    GameData,
    GameState,
    GamePhase,
    IoResponse,
    User,
} from "boomerdog-types";

const placeHolderCards: CardBase[] = [
    { cardId: 0, value: 14 },
    { cardId: 0, value: 14 },
    { cardId: 0, value: 14 },
    { cardId: 0, value: 14 },
    { cardId: 0, value: 14 },
    { cardId: 0, value: 14 },
];

interface GameProps {
    authToken: string;
    isConnected: boolean;
    setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
}

const Game = ({ authToken, isConnected, setIsConnected }: GameProps) => {
    const [socket, setSocket] = React.useState<BoomerDogSocket | null>(null);
    const [player, setPlayer] = React.useState<User | null>(null);
    const [gameData, setGameData] = React.useState<GameData | null>(null);
    const [gameState, setGameState] = React.useState<GameState | null>(null);

    const [cards, setCards] =
        React.useState<(CardBase | null)[]>(placeHolderCards);
    const [selectedCard, setSelectedCard] = React.useState<number | null>(null);

    const { state, dispatch } = React.useContext(AuthContext);

    const startGame = () => {
        socket &&
            player &&
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

    const quitGame = () => {
        socket &&
            player &&
            player.gameId &&
            socket.emit(
                "game:quit",
                { gameId: player.gameId },
                (response: IoResponse) => {
                    if (response.status) {
                        console.error(response.message);
                    }
                }
            );
    };

    const fold = () => {
        socket &&
            player &&
            player.gameId &&
            socket.emit("game:fold", { gameId: player.gameId }, (response) => {
                if (response.status) {
                    console.error(response.message);
                }
            });
    };

    React.useEffect(() => {
        if (authToken) {
            const authSocket = getAuthenticatedSocket(authToken);
            authSocket.on("connect", () => {
                console.debug("Socket connected");
                setIsConnected(true);
            });
            authSocket.on("disconnect", () => {
                console.debug("Socket disconnected");
                setIsConnected(false);
            });
            authSocket.on("gamestate:update", (payload) => {
                console.debug("gamestate updated", payload);
                setGameState(payload);
            });
            authSocket.on("user:update", (payload: User) => {
                console.debug("player updated", payload);
                setPlayer(payload);
            });
            authSocket.on("gamedata:update", (payload) => {
                console.debug("gamedata updated", payload);
                setGameData(payload);
            });
            authSocket.on("cards:update", (payload) => {
                console.log("cards updated", payload);
                setCards(payload);
                setSelectedCard(null);
            });
            setSocket(authSocket);
        } else {
            socket?.close();
        }
    }, [state.user, authToken]);

    React.useEffect(() => {
        if (socket && player && player.gameId && gameState === null) {
            console.debug("Try to reconnect");
            socket.emit("game:reconnect", { gameId: player.gameId });
        }
    }, [socket, player]);

    return (
        <Box>
            {socket && player && (
                <>
                    {(player.gameId && gameData && gameData.hasStarted) || (
                        <GameBrowser {...{ socket, player }} />
                    )}
                    {player.gameId && gameData && (
                        <Stack mt="1em">
                            {/* <Heading>{`${gameData.gameName}`}</Heading> */}
                            <Flex>
                                {!gameData.hasStarted && (
                                    <>
                                        <Button
                                            colorScheme="teal"
                                            m={2}
                                            onClick={startGame}
                                        >
                                            Start game
                                        </Button>
                                        <Button
                                            colorScheme="red"
                                            m={2}
                                            onClick={quitGame}
                                        >
                                            Quit game
                                        </Button>
                                    </>
                                )}
                            </Flex>
                            {gameData.players && (
                                <>
                                    <BoardWrapper
                                        gameData={gameData}
                                        gameState={gameState}
                                        player={player}
                                        socket={socket}
                                        isActive={
                                            gameState?.activePlayerUserId ===
                                            player.userId
                                        }
                                        playerIndex={gameData.players
                                            .map((p) => p.userId)
                                            .indexOf(player.userId)}
                                        stepsRemaining={
                                            // only relevant for the seven card
                                            // null if not defined or not relevant
                                            gameState?.gamePhase ===
                                            GamePhase.WaitingForSevenMove
                                                ? gameState?.remainingMoves ||
                                                  null
                                                : null
                                        }
                                        selectedCard={selectedCard}
                                        deselectCard={() =>
                                            setSelectedCard(null)
                                        }
                                        stack={gameState?.stack || []}
                                        fold={fold}
                                        isSwapping={
                                            gameState?.gamePhase ===
                                            GamePhase.Swapping
                                        }
                                    />
                                    <Cards
                                        cards={cards}
                                        selectedCard={selectedCard}
                                        setSelectedCard={setSelectedCard}
                                        hasStarted={gameData.hasStarted}
                                        isSwapping={
                                            gameState?.gamePhase ===
                                            GamePhase.Swapping
                                        }
                                    />
                                </>
                            )}
                        </Stack>
                    )}
                </>
            )}
        </Box>
    );
};

export default Game;
