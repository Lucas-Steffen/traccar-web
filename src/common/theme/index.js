import { useMemo } from 'react';
import { createTheme } from '@mui/material/styles';
import palette from './palette';
import dimensions from './dimensions';
import components from './components';

export default (server, darkMode, direction) =>
  useMemo(
    () =>
      createTheme({
        typography: {
          fontFamily: '"Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
          button: {
            textTransform: 'none',
            fontWeight: 700,
          },
        },
        shape: {
          borderRadius: 6,
        },
        palette: palette(server, darkMode),
        direction,
        dimensions,
        components,
      }),
    [server, darkMode, direction],
  );
