export default {
  MuiUseMediaQuery: {
    defaultProps: {
      noSsr: true,
    },
  },
  MuiCssBaseline: {
    styleOverrides: (theme) => ({
      '*': {
        scrollbarWidth: 'thin',
        scrollbarColor: `${theme.palette.mode === 'dark' ? '#3a3b41' : '#9ca3af'} transparent`,
      },
      '::-webkit-scrollbar': { width: 6, height: 6 },
      '::-webkit-scrollbar-track': { background: 'transparent' },
      '::-webkit-scrollbar-thumb': {
        background: theme.palette.mode === 'dark' ? '#3a3b41' : '#9ca3af',
        borderRadius: 999,
      },
    }),
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
    },
  },
  MuiAppBar: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundImage: 'none',
      }),
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: ({ theme }) => ({
        backgroundColor: theme.palette.background.paper,
        borderColor: theme.palette.divider,
      }),
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#1b1c20' : '#ffffff',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.divider,
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: theme.palette.text.secondary,
        },
      }),
    },
  },
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        borderRadius: 6,
      },
      sizeMedium: {
        height: '40px',
      },
      containedPrimary: ({ theme }) => ({
        '&:hover': {
          backgroundColor: theme.palette.mode === 'dark' ? '#b2f479' : '#3a6300',
        },
      }),
    },
  },
  MuiFormControl: {
    defaultProps: {
      size: 'small',
    },
  },
  MuiSnackbar: {
    defaultProps: {
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'center',
      },
    },
  },
  MuiTooltip: {
    defaultProps: {
      enterDelay: 500,
      enterNextDelay: 500,
    },
    styleOverrides: {
      tooltip: {
        backgroundColor: '#24252a',
        border: '1px solid #3a3b41',
        color: '#fafafa',
        fontSize: 12,
      },
      arrow: {
        color: '#24252a',
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        '&.Mui-selected, &.Mui-selected:hover': {
          backgroundColor: `${theme.palette.primary.main}22`,
        },
      }),
    },
  },
  MuiLink: {
    defaultProps: {
      underline: 'hover',
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderColor: theme.palette.divider,
        '@media print': {
          color: theme.palette.alwaysDark.main,
        },
      }),
    },
  },
};
