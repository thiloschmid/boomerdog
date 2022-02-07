import { Button, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import * as React from "react";
import { GameBase } from "../../../types/game";
import { Player } from "../../../types/user";

import CreateGameDrawer from "./create_game_drawer";
import { BoomerDogSocket } from "../api/socket-client";
import { Dispatch } from "react";

interface GameBrowserProps {
    socket: BoomerDogSocket;
    player: Player;
}
const GameBrowser = ({ socket, player }: GameBrowserProps) => {
    const [games, setGames] = React.useState<GameBase[]>([]);

    socket.on("games:update", (payload) => {
        setGames(payload);
    });

    React.useEffect(() => {
        socket.emit("games:read");
    }, [socket]);

    const joinGame = (uuid: string) => {
        player &&
            socket.emit(
                "game:join",
                { gameId: uuid, playerId: player.uuid },
                (response) => {
                    if (!response.status) {
                    } else {
                        console.error(response.message);
                    }
                }
            );
    };

    return (
        <>
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
                    {games.map((g) => (
                        <Tr
                            bg={
                                player &&
                                g.players
                                    .map((p) => p.uuid)
                                    .includes(player.uuid)
                                    ? "red.100"
                                    : ""
                            }
                            key={g.gameName}
                        >
                            <Td>{g.gameName}</Td>
                            <Td isNumeric>{g.nPlayers}</Td>
                            <Td>{g.players.map((p) => p.name).join(", ")}</Td>
                            <Td>
                                <Button
                                    onClick={() => {
                                        joinGame(g.uuid);
                                    }}
                                >
                                    Join
                                </Button>
                            </Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </>
    );
};

export default GameBrowser;
