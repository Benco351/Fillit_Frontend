import React from 'react';
import { Box, Button, ButtonGroup } from '@mui/material';

interface AdminShiftFilterProps {
  filter: 'all' | 'full';
  setFilter: (value: 'all' | 'full') => void;
}

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

const AdminShiftFilter: React.FC<AdminShiftFilterProps> = ({ filter, setFilter }) => {
  return (
    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
      <ButtonGroup sx={{ gap: 1 }}>
        <Button
          sx={{
            ...filterButtonStyle,
            ...(filter === 'all' ? filterButtonStyle['&.active'] : {})
          }}
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          All Shifts
        </Button>
        <Button
          sx={{
            ...filterButtonStyle,
            ...(filter === 'full' ? filterButtonStyle['&.active'] : {})
          }}
          className={filter === 'full' ? 'active' : ''}
          onClick={() => setFilter('full')}
        >
          Full Shifts
        </Button>
      </ButtonGroup>
    </Box>
  );
};

export default AdminShiftFilter;
