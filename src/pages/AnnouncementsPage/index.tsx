import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  ThemeProvider,
  CssBaseline,
  Container,
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
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [editorHtml, setEditorHtml] = useState('');
  const editorRef = React.useRef<HTMLDivElement>(null);

  const handlePost = () => {
    const text = editorHtml.trim();
    if (!text || !editorRef.current) return;
    const now = new Date();
    setAnnouncements([
      {
        id: Date.now(),
        text: editorRef.current.innerHTML,
        author: user.name,
        datetime: now.toLocaleString(),
      },
      ...announcements,
    ]);
    setEditorHtml('');
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
  };

  const handleDelete = (id: number) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
  };

  // Formatting commands for contenteditable
  const format = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    // Update state after formatting
    if (editorRef.current) setEditorHtml(editorRef.current.innerHTML);
  };

  // Handle input in contenteditable
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    setEditorHtml(e.currentTarget.innerHTML);
  };

  // Handle focus to ensure LTR direction
  const handleFocus = () => {
    if (editorRef.current) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(true);
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  return (
    <ThemeProvider theme={MainTheme}>
      <CssBaseline />
      <Box sx={{
        backgroundColor: user.admin ? swapPageTheme.adminBg : '#093039',
        minHeight: '100vh',
        py: 4,
        px: 2,
        direction: 'ltr',
      }}>
        <Container maxWidth={false} sx={{ px: { xs: 1, sm: 2, md: 3 }, width: '100%', maxWidth: '100%', direction: 'ltr' }}>
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
              direction: 'ltr',
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
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4, direction: 'ltr' }}>
              {/* Toolbar */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mb: 0.5,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  background: 'rgba(255,255,255,0.10)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                  width: { xs: '100%', sm: 700 },
                  maxWidth: '100%',
                  border: '1px solid rgba(0,0,0,0.07)',
                  justifyContent: 'flex-start',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                <Button
                  size="small"
                  variant="text"
                  sx={{
                    minWidth: 0,
                    px: 1.5,
                    fontWeight: 700,
                    color: 'primary.main',
                  }}
                  onClick={() => format('bold')}
                  aria-label="Bold"
                  title="Bold"
                  type="button"
                >
                  <span style={{ fontWeight: 'bold', fontSize: 18 }}>B</span>
                </Button>
                <Button
                  size="small"
                  variant="text"
                  sx={{
                    minWidth: 0,
                    px: 1.5,
                    fontWeight: 700,
                    color: 'primary.main',
                  }}
                  onClick={() => format('italic')}
                  aria-label="Italic"
                  title="Italic"
                  type="button"
                >
                  <span style={{ fontStyle: 'italic', fontSize: 18 }}>I</span>
                </Button>
                <Button
                  size="small"
                  variant="text"
                  sx={{
                    minWidth: 0,
                    px: 1.5,
                    fontWeight: 700,
                    color: 'primary.main',
                  }}
                  onClick={() => format('underline')}
                  aria-label="Underline"
                  title="Underline"
                  type="button"
                >
                  <span style={{ textDecoration: 'underline', fontSize: 18 }}>U</span>
                </Button>
                <Button
                  size="small"
                  variant="text"
                  sx={{
                    minWidth: 0,
                    px: 1.5,
                    fontWeight: 700,
                    color: 'primary.main',
                  }}
                  onClick={() => format('insertUnorderedList')}
                  aria-label="Bullet List"
                  title="Bullet List"
                  type="button"
                >
                  <span style={{ fontSize: 18 }}>•</span>
                </Button>
              </Box>
              {/* Notepad-style contenteditable */}
              <Box
                sx={{
                  width: { xs: '100%', sm: 700 },
                  background: 'repeating-linear-gradient(180deg, #fffbe7 0px, #fffbe7 38px, #f7f3d7 39px, #fffbe7 40px)',
                  borderRadius: 3,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
                  border: '1.5px solid #e6e1c5',
                  mt: 0,
                  mb: 2,
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: 220,
                  direction: 'ltr',
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    left: 48,
                    top: 0,
                    bottom: 0,
                    width: '2px',
                    background: 'rgba(0,0,0,0.07)',
                    zIndex: 1,
                  },
                }}
              >
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck
                  dir="ltr"
                  lang="en"
                  style={{
                    minHeight: 220,
                    outline: 'none',
                    border: 'none',
                    width: '100%',
                    color: '#3b2f13',
                    fontSize: 18,
                    fontFamily: 'inherit',
                    lineHeight: 2.2,
                    background: 'transparent',
                    paddingLeft: 56,
                    paddingRight: 16,
                    paddingTop: 12,
                    paddingBottom: 12,
                    zIndex: 2,
                    position: 'relative',
                    whiteSpace: 'pre-wrap',
                    direction: 'ltr',
                    textAlign: 'left',
                    writingMode: 'horizontal-tb',
                  }}
                  onInput={handleInput}
                  onFocus={handleFocus}
                />
                {(!editorHtml || editorHtml === '<br>') && (
                  <span
                    style={{
                      position: 'absolute',
                      left: 56,
                      top: 16,
                      color: '#b0b7be',
                      opacity: 0.7,
                      pointerEvents: 'none',
                      fontSize: 18,
                      fontFamily: 'inherit',
                      zIndex: 3,
                      userSelect: 'none',
                    }}
                  >
                    Type your announcement here...
                  </span>
                )}
              </Box>
              <Button
                variant="contained"
                color="primary"
                onClick={handlePost}
                disabled={!editorHtml.replace(/<(.|\n)*?>/g, '').trim()}
                sx={{
                  px: 5,
                  py: 1.7,
                  fontWeight: 700,
                  borderRadius: 2,
                  fontSize: 18,
                  boxShadow: '0 2px 12px rgba(0,194,140,0.13)'
                }}
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
                      <Typography
                        variant="body1"
                        sx={{ mb: 1 }}
                        component="div"
                        dangerouslySetInnerHTML={{ __html: a.text }}
                      />
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