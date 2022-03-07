import * as React from "react";
import { Dispatch } from "react";
import {
    Button,
    Input,
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    useDisclosure,
    RadioGroup,
    HStack,
    Radio,
    FormLabel,
    FormErrorMessage,
    FormControl,
} from "@chakra-ui/react";
import { Form, Formik, FormikHelpers } from "formik";

import { BoomerDogSocket } from "../api/socket-client";
import { User, CreateGameIoResponse } from "boomerdog-types";

interface CreateGameDrawerProps {
    socket?: BoomerDogSocket;
    player: User;
}
const CreateGameDrawer = ({ socket, player }: CreateGameDrawerProps) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const initialValues = {
        gameName: `${player.name}'s game`,
    };
    const [nPlayers, setNPlayers] = React.useState("4");
    const btnRef = React.useRef(null);

    const submitCreateGame = (
        values: typeof initialValues,
        helper: FormikHelpers<typeof initialValues>
    ) => {
        player.userId &&
            socket &&
            socket.emit(
                "game:create",
                {
                    gameName: values.gameName,
                    nPlayers: parseInt(nPlayers),
                    userId: player.userId,
                },
                (response: CreateGameIoResponse) => {
                    if (!response.status) {
                        onClose();
                    }
                }
            );
    };

    return (
        <>
            <Button ref={btnRef} colorScheme="teal" onClick={onOpen}>
                Create game
            </Button>
            <Drawer
                isOpen={isOpen}
                placement="right"
                onClose={onClose}
                finalFocusRef={btnRef}
            >
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>Create a game</DrawerHeader>
                    <DrawerBody>
                        <Formik
                            initialValues={initialValues}
                            onSubmit={submitCreateGame}
                            validate={(values: typeof initialValues) => {
                                const errors: {
                                    gameName?: string | undefined;
                                } = {};
                                if (!values.gameName) {
                                    errors.gameName = "Provide a game name";
                                }
                                return errors;
                            }}
                        >
                            {({
                                values,
                                errors,
                                handleChange,
                                touched,
                                isSubmitting,
                            }) => (
                                <Form>
                                    <FormControl
                                        isInvalid={
                                            !!errors.gameName &&
                                            touched.gameName
                                        }
                                    >
                                        <FormLabel htmlFor="gameName">
                                            Game name
                                        </FormLabel>
                                        <Input
                                            autoFocus
                                            id="gameName"
                                            name="gameName"
                                            value={values.gameName}
                                            onChange={handleChange}
                                        />
                                        <FormErrorMessage>
                                            {errors.gameName}
                                        </FormErrorMessage>
                                    </FormControl>
                                    <FormLabel mt={2} htmlFor="nPlayers">
                                        Board size
                                    </FormLabel>
                                    <RadioGroup
                                        id="nPlayers"
                                        name="nPlayers"
                                        value={nPlayers}
                                        onChange={setNPlayers}
                                    >
                                        <HStack>
                                            <Radio value="4">{"4"}</Radio>
                                            <Radio value="6">{"6"}</Radio>
                                        </HStack>
                                    </RadioGroup>
                                    <HStack mt={2}>
                                        <Button
                                            type="submit"
                                            colorScheme="teal"
                                            isLoading={isSubmitting}
                                        >
                                            Create game
                                        </Button>
                                        <Button ml={2}>Cancel</Button>
                                    </HStack>
                                </Form>
                            )}
                        </Formik>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    );
};

export default CreateGameDrawer;
