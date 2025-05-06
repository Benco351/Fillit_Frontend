import React from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { startOfWeek, format, addDays, isSameWeek, eachDayOfInterval } from 'date-fns';

interface WeekPickerProps {
  currentWeekStart: Date;
  onWeekChange: (newWeekStart: Date) => void;
}

const WeekPicker: React.FC<WeekPickerProps> = ({ currentWeekStart, onWeekChange }) => {
  const [open, setOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date>(currentWeekStart);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDateChange = (newDate: Date | null) => {
    if (newDate) {
      setSelectedDate(newDate);
    }
  };

  const handleConfirm = () => {
    const newWeekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    onWeekChange(newWeekStart);
    handleClose();
  };

  // Get the days of the selected week
  const selectedWeekDays = eachDayOfInterval({
    start: startOfWeek(selectedDate, { weekStartsOn: 1 }),
    end: addDays(startOfWeek(selectedDate, { weekStartsOn: 1 }), 6)
  });

  return (
    <>
      <Button
        variant="outlined"
        onClick={handleOpen}
        sx={{
          minWidth: '200px',
          backgroundColor: 'white',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          },
        }}
      >
        {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}
      </Button>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Select Week</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={selectedDate}
                onChange={handleDateChange}
                sx={{ width: '100%' }}
              />
            </LocalizationProvider>

            {/* Selected Week Preview */}
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Selected Week:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedWeekDays.map((day, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: isSameWeek(day, selectedDate, { weekStartsOn: 1 }) 
                        ? 'primary.main' 
                        : 'grey.200',
                      color: isSameWeek(day, selectedDate, { weekStartsOn: 1 }) 
                        ? 'white' 
                        : 'text.primary',
                      minWidth: '80px',
                      textAlign: 'center'
                    }}
                  >
                    <Typography variant="caption" display="block">
                      {format(day, 'EEE')}
                    </Typography>
                    <Typography variant="body2">
                      {format(day, 'MMM d')}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleConfirm} variant="contained">
            Select Week
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WeekPicker; 