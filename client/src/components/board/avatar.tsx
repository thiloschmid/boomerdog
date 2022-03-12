import * as React from "react";
import { chakra, useColorModeValue } from "@chakra-ui/react";
import { User } from "boomerdog-types";
import { DiscardIcon, ExchangeIcon } from "./icons";

export const avatarSize = 80;
const avatarStrokeWidth = 6;
const avatarRadius = avatarSize / 2 - avatarStrokeWidth;
export const avatarTextHeight = 15;
const iconSize = 30;

const pathlength = 2 * Math.PI * (avatarRadius - 3);

interface AvatarProps {
    size: { width: number; height: number };
    imagePosition: { x: number; y: number };
    textPosition: "top" | "bottom";
    iconPosition: "right" | "left";
    avatarUrl: string;
    player: User;
    position: { x: number; y: number; index: number };
    color: string;
    isActive: boolean;
    isMe: boolean;
    swapIcon: { show: boolean; swapCompleted: boolean };
    hasFolded?: boolean;
    cardsIcon: { show: boolean; number: number };
}
const Avatar = ({
    size,
    imagePosition,
    textPosition,
    iconPosition,
    player,
    avatarUrl,
    position,
    color,
    isActive,
    isMe,
    swapIcon,
    hasFolded,
    cardsIcon,
}: AvatarProps) => {
    const iconColor = useColorModeValue("#2D3748", "#EDF2F7");
    const textColor = useColorModeValue("#EDF2F7", "#2D3748");

    return (
        <svg
            x={position.x}
            y={position.y}
            width={size.width}
            height={size.height}
        >
            <defs>
                <clipPath id="circleView">
                    <circle
                        cx={avatarSize / 2}
                        cy={avatarSize / 2}
                        r={avatarRadius}
                    />
                </clipPath>
            </defs>
            {/* 📷 image and animation */}
            <g transform={`translate(${imagePosition.x},${imagePosition.y})`}>
                <g transform={`translate(${avatarSize / 2},${avatarSize / 2})`}>
                    <g>
                        {isActive && (
                            <animateTransform
                                attributeName="transform"
                                attributeType="XML"
                                type="rotate"
                                from="0 0 0"
                                to="360 0 0"
                                dur="5s"
                                repeatCount="indefinite"
                            />
                        )}
                        <chakra.circle
                            strokeDasharray={
                                isActive
                                    ? `0 0 ${pathlength / 7} ${pathlength / 42}`
                                    : undefined
                            }
                            fill="none"
                            strokeDashoffset={0}
                            stroke={color}
                            strokeWidth={avatarStrokeWidth}
                            // animation={spinAnimation}
                            // cx={avatarSize / 2}
                            // cy={avatarSize / 2}
                            cx={0}
                            cy={0}
                            r={avatarRadius + avatarStrokeWidth / 2}
                        />
                    </g>
                </g>
                <image
                    width={avatarSize}
                    height={avatarSize}
                    href={avatarUrl}
                    clipPath={"url(#circleView"}
                />
                {/* 📛 player name */}
                <text
                    fontWeight="bold"
                    height={avatarTextHeight}
                    // x={textPosition.x}
                    x={avatarSize / 2}
                    y={
                        textPosition === "top"
                            ? -5
                            : avatarSize + avatarTextHeight + 5
                    }
                    fill={useColorModeValue("#2D3748", "#EDF2F7")}
                    // textAnchor={textPosition.anchor}
                    textAnchor="middle"
                >
                    {player?.name
                        ? player.name.length > 10
                            ? player.name.slice(0, 11)
                            : player.name
                        : "AI"}
                </text>
            </g>
            {/* icons */}
            <g
                transform={`translate(${
                    iconPosition === "right" ? size.width - iconSize : 0
                },0)`}
            >
                {/* swap indicator */}
                {swapIcon.show && (
                    <g
                        transform={`translate(0,${
                            size.height / 2 - iconSize / 2
                        })`}
                    >
                        <ExchangeIcon
                            color={iconColor}
                            width={iconSize}
                            height={iconSize}
                        />
                        {!swapIcon.swapCompleted && (
                            <animate
                                attributeName="opacity"
                                values="0.2;.8;0.2"
                                dur="2s"
                                repeatCount="indefinite"
                            />
                        )}
                    </g>
                )}
                {/* show number of cards */}
                {cardsIcon.show && (
                    <>
                        {/* <image
                            x={0}
                            y={size.height / 2 - iconSize / 2}
                            width={iconSize}
                            height={iconSize}
                            opacity={1}
                            href="cards/card_back.svg"
                        /> */}
                        <chakra.rect
                            x={0}
                            y={size.height / 2 - iconSize / 2}
                            width={(iconSize * 5) / 7}
                            height={iconSize}
                            opacity={1}
                            fill={iconColor}
                            rx={3}
                        ></chakra.rect>
                        <text
                            fontWeight="bold"
                            textAnchor="middle"
                            y={size.height / 2 + avatarTextHeight/2 - 2}
                            x={11}
                            height={avatarTextHeight}
                            fill={textColor}
                        >
                            {cardsIcon.number}
                        </text>
                    </>
                )}
                {/* show fold indicator */}
                {hasFolded && (
                    <g
                        transform={`translate(0,${
                            size.height / 2 - iconSize / 2
                        })`}
                    >
                        <DiscardIcon
                            color={iconColor}
                            width={iconSize}
                            height={iconSize}
                        />
                    </g>
                    // <image
                    //     x={0}
                    //     y={size.height / 2 - iconSize / 2}
                    //     width={iconSize}
                    //     height={iconSize}
                    //     opacity={1}
                    //     href="icons/card-discard.svg"
                    // />
                )}
            </g>
        </svg>
    );
};

export default Avatar;
