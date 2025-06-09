// src/App.js
import '@fontsource/orbitron';
import {
  RadioButtonChecked as JoystickIcon,
  Menu as MenuIcon,
  Sensors as SensorsIcon,
  Thermostat as ThermostatIcon,
  PowerSettingsNew as PowerIcon
} from '@mui/icons-material';
import {
  AppBar, Badge, Box, Card, CardContent, CircularProgress, Container,
  CssBaseline, Grid, IconButton, ThemeProvider, Toolbar, Typography
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import TemperatureChart from './TemperatureChart';
import theme from './theme';

export default function App() {
  const [open, setOpen] = useState(false);
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [direcaoAnterior, setDirecaoAnterior] = useState(null);

  const fetchDados = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/sensores');
      setDados(data);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDados();
    const interval = setInterval(fetchDados, 5000);
    return () => clearInterval(interval);
  }, []);

  const ultimo = dados.length > 0 ? dados[0] : null;

  useEffect(() => {
    if (ultimo?.joystick?.direcao && ultimo.joystick.direcao !== direcaoAnterior) {
      setDirecaoAnterior(ultimo.joystick.direcao);
    }
  }, [ultimo]);

  const cardStyle = {
    minHeight: 180,
    backgroundColor: '#1e1e1e',
    color: '#00e5ff',
    borderRadius: '12px',
    transition: 'transform 0.3s ease-in-out',
    '&:hover': { transform: 'scale(1.03)' }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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

        <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Grid container spacing={4}>
                <Grid item xs={12} md={3}>
                  <Card sx={cardStyle}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" gutterBottom>
                        <PowerIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Botão 1
                      </Typography>
                      {ultimo && (
                        <Badge
                          badgeContent={ultimo.botao1 === 'pressionado' ? 'ON' : 'OFF'}
                          color={ultimo.botao1 === 'pressionado' ? 'success' : 'error'}
                        />
                      )}
                      <Typography variant="h4" sx={{ mt: 2 }}>
                        {ultimo ? ultimo.botao1 : '--'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Card sx={cardStyle}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" gutterBottom>
                        <PowerIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Botão 2
                      </Typography>
                      {ultimo && (
                        <Badge
                          badgeContent={ultimo.botao2 === 'pressionado' ? 'ON' : 'OFF'}
                          color={ultimo.botao2 === 'pressionado' ? 'success' : 'error'}
                        />
                      )}
                      <Typography variant="h4" sx={{ mt: 2 }}>
                        {ultimo ? ultimo.botao2 : '--'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Card sx={cardStyle}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" gutterBottom>
                        <ThermostatIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Temperatura
                      </Typography>
                      <Typography variant="h4" sx={{ mt: 2 }}>
                        {ultimo ? `${ultimo.temperatura}°C` : '--'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={3}>
                  <Card sx={cardStyle}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" gutterBottom>
                        <JoystickIcon
                          sx={{
                            verticalAlign: 'middle',
                            mr: 1,
                            transform: `rotate(${direcaoAnterior === 'direita' ? '90deg' :
                              direcaoAnterior === 'esquerda' ? '-90deg' :
                              direcaoAnterior === 'baixo' ? '180deg' : '0deg'})`,
                            transition: 'transform 0.3s ease-in-out'
                          }}
                        /> Direção
                      </Typography>
                      <Typography variant="h4" sx={{ mt: 2 }}>
                        {ultimo?.joystick?.direcao || '--'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Box sx={{ mt: 6 }}>
                <TemperatureChart dados={dados} />
              </Box>
            </>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}
