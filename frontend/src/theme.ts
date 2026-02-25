// RTF Reporting Tool - Material-UI Theme Configuration
import { createTheme } from '@mui/material/styles';
import { deDE } from '@mui/material/locale';

// German banking industry color palette
const palette = {
  primary: {
    main: '#1976d2', // Professional blue
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#ffffff'
  },
  secondary: {
    main: '#f57c00', // Orange accent (Bundesbank colors)
    light: '#ffb74d',
    dark: '#ef6c00',
    contrastText: '#ffffff'
  },
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
    contrastText: '#ffffff'
  },
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
    contrastText: '#ffffff'
  },
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
    contrastText: '#ffffff'
  },
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
    contrastText: '#ffffff'
  },
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121'
  },
  background: {
    default: '#fafafa',
    paper: '#ffffff'
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)'
  }
};

// Typography settings for German business applications
const typography = {
  fontFamily: [
    'Roboto',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif'
  ].join(','),
  h1: {
    fontSize: '2.125rem',
    fontWeight: 300,
    lineHeight: 1.167
  },
  h2: {
    fontSize: '1.5rem',
    fontWeight: 400,
    lineHeight: 1.2
  },
  h3: {
    fontSize: '1.25rem',
    fontWeight: 500,
    lineHeight: 1.167
  },
  h4: {
    fontSize: '1.125rem',
    fontWeight: 500,
    lineHeight: 1.235
  },
  h5: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.334
  },
  h6: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.6
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.75
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.57
  },
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.5
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.43
  },
  button: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.75,
    textTransform: 'none' as const // German UI convention
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.66
  },
  overline: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 2.66,
    textTransform: 'uppercase' as const
  }
};

// Component customizations
const components = {
  // App Bar customization
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: palette.primary.main,
        boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2)',
        '& .MuiToolbar-root': {
          minHeight: '64px'
        }
      }
    }
  },

  // Paper customization
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none'
      },
      elevation1: {
        boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)'
      }
    }
  },

  // Button customizations
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: '4px',
        textTransform: 'none',
        fontWeight: 500,
        padding: '8px 16px'
      },
      containedPrimary: {
        boxShadow: '0px 3px 1px -2px rgba(0,0,0,0.2),0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
        '&:hover': {
          boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2),0px 4px 5px 0px rgba(0,0,0,0.14),0px 1px 10px 0px rgba(0,0,0,0.12)'
        }
      }
    }
  },

  // TextField customizations for German forms
  MuiTextField: {
    defaultProps: {
      variant: 'outlined' as const,
      size: 'medium' as const
    },
    styleOverrides: {
      root: {
        '& .MuiInputLabel-root': {
          fontSize: '1rem'
        },
        '& .MuiOutlinedInput-root': {
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: palette.primary.main
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: palette.primary.main,
            borderWidth: '2px'
          },
          '&.Mui-error:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: palette.error.main
          }
        }
      }
    }
  },

  // Table customizations
  MuiTableHead: {
    styleOverrides: {
      root: {
        backgroundColor: palette.grey[100],
        '& .MuiTableCell-head': {
          fontWeight: 600,
          fontSize: '0.875rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }
      }
    }
  },

  MuiTableRow: {
    styleOverrides: {
      root: {
        '&:hover': {
          backgroundColor: palette.grey[50]
        }
      }
    }
  },

  // Card customizations
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: '8px',
        boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2),0px 1px 1px 0px rgba(0,0,0,0.14),0px 1px 3px 0px rgba(0,0,0,0.12)'
      }
    }
  },

  // Tabs customizations
  MuiTabs: {
    styleOverrides: {
      root: {
        minHeight: '48px',
        borderBottom: `1px solid ${palette.grey[300]}`
      },
      indicator: {
        height: '3px',
        borderRadius: '3px 3px 0 0'
      }
    }
  },

  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 500,
        fontSize: '0.875rem',
        minHeight: '48px',
        padding: '12px 16px',
        '&.Mui-selected': {
          fontWeight: 600
        }
      }
    }
  },

  // Form control customizations
  MuiFormControlLabel: {
    styleOverrides: {
      root: {
        marginLeft: 0,
        marginRight: '16px',
        '& .MuiFormControlLabel-label': {
          fontSize: '1rem',
          userSelect: 'none'
        }
      }
    }
  },

  // Chip customizations
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: '16px',
        height: '32px',
        fontSize: '0.8125rem'
      }
    }
  },

  // Alert customizations
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: '4px',
        fontSize: '0.875rem',
        '& .MuiAlert-message': {
          padding: '8px 0'
        }
      }
    }
  },

  // Dialog customizations
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: '8px'
      }
    }
  },

  // Drawer customizations
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRight: `1px solid ${palette.grey[200]}`,
        backgroundColor: '#ffffff'
      }
    }
  },

  // Menu customizations
  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: '8px',
        boxShadow: '0px 5px 5px -3px rgba(0,0,0,0.2),0px 8px 10px 1px rgba(0,0,0,0.14),0px 3px 14px 2px rgba(0,0,0,0.12)',
        marginTop: '8px'
      }
    }
  }
};

// Create the theme
export const theme = createTheme(
  {
    palette,
    typography,
    components,
    shape: {
      borderRadius: 4
    },
    spacing: 8,
    transitions: {
      easing: {
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        sharp: 'cubic-bezier(0.4, 0, 0.6, 1)'
      },
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195
      }
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920
      }
    },
    zIndex: {
      mobileStepper: 1000,
      speedDial: 1050,
      appBar: 1100,
      drawer: 1200,
      modal: 1300,
      snackbar: 1400,
      tooltip: 1500
    }
  },
  deDE // German locale
);

export default theme;