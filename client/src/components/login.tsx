import * as React from "react";
import { Box, Button, Link, Spinner } from "@chakra-ui/react";
import { Navigate } from "react-router-dom";
import { GoMarkGithub } from "react-icons/go";

import { AuthContext } from "../App";
import { socket } from "../api/socket-client";

const Login = () => {
    const { state, dispatch } = React.useContext(AuthContext);
    const [data, setData] = React.useState({
        errorMessage: "",
        isLoading: false,
    });

    const { client_id, redirect_uri } = state;

    React.useEffect(() => {
        // After requesting Github access, Github redirects back to your app with a code parameter
        const url = window.location.href;
        const hasCode = url.includes("?code=");

        // If Github API returns the code parameter
        if (hasCode) {
            const newUrl = url.split("?code=");
            window.history.pushState({}, "", newUrl[0]);
            setData((previous) => ({ ...previous, isLoading: true }));

            // const requestData = {
            //     code: newUrl[1],
            // };

            const proxy_url =
                state.proxy_url ||
                "https://github.com/login/oauth/access_token";

            // Use code parameter and other parameters to make POST request to proxy_server
            // fetch(proxy_url, {
            //     method: "POST",
            //     body: JSON.stringify(requestData),
            // })
            //     .then((response) => response.json())
            //     .then((data) => {
            //         dispatch(state, {
            //             type: "LOGIN",
            //             payload: { user: data, isLoggedIn: true },
            //         });
            //     })
            //     .catch((error) => {
            //         setData({
            //             isLoading: false,
            //             errorMessage: "Sorry! Login failed",
            //         });
            //     });

            const code = newUrl[1];
            socket.emit("user:authenticate", { code }, (response) => {
                if (!response.status) {
                    dispatch({
                        type: "LOGIN",
                        payload: { user: "", isLoggedIn: true },
                    });
                }
            });

            /*fetch(`${proxy_url}/${code}`)
                .then((response) => response.json())
                .then((data) => {
                    dispatch({
                        type: "LOGIN",
                        payload: { user: data, isLoggedIn: true },
                    });
                    console.log(data);
                })
                .catch((error) => {
                    setData({
                        isLoading: false,
                        errorMessage: "Sorry! Login failed",
                    });
                });

                */
        }
    }, [state, dispatch, data]);

    if (state.isLoggedIn) {
        console.log("already logged in");
        return <Navigate to="/" />;
    }

    return (
        <Box>
            {data.isLoading ? (
                <Spinner
                    thickness="4px"
                    speed="0.65s"
                    emptyColor="gray.200"
                    color="blue.500"
                    size="xl"
                />
            ) : (
                <Button
                    colorScheme={"blackAlpha"}
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
    );
};

export default Login;
