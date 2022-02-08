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
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";

import logo from "../images/blaze_icon.svg";
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

export default function NavBar({
    isLoggedIn,
    loginElement,
}: {
    isLoggedIn: boolean;
    loginElement: JSX.Element;
}) {
    const { state, dispatch } = React.useContext(AuthContext);
    const { isOpen, onOpen, onClose } = useDisclosure();

    const logout = () => {
        console.log("logout");
        dispatch({ type: "LOGOUT" });
    };

    return (
        <>
            <Box bg={useColorModeValue("gray.100", "gray.900")} px={4}>
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
                    <HStack spacing={8} alignItems={"center"}>
                        <RouterLink to="/">
                            <Box>
                                <Image src={logo} w={50} />
                            </Box>
                        </RouterLink>

                        <Heading color="cyan.800">BoomerDog</Heading>
                        <HStack
                            as={"nav"}
                            spacing={4}
                            display={{ base: "none", md: "flex" }}
                        >
                            {Links.map((link) => (
                                <NavLink key={link}>{link}</NavLink>
                            ))}
                        </HStack>
                    </HStack>
                    <Flex alignItems={"center"}>
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

                        <ColorModeSwitcher justifySelf="flex-end" />
                    </Flex>
                </Flex>

                {isOpen ? (
                    <Box pb={4} display={{ md: "none" }}>
                        <Stack as={"nav"} spacing={4}>
                            {Links.map((link) => (
                                <NavLink key={link}>{link}</NavLink>
                            ))}
                        </Stack>
                    </Box>
                ) : null}
            </Box>
        </>
    );
}
