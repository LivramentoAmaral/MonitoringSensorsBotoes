// src/TemperatureChart.js
import { Paper, Typography } from '@mui/material';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

export default function TemperatureChart({ dados }) {
  const dataFiltrada = dados
    .filter(item => item?.data && !isNaN(new Date(item.data).getTime()) && !isNaN(parseFloat(item.temperatura)))
    .map(item => ({
      time: new Date(item.data).getTime(),
      temperaturaValue: parseFloat(item.temperatura),
    }));

  return (
    <Paper
      sx={{
        p: 4,
        mt: 6,
        borderRadius: 4,
        background: 'linear-gradient(145deg, #0d1b2a, #1b263b)',
        color: '#00e5ff',
        fontFamily: '"Orbitron", "Roboto Mono", monospace',
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ color: '#00e5ff', mb: 3 }}>
        🌡️ Temperatura ao Longo do Tempo
      </Typography>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={dataFiltrada} margin={{ top: 10, right: 30, bottom: 5, left: 0 }}>
          <defs>
            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="#00e5ff25" strokeDasharray="4 4" />

          <XAxis
            dataKey="time"
            tickFormatter={(t) => new Date(t).toLocaleTimeString()}
            tick={{ fill: '#00e5ff', fontSize: 12, fontFamily: 'Orbitron' }}
            axisLine={{ stroke: '#00e5ff44' }}
            tickLine={{ stroke: '#00e5ff33' }}
          />

          <YAxis
            unit="°C"
            tick={{ fill: '#00e5ff', fontSize: 12, fontFamily: 'Orbitron' }}
            axisLine={{ stroke: '#00e5ff44' }}
            tickLine={{ stroke: '#00e5ff33' }}
            domain={['auto', 'auto']}
          />

          <Tooltip
            contentStyle={{
              background: '#1b263b',
              border: '1px solid #00e5ff44',
              borderRadius: 10,
              color: '#00e5ff',
              fontFamily: 'Orbitron, monospace',
              fontSize: 13,
            }}
            labelFormatter={(t) => `🕒 ${new Date(t).toLocaleTimeString()}`}
            formatter={(value) => [`🌡️ ${value} °C`, 'Temperatura']}
          />

          <Area
            type="monotone"
            dataKey="temperaturaValue"
            stroke="#00e5ff"
            fillOpacity={1}
            fill="url(#colorTemp)"
            strokeWidth={2.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
}
