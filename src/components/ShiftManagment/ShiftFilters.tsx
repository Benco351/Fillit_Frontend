import React, { Dispatch, SetStateAction } from "react";
import { Box, Button, ButtonGroup } from "@mui/material";

type Props = {
  filter: "all" | "requested" | "accepted";
  setFilter: Dispatch<SetStateAction<"all" | "requested" | "accepted">>;
};

const glassFilterButtonStyle = {
  background: 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '10px',
  padding: '8px 20px',
  color: 'white',
  fontSize: '0.9rem',
  fontWeight: '500',
  minWidth: '120px',
  textTransform: 'none',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
  transition: 'all 0.3s ease',
  '&.active': {
    background: 'rgba(0, 194, 140, 0.2)',
    border: '1px solid rgba(0, 194, 140, 0.3)',
    boxShadow: '0 4px 16px rgba(0, 194, 140, 0.15)',
  },
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.12)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
    transform: 'translateY(-1px)',
  },
  '&:active': {
    transform: 'translateY(1px)',
  }
};

const ShiftFilters: React.FC<Props> = ({ filter, setFilter }) => {
  return (
    <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
      <ButtonGroup sx={{ gap: 1 }}>
        <Button
          sx={{
            ...glassFilterButtonStyle,
            ...(filter === 'all' && { '&.active': glassFilterButtonStyle['&.active'] })
          }}
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All Shifts
        </Button>
        <Button
          sx={{
            ...glassFilterButtonStyle,
            ...(filter === 'requested' && { '&.active': glassFilterButtonStyle['&.active'] })
          }}
          className={filter === 'requested' ? 'active' : ''}
          onClick={() => setFilter('requested')}
        >
          Requested
        </Button>
        <Button
          sx={{
            ...glassFilterButtonStyle,
            ...(filter === 'accepted' && { '&.active': glassFilterButtonStyle['&.active'] })
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
