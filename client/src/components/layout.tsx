import * as React from "react";
import { Box } from "@chakra-ui/react";

import NavBar from "./navbar";

export interface LayoutProps {
    isLoggedIn: boolean;
    isConnected: boolean;
    children: React.ReactNode;
    loginElement: JSX.Element;
    collapseDisclosure: {
        isOpen: boolean;
        onOpen: () => void;
        onClose: () => void;
        onToggle: () => void;
        isControlled: boolean;
        getButtonProps: (props?: any) => any;
        getDisclosureProps: (props?: any) => any;
    };
    gameBrowserDisclosure: {
        isOpen: boolean;
        onOpen: () => void;
        onClose: () => void;
        onToggle: () => void;
        isControlled: boolean;
        getButtonProps: (props?: any) => any;
        getDisclosureProps: (props?: any) => any;
    };
}

const Layout = (props: LayoutProps) => {
    return (
        <>
            <NavBar
                isLoggedIn={props.isLoggedIn}
                loginElement={props.loginElement}
                isConnected={props.isConnected}
                collapseDisclosure={props.collapseDisclosure}
                gameBrowserDisclosure={props.gameBrowserDisclosure}
            />
            <Box maxW={1000} position="relative" mx="auto" overflow="hidden">
                {props.children}
            </Box>
        </>
    );
};

export default Layout;
