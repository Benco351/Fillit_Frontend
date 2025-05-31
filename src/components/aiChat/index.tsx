// src/components/ai/ChatPopup.tsx
// -----------------------------------------------------------------------------
// Brand-green AI chat popup.  Uses the primary palette for FAB, header bar,
// and user-message bubble.  Requires: MUI v5, @mui/icons-material, aiLambda.
// -----------------------------------------------------------------------------

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Fab,
  Paper,
  IconButton,
  Typography,
  TextField,
  CircularProgress,
  Divider,
  useTheme,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { aiLambda } from '../../utils/apis/apiconfig';

type Message = { from: 'user' | 'ai'; text: string };

export default function ChatPopup() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  /* auto-scroll */
  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [msgs]);

  /* close on Esc */
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  /* send prompt */
  const send = async () => {
    if (!input.trim()) return;
    const prompt = input;
    setInput('');
    setMsgs(m => [...m, { from: 'user', text: prompt }]);
    setLoading(true);
    try {
      // Fetch from sessionStorage
      const employeeId = sessionStorage.getItem('customEmployeeId');
      const adminMode = sessionStorage.getItem('isAdmin');

      const { data } = await aiLambda.post(
        '/',
        {
          user_prompt: prompt,
          employee_id: employeeId ? Number(employeeId) : undefined,
          admin_mode: adminMode ? String(JSON.parse(adminMode)) : 'false',
        }
      );
      // Lambda returns a stringified JSON in the 'body' property
      let aiReply = 'Sorry, something went wrong 🤖';
      if (data && typeof data.body === 'string') {
        try {
          const parsed = JSON.parse(data.body);
          aiReply = parsed.ai_reply || aiReply;
        } catch { /* empty */ }
      }
      setMsgs(m => [...m, { from: 'ai', text: aiReply }]);
    } catch {
      setMsgs(m => [...m, { from: 'ai', text: 'Sorry, something went wrong 🤖' }]);
    } finally {
      setLoading(false);
    }
  };

  /* UI ------------------------------------------------------------------- */
  return (
    <>
      {!open && (
        <Fab
          color="primary"
          onClick={() => setOpen(true)}
          sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1500 }}
        >
          <ChatIcon />
        </Fab>
      )}

      {open && (
        <Paper
          elevation={10}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: { xs: 320, sm: 380 },
            height: 480,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
            zIndex: 2000,
          }}
        >
          {/* header bar in primary color */}
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'common.white',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 1,
            }}
          >
            <ChatIcon />
            <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
              FillIt AI Assistant
            </Typography>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: 'inherit' }}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />

          {/* messages list */}
          <Box
            ref={listRef}
            sx={{
              flex: 1,
              px: 2,
              py: 1,
              overflowY: 'auto',
              '&::-webkit-scrollbar': { width: 4 },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: theme.palette.primary.main,
                borderRadius: 2,
              },
            }}
          >
            {msgs.map((m, i) => (
              <Box
                key={i}
                sx={{
                  my: 1,
                  display: 'flex',
                  justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <Box
                  sx={{
                    px: 1.5,
                    py: 1,
                    maxWidth: '75%',
                    bgcolor: m.from === 'user' ? 'primary.main' : 'grey.800',
                    color: 'common.white',
                    borderRadius: 2,
                    fontSize: '0.875rem',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {m.text}
                </Box>
              </Box>
            ))}

            {loading && (
              <Box sx={{ display: 'flex', mt: 1 }}>
                <CircularProgress size={20} color="inherit" />
              </Box>
            )}
          </Box>

          {/* input row */}
          <Divider />
          <Box sx={{ p: 1.5, display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Type a message…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
            />
            <IconButton
              sx={{ bgcolor: 'primary.main', color: 'common.white', '&:hover': { bgcolor: 'primary.dark' } }}
              onClick={send}
              disabled={!input.trim()}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      )}
    </>
  );
}
