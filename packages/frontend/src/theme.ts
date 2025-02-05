import { createTheme } from '@mui/material';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#306ad0',
      light: '#5d91ed', // accent
      dark: '#306ad0', // same as main to keep consistent
    },
    secondary: {
      main: '#82a8ea',
      light: '#82a8ea', // same as main to keep consistent
      dark: '#82a8ea', // same as main to keep consistent
    },
    text: {
      primary: '#04070b',
      secondary: '#04070b',
    },
    background: {
      default: '#f3f6fb',
      paper: '#f3f6fb',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
          margin: 0,
          padding: 0,
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#c1c1c1',
            borderRadius: '4px',
            '&:hover': {
              background: '#a8a8a8',
            },
          },
          '&::-webkit-scrollbar-corner': {
            background: 'transparent',
          },
        },
        'html, body': {
          scrollBehavior: 'smooth',
        },
        // Firefox scrollbar styling
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: '#c1c1c1 #f1f1f1',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#f3f6fb',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(48, 106, 208, 0.12)',
          minWidth: '950px',
          '& .MuiDialogTitle-root': {
            color: '#04070b',
            padding: '24px',
            fontSize: '1.25rem',
            fontWeight: 600,
            borderBottom: '1px solid #82a8ea',
          },
          '& .MuiDialogContent-root': {
            padding: '24px',
            color: '#04070b',
            '& .MuiTextField-root': {
              marginBottom: '16px',
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#306ad0',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#306ad0',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#306ad0',
              },
            },
          },
          '& .MuiDialogActions-root': {
            padding: '16px 24px',
            borderTop: '1px solid #82a8ea',
            '& .MuiButton-root': {
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 500,
              padding: '8px 16px',
              '&.MuiButton-contained': {
                backgroundColor: '#306ad0',
                color: '#f3f6fb',
                '&:hover': {
                  backgroundColor: '#5d91ed',
                },
              },
              '&.MuiButton-text': {
                color: '#04070b',
                '&:hover': {
                  backgroundColor: 'rgba(48, 106, 208, 0.08)',
                },
              },
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});
