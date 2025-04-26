import React, { Dispatch, SetStateAction } from "react";
import { Box, Button } from "@mui/material";

type Props = {
  filter: "all" | "requested" | "accepted";
  setFilter: Dispatch<SetStateAction<"all" | "requested" | "accepted">>;
};

const ShiftFilters: React.FC<Props> = ({ filter, setFilter }) => {
  return (
    <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
      <Button
        variant={filter === "all" ? "contained" : "outlined"}
        onClick={() => setFilter("all")}
      >
        All
      </Button>
      <Button
        variant={filter === "requested" ? "contained" : "outlined"}
        onClick={() => setFilter("requested")}
      >
        Requested
      </Button>
      <Button
        variant={filter === "accepted" ? "contained" : "outlined"}
        onClick={() => setFilter("accepted")}
      >
        Accepted
      </Button>
    </Box>
  );
};

export default ShiftFilters;
