import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary:  { main: '#1565c0' },
    secondary:{ main: '#ff5722' },
    background:{ default: '#f4f6f8', paper: '#fff' },
  },
  typography: {
    fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
    h6: { fontWeight: 600 },
    h4: { fontWeight: 700 },
  },
});

export default theme;
