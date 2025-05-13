import React from 'react';
import { Card, CardContent, Typography, Stack } from '@mui/material';

interface ShiftStatusMessage {
  id: string;
  message: string;
  date: string;
  status: 'approved' | 'denied';
}

interface ShiftStatusMessagesProps {
  messages: ShiftStatusMessage[];
}

const ShiftStatusMessages: React.FC<ShiftStatusMessagesProps> = ({ messages }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Shift Status Updates
        </Typography>
        <Stack spacing={2}>
          {messages.map((message) => (
            <Card key={message.id} variant="outlined">
              <CardContent>
                <Typography variant="subtitle1">{message.message}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Date: {message.date}
                </Typography>
                <Typography
                  variant="body2"
                  color={message.status === 'approved' ? 'success.main' : 'error.main'}
                  sx={{ mt: 1 }}
                >
                  Status: {message.status}
                </Typography>
              </CardContent>
            </Card>
          ))}
          {messages.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No shift status updates
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ShiftStatusMessages; 