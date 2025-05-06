import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO } from 'date-fns';
import { AvailableShift } from '../../components/CalendarFeatures/ShiftUtils';

interface EditShiftDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editShift: AvailableShift | null;
  setEditShift: (shift: AvailableShift | null) => void;
  loading: boolean;
  onSave: () => void;
  onRequest: () => void;
}

const EditShiftDialog: React.FC<EditShiftDialogProps> = ({
  isOpen,
  onClose,
  editShift,
  setEditShift,
  loading,
  onSave,
  onRequest,
}) => {
  if (!editShift) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Shift</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Date"
              value={parseISO(editShift.date)}
              onChange={(newDate) => {
                if (newDate) {
                  setEditShift({ ...editShift, date: format(newDate, 'yyyy-MM-dd') });
                }
              }}
              sx={{ width: '100%', mb: 2 }}
            />
          </LocalizationProvider>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <TimePicker
                label="Start Time"
                value={parseISO(`2023-01-01T${editShift.start}`)}
                onChange={(newTime) => {
                  if (newTime) {
                    setEditShift({ ...editShift, start: format(newTime, 'HH:mm:ss') });
                  }
                }}
                sx={{ width: '100%' }}
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <TimePicker
                label="End Time"
                value={parseISO(`2023-01-01T${editShift.end}`)}
                onChange={(newTime) => {
                  if (newTime) {
                    setEditShift({ ...editShift, end: format(newTime, 'HH:mm:ss') });
                  }
                }}
                sx={{ width: '100%' }}
              />
            </LocalizationProvider>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onSave} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Save Changes'}
        </Button>
        <Button variant="outlined" onClick={onRequest} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Request Shift'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditShiftDialog; 