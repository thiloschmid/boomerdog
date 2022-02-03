import * as React from "react"
import {
  ChakraProvider,
  Box,
  Text,
  Link,
  VStack,
  Code,
  Grid,
  theme,
} from "@chakra-ui/react"
import { ColorModeSwitcher } from "./ColorModeSwitcher"
import { Logo } from "./Logo"

import { Socket } from "socket.io-client"

import socket, {ServerToClientEvents, ClientToServerEvents} from "./api/socket-client";
import SocketTester from "./components/socket-test"

const SocketIOContext = React.createContext<Socket<ServerToClientEvents, ClientToServerEvents>>(socket);

export const App = () => (
  <ChakraProvider theme={theme}>
    <SocketIOContext.Provider value={socket}>
      <Box textAlign="center" fontSize="xl">
        <Grid minH="100vh" p={3}>
          <ColorModeSwitcher justifySelf="flex-end" />
          <VStack spacing={8}>
            <Logo h="40vmin" pointerEvents="none" />
            <Text>
              Edit <Code fontSize="xl">src/App.tsx</Code> and save to reload.
            </Text>
            <Link
              color="teal.500"
              href="https://chakra-ui.com"
              fontSize="2xl"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn Chakra now!+22
            </Link>
            <SocketTester />
          </VStack>
        </Grid>
      </Box>
    </SocketIOContext.Provider>
  </ChakraProvider>
)
