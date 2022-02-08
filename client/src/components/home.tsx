import * as React from "react";
import { Box } from "@chakra-ui/react";
import { Player } from "../../../types/user";
import Console from "./console";
import GameBrowser from "./game_browser";
import Board from "./board/board";
import Cards from "./cards/cards";
import { BoomerDogSocket, getAuthenticatedSocket } from "../api/socket-client";

import { AuthContext } from "../App";

interface HomeProps {
    authToken: string;
}

const Home = ({ authToken }: HomeProps) => {
    const [socket, setSocket] = React.useState<BoomerDogSocket | null>(null);
    const { state, dispatch } = React.useContext(AuthContext);
    const [isConnected, setIsConnected] = React.useState(false);
    const [player, setPlayer] = React.useState<Player>({} as Player);

    React.useEffect(() => {
        const authSocket = getAuthenticatedSocket(authToken);
        authSocket.on("connect", () => {
            console.debug("Socket connected");
            setIsConnected(true);
        });
        authSocket.on("disconnect", () => {
            console.debug("Socket disconnected");
            setIsConnected(false);
        });
        authSocket.on("user:update", (payload: Player) => {
            console.debug("player updated");
            console.debug(payload);
            setPlayer(payload);
        });
        setSocket(authSocket);
    }, [state.user]);
    return (
        <Box>
            {socket && player && (
                <>
                    <Console {...{ isConnected, player, socket }} />
                    <GameBrowser {...{ socket, player }} />
                    {player.gameId && (
                        <>
                            <Board socket={socket} nPlayers={4} />
                            <Cards socket={socket} />
                        </>
                    )}
                </>
            )}
        </Box>
    );
};

export default Home;
