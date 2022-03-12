import { chakra } from "@chakra-ui/react";
import { Animate } from "react-move";

const Marble = (props: {
    x: number;
    y: number;
    r: number;
    color: string;
    handleClick?: () => void;
    // handleMouseOver?: () => void;
    // handleMouseOut?: () => void;
}) => (
    <Animate
        show={true}
        start={{ x: props.x, y: props.y }}
        update={{ x: [props.x], y: [props.y], timing: { duration: 1000 } }}
    >
        {(position) => (
            <chakra.circle
                cx={position.x}
                cy={position.y}
                fill={props.color}
                r={props.r}
                onClick={props.handleClick}
                // onMouseOver={props.handleMouseOver}
                // cursor={props.handleClick ? "pointer" : "auto"}
            />
        )}
    </Animate>
);

export default Marble;
