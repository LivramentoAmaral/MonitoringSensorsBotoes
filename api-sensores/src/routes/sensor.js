const express = require('express');
const router = express.Router();
const SensorData = require('../models/SensorData');

// Rota POST para criar novo registro
router.post('/', async (req, res) => {
  try {
    let payload = req.body;

    // Define automaticamente a data se não enviada
    if (!payload.data) {
      payload.data = new Date();
    }

    let existing = await SensorData.findOne({ data: payload.data });

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
});

// Rota GET para listar todos os dados
router.get('/', async (req, res) => {
  try {
    const dados = await SensorData.find().sort({ data: -1 });
    res.json(dados);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



module.exports = router;
