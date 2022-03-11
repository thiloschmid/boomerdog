import { chakra, useColorModeValue } from "@chakra-ui/react";

import { NODE_COLORS } from "./board";

export const BoardNode = (data: {
    id: number;
    x: number;
    y: number;
    r: number;
    strokeWidth: number;
}) => (
    // for 4 players: 0 to 3 corresponds to being occupied by the corresponding
    // player 4 means unoccupied
    <chakra.circle
        stroke={useColorModeValue(NODE_COLORS[0], NODE_COLORS[1])}
        strokeWidth={data.strokeWidth}
        fillOpacity="0"
        key={`${data.id}-${data.x} ${data.y}`}
        className="step"
        id={"step-" + data.id}
        cx={data.x}
        cy={data.y}
        r={data.r}
    />
);

export const EndzoneNode = (data: {
    id: number;
    x: number;
    y: number;
    color: number;
    r: number;
    strokeWidth: number;
}) => (
    <chakra.circle
        stroke={useColorModeValue(NODE_COLORS[0], NODE_COLORS[1])}
        strokeWidth={data.strokeWidth}
        fill="none"
        className="step"
        key={`endzone-${data.x} ${data.y}`}
        cx={data.x}
        cy={data.y}
        r={data.r}
    />
);
export const BaseNode = (data: {
    id: number;
    x: number;
    y: number;
    color: number;
    r: number;
    strokeWidth: number;
}) => (
    <chakra.circle
        stroke={useColorModeValue(NODE_COLORS[0], NODE_COLORS[1])}
        strokeWidth={data.strokeWidth}
        fill="none"
        className="step"
        key={`base-${data.x} ${data.y}`}
        cx={data.x}
        cy={data.y}
        r={data.r}
    />
);

export const Outline = (data: {
    x: number;
    y: number;
    color: string;
    r: number;
    strokeWidth: number;
}) => (
    <chakra.circle
        stroke={data.color}
        strokeWidth={data.strokeWidth}
        fill="none"
        className={"out out-" + data.color}
        key={`outline-${data.x} ${data.y}`}
        cx={data.x}
        cy={data.y}
        r={data.r}
    />
);
