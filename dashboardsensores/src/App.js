import {
  RadioButtonChecked as JoystickIcon,
  Menu as MenuIcon,
  Sensors as SensorsIcon,
  Thermostat as ThermostatIcon
} from '@mui/icons-material';
import {
  AppBar,
  Badge,
  Box,
  Card, CardContent,
  CircularProgress,
  Container,
  CssBaseline,
  Grid,
  IconButton,
  ThemeProvider,
  Toolbar,
  Typography
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import TemperatureChart from './TemperatureChart';
import theme from './theme';

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

  const ultimo = dados && dados.length > 0 ? dados[0] : null;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <AppBar sx={{ width: "100%" }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={() => setOpen(!open)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            <SensorsIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Dashboard de Sensores</Typography>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
          <Container maxWidth="lg">
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Card sx={{ position: 'relative', minHeight: 150 ,minWidth:270}}>
                      {ultimo && (
                        <Badge
                          badgeContent={ultimo.botao1 === 'pressionado' ? 'ON' : 'OFF'}
                          color={ultimo.botao1 === 'pressionado' ? 'success' : 'error'}
                          sx={{ position: 'absolute', top: 16, right: 16 }}
                        />
                      )}
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom>
                          <SensorsIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Botão 1
                        </Typography>
                        <Typography variant="h4">{ultimo ? ultimo.botao1 : '--'}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card sx={{ position: 'relative', minHeight: 150, minWidth:270 }}>
                      {ultimo && (
                        <Badge
                          badgeContent={ultimo.botao2 === 'pressionado' ? 'ON' : 'OFF'}
                          color={ultimo.botao2 === 'pressionado' ? 'success' : 'error'}
                          sx={{ position: 'absolute', top: 16, right: 16 }}
                        />
                      )}
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom>
                          <SensorsIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Botão 2
                        </Typography>
                        <Typography variant="h4">{ultimo ? ultimo.botao2 : '--'}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card sx={{ minHeight: 150, minWidth:270 }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom>
                          <ThermostatIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Temperatura
                        </Typography>
                        <Typography variant="h4">{ultimo ? ultimo.temperatura : '--'}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Card sx={{ minHeight: 150, minWidth:270 }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom>
                          <JoystickIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Direção
                        </Typography>
                        <Typography variant="h4">{ultimo?.joystick?.direcao || '--'}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Gráfico de Temperatura */}
                <TemperatureChart dados={dados} />
              </>
            )}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
