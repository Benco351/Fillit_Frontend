import React from 'react';
import { Box, Typography, Paper, Button, Chip, CircularProgress } from '@mui/material';
import { RequestedShift } from '../../components/CalendarFeatures/ShiftUtils';
import { Employee } from '../../components/CalendarFeatures/calendarStates';

interface AdminShiftRequestsProps {
  requestedShifts: RequestedShift[];
  employees: Employee[];
  loading: boolean;
  onAcceptShift: (requestedShiftId: number) => void;
  onDeleteRequestedShift: (requestedShiftId: number) => void;
}

const AdminShiftRequests: React.FC<AdminShiftRequestsProps> = ({
  requestedShifts,
  employees,
  loading,
  onAcceptShift,
  onDeleteRequestedShift,
}) => {
  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : 'Unknown Employee';
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
        Shift Requests
      </Typography>
      
      {requestedShifts.map((request) => (
        <Paper
          key={request.id}
          sx={{
            p: 2,
            mb: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body1" sx={{ color: 'white' }}>
                {getEmployeeName(request.employeeId)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'white', opacity: 0.7 }}>
                Notes: {request.notes || 'No notes'}
              </Typography>
              <Chip
                label={request.status}
                size="small"
                color={
                  request.status === 'pending'
                    ? 'warning'
                    : request.status === 'approved'
                    ? 'success'
                    : 'error'
                }
                sx={{ mt: 1 }}
              />
            </Box>
            
            {request.status === 'pending' && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={() => onAcceptShift(request.id)}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} /> : 'Accept'}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => onDeleteRequestedShift(request.id)}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={20} /> : 'Reject'}
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default AdminShiftRequests; 