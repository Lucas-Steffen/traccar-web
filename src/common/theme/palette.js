// Paleta Localize-C, alinhada ao padrão Mobilize-C (MOB-CCO-Frontend/src/styles/tailwind-theme.css)
const dark = {
  background: '#151619',
  paper: '#24252a',
  muted: '#2b2c31',
  border: '#3a3b41',
  text: '#fafafa',
  textSecondary: '#a1a1aa',
};

const light = {
  background: '#f0f2f5',
  paper: '#ffffff',
  muted: '#e5e7eb',
  border: '#cbd5e1',
  text: '#111827',
  textSecondary: '#4b5563',
};

export default (server, darkMode) => {
  const c = darkMode ? dark : light;
  return {
    mode: darkMode ? 'dark' : 'light',
    background: {
      default: c.background,
      paper: c.paper,
    },
    text: {
      primary: c.text,
      secondary: c.textSecondary,
    },
    divider: c.border,
    primary: {
      main: darkMode ? '#85d73e' : '#4d7c0f',
      light: '#b2f479',
      dark: darkMode ? '#5cb854' : '#3a6300',
      contrastText: darkMode ? '#111111' : '#ffffff',
    },
    secondary: {
      main: darkMode ? '#b6ff22' : '#3a6300',
      contrastText: '#111111',
    },
    neutral: {
      main: '#8b8b93',
    },
    surfaceMuted: {
      main: c.muted,
    },
    geometry: {
      main: '#38bdf8',
    },
    alwaysDark: {
      main: '#272727',
    },
  };
};
