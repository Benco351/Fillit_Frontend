import React, { Dispatch, SetStateAction } from "react";
import { Box, Button, ButtonGroup } from "@mui/material";

type Props = {
  filter: "all" | "requested" | "accepted" | "full";
  setFilter: Dispatch<SetStateAction<"all" | "requested" | "accepted" | "full">>;
};

const filterButtonStyle = {
  minWidth: '120px',
  background: 'linear-gradient(135deg, rgba(0, 194, 140, 0.1), rgba(0, 194, 140, 0.2))',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(0, 194, 140, 0.3)',
  borderRadius: '10px',
  color: '#00c28c',
  '&.active': {
    background: 'linear-gradient(135deg, rgba(0, 194, 140, 0.2), rgba(0, 194, 140, 0.3))',
    border: '1px solid rgba(0, 194, 140, 0.5)',
    boxShadow: '0 4px 12px rgba(0, 194, 140, 0.2)',
  },
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(0, 194, 140, 0.15), rgba(0, 194, 140, 0.25))',
    transform: 'translateY(-1px)',
  }
};

const ShiftFilters: React.FC<Props> = ({ filter, setFilter }) => {
  return (
    <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
      <ButtonGroup sx={{ gap: 1 }}>
        <Button
          sx={{
            ...filterButtonStyle,
            ...(filter === 'all' && { '&.active': filterButtonStyle['&.active'] })
          }}
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All Shifts
        </Button>
        <Button
          sx={{
            ...filterButtonStyle,
            ...(filter === 'requested' && { '&.active': filterButtonStyle['&.active'] })
          }}
          className={filter === 'requested' ? 'active' : ''}
          onClick={() => setFilter('requested')}
        >
          Requested
        </Button>
        <Button
          sx={{
            ...filterButtonStyle,
            ...(filter === 'accepted' && { '&.active': filterButtonStyle['&.active'] })
          }}
          className={filter === 'accepted' ? 'active' : ''}
          onClick={() => setFilter('accepted')}
        >
          Accepted
        </Button>
      </ButtonGroup>
    </Box>
  );
};



export default ShiftFilters;
