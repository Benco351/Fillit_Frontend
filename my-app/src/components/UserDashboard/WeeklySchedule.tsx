import React from 'react';
import { Box, Typography, IconButton, Chip } from '@mui/material';
import { Edit as EditIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { AvailableShift } from '../../components/CalendarFeatures/ShiftUtils';
import { getShiftColor } from '../../components/CalendarFeatures/calendarStates';

interface WeeklyScheduleProps {
  weekDays: Date[];
  filteredShifts: AvailableShift[];
  getShiftStatus: (availableShiftId: number) => string;
  getAssignedEmployeeName: (availableShiftId: number) => string;
  handleOpenEditDialogFromCalendar: (shift: AvailableShift) => void;
}

const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({
  weekDays,
  filteredShifts,
  getShiftStatus,
  getAssignedEmployeeName,
  handleOpenEditDialogFromCalendar,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'nowrap',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      {weekDays.map((day, index) => (
        <Box
          key={index}
          sx={{
            flex: '1 1 calc(14.28% - 16px)',
            minWidth: 150,
            p: 2,
            height: '100%',
            minHeight: 400,
            backgroundColor: 'white',
            borderRadius: 1,
            boxShadow: 3,
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold" align="center" gutterBottom>
            {format(day, 'EEE')}
          </Typography>
          <Typography variant="body2" align="center" gutterBottom sx={{ mb: 2 }}>
            {format(day, 'MMM d')}
          </Typography>
          
          {filteredShifts
            .filter(shift => shift.date === format(day, 'yyyy-MM-dd'))
            .map(shift => {
              const status = getShiftStatus(shift.id);
              const backgroundColor = getShiftColor(status);
              
              return (
                <Box
                  key={shift.id}
                  sx={{
                    mb: 1,
                    p: 1,
                    borderRadius: 1,
                    backgroundColor,
                    color: 'white',
                    position: 'relative',
                  }}
                >
                  <Typography variant="body2">
                    {shift.start.substring(0, 5)} - {shift.end.substring(0, 5)}
                  </Typography>
                  
                  {status === 'assigned' && (
                    <Typography variant="caption" display="block">
                      {getAssignedEmployeeName(shift.id)}
                    </Typography>
                  )}
                  
                  <IconButton
                    size="small"
                    sx={{ position: 'absolute', top: 2, right: 2, color: 'white' }}
                    onClick={() => handleOpenEditDialogFromCalendar(shift)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  
                  {status === 'pending' && (
                    <Chip
                      label="Pending"
                      size="small"
                      sx={{ fontSize: '0.6rem', height: 16, mt: 0.5 }}
                    />
                  )}
                  
                  {status === 'denied' && (
                    <Chip
                      label="Denied"
                      size="small"
                      sx={{ fontSize: '0.6rem', height: 16, mt: 0.5, backgroundColor: '#d32f2f' }}
                    />
                  )}
                </Box>
              );
            })}
        </Box>
      ))}
    </Box>
  );
};

export default WeeklySchedule; 