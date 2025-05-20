import React from 'react';
import { Box, Typography, IconButton, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { format } from 'date-fns';

interface Shift {
  id: string;
  date: string;
  start: string;
  end: string;
  shift_slots_amount: number;
  shift_slots_taken: number;
}

interface WeeklyScheduleGridProps {
  weekDays: Date[];
  filteredShifts: Shift[];
  getShiftStatus: (shiftId: string) => string;
  getShiftColor: (status: string) => string;
  getAssignedEmployeeName: (shiftId: string) => string;
  handleOpenEditDialogFromCalendar: (shift: Shift) => void;
}

const WeeklyScheduleGrid: React.FC<WeeklyScheduleGridProps> = ({
  weekDays,
  filteredShifts,
  getShiftStatus,
  getShiftColor,
  getAssignedEmployeeName,
  handleOpenEditDialogFromCalendar
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        flexWrap: { xs: 'nowrap', sm: 'nowrap' },
        justifyContent: 'space-between',
        gap: 2,
        overflowX: { sm: 'auto' },
        '&::-webkit-scrollbar': {
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '4px',
        },
      }}
    >
      {weekDays.map((day, index) => (
        <Box
          key={index}
          sx={{
            flex: { xs: '1 1 100%', sm: '1 1 calc(14.28% - 16px)' },
            minWidth: { xs: '100%', sm: 150 },
            p: { xs: 1, sm: 2 },
            height: '100%',
            minHeight: { xs: 300, sm: 400 },
            backgroundColor: 'white',
            borderRadius: 1,
            boxShadow: 3,
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            align="center"
            gutterBottom
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            {format(day, 'EEE')}
          </Typography>
          <Typography
            variant="body2"
            align="center"
            gutterBottom
            sx={{
              mb: 2,
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
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
                    p: { xs: 0.5, sm: 1 },
                    borderRadius: 1,
                    backgroundColor,
                    color: 'white',
                    position: 'relative',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                  >
                    {shift.start.substring(0, 5)} - {shift.end.substring(0, 5)}
                  </Typography>

                  {status === 'assigned' && (
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' } }}
                    >
                      {getAssignedEmployeeName(shift.id)}
                    </Typography>
                  )}

                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      color: 'white',
                      padding: { xs: 0.5, sm: 1 }
                    }}
                    onClick={() => handleOpenEditDialogFromCalendar(shift)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>

                  {status === 'pending' && (
                    <Chip
                      label="Pending"
                      size="small"
                      sx={{
                        fontSize: { xs: '0.5rem', sm: '0.6rem' },
                        height: { xs: 14, sm: 16 },
                        mt: 0.5
                      }}
                    />
                  )}

                  {status === 'denied' && (
                    <Chip
                      label="Denied"
                      size="small"
                      sx={{
                        fontSize: { xs: '0.5rem', sm: '0.6rem' },
                        height: { xs: 14, sm: 16 },
                        backgroundColor: '#d32f2f',
                        mt: 0.5
                      }}
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

export default WeeklyScheduleGrid;
