import React, { useEffect, useState } from 'react';
import {
  ThemeProvider, CssBaseline, Box, Drawer, AppBar, Toolbar,
  List, ListItem, ListItemIcon, ListItemText, IconButton,
  Typography, Container, Grid, Card, CardContent, Badge, CircularProgress
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Sensors as SensorsIcon,
  Thermostat as ThermostatIcon,
  RadioButtonChecked as JoystickIcon
} from '@mui/icons-material';
import axios from 'axios';
import theme from './theme';
import TemperatureChart from './TemperatureChart';

const drawerWidth = 240;

export default function App() {
  const [open, setOpen] = useState(false);
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDados = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/sensores');
      setDados(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDados();
    const interval = setInterval(fetchDados, 5000);
    return () => clearInterval(interval);
  }, []);

  const ultimo = dados[0];
  const chartData = dados.map(item => ({
    time: item.data,
    temperaturaValue: parseFloat(item.temperatura)
  }));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <AppBar position="fixed" sx={{ width: `calc(100% - ${drawerWidth}px)`, ml: drawerWidth }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => setOpen(!open)} sx={{ mr:2 }}>
              <MenuIcon />
            </IconButton>
            <SensorsIcon sx={{ mr:1 }} />
            <Typography variant="h6">Dashboard de Sensores</Typography>
          </Toolbar>
        </AppBar>

        <Drawer variant="permanent" open={open}
                sx={{
                  width: drawerWidth,
                  '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' }
                }}>
          <Toolbar />
          <List>
            {['Visão Geral','Sensores','Configurações'].map((text, idx) => {
              const icons = [<DashboardIcon/>, <SensorsIcon/>, <ThermostatIcon/>];
              return (
                <ListItem button key={text}>
                  <ListItemIcon>{icons[idx]}</ListItemIcon>
                  <ListItemText primary={text} />
                </ListItem>
              );
            })}
          </List>
        </Drawer>

        <Box component="main" sx={{ flexGrow:1, p:3, mt:8 }}>
          <Container maxWidth="lg">
            {loading ? (
              <Box sx={{ display:'flex', justifyContent:'center', mt:10 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ position:'relative' }}>
                      <Badge
                        badgeContent={ultimo?.botao1 === 'pressionado' ? 'ON' : 'OFF'}
                        color={ultimo?.botao1 === 'pressionado' ? 'success' : 'error'}
                        sx={{ position:'absolute', top:16, right:16 }}
                      />
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          <SensorsIcon sx={{ verticalAlign:'middle', mr:1 }} /> Botão 1
                        </Typography>
                        <Typography variant="h4">{ultimo?.botao1}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card sx={{ position:'relative' }}>
                      <Badge
                        badgeContent={ultimo?.botao2 === 'pressionado' ? 'ON' : 'OFF'}
                        color={ultimo?.botao2 === 'pressionado' ? 'success' : 'error'}
                        sx={{ position:'absolute', top:16, right:16 }}
                      />
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          <SensorsIcon sx={{ verticalAlign:'middle', mr:1 }} /> Botão 2
                        </Typography>
                        <Typography variant="h4">{ultimo?.botao2}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          <ThermostatIcon sx={{ verticalAlign:'middle', mr:1 }} /> Temperatura
                        </Typography>
                        <Typography variant="h4">{ultimo?.temperatura}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          <JoystickIcon sx={{ verticalAlign:'middle', mr:1 }} /> Direção
                        </Typography>
                        <Typography variant="h4">{ultimo?.joystick?.direcao}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Gráfico de Temperatura */}
                <TemperatureChart data={chartData} />
              </>
            )}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
