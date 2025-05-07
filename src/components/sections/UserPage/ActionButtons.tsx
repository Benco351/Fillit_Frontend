import { Box, Button, SxProps, Theme, Chip } from '@mui/material';
import { AvailableShift } from '../../../components/CalendarFeatures/ShiftUtils';

interface ActionButtonsProps {
  shift: AvailableShift;
  status: string;
  requesting: boolean;
  canceling: boolean;
  requestedShifts: any[];
  onRequestShift: (shift: AvailableShift) => Promise<void>;
  handleDeleteRequestedShift: (id: number, availableShiftId: number) => Promise<void>;
  buttonStyle?: Record<string, any>; // Make sure this matches the prop name we're using
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  shift,
  status,
  requesting,
  canceling,
  requestedShifts,
  onRequestShift,
  handleDeleteRequestedShift,
  buttonStyle = {} // Changed prop name
}) => {
  return (
    <Box sx={{ 
      mt: 1,
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 1,
      flexDirection: status === 'pending' ? 'column' : 'row'
    }}>
      {status === 'available' && (
        <Button
          size="small"
          variant="contained"
          onClick={() => onRequestShift(shift)}
          disabled={requesting}
          sx={{
            ...buttonStyle, // Use new prop name
            fontSize: '0.7rem',
            padding: '1px 6px',
            minWidth: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(8px)',
            height: '22px',
            lineHeight: 1,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
            },
          }}
        >
          {requesting ? 'Requesting...' : 'Request'}
        </Button>
      )}
      {status === 'pending' && (
        <>
          <Chip
            label="Pending"
            size="small"
            sx={{ 
              fontSize: '0.6rem', 
              height: 16,
              backgroundColor: 'orange',
              color: 'white',
              mb: 1
            }}
          />
          <Button
            size="small"
            variant="contained"
            color="error"
            onClick={() => {
              const request = requestedShifts.find(req => req.availableShiftId === shift.id);
              if (request?.id) {
                handleDeleteRequestedShift(request.id, shift.id); // Pass availableShiftId
              }
            }}
            disabled={canceling}
            sx={{
              ...buttonStyle, // Use new prop name
              fontSize: '0.7rem',
              padding: '1px 6px',
              minWidth: 0,
              backgroundColor: 'rgba(255, 0, 0, 0.3)',
              backdropFilter: 'blur(8px)',
              height: '22px',
              lineHeight: 1,
              '&:hover': {
                backgroundColor: 'rgba(255, 0, 0, 0.4)',
              },
            }}
          >
            {canceling ? 'Cancelling...' : 'Cancel Request'}
          </Button>
        </>
      )}
    </Box>
  );
};

export default ActionButtons;