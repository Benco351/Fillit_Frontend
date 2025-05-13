import React, { useState } from 'react';
import { Container, Typography, Stack, Box, Paper, CssBaseline, ThemeProvider } from '@mui/material';
import { MainTheme } from '../assets/themes/themes';
import ShiftSwapRequests from '../components/notifications/ShiftSwapRequests';
import ShiftStatusMessages from '../components/notifications/ShiftStatusMessages';
import Announcements from '../components/notifications/Announcements';
import Navbar from '../components/layout/userNavbar';
import Footer from '../components/layout/Footer';

type ShiftSwapRequest = {
  id: string;
  requesterName: string;
  shiftDate: string;
  shiftTime: string;
  status: 'pending' | 'approved' | 'denied';
};

// Mock data - replace with actual data fetching
const mockShiftSwapRequests: ShiftSwapRequest[] = [
  {
    id: '1',
    requesterName: 'John Doe',
    shiftDate: '2024-03-20',
    shiftTime: '09:00 - 17:00',
    status: 'pending',
  },
];

const mockShiftStatusMessages = [
  {
    id: '1',
    message: 'Your shift request for March 25th has been approved',
    date: '2024-03-15',
    status: 'approved' as const,
  },
];

const mockAnnouncements = [
  {
    id: '1',
    title: 'New Schedule System',
    content: 'We are implementing a new scheduling system next week. Please attend the training session.',
    date: '2024-03-18',
    priority: 'high' as const,
  },
];

const Notifications: React.FC = () => {
  const [shiftSwapRequests, setShiftSwapRequests] = useState<ShiftSwapRequest[]>(mockShiftSwapRequests);
  const [shiftStatusMessages] = useState(mockShiftStatusMessages);
  const [announcements] = useState(mockAnnouncements);

  const handleApproveRequest = (id: string) => {
    setShiftSwapRequests((prev) =>
      prev.map((request) =>
        request.id === id ? { ...request, status: 'approved' } : request
      )
    );
  };

  const handleDenyRequest = (id: string) => {
    setShiftSwapRequests((prev) =>
      prev.map((request) =>
        request.id === id ? { ...request, status: 'denied' } : request
      )
    );
  };

  return (
    <ThemeProvider theme={MainTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Container maxWidth="lg" sx={{ py: 4, flex: 1 }}>
          <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', fontWeight: 'bold' }}>
              Notifications
            </Typography>
            <Stack spacing={4}>
              <Box>
                <ShiftSwapRequests
                  requests={shiftSwapRequests}
                  onApprove={handleApproveRequest}
                  onDeny={handleDenyRequest}
                />
              </Box>
              <Box>
                <ShiftStatusMessages messages={shiftStatusMessages} />
              </Box>
              <Box>
                <Announcements announcements={announcements} />
              </Box>
            </Stack>
          </Paper>
        </Container>
        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default Notifications; 