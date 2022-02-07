import * as React from "react";
import { Box } from "@chakra-ui/react";
import { Player } from "../../../types/user";
import Console from "./console";
import GameBrowser from "./game_browser";
import Board from "./board/board";
import Cards from "./cards/cards";
import { BoomerDogSocket } from "../api/socket-client";

interface HomeProps {
    player?: Player;
    socket: BoomerDogSocket;
    isConnected: boolean;
}

const Home = ({ player, socket, isConnected }: HomeProps) => (
    <Box>
        {player && (
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

export default Home;
