import { Card, CardContent, Typography, Badge } from '@mui/material';
import { PowerSettingsNew as PowerIcon } from '@mui/icons-material';

export default function BotaoCard({ titulo, valor }) {
  return (
    <Card sx={{
      height: 200, backgroundColor: '#1e1e1e', color: '#00e5ff',
      borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center',
      '&:hover': { transform: 'scale(1.03)' }, transition: 'transform 0.3s ease-in-out'
    }}>
      <CardContent sx={{ textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          <PowerIcon sx={{ verticalAlign: 'middle', mr: 1 }} /> {titulo}
        </Typography>
        <Badge
          badgeContent={valor === 'pressionado' ? 'ON' : 'OFF'}
          color={valor === 'pressionado' ? 'success' : 'error'}
        />
        <Typography variant="h4" sx={{ mt: 2 }}>
          {valor || '--'}
        </Typography>
      </CardContent>
    </Card>
  );
}
