import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Paper, Typography } from '@mui/material';

export default function TemperatureChart({ data }) {
  return (
    <Paper sx={{ p:2, mt:3, borderRadius:2 }}>
      <Typography variant="h6" gutterBottom>Temperatura ao Longo do Tempo</Typography>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tickFormatter={(t) => new Date(t).toLocaleTimeString()} />
          <YAxis unit="°C" />
          <Tooltip labelFormatter={(t) => new Date(t).toLocaleString()} />
          <Line type="monotone" dataKey="temperaturaValue" stroke="#1565c0" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
}
