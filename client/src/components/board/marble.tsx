import { chakra } from "@chakra-ui/react";
import { Animate } from "react-move";

const Marble = (props: {
    x: number;
    y: number;
    r: number;
    color: string;
    selected: boolean;
    handleClick?: () => void;
    handleMouseOver?: () => void;
    handleMouseOut?: () => void;
}) => (
    <Animate
        // show={true}
        start={{ x: [props.x], y: [props.y] }}
        update={{ x: [props.x], y: [props.y] }}
    >
        {(position) => (
            <chakra.circle
                cx={position.x}
                cy={position.y}
                fill={props.color}
                stroke={"cyan"}
                strokeWidth={props.selected ? 3 : 0}
                r={props.r}
                onClick={props.handleClick}
                onMouseOver={props.handleMouseOver}
                onMouseOut={props.handleMouseOut}
                cursor={props.handleClick ? "pointer" : "auto"}
            />
        )}
    </Animate>
);

export default Marble;
