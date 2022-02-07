import * as React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Link as RouterLink,
} from "react-router-dom";
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
import { GameState } from "../../types/game";
import { Player } from "../../types/user";
import { ReadUserIoResponse } from "../../types/socketio";
import Home from "./components/home";
import Login from "./components/login";

import {
    initialState,
    reducer,
    AuthReducerAction,
} from "./store/reducer/index";

export const AuthContext = React.createContext({
    state: initialState,
    dispatch: (() => {}) as React.Dispatch<AuthReducerAction>,
});

export const App = () => {
    const [state, dispatch] = React.useReducer(reducer, initialState);

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
        <AuthContext.Provider value={{ state, dispatch }}>
            <ChakraProvider theme={theme}>
                <ColorModeSwitcher justifySelf="flex-end" />
                <Layout>
                    <Router>
                        <RouterLink to="/">Home</RouterLink>
                        <RouterLink to="/login">Login</RouterLink>
                        <Routes>
                            <Route
                                path="/"
                                element={
                                    <Home
                                        {...{ isConnected, player, socket }}
                                    />
                                }
                            />
                            <Route path="/login" element={<Login />} />
                        </Routes>
                    </Router>
                </Layout>
            </ChakraProvider>
        </AuthContext.Provider>
    );
};
