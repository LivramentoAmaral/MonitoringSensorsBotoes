const express = require('express');
const router = express.Router();
const sensorController = require('../controller/controller_sensor');

// POST: Criar ou atualizar dados do sensor
router.post('/', sensorController.criarOuAtualizarSensor);

// GET: Listar todos os dados dos sensores
router.get('/', sensorController.listarSensores);

module.exports = router;
