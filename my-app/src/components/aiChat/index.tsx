import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import { 
  Box, 
  Button, 
  IconButton, 
  InputBase, 
  Paper, 
  Typography, 
  Fade,
  CircularProgress
} from '@mui/material';
import { 
  Chat as ChatIcon, 
  Close as CloseIcon, 
  Send as SendIcon 
} from '@mui/icons-material';

// Define types for our messages
interface Message {
  sender: string;
  text: string;
  isError?: boolean;
}

// Define type for API response
interface ApiResponse {
  ai_reply: string;
}

export default function MTAChatPopup(): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatBoxRef = useRef<HTMLDivElement | null>(null);
  
  // Auto-scroll to bottom when new messages come in
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (): Promise<void> => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = { sender: 'You', text: inputValue.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      const response = await fetch("http://localhost:5001/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ user_prompt: userMessage.text })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      // Add AI response
      setMessages(prev => [...prev, { sender: 'AI', text: data.ai_reply }]);
    } catch (error) {
      console.error("Fetch error:", error);
      setMessages(prev => [...prev, { 
        sender: 'Error', 
        text: error instanceof Error ? error.message : 'Unknown error occurred', 
        isError: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setInputValue(e.target.value);
  };

  const handleCloseChat = (): void => {
    // Only close when the user explicitly clicks the close button
    setIsOpen(false);
  };

  const handleFormSubmit = (e: React.FormEvent): void => {
    e.preventDefault(); // Prevent form submission
    handleSendMessage();
  };

  return (
    <>
      {/* Chat button that shows in bottom-right corner */}
      <Box 
        sx={{ 
          position: 'fixed', 
          bottom: 16, 
          right: 16, 
          zIndex: 1050,
          display: isOpen ? 'none' : 'block'
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsOpen(true)}
          sx={{ 
            borderRadius: '50%', 
            minWidth: 56, 
            height: 56, 
            p: 0,
            boxShadow: 3
          }}
          aria-label="Open chat"
        >
          <ChatIcon />
        </Button>
      </Box>

      {/* Chat popup window */}
      <Fade in={isOpen} >
        <Paper
        
          elevation={6}
          sx={{
            
            position: 'fixed',
            bottom: 16,
            right: 16,
            width: { xs: 'calc(100% - 32px)', sm: 320 },
            maxWidth: 400,
            zIndex: 1050,
            overflow: 'hidden',
            display: isOpen ? 'flex' : 'none',
            flexDirection: 'column',
            borderRadius: 2
          }}
        >
          {/* Chat header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              p: 2
            }}
          >
            <Typography variant="h6" fontWeight="medium">
              AI Assistant
            </Typography>
            <IconButton
              onClick={handleCloseChat}
              size="small"
              color="inherit"
              aria-label="Close chat"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Messages area */}
          <Box
            ref={chatBoxRef}
            sx={{
              height: { xs: 256, md: 320 },
              p: 2,
              overflowY: 'auto',
              bgcolor: 'grey.50',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5
            }}
          >
            {messages.length === 0 ? (
              <Box sx={{ 
                textAlign: 'center', 
                color: 'text.secondary',
                py: 6
              }}>
                Start a conversation
              </Box>
            ) : (
              messages.map((msg, index) => (
                <Box
                  key={index}
                  sx={{
                    maxWidth: '80%',
                    p: 1.5,
                    borderRadius: 2,
                    wordBreak: 'break-word',
                    ...(msg.sender === 'You' 
                      ? { 
                          ml: 'auto', 
                          bgcolor: 'primary.main', 
                          color: 'primary.contrastText' 
                        } 
                      : msg.isError 
                        ? { 
                            bgcolor: 'error.light', 
                            color: 'error.dark' 
                          } 
                        : { 
                            bgcolor: 'grey.200', 
                            color: 'text.primary' 
                          }
                    )
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    component="div"
                    sx={{
                      fontWeight: 'bold',
                      mb: 0.5,
                      ...(msg.sender === 'You'
                        ? { color: 'primary.contrastText' }
                        : msg.isError
                          ? { color: 'error.dark' }
                          : { color: 'text.secondary' }
                      )
                    }}
                  >
                    {msg.sender}
                  </Typography>
                  <Typography variant="body2">
                    {msg.text}
                  </Typography>
                </Box>
              ))
            )}
            {isLoading && (
              <Box
                sx={{
                  maxWidth: '80%',
                  p: 1.5,
                  borderRadius: 2,
                  wordBreak: 'break-word',
                  bgcolor: 'grey.200',
                  color: 'text.primary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Typography variant="subtitle2" component="div">
                  AI
                </Typography>
                <CircularProgress size={16} color="inherit" />
              </Box>
            )}
          </Box>

          {/* Input area */}
          <Box 
            sx={{ 
              p: 2, 
              borderTop: 1, 
              borderColor: 'divider',
              display: 'flex',
              gap: 1
            }}
          >
            <Paper
              component="form"
              variant="outlined"
              onSubmit={handleFormSubmit} // Add onSubmit handler
              sx={{
                display: 'flex',
                alignItems: 'center',
                flex: 1,
                pl: 2,
                pr: 1,
                py: 0.5
              }}
            >
              <InputBase
                sx={{ flex: 1 }}
                placeholder="Type your message..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                autoFocus
                inputProps={{ 'aria-label': 'message input' }}
              />
            </Paper>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              endIcon={<SendIcon />}
              size="small"
              sx={{ px: 2 }}
            >
              Send
            </Button>
          </Box>
        </Paper>
      </Fade>
    </>
  );
}