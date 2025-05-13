import React from 'react';
import { Card, CardContent, Typography, Button, Stack } from '@mui/material';

interface ShiftSwapRequest {
  id: string;
  requesterName: string;
  shiftDate: string;
  shiftTime: string;
  status: 'pending' | 'approved' | 'denied';
}

interface ShiftSwapRequestsProps {
  requests: ShiftSwapRequest[];
  onApprove: (id: string) => void;
  onDeny: (id: string) => void;
}

const ShiftSwapRequests: React.FC<ShiftSwapRequestsProps> = ({ requests, onApprove, onDeny }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Shift Swap Requests
        </Typography>
        <Stack spacing={2}>
          {requests.map((request) => (
            <Card key={request.id} variant="outlined">
              <CardContent>
                <Typography variant="subtitle1">
                  {request.requesterName} requested to swap shift
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Date: {request.shiftDate}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Time: {request.shiftTime}
                </Typography>
                {request.status === 'pending' && (
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => onApprove(request.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => onDeny(request.id)}
                    >
                      Deny
                    </Button>
                  </Stack>
                )}
                {request.status !== 'pending' && (
                  <Typography
                    variant="body2"
                    color={request.status === 'approved' ? 'success.main' : 'error.main'}
                    sx={{ mt: 1 }}
                  >
                    Status: {request.status}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
          {requests.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No pending shift swap requests
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ShiftSwapRequests; 