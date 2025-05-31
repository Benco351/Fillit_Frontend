import { createTheme } from "@mui/material";



export const WhyChooseUsTheme = createTheme({
    palette: {
      primary: {
        main: '#00c28c', // Green color from Fillit logo
        dark: '#009e6f',
        light: '#33cf9f'
      },
      secondary: {
        main: '#2c353d', // Dark background from Fillit logo
        dark: '#232a31',
        light: '#4e5a64'
      },
      background: {
        default: '#f8f9fa',
        paper: '#ffffff'
      }
    },
    typography: {
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
      },
      h2: {
        fontWeight: 600,
      },
      button: {
        fontWeight: 500,
        textTransform: 'none',
      }
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 30,
            padding: '10px 24px',
            fontSize: '1rem',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
            transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.12)',
            },
          },
        },
      },
    },
});

export const MainTheme = createTheme({
  palette: {
    primary: {
      main: '#00c28c', // Green color from Fillit logo
      dark: '#009e6f',
      light: '#33cf9f'
    },
    secondary: {
      main: '#2c353d', // Dark background from Fillit logo
      dark: '#232a31',
      light: '#4e5a64'
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    }
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 30,
          padding: '10px 24px',
          fontSize: '1rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
  },
});

export const SignUpTheme = createTheme({
    palette: {
      primary: {
        main: '#00c28c',
        dark: '#009e6f',
        light: '#33cf9f',
      },
      secondary: { main: '#2c353d' },
      background: {
        default: '#2c353d',
        paper: '#3a3f47',
      },
      grey: {
        50: '#f9fafb',
        100: '#f2f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        800: '#2c353d',
      },
    },
    typography: {
      fontFamily: 'Poppins, Roboto, Helvetica, Arial, sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 600 },
      button: { fontWeight: 500, textTransform: 'none' },
    },
    shape: { borderRadius: 12 },
  });
  
export const LoginTheme = createTheme({
    palette: {
      primary: {
        main: '#00c28c',
        dark: '#009e6f',
        light: '#33cf9f',
      },
      secondary: { main: '#2c353d' },
      background: {
        default: '#2c353d',
        paper: '#3a3f47',
      },
      grey: {
        50: '#f9fafb',
        100: '#f2f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        800: '#2c353d',
      },
    },
    typography: {
      fontFamily: 'Poppins, Roboto, Helvetica, Arial, sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 600 },
      button: { fontWeight: 500, textTransform: 'none' },
    },
    shape: { borderRadius: 12 },
  });

// Create a custom theme with Fillit colors
export const NavBarTheme = createTheme({
  palette: {
    primary: {
      main: '#00c28c', // Green color from Fillit logo
      dark: '#009e6f',
      light: '#33cf9f'
    },
    secondary: {
      main: '#2c353d', // Dark background from Fillit logo
      dark: '#232a31',
      light: '#4e5a64'
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    }
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 30,
          padding: '10px 24px',
          fontSize: '1rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
  },
});

export const DrawerTheme = createTheme({
  palette: {
    primary: {
      main: '#00c28c', // Green color from Fillit logo
      dark: '#009e6f',
      light: '#33cf9f',
    },
    secondary: {
      main: '#2c353d', // Dark background from Fillit logo
      dark: '#232a31',
      light: '#4e5a64',
    },
    background: {
      default: '#2c353d',
      paper: '#3a3f47',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 600 },
    button: { fontWeight: 500, textTransform: 'none' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#2c353d',
          color: '#ffffff',
          padding: '16px',
          width: '280px',
        },
      },
    },
  },
});


export const AdminTheme = createTheme({
  palette: {
    primary: {
      main: '#093039', // Green color from Fillit logo
      dark: '#009e6f',
      light: '#33cf9f'
    },
    secondary: {
      main: '#2c353d', // Dark background from Fillit logo
      dark: '#232a31',
      light: '#4e5a64'
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff'
    }
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    }
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 30,
          padding: '10px 24px',
          fontSize: '1rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
  },
});

