import * as React from "react";
import { chakra } from "@chakra-ui/react";
import { User } from "boomerdog-types";

export const avatarSize = 100;
const avatarStrokeWidth = 6;
const avatarRadius = avatarSize / 2 - avatarStrokeWidth;

const pathlength = 295.31; // 2 * pi * 47

interface AvatarProps {
    avatarUrl: string;
    player: User;
    position: { x: number; y: number };
    color: string;
    isActive: boolean;
    isMe: boolean;
}
const Avatar = ({
    avatarUrl,
    position,
    color,
    isActive,
    isMe,
}: AvatarProps) => {
    return (
        <svg x={position.x} y={position.y}>
            <defs>
                <clipPath id="circleView">
                    <circle
                        cx={avatarSize / 2}
                        cy={avatarSize / 2}
                        r={avatarRadius}
                    />
                </clipPath>
            </defs>
            <g transform={`translate(${avatarSize / 2},${avatarSize / 2})`}>
                <g>
                    <animateTransform
                        attributeName="transform"
                        attributeType="XML"
                        type="rotate"
                        from="0 0 0"
                        to="360 0 0"
                        dur="5s"
                        repeatCount="indefinite"
                    />
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
        </svg>
    );
};

export default Avatar;
