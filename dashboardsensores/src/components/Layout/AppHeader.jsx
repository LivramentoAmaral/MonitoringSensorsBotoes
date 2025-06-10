import { AppBar, IconButton, Toolbar, Typography } from '@mui/material';
import { Menu as MenuIcon, Sensors as SensorsIcon } from '@mui/icons-material';

export default function AppHeader({ open, setOpen }) {
  return (
    <AppBar position="fixed" sx={{ backgroundColor: '#1f1f1f' }}>
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={() => setOpen(!open)} sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <SensorsIcon sx={{ mr: 1 }} />
        <Typography variant="h6" noWrap>
          Dashboard de Sensores
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
