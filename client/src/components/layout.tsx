import * as React from "react";
import { Image } from "@chakra-ui/react";
import { Box, HStack, IconButton } from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

import logo from "../images/blaze_icon.svg";
import NavBar from "./navbar";

export interface LayoutProps {
    isLoggedIn: boolean;
    isConnected: boolean;
    children: React.ReactNode;
    loginElement: JSX.Element;
}

const Layout = (props: LayoutProps) => {
    return (
        <>
            <NavBar
                isLoggedIn={props.isLoggedIn}
                loginElement={props.loginElement}
                isConnected={props.isConnected}
            />
            <Box
                maxW={1000}
                position="relative"
                mx="auto"
                overflow="hidden"
            >
                {props.children}
            </Box>
        </>
    );
};

export default Layout;
