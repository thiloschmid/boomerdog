import * as React from "react";
import { Box, Button, Flex, Heading, HStack, Stack } from "@chakra-ui/react";
import Console from "./connection_indicator";
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

    const fold = () => {
        socket &&
            player &&
            player.gameId &&
            socket.emit("game:fold", { gameId: player.gameId }, (response) => {
                if (!response.status) {
                    console.error(response.message);
                }
            });
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
        socket.on("gamestate:update", (payload) => {
            console.debug("gamestate updated", payload);
            setGameState(payload);
        });
        socket.on("user:update", (payload: User) => {
            console.debug("player updated", payload);
            setPlayer(payload);
        });
        socket.on("gamedata:update", (payload) => {
            console.debug("gamedata updated", payload);
            setGameData(payload);
        });
        socket.on("cards:update", (payload) => {
            console.log("cards updated", payload);
            setCards(payload);
        });
        setSocket(socket);
    }, [state.user]);

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
                    <Console {...{ isConnected, player, socket }} />
                    <GameBrowser {...{ socket, player }} />
                    {player.gameId && gameData && (
                        <Stack>
                            <Heading>{`${gameData.gameName} [${gameData.gameId}]`}</Heading>
                            <Flex>
                                {!gameData.hasStarted && (
                                    <Button
                                        colorScheme="teal"
                                        m={5}
                                        onClick={startGame}
                                    >
                                        Start game
                                    </Button>
                                )}
                            </Flex>
                            {gameData.players && (
                                <>
                                    <BoardWrapper
                                        userId={player.userId}
                                        gameId={gameData.gameId}
                                        socket={socket}
                                        nPlayers={4}
                                        playerIndex={gameData.players
                                            .map((p) => p.userId)
                                            .indexOf(player.userId)}
                                        remainingMoves={
                                            // null if not defined or not relevant
                                            gameState?.gamePhase ===
                                            GamePhase.WaitingForSevenMove
                                                ? gameState?.remainingMoves ||
                                                  null
                                                : null
                                        }
                                        selectedCard={selectedCard}
                                        stack={gameState?.stack || []}
                                    />
                                    {gameState?.activePlayerUserId ===
                                        player.userId && (
                                        <Flex>
                                            <Button
                                                colorScheme="red"
                                                m={5}
                                                onClick={fold}
                                            >
                                                Fold
                                            </Button>
                                        </Flex>
                                    )}
                                    <Cards
                                        cards={cards}
                                        selectedCard={selectedCard}
                                        setSelectedCard={setSelectedCard}
                                        hasStarted={gameData.hasStarted}
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
