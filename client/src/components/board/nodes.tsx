import { chakra, useColorModeValue } from "@chakra-ui/react";

import { COLORS } from "./board";

export const RADIUS = { inner: 12, outer: 20 };
export const NODE_COLORS = ["gray.600", "gray.200"];

export const BoardNode = (data: { id: number; x: number; y: number }) => (
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

export const EndzoneNode = (data: {
    id: number;
    x: number;
    y: number;
    color: number;
}) => (
    <chakra.circle
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
export const BaseNode = (data: {
    id: number;
    x: number;
    y: number;
    color: number;
}) => (
    <chakra.circle
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

export const Outline = (data: { x: number; y: number; color: number }) => (
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
