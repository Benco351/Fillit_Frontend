import React from 'react';
import { Box, Paper, Typography, Alert } from '@mui/material';
import { AvailableShift } from '../../components/CalendarFeatures/ShiftUtils';
import { calculateDuration } from '../../components/CalendarFeatures/calendarStates';

interface ShiftDetailsProps {
  fetchedShift: AvailableShift | null;
  error: string | null;
  success: string | null;
}

const ShiftDetails: React.FC<ShiftDetailsProps> = ({ fetchedShift, error, success }) => {
  if (!fetchedShift) {
    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }
    if (success) {
      return <Alert severity="info">No shift found with that ID.</Alert>;
    }
    return null;
  }

  return (
    <Paper sx={{ mt: 2, p: 3, borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h6" color="primary" gutterBottom>
        Shift Details
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Typography variant="body1">
            <strong>Shift ID:</strong> {fetchedShift.id || 'N/A'}
          </Typography>
          <Typography variant="body1">
            <strong>Date:</strong> {fetchedShift.date || 'N/A'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Typography variant="body1">
            <strong>Start Time:</strong> {fetchedShift.start || 'N/A'}
          </Typography>
          <Typography variant="body1">
            <strong>End Time:</strong> {fetchedShift.end || 'N/A'}
          </Typography>
        </Box>
        {fetchedShift.start && fetchedShift.end && (
          <Typography variant="body1">
            <strong>Duration:</strong> {calculateDuration(fetchedShift.start, fetchedShift.end)}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default ShiftDetails; 