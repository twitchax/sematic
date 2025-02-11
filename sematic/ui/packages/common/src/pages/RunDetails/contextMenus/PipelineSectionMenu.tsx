import ContextMenu from "src/component/ContextMenu";
import { useMemo } from "react";
import { useRootRunContext } from "src/context/RootRunContext";
import { useNavigate } from "react-router-dom";
import { getPipelineRunsPattern } from "src/hooks/runHooks";
import { useRunDetailsSelectionContext } from "src/context/RunDetailsSelectionContext";

const ANCHOR_OFFSET = {x: 13, y: -11};
interface PipelineSectionActionMenuProps {
    anchorEl: HTMLElement | null;
}

function PipelineSectionActionMenu(props: PipelineSectionActionMenuProps) {
    const { anchorEl } = props;

    const { rootRun } = useRootRunContext();
    const navigate = useNavigate();
    const { setSelectedPanel } = useRunDetailsSelectionContext();


    const commands = useMemo(() => {
        return [
            {
                title: "View all runs",
                onClick: () => {
                    navigate(getPipelineRunsPattern(rootRun!.function_path))
                }
            },
            {
                title: "Metrics",
                onClick: () => { 
                    setSelectedPanel("metrics");
                }
            }
        ]
    }, [rootRun, navigate, setSelectedPanel]);

    return <ContextMenu anchorEl={anchorEl} commands={commands} anchorOffset={ANCHOR_OFFSET} />;
}

export default PipelineSectionActionMenu;
