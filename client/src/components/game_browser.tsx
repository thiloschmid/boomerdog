import { Button, Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import * as React from "react";
import { GameBase } from "../../../types/game";
import { Player } from "../../../types/user";

import CreateGameDrawer from "./create_game_drawer";
import { BoomerDogSocket } from "../api/socket-client";

interface GameBrowserProps {
    socket?: BoomerDogSocket;
    player: Player;
}
const GameBrowser = ({ socket, player }: GameBrowserProps) => {
    const [games, setGames] = React.useState<GameBase[]>([]);

    React.useEffect(() => {
        if (socket) {
            socket.on("games:update", (payload) => {
                setGames(payload);
            });
            socket.emit("games:read");
        }
    }, [socket]);

    const joinGame = (uuid: string) => {
        player &&
            socket &&
            socket.emit(
                "game:join",
                { gameId: uuid, userId: player.uuid },
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
                    {games.map((g) => {
                        const isPlayersGame =
                            player &&
                            g.players.map((p) => p.uuid).includes(player.uuid);
                        return (
                            <Tr
                                bg={isPlayersGame ? "cyan.100" : ""}
                                key={g.gameName}
                            >
                                <Td>{g.gameName}</Td>
                                <Td isNumeric>{g.nPlayers}</Td>
                                <Td>
                                    {g.players.map((p) => p.name).join(", ")}
                                </Td>
                                <Td>
                                    {!isPlayersGame && (
                                        <Button
                                            onClick={() => {
                                                joinGame(g.uuid);
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
        </>
    );
};

export default GameBrowser;
