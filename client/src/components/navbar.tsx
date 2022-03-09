import * as React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
    Image,
    Heading,
    Box,
    Flex,
    Avatar,
    HStack,
    Link,
    IconButton,
    Button,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    useDisclosure,
    useColorModeValue,
    Stack,
    Text,
    useBreakpointValue,
    Collapse,
} from "@chakra-ui/react";
import {
    HamburgerIcon,
    CloseIcon,
    ChevronDownIcon,
    ChevronUpIcon,
} from "@chakra-ui/icons";

import logo from "../images/blaze_icon.svg";
import { ColorModeSwitcher } from "../ColorModeSwitcher";
import { AuthContext } from "../App";
import ConnectionIndicator from "./connection_indicator";

const Links = ["Chats", "Leaderboard", "About"];

const NavLink = ({ children }: { children: React.ReactNode }) => (
    <Link
        px={2}
        py={1}
        rounded={"md"}
        _hover={{
            textDecoration: "none",
            bg: useColorModeValue("gray.200", "gray.700"),
        }}
        href={"#"}
    >
        {children}
    </Link>
);

export interface NavBarProps {
    isLoggedIn: boolean; // logged in via github
    isConnected: boolean; // connected to the socketio backend
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
}

const NavBar = ({
    isLoggedIn,
    isConnected,
    loginElement,
    collapseDisclosure,
}: NavBarProps) => {
    const { state, dispatch } = React.useContext(AuthContext);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const logout = () => {
        console.log("logout");
        dispatch({ type: "LOGOUT" });
    };

    return (
        <>
            <IconButton
                size={"md"}
                icon={
                    collapseDisclosure.isOpen ? (
                        <ChevronUpIcon w="2em" h="2em" />
                    ) : (
                        <ChevronDownIcon w="2em" h="2em" />
                    )
                }
                aria-label={"Toggle Nav"}
                onClick={collapseDisclosure.onToggle}
                position={"absolute"}
                left="1em"
                top="1em"
                zIndex={1000}
            />
            <Collapse in={collapseDisclosure.isOpen} animateOpacity>
                {/* <Box bg={useColorModeValue("gray.100", "gray.900")} px={4}> */}
                <Box px={4}>
                    <Flex
                        h={16}
                        alignItems={"center"}
                        justifyContent={"space-between"}
                    >
                        <IconButton
                            size={"md"}
                            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
                            aria-label={"Open Menu"}
                            display={{ md: "none" }}
                            onClick={isOpen ? onClose : onOpen}
                        />
                        <HStack spacing={2} alignItems={"center"}>
                            <Box
                                // mr={{ base: "0", md: "1em" }}
                                mr={0}
                                ml={"4em"}
                            >
                                <Image
                                    src={logo}
                                    w={{ base: "2em", md: "3em" }}
                                />
                            </Box>
                            {/* {useBreakpointValue({ base: false, md: true }) && (
                                <Heading p={0} m={0} color="cyan.700">
                                    BoomerDog
                                </Heading>
                            )} */}
                            {/* <HStack
                            as={"nav"}
                            spacing={4}
                            display={{ base: "none", md: "flex" }}
                        >
                            {Links.map((link) => (
                                <NavLink key={link}>{link}</NavLink>
                            ))}
                        </HStack> */}
                        </HStack>
                        <Flex alignItems="center">
                            <Flex
                                alignItems={"center"}
                                display={{ base: "none", md: "flex" }}
                            >
                                {isLoggedIn && (
                                    <ConnectionIndicator {...{ isConnected }} />
                                )}
                                {isLoggedIn ? (
                                    <Button
                                        onClick={logout}
                                        variant="solid"
                                        colorScheme={"red"}
                                        mr={4}
                                    >
                                        Logout
                                    </Button>
                                ) : (
                                    loginElement
                                )}
                                <Menu>
                                    <MenuButton
                                        as={Button}
                                        rounded={"full"}
                                        variant={"link"}
                                        cursor={"pointer"}
                                        minW={0}
                                    ></MenuButton>
                                    <Text mx={2}>{state.user?.name}</Text>
                                    <Avatar
                                        // size={"sm"}
                                        src={state.user?.avatar_url}
                                    />
                                    <MenuList>
                                        <MenuItem>Link 1</MenuItem>
                                        <MenuItem>Link 2</MenuItem>
                                        <MenuDivider />
                                        <MenuItem>Link 3</MenuItem>
                                    </MenuList>
                                </Menu>
                            </Flex>
                            <ColorModeSwitcher
                                ml="1em"
                                justifySelf="flex-end"
                            />
                        </Flex>
                    </Flex>

                    {isOpen ? (
                        <Box pb={4} display={{ md: "none" }}>
                            <Stack as={"nav"} spacing={4}>
                                {Links.map((link) => (
                                    <NavLink key={link}>{link}</NavLink>
                                ))}
                                {isLoggedIn ? (
                                    <Button
                                        onClick={logout}
                                        variant="solid"
                                        colorScheme={"red"}
                                        mr={4}
                                    >
                                        Logout
                                    </Button>
                                ) : (
                                    loginElement
                                )}
                            </Stack>
                        </Box>
                    ) : null}
                </Box>
            </Collapse>
        </>
    );
};

export default NavBar;
