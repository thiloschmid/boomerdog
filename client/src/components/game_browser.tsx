import {
    Box,
    Button,
    Table,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    useColorModeValue,
} from "@chakra-ui/react";
import * as React from "react";
import { User, GameData } from "boomerdog-types";

import CreateGameDrawer from "./create_game_drawer";
import { BoomerDogSocket } from "../api/socket-client";

interface GameBrowserProps {
    socket: BoomerDogSocket;
    player: User;
}
const GameBrowser = ({ socket, player }: GameBrowserProps) => {
    const [games, setGames] = React.useState<GameData[]>([]);
    const selectionColor = useColorModeValue("teal.100", "teal.700");

    React.useEffect(() => {
        if (socket) {
            socket.on("games:update", (payload) => {
                setGames(payload);
            });
            socket.emit("games:read");
        }
    }, [socket]);

    const joinGame = (gameId: string) => {
        socket.emit("game:join", { gameId: gameId }, (response) => {
            if (!response.status) {
            } else {
                console.error(response.message);
            }
        });
    };

    const quitGame = (gameId: string) => {
        socket.emit("game:quit", { gameId: gameId }, (response) => {
            if (response.status) {
                console.error(response.message);
            }
        });
    };

    return (
        <Box mt={2}>
            {!player.gameId && <CreateGameDrawer {...{ socket, player }} />}
            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Game name</Th>
                        <Th isNumeric>Board size</Th>
                        <Th>Players</Th>
                        <Th></Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {games.map((g) => {
                        const isPlayersGame = g.players
                            .map((p) => p.userId)
                            .includes(player.userId);
                        return (
                            <Tr
                                bg={isPlayersGame ? selectionColor : ""}
                                key={g.gameName}
                            >
                                <Td>{g.gameName}</Td>
                                <Td isNumeric>{g.nPlayers}</Td>
                                <Td>
                                    {g.players.map((p) => p.name).join(", ")}
                                </Td>
                                <Td>
                                    {isPlayersGame ? (
                                        <Button
                                            onClick={() => {
                                                quitGame(g.gameId);
                                            }}
                                        >
                                            Quit
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => {
                                                joinGame(g.gameId);
                                            }}
                                        >
                                            Join
                                        </Button>
                                    )}
                                </Td>
                            </Tr>
                        );
                    })}
                </Tbody>
            </Table>
        </Box>
    );
};

export default GameBrowser;
