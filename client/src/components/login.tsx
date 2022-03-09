import * as React from "react";
import { Box, Button, Spinner, useDisclosure } from "@chakra-ui/react";
import { Navigate } from "react-router-dom";
import { GoMarkGithub } from "react-icons/go";

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
} from "@chakra-ui/react";
import { FaDog } from "react-icons/fa";

import { AuthContext } from "../App";

const Login = () => {
    const { isOpen, onOpen, onClose } = useDisclosure(); // for the modal overlay
    const { state, dispatch } = React.useContext(AuthContext);
    const [data, setData] = React.useState({
        errorMessage: "",
        isLoading: false,
    });

    const { client_id, redirect_uri } = state;

    const fetchUserData = (token: string) => {
        fetch("https://api.github.com/user", {
            method: "get",
            headers: {
                Authorization: `token ${token}`,
            },
        })
            .then((response) => response.json())
            .then((userData) => {
                console.log(userData);
                dispatch({
                    type: "LOGIN",
                    payload: {
                        authToken: token,
                        user: userData,
                        isLoggedIn: true,
                    },
                });
            });
    };

    React.useEffect(() => {
        // After requesting Github access, Github redirects back to your app with a code parameter
        const url = window.location.href;
        const hasCode = url.includes("?code=");

        // If Github API returns the code parameter
        if (hasCode) {
            const newUrl = url.split("?code=");
            window.history.pushState({}, "", newUrl[0]);
            setData((previous) => ({ ...previous, isLoading: true }));

            const code = newUrl[1];

            const apiUrl = new URL("token", process.env.REACT_APP_BACKEND_URL);
            apiUrl.search = new URLSearchParams({ code: code }).toString();

            fetch(apiUrl.toString())
                .then((response) => response.json())
                .then((tokenData) => {
                    if (!tokenData.status) {
                        tokenData.token && fetchUserData(tokenData.token);
                    }
                })
                .catch((e) => console.error(e));
        }
    }, [state, dispatch, data]);

    if (state.isLoggedIn) {
        console.log("already logged in");
        return <Navigate to="/" />;
    }

    return (
        <>
            <Button
                variant="solid"
                colorScheme={"green"}
                leftIcon={<FaDog />}
                mr={4}
                onClick={onOpen}
            >
                Login
            </Button>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Authenticate</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Box>
                            {data.isLoading ? (
                                <Spinner
                                    mx={"auto"}
                                    thickness="4px"
                                    speed="0.65s"
                                    emptyColor="gray.200"
                                    color="blue.500"
                                    size="xl"
                                />
                            ) : (
                                <Button
                                    mx={"auto"}
                                    mb={3}
                                    colorScheme={"teal"}
                                    leftIcon={<GoMarkGithub />}
                                    as={"a"}
                                    href={`https://github.com/login/oauth/authorize?scope=user&client_id=${client_id}&redirect_uri=${redirect_uri}`}
                                    onClick={() => {
                                        setData({ ...data, errorMessage: "" });
                                    }}
                                >
                                    <span>Login with GitHub</span>
                                </Button>
                            )}
                        </Box>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};

export default Login;
