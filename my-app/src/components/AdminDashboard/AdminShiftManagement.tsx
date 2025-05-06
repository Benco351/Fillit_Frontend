import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { AvailableShift } from '../../components/CalendarFeatures/ShiftUtils';

interface AdminShiftManagementProps {
  loading: boolean;
  onAddShift: () => void;
  onDeleteShift: (shiftId: number) => void;
  onAcceptShift: (requestedShiftId: number) => void;
  onDeleteRequestedShift: (requestedShiftId: number) => void;
  selectedShift: AvailableShift | null;
}

const AdminShiftManagement: React.FC<AdminShiftManagementProps> = ({
  loading,
  onAddShift,
  onDeleteShift,
  onAcceptShift,
  onDeleteRequestedShift,
  selectedShift,
}) => {
  return (
    <Box sx={{ mb: 4, p: 3, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2 }}>
      <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
        Shift Management
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAddShift}
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Add Shift'}
        </Button>

        {selectedShift && (
          <>
            <Button
              variant="outlined"
              color="error"
              onClick={() => onDeleteShift(selectedShift.id)}
              disabled={loading}
            >
              Delete Shift
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default AdminShiftManagement; 