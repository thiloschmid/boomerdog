import * as React from "react";
import {
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
    useDisclosure,
    useColorModeValue,
    Stack,
    Text,
    useBreakpointValue,
    Collapse,
    Spinner,
} from "@chakra-ui/react";
import {
    HamburgerIcon,
    CloseIcon,
    ChevronDownIcon,
    ChevronUpIcon,
} from "@chakra-ui/icons";
import { IoPaw } from "react-icons/io5";
import { BiGlobe } from "react-icons/bi";

// import logo from "../images/blaze_icon.svg";
import { ColorModeSwitcher } from "../ColorModeSwitcher";
import { AuthContext } from "../App";

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

const NavBar = ({
    isLoggedIn,
    isConnected,
    loginElement,
    collapseDisclosure,
    gameBrowserDisclosure,
}: NavBarProps) => {
    const { state, dispatch } = React.useContext(AuthContext);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const logout = () => {
        console.log("logout");
        dispatch({ type: "LOGOUT" });
    };

    const iconColor = useColorModeValue("#2D3748", "#EDF2F7");

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
                        <HStack
                            spacing={2}
                            alignItems={"center"}
                            color={useColorModeValue("#44337A", "#E9D8FD")}
                        >
                            <Box mr={0} ml={"4em"}>
                                <IoPaw size={50} />
                            </Box>
                            {useBreakpointValue({ base: false, md: true }) && (
                                <Heading p={0} m={0} fontFamily={"mono"}>
                                    BoomerDog
                                </Heading>
                            )}
                        </HStack>
                        {isLoggedIn && !isConnected && (
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
                        <Flex alignItems="center">
                            <Flex
                                alignItems={"center"}
                                display={{ base: "none", md: "flex" }}
                            >
                                {
                                    <IconButton
                                        aria-label="expand game browser"
                                        icon={
                                            <BiGlobe
                                                color={iconColor}
                                                size={30}
                                            />
                                        }
                                        mr={5}
                                        onClick={gameBrowserDisclosure.onToggle}
                                    />
                                }
                                {isLoggedIn ? (
                                    <Menu>
                                        <MenuButton
                                            rounded={"full"}
                                            cursor={"pointer"}
                                        >
                                            <HStack>
                                                <Text mx={2}>
                                                    {state.user?.name}
                                                </Text>
                                                <Avatar
                                                    // size={"sm"}
                                                    src={state.user?.avatar_url}
                                                />
                                            </HStack>
                                        </MenuButton>
                                        <MenuList>
                                            <MenuItem onClick={logout}>
                                                Logout
                                            </MenuItem>
                                        </MenuList>
                                    </Menu>
                                ) : (
                                    loginElement
                                )}
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
