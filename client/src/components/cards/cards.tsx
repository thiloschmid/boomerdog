import { AspectRatio, chakra, Flex } from "@chakra-ui/react";
import * as React from "react";
import { CardBase, CardClickedResponse } from "boomerdog-types";
import { BoomerDogSocket } from "../../api/socket-client";

/*
 * Card.value takes values between 0 and 13
 * Card.color takes values between 0 and 3
 */

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

export const cardToSvg = (card: CardBase) =>
    `/cards/${VALUE_TO_FILE[card.value]}${
        typeof card.color !== "undefined" ? COLOR_TO_FILE[card.color] : ""
    }.svg`;

interface CardsProps {
    cards: (CardBase | null)[];
    selectedCard: number | null;
    setSelectedCard: React.Dispatch<React.SetStateAction<number | null>>;
    socket?: BoomerDogSocket;
    hasStarted: boolean;
    isSwapping: boolean;
}
const Cards = ({
    cards,
    hasStarted,
    selectedCard,
    setSelectedCard,
}: CardsProps) => {
    const cardClicked = (i: number) => {
        if (selectedCard === i) {
            setSelectedCard(null);
        } else {
            setSelectedCard(i);
        }
    };

    return (
        <Flex mt={"1em"} justifyContent={"center"}>
            {cards.map(
                (card, i) =>
                    card && (
                        <AspectRatio
                            key={i}
                            w="60"
                            maxW={"8em"}
                            ratio={5 / 7}
                            mb="2em"
                        >
                            <chakra.img
                                mt={i === selectedCard ? "0em" : "1em"}
                                cursor="pointer"
                                onClick={() => cardClicked(i)}
                                // mx={1}
                                src={
                                    hasStarted
                                        ? cardToSvg(card)
                                        : "/cards/card_back.svg"
                                }
                                objectFit="cover"
                            />
                        </AspectRatio>
                    )
            )}
        </Flex>
    );
};

export default Cards;
