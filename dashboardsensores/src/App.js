import '@fontsource/orbitron';
import { Box, Container, CssBaseline, Grid, ThemeProvider, CircularProgress } from '@mui/material';
import theme from './core/theme/theme';
import useSensorData from './hooks/useSensorData';
import AppHeader from './components/Layout/AppHeader';
import BotaoCard from './components/SensorCards/BotaoCard';
import TemperaturaCard from './components/SensorCards/TemperaturaCard';
import DirecaoCard from './components/SensorCards/DirecaoCard';
import TemperatureChart from './components/GraficTemperature/TemperatureChart';
import React, { useState } from 'react';

export default function App() {
  const [open, setOpen] = useState(false);
  const { dados, ultimo, loading, direcaoAnterior } = useSensorData();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppHeader open={open} setOpen={setOpen} />

        <Container maxWidth="lg" sx={{ mt: 10, mb: 4 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Grid container spacing={6}>
                <Grid item xs={12} sm={6} md={3}>
                  <BotaoCard titulo="Botão 1" valor={ultimo?.botao1} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <BotaoCard titulo="Botão 2" valor={ultimo?.botao2} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TemperaturaCard valor={ultimo?.temperatura} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <DirecaoCard direcao={direcaoAnterior} />
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
