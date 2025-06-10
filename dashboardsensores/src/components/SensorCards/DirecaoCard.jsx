import { Card, CardContent, Typography } from '@mui/material';
import { RadioButtonChecked as JoystickIcon } from '@mui/icons-material';

export default function DirecaoCard({ direcao }) {
  const angulo = direcao === 'direita' ? 90 : direcao === 'esquerda' ? -90 : direcao === 'baixo' ? 180 : 0;

  return (
    <Card sx={{
      height: 200, backgroundColor: '#1e1e1e', color: '#00e5ff',
      borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <CardContent sx={{ textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          <JoystickIcon sx={{
            verticalAlign: 'middle',
            mr: 1,
            transform: `rotate(${angulo}deg)`,
            transition: 'transform 0.5s ease-in-out'
          }} />
          Direção
        </Typography>
        <Typography variant="h4" sx={{ mt: 2 }}>
          {direcao || '--'}
        </Typography>
      </CardContent>
    </Card>
  );
}
