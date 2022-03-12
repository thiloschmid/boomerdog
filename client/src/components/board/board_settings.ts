import { keyframes } from "@chakra-ui/react";
import { boardNodes4 } from "./board_data_4";
import { boardNodes6 } from "./board_data_6";
import { avatarSize } from "./avatar";

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

export const getBoardSettings = (nPlayers: number) => {
    const playerBoxSize = { height: 100, width: 130 };

    const boardNodes = nPlayers === 4 ? boardNodes4 : boardNodes6;

    const getCoords = (
        n: number,
        p?: number,
        m?: number
    ): { x: number; y: number; id: number } => {
        if (n < nPlayers * 16 && n >= 0) {
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

    const BOARD_SIZE =
        nPlayers === 4
            ? { height: 800, width: 800 }
            : { height: 800, width: 800 };

    const STACK_SIZE =
        nPlayers === 4
            ? {
                  width: 100,
                  height: 140,
              }
            : { width: 95, height: 132 };

    const NODE_RADIUS =
        nPlayers === 4 ? { inner: 12, outer: 20 } : { inner: 10, outer: 15 };
    const NODE_STROKEWIDTH = nPlayers === 4 ? 4 : 3;

    const avatarPositions: {
        x: number;
        y: number;
        imagePosition: { x: number; y: number };
        textPosition: "bottom" | "top";
        iconPosition: "right" | "left";
    }[] =
        nPlayers === 4
            ? [
                  // player 0
                  {
                      x: BOARD_SIZE.width - playerBoxSize.width - 10,
                      y: 10,
                      imagePosition: {
                          x: playerBoxSize.width - avatarSize,
                          y: 0,
                      },
                      textPosition: "bottom",
                      iconPosition: "left",
                  },
                  // player 1
                  {
                      x: 10,
                      y: 10,
                      imagePosition: { x: 0, y: 0 },
                      textPosition: "bottom",
                      iconPosition: "right",
                  },
                  // player 2
                  {
                      x: 10,
                      y: BOARD_SIZE.height - playerBoxSize.height - 10,
                      imagePosition: {
                          x: 0,
                          y: playerBoxSize.height - avatarSize,
                      },
                      textPosition: "top",
                      iconPosition: "right",
                  },
                  // player 3
                  {
                      x: BOARD_SIZE.width - playerBoxSize.width - 10,
                      y: BOARD_SIZE.height - playerBoxSize.height - 10,
                      imagePosition: {
                          x: playerBoxSize.width - avatarSize,
                          y: playerBoxSize.height - avatarSize,
                      },
                      textPosition: "top",
                      iconPosition: "left",
                  },
              ]
            : [
                  // player 0
                  {
                      x: BOARD_SIZE.width - playerBoxSize.width - 10,
                      y: 10,
                      imagePosition: {
                          x: playerBoxSize.width - avatarSize,
                          y: 0,
                      },
                      textPosition: "bottom",
                      iconPosition: "left",
                  },
                  // player 1
                  {
                      x: BOARD_SIZE.width / 2 - playerBoxSize.width / 2,
                      y: 10,
                      imagePosition: {
                          x: playerBoxSize.width - avatarSize,
                          y: 0,
                      },
                      textPosition: "bottom",
                      iconPosition: "left",
                  },
                  // player 2
                  {
                      x: 10,
                      y: 10,
                      imagePosition: {
                          x: 0,
                          y: 0,
                      },
                      textPosition: "bottom",
                      iconPosition: "right",
                  },
                  // player 3
                  {
                      x: 10,
                      y: BOARD_SIZE.height - playerBoxSize.height - 10,
                      imagePosition: {
                          x: 0,
                          y: playerBoxSize.height - avatarSize,
                      },
                      textPosition: "top",
                      iconPosition: "right",
                  },
                  // player 4
                  {
                      x: BOARD_SIZE.width / 2 - playerBoxSize.width / 2,
                      y: BOARD_SIZE.height - playerBoxSize.height - 10,
                      imagePosition: {
                          x: 0,
                          y: playerBoxSize.height - avatarSize,
                      },
                      textPosition: "top",
                      iconPosition: "right",
                  },
                  // player 5
                  {
                      x: BOARD_SIZE.width - playerBoxSize.width - 10,
                      y: BOARD_SIZE.height - playerBoxSize.height - 10,
                      imagePosition: {
                          x: playerBoxSize.width - avatarSize,
                          y: playerBoxSize.height - avatarSize,
                      },
                      textPosition: "top",
                      iconPosition: "left",
                  },
              ];

    const COLORS =
        nPlayers === 4
            ? ["red", "yellow.400", "green.600", "blue.600"]
            : [
                  "red",
                  "yellow.400",
                  "purple.400",
                  "green.600",
                  "blue.600",
                  "orange",
              ];

    return {
        pulseAnimation,
        playerBoxSize,
        boardNodes,
        getCoords,
        BOARD_SIZE,
        STACK_SIZE,
        NODE_RADIUS,
        NODE_STROKEWIDTH,
        avatarPositions,
        COLORS,
    };
};
