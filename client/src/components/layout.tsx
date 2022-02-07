import * as React from "react";
import {
    Box,
    Heading,
    Image,
    Stack,
    useColorModeValue,
} from "@chakra-ui/react";

import logo from "../images/blaze_icon.svg";

export interface LayoutProps {
    children: React.ReactNode;
}

const Layout = (props: LayoutProps) => (
    <>
        <Image src={logo} w={50} position="absolute" top={10} left={10} />
        <Heading position="absolute" top={10} left={100} color="cyan.800">
            BoomerDog
        </Heading>
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
