import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  ThemeProvider,
  CssBaseline,
  Container,
  TextField,
} from '@mui/material';
import { MainTheme, swapPageTheme } from '../../assets/themes/themes';
import { useUserDashboard } from '../../hooks/useUserDashboard';
import Navbar from '../../components/layout/userNavbar';
import Footer from '../../components/layout/Footer';

const getCurrentUser = () => {
  const name = sessionStorage.getItem('name');
  const email = sessionStorage.getItem('email');
  const admin = sessionStorage.getItem('isAdmin');
  const id = sessionStorage.getItem('customEmployeeId');
  return {
    name: name || 'Unknown',
    email: email || 'Unknown',
    admin: admin === 'true',
    id: id || 'Unknown',
  };
};

interface Announcement {
  id: number;
  text: string;
  author: string;
  datetime: string;
}

const AnnouncementsPage: React.FC = () => {
  const user = getCurrentUser();
  const [announcementText, setAnnouncementText] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const handlePost = () => {
    if (!announcementText.trim()) return;
    const now = new Date();
    setAnnouncements([
      {
        id: Date.now(),
        text: announcementText,
        author: user.name,
        datetime: now.toLocaleString(),
      },
      ...announcements,
    ]);
    setAnnouncementText('');
  };

  const handleDelete = (id: number) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
  };

  return (
    <ThemeProvider theme={MainTheme}>
      <CssBaseline />
      <Box sx={{
        backgroundColor: user.admin ? swapPageTheme.adminBg : '#093039',
        minHeight: '100vh',
        py: 4,
        px: 2
      }}>
        <Container maxWidth={false} sx={{ px: { xs: 1, sm: 2, md: 3 }, width: '100%', maxWidth: '100%' }}>
          <Navbar />
          <Box
            sx={{
              border: swapPageTheme.mainBorder,
              borderRadius: '12px',
              padding: { xs: 2, sm: 3, md: 4 },
              backgroundColor: swapPageTheme.mainBg,
              boxShadow: swapPageTheme.mainBoxShadow,
              margin: '24px 0',
              transform: 'translateZ(0)',
              willChange: 'transform',
            }}
          >
            <Typography variant="h3" fontWeight={700} color="primary" align="center" gutterBottom>
              Announcement Board
            </Typography>
            <Typography variant="body1" align="center" style={{ color: '#b0b7be', marginBottom: 24 }}>
              GET THE LATEST UPDATES
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 4 }}>
              <Paper sx={{ p: { xs: 2, sm: 3 }, minWidth: 300, borderRadius: 3, background: swapPageTheme.infoPaperBg, border: swapPageTheme.cardBorder, boxShadow: swapPageTheme.cardShadow }} elevation={0}>
                <Typography variant="h6" gutterBottom align="center" color={swapPageTheme.unselectedText}>Current User Info</Typography>
                <Typography style={{ color: swapPageTheme.unselectedText }}>Name: {user.name}</Typography>
                <Typography style={{ color: '#b0b7be' }}>Email: {user.email}</Typography>
                <Typography style={{ color: '#b0b7be' }}>User ID: {user.id}</Typography>
                <Typography color="primary">Role: {user.admin ? 'Admin' : 'User'}</Typography>
              </Paper>
            </Box>
            {/* Announcement Input */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
              <TextField
                multiline
                minRows={2}
                maxRows={6}
                placeholder="Type your announcement here..."
                value={announcementText}
                onChange={e => setAnnouncementText(e.target.value)}
                sx={{
                  width: { xs: '100%', sm: 600 },
                  mb: 2,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  borderRadius: 2,
                  '& .MuiInputBase-input': {
                    color: 'white',
                  },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'rgba(255,255,255,0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
                InputProps={{
                  style: { color: 'white' }
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handlePost}
                disabled={!announcementText.trim()}
                sx={{ px: 4, py: 1.5, fontWeight: 600, borderRadius: 2 }}
              >
                Post
              </Button>
            </Box>
            {/* Announcements List */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" fontWeight={600} align="center" gutterBottom style={{ color: swapPageTheme.unselectedText }}>
                Announcements
              </Typography>
              {announcements.length === 0 ? (
                <Typography align="center" sx={{ mt: 4 }} style={{ color: '#b0b7be' }}>
                  No announcements yet.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  {announcements.map(a => (
                    <Paper
                      key={a.id}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        background: swapPageTheme.cardBg,
                        border: swapPageTheme.cardBorder,
                        color: swapPageTheme.unselectedText,
                        position: 'relative',
                      }}
                    >
                      <Typography variant="body1" sx={{ mb: 1 }}>{a.text}</Typography>
                      <Typography variant="caption" sx={{ color: '#b0b7be' }}>
                        Posted by {a.author} on {a.datetime}
                      </Typography>
                      {a.author === user.name && (
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          sx={{ position: 'absolute', top: 8, right: 8, minWidth: 0, px: 1, py: 0.5 }}
                          onClick={() => handleDelete(a.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Container>
        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default AnnouncementsPage;