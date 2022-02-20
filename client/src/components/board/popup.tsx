import {
    chakra,
    Box,
    CloseButton,
    Text,
    useColorModeValue,
} from "@chakra-ui/react";

interface PopupProps {
    text: string;
    top: string;
    close?: () => void;
}

const Popup = ({ text, close, top }: PopupProps) => (
    <Box
        borderRadius="md"
        p=".5em"
        pr={close? "2em" : ".5em"}
        bg={useColorModeValue("white", "gray.900")}
        pointerEvents="none"
        position="absolute"
        left="0"
        right="0"
        mx="auto"
        h="max-content"
        w="max-content"
        flexGrow={0}
        top={top}
    >
        {/* // <div style={{display: "block", position: "absolute", backgroundColor:"red", width: "max-content", height:"max-content"}}> */}
        <Text>{text}</Text>
        {close && (
            <CloseButton
                position="absolute"
                top="0"
                right="0"
                onClick={close}
                pointerEvents="auto"
            />
        )}
        {/* // </div> */}
    </Box>
);

export default Popup;
