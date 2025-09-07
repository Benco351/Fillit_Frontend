import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  ThemeProvider,
  CssBaseline,
  Container,
  Alert,
  CircularProgress,
} from '@mui/material';
import { MainTheme, swapPageTheme } from '../../assets/themes/themes';
import { useUserDashboard } from '../../hooks/useUserDashboard';
import AdminNavbar from '../../components/layout/AdminNavbar';
import Footer from '../../components/layout/Footer';
import { 
  createAnnouncement, 
  getAnnouncements, 
  deleteAnnouncementById 
} from '../../utils/apis/Announcements';
import { AnnouncementMapped } from '../../utils/apis/types';

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

const AnnouncementsUserPage: React.FC = () => {
  const user = getCurrentUser();
  const [announcements, setAnnouncements] = useState<AnnouncementMapped[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<number[]>([]);

  // Fetch announcements on component mount
  useEffect(() => {
    fetchAnnouncements(); // Enable this to test the endpoint
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const orgIdStr = sessionStorage.getItem('organizationId');
      const orgId = orgIdStr ? Number(orgIdStr) : undefined;
      const response = await getAnnouncements({ organization_id: Number(orgId), title: undefined, author_id: undefined } as any);
      console.log('Fetch announcements response:', response);
      setAnnouncements(response.data || []);
    } catch (err: any) {
      console.error('Fetch announcements error:', err);
      console.error('Error response:', err.response);
      // Handle 404 specifically
      if (err.response?.status === 404) {
        console.log('Announcements endpoint not found - backend not ready yet');
        setAnnouncements([]); // Set empty array instead of showing error
      } else {
        setError(err.message || 'Failed to fetch announcements');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingIds(prev => [...prev, id]);
    try {
      console.log('Deleting announcement with ID:', id);
      const orgIdStr = sessionStorage.getItem('organizationId');
      const orgId = orgIdStr ? Number(orgIdStr) : undefined;
      await deleteAnnouncementById(id, Number(orgId));
      console.log('Announcement deleted successfully');
      
      // Remove from local state immediately for better UX
      setAnnouncements(prev => prev.filter(a => a.announcement_id !== id));
      
      // Optionally refresh announcements from server
      // await fetchAnnouncements();
      
      setError(null); // Clear any previous errors
    } catch (err: any) {
      console.error('Delete announcement error:', err);
      console.error('Delete error response:', err.response);
      
      if (err.response?.status === 404) {
        setError('Delete feature is not available yet - backend endpoint not configured');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to delete this announcement');
      } else {
        setError(`Failed to delete announcement: ${err.response?.data?.message || err.message}`);
      }
    } finally {
      setDeletingIds(prev => prev.filter(deleteId => deleteId !== id));
    }
  };

  return (
    <ThemeProvider theme={MainTheme}>
      <CssBaseline />
      <Box sx={{
        backgroundColor: user.admin ? swapPageTheme.adminBg : '#093039',
        minHeight: '100vh',
        pt: 4,
        pb: 0,
        px: 2,
        direction: 'ltr',
      }}>
        <Container maxWidth={false} sx={{ px: { xs: 1, sm: 2, md: 3 }, width: '100%', maxWidth: '100%', direction: 'ltr' }}>
          <AdminNavbar />
          <Box
            sx={{
              border: swapPageTheme.mainBorder,
              borderRadius: '12px',
              padding: { xs: 2, sm: 3, md: 4 },
              backgroundColor: swapPageTheme.mainBg,
              boxShadow: swapPageTheme.mainBoxShadow,
              margin: '24px 0 0',
              transform: 'translateZ(0)',
              willChange: 'transform',
              direction: 'ltr',
            }}
          >
            <Typography 
              variant="h3" 
              fontWeight={700} 
              color="primary" 
              align="center" 
              gutterBottom
              sx={{
                fontSize: { xs: '1.1rem', sm: '2.2rem', md: '3rem' },
                wordBreak: 'break-word',
                hyphens: 'auto',
                lineHeight: { xs: 1.2, sm: 1.2 },
                px: { xs: 4, sm: 0 },
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'normal',
                display: 'block',
                width: '100%',
                boxSizing: 'border-box',
                '@media (max-width: 375px)': {
                  fontSize: '1rem',
                  px: 2
                }
              }}
            >
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
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            {/* Announcements List */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" fontWeight={600} align="center" gutterBottom style={{ color: swapPageTheme.unselectedText }}>
                Announcements
              </Typography>
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <CircularProgress color="primary" />
                </Box>
              )}
              {!loading && announcements.length === 0 && (
                <Typography align="center" sx={{ mt: 4 }} style={{ color: '#b0b7be' }}>
                  No announcements yet.
                </Typography>
              )}
              {!loading && announcements.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  {announcements.map(a => {
                    // Fallback for body/content
                    const announcementBody = a.content || (a as any).body || '';
                    // Fallback for date
                    let dateString = a.start_date || a.updated_at || '';
                    let dateDisplay = 'Invalid date';
                    if (dateString && !isNaN(Date.parse(dateString))) {
                      dateDisplay = new Date(dateString).toLocaleString();
                    }
                    return (
                      <Paper
                        key={a.announcement_id}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: swapPageTheme.cardBg,
                          border: swapPageTheme.cardBorder,
                          color: swapPageTheme.unselectedText,
                          position: 'relative',
                        }}
                      >
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 700, color: 'primary.main' }}>
                          {a.title || 'Untitled'}
                        </Typography>
                        {announcementBody && (
                          <Typography
                            variant="body1"
                            sx={{ mb: 1 }}
                            component="div"
                            dangerouslySetInnerHTML={{ __html: announcementBody }}
                          />
                        )}
                        <Typography variant="caption" sx={{ color: '#b0b7be' }}>
                          Posted by {a.Employee?.employee_name || 'Unknown'}
                          {(() => {
                            let dateString = a.start_date || a.updated_at || '';
                            if (dateString && !isNaN(Date.parse(dateString))) {
                              return ` on ${new Date(dateString).toLocaleString()}`;
                            }
                            return '';
                          })()}
                        </Typography>
                        {user.admin && (
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            disabled={deletingIds.includes(a.announcement_id)}
                            sx={{ 
                              position: 'absolute', 
                              top: 8, 
                              right: 8, 
                              minWidth: 0, 
                              px: 1, 
                              py: 0.5,
                              '&:disabled': {
                                opacity: 0.6,
                              }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(a.announcement_id);
                            }}
                          >
                            {deletingIds.includes(a.announcement_id) ? (
                              <CircularProgress size={14} sx={{ color: '#f44336' }} />
                            ) : (
                              'Delete'
                            )}
                          </Button>
                        )}
                      </Paper>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Box>
        </Container>
      </Box>
      <Footer />
    </ThemeProvider>
  );
};

export default AnnouncementsUserPage;