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
    // const [player, setPlayer] = useState<Player>();

    // const [gameState, setGameState] = useState<GameState>({});

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
                                    loginElement={<Login />}
                                >
                                    {state.isLoggedIn && state.user?.id && (
                                        // Here, sockets exist 🔥
                                        <Game authToken={`${state.user.id}`} />
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
