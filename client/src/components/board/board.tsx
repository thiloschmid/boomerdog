import * as React from "react";
import { chakra, Box, AspectRatio } from "@chakra-ui/react";

import { BoomerDogSocket } from "../../api/socket-client";

import { boardNodes } from "./board_data";

const RADIUS = { inner: 12, outer: 18 };
const BOARD_SIZE = { height: 800, width: 800 };
const STROKE_WIDTH = ".2em";

const COLORS = ["red", "yellow.400", "green.600", "blue.600"];

const marbleLocations = [
    [100, 101, 102, 103],
    [110, 111, 112, 113],
    [120, 121, 122, 123],
    [130, 131, 132, 133],
];

interface BoardProps {
    nPlayers: number;
    playerIndex: number;
    socket?: BoomerDogSocket;
}
const Board = ({ socket, playerIndex }: BoardProps) => {
    const [boardData, setBoardData] =
        React.useState<number[][]>(marbleLocations);

    const boardClicked = () => {};

    const nodeClicked = (n: number) => {
        console.log(`node ${n} clicked`);
        socket && socket.emit("board:node:clicked", n);
    };

    const marbleClicked = (n: number) => {
        console.log(`node ${n} clicked`);
        socket && socket.emit("board:marble:clicked", n);
    };

    socket &&
        socket.on("board:update", (payload) => {
            console.log("update board");
            setBoardData(payload);
        });

    const BoardNode = (data: { id: number; x: number; y: number }) => (
        // for 4 players: 0 to 3 corresponds to being occupied by the corresponding
        // player 4 means unoccupied
        <chakra.circle
            onClick={() => nodeClicked(data.id)}
            stroke={"gray.600"}
            strokeWidth={".3em"}
            fillOpacity="0"
            key={data.id}
            className="step"
            id={"step-" + data.id}
            cx={data.x}
            cy={data.y}
            r={RADIUS.inner}
        />
    );

    const OccupiedNode = (data: {
        id: number;
        x: number;
        y: number;
        color: number;
    }) => (
        <chakra.circle
            onClick={() => marbleClicked(data.id)}
            fill={COLORS[data.color]}
            key={"occupied" + data.x + " " + data.y}
            className="step"
            cx={data.x}
            cy={data.y}
            r={data.color===playerIndex ? RADIUS.inner +4 : RADIUS.inner -1}
        />
    );

    const EndzoneNode = (data: {
        id: number;
        x: number;
        y: number;
        color: number;
    }) => (
        <chakra.circle
            stroke={COLORS[data.color]}
            strokeWidth={".3em"}
            fill="none"
            className="step"
            id={"house" + data.color + "-" + data.id}
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
            stroke={COLORS[data.color]}
            strokeWidth={".3em"}
            fill="none"
            className="step"
            id={"home" + data.color + "-" + data.id}
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
            cx={data.x}
            cy={data.y}
            r={RADIUS.outer}
        />
    );
    return (
        <AspectRatio
            mt="2em"
            mx="auto"
            w="800px"
            maxW="1000px"
            ratio={1}
            bg="gray.100"
        >
            <svg
                onClick={boardClicked}
                viewBox={`0 0 ${BOARD_SIZE.height} ${BOARD_SIZE.width}`}
            >
                {/* build steps for the path around the board */}
                {boardNodes.nodes.map((data) => (
                    <BoardNode key={data.id} {...data} />
                ))}
                {/* draw homes */}
                {boardNodes.bases.map((data) => (
                    <BaseNode key={data.id} {...data} />
                ))}
                {/* draw houses */}
                {boardNodes.endzones.map((data) => (
                    <EndzoneNode key={data.id} {...data} />
                ))}
                {/* draw outer circles */}
                {boardNodes.outlines.map((data) => (
                    <Outline key={`outline-${data.x}-${data.y}`} {...data} />
                ))}
                {boardData.map((marbles, i) =>
                    marbles.map((m, j) => {
                        if (m <= 64 && m >= 0) {
                            return (
                                <OccupiedNode
                                    key={`${i} ${j}`}
                                    {...{
                                        ...boardNodes.nodes[m],
                                        color: i,
                                    }}
                                />
                            );
                        } else if (m === -1) {
                            return (
                                <OccupiedNode
                                    key={`${i} ${j}`}
                                    {...{
                                        ...boardNodes.bases[4 * i + j],
                                        color: i,
                                    }}
                                />
                            );
                        } else if (m >= 100) {
                            return (
                                <OccupiedNode
                                    key={`${i} ${j}`}
                                    {...{
                                        ...boardNodes.endzones[4 * i + j],
                                        color: i,
                                    }}
                                />
                            );
                        }
                    })
                )}
            </svg>
        </AspectRatio>
    );
};

export default Board;
