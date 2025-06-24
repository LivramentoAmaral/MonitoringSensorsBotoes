import { Card, CardContent, Typography } from '@mui/material';
import { Thermostat as ThermostatIcon } from '@mui/icons-material';

export default function TemperaturaCard({ valor }) {
  return (
    <Card sx={{
      width: "100%", maxWidth: 300, minWidth: 250,
      height: 200, backgroundColor: '#1e1e1e', color: '#00e5ff',
      borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <CardContent sx={{ textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          <ThermostatIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> Temperatura
        </Typography>
        <Typography variant="h4" sx={{ mt: 2 }}>
          {valor || '--'}
        </Typography>
      </CardContent>
    </Card>
  );
}
