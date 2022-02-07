import { AspectRatio, chakra, Flex } from "@chakra-ui/react";
import * as React from "react";
import { CardBase } from "../../../../types/game";
import { BoomerDogSocket } from "../../api/socket-client";

/*
 * Card.value takes values between 0 and 13
 * Card.color takes values between 0 and 3
 */

const testHand = [
    { id: 0, value: 9, color: 1 },
    { id: 1, value: 0 },
    { id: 2, value: 2, color: 3 },
    { id: 2, value: 2, color: 3 },
    { id: 2, value: 2, color: 3 },
    { id: 2, value: 2, color: 3 },
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
];

const cardToSvg = (card: CardBase) =>
    `/cards/${VALUE_TO_FILE[card.value]}${
        card.color ? COLOR_TO_FILE[card.color] : ""
    }.svg`;

interface CardsProps {
    socket: BoomerDogSocket;
}
const Cards = ({ socket }: CardsProps) => {
    const [hand, setHand] = React.useState(testHand);
    const [selectedCard, setSelectedCard] = React.useState(10);

    const cardClicked = (i: number) => {
        selectedCard === i
            ? socket.emit("card:clicked", hand[selectedCard])
            : setSelectedCard(i);
    };

    socket.on("cards:update", (payload) => {
        console.log("update cards")
        setHand(payload);
    })

    return (
        <Flex mt={"1em"} justifyContent={"center"}>
            {hand.map((card, i) => (
                <AspectRatio key={i} w={60} ratio={5 / 7}>
                    <chakra.img
                        h={"20px"}
                        // style={{height:"20px"}}
                        // mt={i === selectedCard ? "1em" : "0em"}
                        onClick={() => cardClicked(i)}
                        // mx={1}
                        src={cardToSvg(card)}
                    />
                </AspectRatio>
            ))}
        </Flex>
    );
};

export default Cards;
