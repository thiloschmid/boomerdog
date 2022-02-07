import * as React from "react";
import { useState } from "react";
import {
    ChakraProvider,
    Box,
    Text,
    Link,
    VStack,
    Code,
    Grid,
    theme,
    Stack,
    usePrevious,
} from "@chakra-ui/react";
import { ColorModeSwitcher } from "./ColorModeSwitcher";

import SocketTester from "./components/socket-test";
import Layout from "./components/layout";

import Console from "./components/console";

import { socket } from "./api/socket-client";
import GameBrowser from "./components/game_browser";
import Board from "./components/board/board";
import Cards from "./components/cards/cards";
import { GameBase, GameState } from "../../types/game";
import { Player } from "../../types/user";
import { prepareDataForValidation } from "formik";
import { ReadUserIoResponse } from "../../types/socketio";
import { connect } from "http2";

export const App = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [player, setPlayer] = useState<Player>();

    const [gameState, setGameState] = useState<GameState>({});

    const connectSocket = () => {
        socket.on("connect", () => {
            console.debug(`socket connected: ${socket.id}`);
            socket.emit(
                "user:read",
                undefined,
                (response: ReadUserIoResponse) => {
                    if (!response.status) {
                        setPlayer(response.player);
                    } else {
                        console.error(response.message);
                    }
                }
            );
            setIsConnected(true);
        });

        socket.on("player:update", (payload: Player) => {
            setPlayer(payload);
        });

        socket.on("disconnect", () => {
            console.debug("socket disconnected");
            setIsConnected(false);
        });
    };

    React.useEffect(connectSocket, [isConnected]);

    return (
        <ChakraProvider theme={theme}>
            <ColorModeSwitcher justifySelf="flex-end" />
            <Layout>
                {player && (
                    <>
                        <Console {...{ isConnected, player, socket }} />
                        <GameBrowser {...{ socket, player, setPlayer }} />
                        {player.gameId && (
                            <>
                                <Board socket={socket} nPlayers={4} />
                                <Cards socket={socket} />
                            </>
                        )}
                    </>
                )}

                <Box textAlign="center" fontSize="xl">
                    <Grid minH="100vh" p={3}>
                        <VStack spacing={8}>
                            <SocketTester {...{ socket }} />
                        </VStack>
                    </Grid>
                </Box>
            </Layout>
        </ChakraProvider>
    );
};
