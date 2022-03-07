import * as React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ChakraProvider, theme } from "@chakra-ui/react";

import Layout from "./components/layout";
import Game from "./components/game";
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
    const [isConnected, setIsConnected] = React.useState(false);

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
                                >
                                    {state.isLoggedIn && state.authToken && (
                                        // Here, sockets exist 🔥
                                        <Game
                                            {...{
                                                authToken: `${state.authToken}`,
                                                isConnected,
                                                setIsConnected,
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
