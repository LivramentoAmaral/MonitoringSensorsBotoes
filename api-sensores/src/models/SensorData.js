const mongoose = require('mongoose');

const SensorDataSchema = new mongoose.Schema({
  botao1: String,
  botao2: String,
  temperatura: String,
  joystick: {
    x: Number,
    y: Number,
    direcao: String
  },
  data: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SensorData', SensorDataSchema);
