import { SearchOutlined } from "@mui/icons-material";
import {
    Box,
    Button,
    buttonClasses,
    Container,
    TextField,
    textFieldClasses,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/system";
import MuiRouterLink from "@sematic/common/src/component/MuiRouterLink";
import TimeAgo from "@sematic/common/src/component/TimeAgo";
import { getRunUrlPattern } from "@sematic/common/src/hooks/runHooks";
import { Run } from "@sematic/common/src/Models";
import { atomWithHashCustomSerialization } from "@sematic/common/src/utils/url";
import { useAtom } from "jotai";
import React, { ChangeEvent, FormEvent, useCallback, useState } from "react";
import CalculatorPath from "src/components/CalculatorPath";
import Id from "src/components/Id";
import { RunList, RunListColumn } from "src/components/RunList";
import RunStateChip from "src/components/RunStateChip";
import { RunTime } from "src/components/RunTime";
import Tags from "src/components/Tags";
import UserAvatar from "src/components/UserAvatar";
import { spacing } from "src/utils";

const StyledScroller = styled(Container)`
  padding-top: ${spacing(10)};
  height: 100%;
  overflow-y: hidden;
  display: flex;
  flex-direction: column;

  @media (min-width: 1280px) {
    min-width: 1020px;
  }

  & > * {
    flex-shrink: 1;
  }

  & > *.RunListBox {
    flex-grow: 1;
    flex-shrink: unset;
    height: 0;
  }

  & .search-bar {
    padding-top: ${spacing(10)};
    padding-bottom: ${spacing(10)};
    display: flex;
    flex-direction: row;

    & > *:first-of-type {
      padding-right: ${spacing(10)};
      flex-grow: 1;
    }

    & .${buttonClasses.root} {
      height: 100%;
    }

    & .${textFieldClasses.root} {
      width: 100%;
    }
  }
`;

const StyledContainer = styled(Container)`
  display: flex;
  align-items: center;
  column-gap: 12px;
  padding-left: 0;
`;

function RowNameColumn({ run }: { run: Run }) {
    let functionPath: React.ReactElement = (
        <Box>
            <CalculatorPath functionPath={run.function_path} />
        </Box>
    );
    return (
        <>
            <Typography variant="h6">
                <MuiRouterLink href={getRunUrlPattern(run.id)} underline="hover">
                    {run.name}
                </MuiRouterLink>
            </Typography>
            {functionPath}
        </>
    );
}

function UserColumn({ run }: { run: Run }) {
    if (!run.user) {
        return null;
    }
    const { first_name, last_name } = run.user;
    return (
        <StyledContainer>
            <UserAvatar user={run.user} sx={{ width: 18, height: 18 }} />
            <div>
                {first_name} {(last_name || "").substring(0, 1)}.
            </div>
        </StyledContainer>
    );
}

const TableColumns: Array<RunListColumn> = [
    {
        name: "ID",
        width: "7.5%",
        render: (run: Run) => <Id id={run.id} trimTo={8} />,
    },
    {
        name: "Name",
        width: "37.5%",
        render: (run: Run) => <RowNameColumn run={run} />,
    },
    {
        name: "Tags",
        width: "21%",
        render: (run: Run) => <Tags tags={run.tags || []} />,
    },
    {
        name: "User",
        width: "14%",
        render: (run: Run) => <UserColumn run={run} />,
    },
    {
        name: "Time",
        width: "10%",
        render: (run: Run) => (
            <>
                <TimeAgo date={run.created_at} />
                <RunTime run={run} prefix="in" />
            </>
        ),
    },
    {
        name: "Status",
        width: "10%",
        render: (run: Run) => <RunStateChip run={run} variant="full" />,
    },
];

const searchAtom = atomWithHashCustomSerialization("search", "");

export function RunIndex() {
    const [searchString, setSearchString] = useAtom(searchAtom);
    
    const [submitedSearchString, setSubmitedSearchString] = useState<
    string | undefined
    >(searchString);

    const onChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setSearchString(event.target.value);
    }, [setSearchString]);

    const onSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setSubmitedSearchString(searchString);
        },
        [searchString]
    );

    return (
        <StyledScroller>
            <Typography variant="h4" component="h2">
        Runs
            </Typography>
            <form onSubmit={onSubmit}>
                <Box className={"search-bar"}>
                    <Box sx={{ gridColumn: 1 }}>
                        <TextField
                            id="outlined-basic"
                            label="Search"
                            variant="outlined"
                            onChange={onChange}
                            value={searchString}
                        />
                    </Box>
                    <Box sx={{ gridColumn: 2 }}>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<SearchOutlined />}
                            type="submit"
                        >
              SEARCH
                        </Button>
                    </Box>
                </Box>
            </form>
            <Box className="RunListBox">
                <RunList columns={TableColumns} search={submitedSearchString} />
            </Box>
        </StyledScroller>
    );
}
