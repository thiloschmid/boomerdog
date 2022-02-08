import * as React from "react";
import { Box, useColorModeValue } from "@chakra-ui/react";

import NavBar from "./navbar";

export interface LayoutProps {
    isLoggedIn: boolean;
    children: React.ReactNode;
    loginElement: JSX.Element;
}

const Layout = (props: LayoutProps) => (
    <>
        <NavBar
            isLoggedIn={props.isLoggedIn}
            loginElement={props.loginElement}
        />
        <Box
            position="relative"
            mx="auto"
            bg={useColorModeValue("gray.200", "gray.700")}
            w={[400, 800, 1000]}
            overflow="hidden"
        >
            {props.children}
        </Box>
    </>
);

export default Layout;
