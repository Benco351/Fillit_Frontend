import { Box, Typography } from '@mui/material';
import LogoOnly from '../Logo';

const Branding = () => {
  return (
      <Box sx={{ flex: '1 1 250px', minWidth: 200 }}>
        <LogoOnly/>
        <Typography variant="body2" sx={{ mb: 3, opacity: 0.7 }}>
          The intelligent shift management platform that streamlines scheduling and enhances team communication.
        </Typography>
    </Box>
  )
}

export default Branding