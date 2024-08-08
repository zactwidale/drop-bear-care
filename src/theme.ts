'use client';
import { Roboto } from 'next/font/google';
import { createTheme, alpha } from '@mui/material/styles';
import { drawerWidth } from './lib/constants';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const palette = {
  background: {
    default: '#009CDE',
  },
  primary: {
    main: '#003087',
    contrastText: '#fff',
  },
  secondary: {
    main: '#009CDE',
    contrastText: '#fff',
  },
  success: {
    main: '#008000',
    contrastText: '#fff',
  },
  error: {
    main: '#f44336',
    contrastText: '#fff',
  },
  warning: {
    main: '#ff9800',
    contrastText: '#fff',
  },
  info: {
    main: '#2196f3',
    contrastText: '#fff',
  },
};

const baseTheme = createTheme();

const theme = createTheme({
  palette: palette,
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
  components: {
    MuiButton: {
      defaultProps: {
        variant: 'contained',
        color: 'primary',
      },
      styleOverrides: {
        root: {
          borderRadius: 50,
          border: '2px solid',
          borderColor: palette.primary.main,
          textTransform: 'none',
          fontWeight: 'bold',
          fontSize: '1rem',
          minWidth: '10rem',
          paddingLeft: baseTheme.spacing(4),
          paddingRight: baseTheme.spacing(4),
          '&:hover': {
            backgroundColor: palette.primary.contrastText,
            color: palette.primary.main,
          },
        },
        containedSecondary: {
          color: palette.primary.main,
          backgroundColor: palette.primary.contrastText,
          '&:hover': {
            color: palette.primary.contrastText,
            backgroundColor: palette.primary.main,
          },
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        position: 'fixed',
        color: 'transparent',
        elevation: 0,
        style: { width: '100%' }, //TODO - figure out why I can't move this to styleOverrides
      },
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          borderRadius: 0,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            color: '#fff',
          },
        },
      },
    },

    // MuiDrawer: {
    //   styleOverrides: {
    //     //This is a bit clumsy, but needed to do this to override the paper styles when used in the drawer component
    //     paper: {
    //       borderRadius: 0,
    //       width: drawerWidth,
    //     },
    //   },
    // },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          width: '90%',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginBottom: 32,
          elevation: 8,
          boxShadow:
            '0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)', // This is equivalent to elevation 8
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: 8,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: 8,
        },
      },
    },

    MuiLink: {
      styleOverrides: {
        root: {
          color: palette.secondary.main,
          fontWeight: 'bold',
          textDecoration: 'none',
          '&:hover': {
            color: alpha(palette.secondary.main, 0.5),
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: alpha(palette.secondary.main, 0.2),
          },
          '&.Mui-selected': {
            color: palette.secondary.main,
            backgroundColor: 'transparent',
            style: { fontWeight: 'bold' },
            '&:hover': {
              backgroundColor: alpha(palette.secondary.main, 0.2),
            },
            '& .MuiListItemText-primary': {
              fontWeight: 'bold',
            },
            // Make icon bold (if it's an SVG icon)
            '& .MuiListItemIcon-root': {
              '& svg': {
                color: palette.secondary.main,
              },
            },
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        fullWidth: true,
        margin: 'dense',
        size: 'small',
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          '&.Mui-focused': {
            color: palette.secondary.main,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: palette.secondary.main,
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          textAlign: 'right',
          marginRight: 0,
        },
      },
    },
    MuiMobileStepper: {
      styleOverrides: {
        root: {
          width: '100%',
          margin: 0,
          backgroundColor: 'transparent',
          //TODO - figure out how to style the stepper to eliminate it's internal margin
        },
      },
    },
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          backgroundColor: palette.primary.main,
          color: palette.primary.contrastText,
          borderRadius: 16,
          position: 'relative',
        },
        message: {
          paddingLeft: 8,
        },
        action: {
          position: 'absolute',
          right: 20,
          top: 8,
        },
      },
    },
  },
});

export default theme;
