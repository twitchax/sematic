import styled from "@emotion/styled";
import { Handle } from "reactflow";
import theme from "src/theme/new";
import { createContext } from "react";
import noop from "lodash/noop";

export const LEFT_NODE_MAX_WIDTH = 250;

export enum NodeTypes {
    LEAF = "leafNode",
    COMPOUND = "compoundNode",
}

export const StyledHandle = styled(Handle, {
    shouldForwardProp: (prop) => prop !== "color",
}) <{
    color?: string;
}>`
    height: 12px;
    width: 12px;
    background-color: ${(props) => props.color || theme.palette.success.main};
`;

export const DagViewServiceContext = createContext<{
    onNodeClick: (nodeId: string) => void;
}>({ onNodeClick: noop });
