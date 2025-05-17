import { Typography } from "@mui/material";
import { Box } from "@mui/system";

interface UserDashboardTitleProps {
  title?: string;
}

const UserDashboardTitle: React.FC<UserDashboardTitleProps> = ({ 
  title = "Shift Management System" // Default title
}) => {

      return(
            <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 3,
            mt: 1,
          }}
        >
          <Box
            sx={{
              px: { xs: 2, sm: 4 },
              py: { xs: 1, sm: 2 },
              borderRadius: 2,
              background: '#1a1a1a', // darker background for contrast
              boxShadow: '0 8px 32px 0 rgba(0, 194, 140, 0.2)',
              maxWidth: '900px', // wider container
              width: '100%',
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              align="center"
              noWrap // Forces single line
              sx={{
                color: '#00c28c', // Match your theme's primary color
                fontWeight: 900,
                fontFamily: '"Montserrat", "Roboto", sans-serif',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.8rem' }, // Slightly smaller for better fit
                lineHeight: 1.1,
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  letterSpacing: '0.04em',
                  transform: 'scale(1.02)',
                },
              }}
            >
              {title}
            </Typography>
          </Box>
        </Box>
      );
};

export default UserDashboardTitle;