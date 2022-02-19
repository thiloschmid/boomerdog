import * as React from "react";
import { Button, HStack, Spinner, Stack, Text, VStack } from "@chakra-ui/react";

import { CheckCircleIcon } from "@chakra-ui/icons";
import { BoomerDogSocket } from "../api/socket-client";
import { User } from "boomerdog-types/user";

export interface ConnectionIndicatorProps {
    isConnected: boolean;
}

const ConnectionIndicator = ({ isConnected }: ConnectionIndicatorProps) => {
    return (
        <Stack p={4} direction="row" spacing={2}>
            {isConnected ? (
                <CheckCircleIcon w={6} h={6} color="green.600" />
            ) : (
                <HStack>
                    <Spinner
                        thickness="4px"
                        speed="0.65s"
                        emptyColor="gray.200"
                        color="blue.500"
                        // size="xl"
                    />
                    <Text>connecting to server</Text>
                </HStack>
            )}
            ;
        </Stack>
    );
};

export default ConnectionIndicator;
