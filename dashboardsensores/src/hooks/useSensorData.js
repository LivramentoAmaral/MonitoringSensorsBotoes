import { useEffect, useState } from 'react';
import axios from 'axios';

const useSensorData = () => {
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
    const interval = setInterval(fetchDados, 1000);
    return () => clearInterval(interval);
  }, []);

  const ultimo = dados[0];

  useEffect(() => {
    if (ultimo?.joystick?.direcao && ultimo.joystick.direcao !== direcaoAnterior) {
      setDirecaoAnterior(ultimo.joystick.direcao);
    }
  }, [ultimo, direcaoAnterior]);

  return { dados, ultimo, loading, direcaoAnterior };
};

export default useSensorData;
