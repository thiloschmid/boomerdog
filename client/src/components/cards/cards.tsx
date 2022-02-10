import { AspectRatio, chakra, Flex } from "@chakra-ui/react";
import * as React from "react";
import { CardBase } from "../../../../types/game";
import { BoomerDogSocket } from "../../api/socket-client";

/*
 * Card.value takes values between 0 and 13
 * Card.color takes values between 0 and 3
 */

const placeHolderCards = [
    { id: 0, value: 14 },
    { id: 0, value: 14 },
    { id: 0, value: 14 },
    { id: 0, value: 14 },
    { id: 0, value: 14 },
    { id: 0, value: 14 },
] as CardBase[];

const COLOR_TO_FILE = ["S", "D", "H", "C"];
const VALUE_TO_FILE = [
    "joker",
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "card_back",
];

const cardToSvg = (card: CardBase) =>
    `/cards/${VALUE_TO_FILE[card.value]}${
        typeof card.color !== "undefined" ? COLOR_TO_FILE[card.color] : ""
    }.svg`;

interface CardsProps {
    socket?: BoomerDogSocket;
    hasStarted: boolean;
}
const Cards = ({ socket, hasStarted }: CardsProps) => {
    const [hand, setHand] =
        React.useState<(CardBase | null)[]>(placeHolderCards);

    const cardClicked = (i: number) => {
        console.log("card clicked", Boolean(socket))
        socket && socket.emit("card:clicked", i, (response: CardClickedResponse) => {});
    };

    socket &&
        socket.on("cards:update", (payload) => {
            console.log("update cards");
            setHand(payload);
        });

    return (
        <Flex mt={"1em"} justifyContent={"center"}>
            {hand.map(
                (card, i) =>
                    card && (
                        <AspectRatio key={i} w={60} ratio={5 / 7}>
                            <chakra.img
                                h={"20px"}
                                // style={{height:"20px"}}
                                // mt={i === selectedCard ? "1em" : "0em"}
                                onClick={() => cardClicked(i)}
                                // mx={1}
                                src={
                                    hasStarted
                                        ? cardToSvg(card)
                                        : "/cards/card_back.svg"
                                }
                            />
                        </AspectRatio>
                    )
            )}
        </Flex>
    );
};

export default Cards;
