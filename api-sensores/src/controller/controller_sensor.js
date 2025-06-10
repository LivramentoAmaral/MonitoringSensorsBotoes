

const SensorData = require('../models/SensorData');

const criarOuAtualizarSensor = async (req, res) => {
  try {
    let payload = req.body;

    if (!payload.data) {
      payload.data = new Date();
    }

    const existing = await SensorData.findOne({ data: payload.data });

    if (existing) {
      existing.set(payload);
      await existing.save();
      return res.status(200).json({ message: 'Registro atualizado com sucesso', data: existing });
    }

    const novo = new SensorData(payload);
    await novo.save();
    return res.status(201).json({ message: 'Novo registro criado com sucesso', data: novo });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const listarSensores = async (req, res) => {
  try {
    const dados = await SensorData.find().sort({ data: -1 });
    res.json(dados);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  criarOuAtualizarSensor,
  listarSensores,
};
