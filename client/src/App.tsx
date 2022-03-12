import * as React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ChakraProvider, useDisclosure } from "@chakra-ui/react";

import Layout from "./components/layout";
import Game from "./components/game";
import Login from "./components/login";

import theme from "./theme";

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
    const [isConnected, setIsConnected] = React.useState(false);

    const collapseDisclosure = useDisclosure({ defaultIsOpen: true });
    const gameBrowserDisclosure = useDisclosure({ defaultIsOpen: true });

    return (
        <AuthContext.Provider value={{ state, dispatch }}>
            <ChakraProvider theme={theme}>
                <Router>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <Layout
                                    isLoggedIn={state.isLoggedIn}
                                    isConnected={isConnected}
                                    loginElement={<Login />}
                                    collapseDisclosure={collapseDisclosure}
                                    gameBrowserDisclosure={
                                        gameBrowserDisclosure
                                    }
                                >
                                    {state.isLoggedIn && state.authToken && (
                                        // Here, sockets exist 🔥
                                        <Game
                                            {...{
                                                authToken: `${state.authToken}`,
                                                isConnected,
                                                setIsConnected,
                                                collapseDisclosure,
                                                gameBrowserDisclosure,
                                            }}
                                        />
                                    )}
                                </Layout>
                            }
                        />
                    </Routes>
                </Router>
            </ChakraProvider>
        </AuthContext.Provider>
    );
};
