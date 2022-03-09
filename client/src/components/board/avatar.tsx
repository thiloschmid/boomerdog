import * as React from "react";
import { chakra, useColorModeValue } from "@chakra-ui/react";
import { User } from "boomerdog-types";
import { DiscardIcon, ExchangeIcon } from "./icons";

export const avatarSize = 80;
const avatarStrokeWidth = 6;
const avatarRadius = avatarSize / 2 - avatarStrokeWidth;
const textHeight = 15;
const iconSize = 30;

const pathlength = 2 * Math.PI * (avatarRadius - 3);

interface AvatarProps {
    size: { width: number; height: number };
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
    const imagePosition = [
        { x: size.width - avatarSize, y: 0 },
        { x: 0, y: 0 },
        { x: 0, y: size.height - avatarSize },
        { x: size.width - avatarSize, y: size.height - avatarSize },
    ][position.index];

    const textPosition = [
        {
            x: size.width - avatarSize / 2,
            y: size.height - 5,
            anchor: "middle",
        },
        { x: avatarSize / 2, y: size.height - 5, anchor: "middle" },
        { x: avatarSize / 2, y: textHeight, anchor: "middle" },
        {
            x: size.width - avatarSize / 2,
            y: textHeight,
            anchor: "middle",
        },
    ][position.index];

    const iconColor = useColorModeValue("#2D3748", "#EDF2F7");

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
            </g>
            {/* 📛 player name */}
            <text
                fontWeight="bold"
                height={textHeight}
                x={textPosition.x}
                y={textPosition.y}
                fill={useColorModeValue("#2D3748", "#EDF2F7")}
                textAnchor={textPosition.anchor}
            >
                {player?.name
                    ? player.name.length > 10
                        ? player.name.slice(0, 11)
                        : player.name
                    : "QAI"}
            </text>
            {/* icons */}
            <g
                transform={`translate(${
                    position.index === 2 || position.index === 1
                        ? size.width - iconSize
                        : 0
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
                        <image
                            x={0}
                            y={size.height / 2 - iconSize / 2}
                            width={iconSize}
                            height={iconSize}
                            opacity={1}
                            href="cards/card_back.svg"
                        />
                        <text
                            fontWeight="bold"
                            textAnchor="left"
                            y={size.height / 2 + textHeight / 2}
                            x={10}
                            height={textHeight}
                            fill="#2D3748"
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
