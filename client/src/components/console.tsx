import * as React from "react";
import { Button, HStack, Spinner, Stack, Text, VStack } from "@chakra-ui/react";

import { CheckCircleIcon } from "@chakra-ui/icons";
import { BoomerDogSocket } from "../api/socket-client";
import { Player } from "../../../types/user";
import { IoResponse } from "../../../types/socketio";

export interface ConsoleProps {
    isConnected: boolean;
    player: Player;
    socket?: BoomerDogSocket; // authenticated socket
}

const Console = ({ isConnected, player, socket }: ConsoleProps) => {
    return (
        <Stack p={4} direction="row" spacing={2}>
            {isConnected ? (
                <CheckCircleIcon w={6} h={6} color="green.600" />
            ) : (
                <Spinner
                    thickness="4px"
                    speed="0.65s"
                    emptyColor="gray.200"
                    color="blue.500"
                    // size="xl"
                />
            )}
            ;
            {isConnected && (
                <Text>{`${socket && socket.id} // ${player.uuid}`}</Text>
            )}
        </Stack>
    );
};

export default Console;
