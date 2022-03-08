import * as React from "react";
import {
    chakra,
    keyframes,
    AspectRatio,
    Box,
    useColorModeValue,
    Button,
    Radio,
    RadioGroup,
    Stack,
} from "@chakra-ui/react";

import { cardToSvg } from "../cards/cards";
import { boardNodes } from "./board_data";
import BoomerdogAvatar, { avatarSize } from "./avatar";
import {
    CardMoves,
    CardBase,
    MarbleMoves,
    GameData,
    GamePhase,
    GameState,
} from "boomerdog-types";
import Popup from "./popup";

// encode moving over nodes with a seven card by adding SEVEN_MOVE_OFFSET to
// the node index
const SEVEN_MOVE_OFFSET = 1000;
const SWAP_MOVE_OFFSET = 300; // same for swaps

const RADIUS = { inner: 12, outer: 20 };
export const BOARD_SIZE = { height: 800, width: 800 };
const NODE_COLORS = ["gray.600", "gray.200"];
const SELECTION_COLOR = "teal.400";

const avatarPositions = [
    { x: BOARD_SIZE.width - avatarSize - 10, y: 10 },
    { x: 10, y: 10 },
    { x: 10, y: BOARD_SIZE.height - avatarSize - 10 },
    {
        x: BOARD_SIZE.width - avatarSize - 10,
        y: BOARD_SIZE.height - avatarSize - 10,
    },
];

const COLORS = ["red", "yellow.400", "green.600", "blue.600"];

const pulse = keyframes`
    from {
        stroke-width: 10px;
        stroke-opacity: 1;
        transform: scale(0);
    }
    to {
        stroke-width: 2;
        stroke-opacity: .4;
        transform: scale(1.2);
    }`;

const pulseAnimation = `${pulse} infinite 1.5s linear`;

export interface BoardProps {
    gameData: GameData;
    gameState: GameState | null;
    marbleLocations: number[][]; // [cards][marbles][moves]
    stack: CardBase[];
    possibleMoves: CardMoves[];
    selectedCardIndex: number | null;
    cards: (CardBase | null)[];
    isActive: boolean;
    playerIndex: number;
    stepsRemaining: number | null; // only relevant for the 7️⃣ card
    remainingMoves: MarbleMoves[];
    moveSelected: (m: number, t: number) => void;
    moveRemaining: (m: number, t: number) => void;
    fold: () => void;
    swap: () => void;
}

const Board = ({
    gameData,
    gameState,
    marbleLocations,
    stack,
    possibleMoves,
    selectedCardIndex,
    cards,
    isActive,
    playerIndex,
    stepsRemaining,
    remainingMoves,
    moveSelected,
    moveRemaining,
    fold,
    swap,
}: BoardProps) => {
    const [popoverIsOpen, setPopoverIsOpen] = React.useState(false);
    const [expandCards, setExpandCards] = React.useState(false);

    // show the possible paths for a given marble, only shown when a card is
    // selected and
    // a) the player is hovering over a marble
    // b) the player clicked on a marble which has multiple possible moves
    const [showMove, setShowMove] = React.useState<number | null>(null);
    const [selectedMarble, setSelectedMarble] =
        React.useState<number | null>(null);
    const [jokerMove, setJokerMove] = React.useState<string>("regular"); // "swap" | "seven" | "regular"

    const marbleClicked = (m: number) => {
        if (stepsRemaining) {
            // handle seven card
            if (remainingMoves[m].length > 1) {
                setPopoverIsOpen(true);
                setSelectedMarble(m);
            } else if (remainingMoves[m][0]) {
                moveRemaining(m, 0);
                setShowMove(null);
                setSelectedMarble(null);
            }
        } else {
            // handle regular moves
            if (selectedCardIndex !== null) {
                if (possibleMoves[selectedCardIndex][m].length > 1) {
                    setPopoverIsOpen(true);
                    setSelectedMarble(m);
                } else if (possibleMoves[selectedCardIndex][m][0]) {
                    moveSelected(m, 0);
                    setShowMove(null);
                    setSelectedMarble(null);
                }
            }
        }
    };

    const targetClicked = (t: number) => {
        console.log(`target ${t} clicked`);
        if (selectedMarble !== null) {
            if (stepsRemaining) {
                // move the rest of the steps 7️⃣
                moveRemaining(selectedMarble, t);
            } else {
                // move normally
                moveSelected(selectedMarble, t);
            }
            setPopoverIsOpen(false);
            setShowMove(null);
            setSelectedMarble(null);
        }
    };

    const BoardNode = (data: { id: number; x: number; y: number }) => (
        // for 4 players: 0 to 3 corresponds to being occupied by the corresponding
        // player 4 means unoccupied
        <chakra.circle
            stroke={useColorModeValue(NODE_COLORS[0], NODE_COLORS[1])}
            strokeWidth={".3em"}
            fillOpacity="0"
            key={`${data.id}-${data.x} ${data.y}`}
            className="step"
            id={"step-" + data.id}
            cx={data.x}
            cy={data.y}
            r={RADIUS.inner}
        />
    );

    const getCoords = (
        n: number,
        p?: number,
        m?: number
    ): { x: number; y: number; id: number } => {
        if (n <= 64 && n >= 0) {
            return boardNodes.nodes[n];
        }
        if (n === -1 && typeof m !== "undefined" && typeof p !== "undefined") {
            return boardNodes.bases[4 * p + m];
        } else {
            //(n >= 100)
            // 100 -> 0, 110 -> 4, 120 -> 8
            const i = ((n - 100) % 10) + 4 * Math.floor((n - 100) / 10);
            return boardNodes.endzones[i];
        }
    };

    const OccupiedNode = (data: {
        id: number;
        x: number;
        y: number;
        color: number;
        p: number;
        m: number;
    }) => (
        <chakra.circle
            cursor="pointer"
            onMouseOver={() => {
                if (data.p === playerIndex) {
                    setShowMove(data.m);
                    if (selectedMarble !== null && selectedMarble !== data.m) {
                        setSelectedMarble(null);
                    }
                }
            }}
            onMouseOut={() => setShowMove(null)}
            onClick={
                data.p === playerIndex
                    ? () => {
                          marbleClicked(data.m);
                      }
                    : undefined
            }
            fill={COLORS[data.color]}
            stroke={SELECTION_COLOR}
            strokeWidth={
                data.p === playerIndex && data.m === selectedMarble ? 5 : 0
            }
            key={`occupied-${data.x} ${data.y}`}
            className="step"
            cx={data.x}
            cy={data.y}
            r={
                data.color === playerIndex
                    ? RADIUS.inner - 0.5
                    : RADIUS.inner - 0.5
            }
        />
    );

    const EndzoneNode = (data: {
        id: number;
        x: number;
        y: number;
        color: number;
    }) => (
        <chakra.circle
            // stroke={COLORS[data.color]}
            stroke={useColorModeValue(NODE_COLORS[0], NODE_COLORS[1])}
            strokeWidth={".3em"}
            fill="none"
            className="step"
            key={`endzone-${data.x} ${data.y}`}
            cx={data.x}
            cy={data.y}
            r={RADIUS.inner}
        />
    );
    const BaseNode = (data: {
        id: number;
        x: number;
        y: number;
        color: number;
    }) => (
        <chakra.circle
            // stroke={COLORS[data.color]}
            stroke={useColorModeValue(NODE_COLORS[0], NODE_COLORS[1])}
            strokeWidth={".3em"}
            fill="none"
            className="step"
            key={`base-${data.x} ${data.y}`}
            cx={data.x}
            cy={data.y}
            r={RADIUS.inner}
        />
    );

    const Outline = (data: { x: number; y: number; color: number }) => (
        <chakra.circle
            stroke={COLORS[data.color]}
            strokeWidth={".3em"}
            fill="none"
            className={"out out-" + data.color}
            key={`outline-${data.x} ${data.y}`}
            cx={data.x}
            cy={data.y}
            r={RADIUS.outer}
        />
    );

    interface PossibleMoveMarkerProps {
        isVisible: boolean;
        data: { x: number; y: number; id: number; r?: number; index?: number };
    }
    const PossibleMovePathMarker = ({
        isVisible,
        data,
    }: PossibleMoveMarkerProps) => (
        <chakra.circle
            visibility={isVisible ? "visible" : "hidden"}
            pointerEvents={isVisible ? "auto" : "none"}
            fill={SELECTION_COLOR}
            cx={data.x}
            cy={data.y}
            r={data.r || 3}
            key={"move-marker" + data.x + " " + data.y}
        />
    );

    const PossibleMoveTargetMarker = ({
        isVisible,
        data,
    }: PossibleMoveMarkerProps) => (
        <g
            transform={`translate(${data.x},${data.y})`}
            visibility={isVisible ? "data." : "hidden"}
            pointerEvents={isVisible ? "auto" : "none"}
        >
            <chakra.circle
                stroke={SELECTION_COLOR}
                strokeWidth={"0"}
                fill="none"
                // cx={data.x}
                // cy={data.y}
                cx={0}
                cy={0}
                r={RADIUS.inner}
                animation={pulseAnimation}
            />
            <chakra.circle
                // stroke={"teal.400"}
                // strokeWidth={".3em"}
                fill={SELECTION_COLOR}
                opacity={0}
                onClick={() => data.index && targetClicked(data.index)}
                // cx={data.x}
                // cy={data.y}
                cursor="pointer"
                cx={0}
                cy={0}
                r={RADIUS.outer + 3}
            />
        </g>
    );

    const moveShouldBeShown = (move: number[]) => {
        if (
            selectedCardIndex !== null &&
            cards[selectedCardIndex]?.value === 0
        ) {
            if (move[0] >= SEVEN_MOVE_OFFSET) {
                return jokerMove === "seven";
            } else if (move[0] >= SWAP_MOVE_OFFSET) {
                console.log(move[0]);
                return jokerMove === "swap";
            } else {
                return jokerMove === "regular";
            }
        }
        return true;
    };

    const renderMove = (move: number[], i: number) => {
        const isVisible = moveShouldBeShown(move);
        if (move[0] === -1) {
            move = [move[1]];
        } else if (move[0] >= SEVEN_MOVE_OFFSET) {
            // a move with a 7
            move = move.map((n) => n - SEVEN_MOVE_OFFSET);
        } else if (move[0] >= SWAP_MOVE_OFFSET) {
            move = [move[0] - SWAP_MOVE_OFFSET];
        }
        return (
            <React.Fragment key={`${i}`}>
                {move !== null &&
                    move.map((n, j) => (
                        <PossibleMovePathMarker
                            key={`path-marker-${i}-${j}`}
                            {...{
                                data: getCoords(n),
                                isVisible: isVisible,
                            }}
                        />
                    ))}
                {move !== null && (
                    <PossibleMoveTargetMarker
                        key={`target-marker ${i}`}
                        {...{
                            data: {
                                ...getCoords(move[move.length - 1]),
                                index: i,
                            },
                            isVisible: isVisible,
                        }}
                    />
                )}
            </React.Fragment>
        );
    };

    return (
        <Box>
            <AspectRatio
                mt="0"
                mx="auto"
                maxW="800px"
                ratio={1}
                bg={useColorModeValue("gray.100", "gray.700")}
            >
                <>
                    <svg
                        viewBox={`0 0 ${BOARD_SIZE.height} ${BOARD_SIZE.width}`}
                    >
                        {/* Place the players */}
                        {avatarPositions.map((pos, i) => (
                            <BoomerdogAvatar
                                key={`avatar-${i}`}
                                avatarUrl={
                                    i < gameData.players.length
                                        ? gameData.players[i].avatarUrl
                                        : "/dog.jpg"
                                }
                                // avatars[i]}
                                player={gameData.players[i]}
                                position={pos}
                                isActive={
                                    // show the player is active if its their turn
                                    gameState?.gamePhase ===
                                        GamePhase.Playing ||
                                    gameState?.gamePhase ===
                                        GamePhase.WaitingForSevenMove
                                        ? i === gameState.activePlayerIndex
                                        : false
                                }
                                isMe={i === playerIndex}
                                color={COLORS[i]}
                            />
                        ))}

                        {/* build steps for the path around the board */}
                        {boardNodes.nodes.map((data) => (
                            <BoardNode
                                key={`boardnode-${data.x}-${data.y}`}
                                {...data}
                            />
                        ))}
                        {/* draw homes */}
                        {boardNodes.bases.map((data) => (
                            <BaseNode
                                key={`basenode-${data.x}-${data.y}`}
                                {...data}
                            />
                        ))}
                        {/* draw houses */}
                        {boardNodes.endzones.map((data) => (
                            <EndzoneNode
                                key={`endzonenode-${data.x}-${data.y}`}
                                {...data}
                            />
                        ))}
                        {/* draw outer circles */}
                        {boardNodes.outlines.map((data) => (
                            <Outline
                                key={`outlinenode-${data.x}-${data.y}`}
                                {...data}
                            />
                        ))}
                        {marbleLocations.map((nodes, p) =>
                            nodes.map((n, m) => (
                                <OccupiedNode
                                    key={`${p} ${m}`}
                                    {...{
                                        ...getCoords(n, p, m),
                                        color: p,
                                        p: p,
                                        m: m,
                                    }}
                                />
                            ))
                        )}
                        {stepsRemaining
                            ? remainingMoves.map(
                                  (moves, m) =>
                                      (showMove === m ||
                                          selectedMarble === m) &&
                                      moves !== null &&
                                      moves.map(
                                          (move, i) =>
                                              move && renderMove(move, i)
                                      )
                              )
                            : possibleMoves?.length &&
                              selectedCardIndex !== null &&
                              possibleMoves[selectedCardIndex] !== null &&
                              possibleMoves[selectedCardIndex]!.map(
                                  (moves, m) =>
                                      (showMove === m ||
                                          selectedMarble === m) &&
                                      moves !== null &&
                                      moves.map(
                                          (move, i) =>
                                              move &&
                                              isActive &&
                                              renderMove(move, i)
                                      )
                              )}

                        {stack.map((card, i) =>
                            i === stack.length - 1 ? (
                                // render the top card
                                <image
                                    href={cardToSvg(card)}
                                    cursor="pointer"
                                    onClick={() => setExpandCards(!expandCards)}
                                    x="340"
                                    y="316"
                                    width="120"
                                    height="168"
                                    key={`stack-card-${i}`}
                                />
                            ) : (
                                // render the remaining cards only if expanded
                                expandCards && (
                                    <image
                                        x={340 - 30 * (stack.length - 1 - i)}
                                        y="316"
                                        width="120"
                                        height="168"
                                        href={cardToSvg(card)}
                                        key={`stack-card-${i}`}
                                    />
                                )
                            )
                        )}
                    </svg>
                    <Box position="relative" pointerEvents="none">
                        {stepsRemaining !== null && (
                            <Popup
                                top="1%"
                                text={`Complete the remaining ${stepsRemaining} moves`}
                            />
                        )}
                        {popoverIsOpen && (
                            <Popup
                                top="30%"
                                text={`Select the target node`}
                                close={() => {
                                    setPopoverIsOpen(false);
                                    setSelectedMarble(null);
                                }}
                            />
                        )}
                        {gameState?.gamePhase === GamePhase.Playing &&
                            isActive && (
                                <Button
                                    pointerEvents={"auto"}
                                    position="absolute"
                                    bottom="30%"
                                    colorScheme="red"
                                    m={0}
                                    onClick={fold}
                                >
                                    Fold
                                </Button>
                            )}
                        {gameState?.gamePhase === GamePhase.Swapping && (
                            <>
                                <Popup
                                    top="30%"
                                    text={`Choose a card to exchange with your team mate`}
                                />
                                <Button
                                    pointerEvents={"auto"}
                                    position="absolute"
                                    bottom="30%"
                                    colorScheme="teal"
                                    m={0}
                                    onClick={swap}
                                    disabled={selectedCardIndex === null}
                                >
                                    Choose card
                                </Button>
                            </>
                        )}
                        {isActive &&
                            selectedCardIndex !== null &&
                            cards[selectedCardIndex]?.value === 0 && (
                                <>
                                    <Popup top="30%" text={`Specify move`}>
                                        <RadioGroup
                                            onChange={setJokerMove}
                                            value={jokerMove}
                                        >
                                            <Stack
                                                direction="row"
                                                pointerEvents="auto"
                                            >
                                                <Radio value="regular">
                                                    Regular/out
                                                </Radio>
                                                <Radio value="swap">Swap</Radio>
                                                <Radio value="seven">7</Radio>
                                            </Stack>
                                        </RadioGroup>
                                    </Popup>
                                </>
                            )}
                    </Box>
                </>
            </AspectRatio>
        </Box>
    );
};

export default Board;
