
---
## 📡 SensorData API

API para registro e atualização de dados de sensores como botões, temperatura e joystick. Desenvolvida em Node.js com MongoDB.

### 🚀 Funcionalidades

* Criar novo registro de sensores
* Atualizar automaticamente um registro existente baseado na data
* Listar todos os registros ordenados pela data

---

### 🛠️ Tecnologias Utilizadas

* Node.js
* Express.js
* MongoDB
* Mongoose

---

### 📦 Estrutura Esperada do JSON

A API espera um JSON no seguinte formato:

```json
{
  "botao1": "pressionado",
  "botao2": "solto",
  "temperatura": "23.45 °C",
  "joystick": {
    "x": 2048,
    "y": 1024,
    "direcao": "Noroeste"
  },
  "data": "2025-04-30T12:34:56.789Z"
}
```

---

### 📁 Rotas da API

#### ▶️ Criar ou Atualizar Dados (POST)

`POST /api/sensores`

* Se o campo `data` já existir, atualiza o registro correspondente
* Se não existir, cria um novo registro

**Exemplo de requisição:**

```bash
curl -X POST http://localhost:5000/api/sensores \
-H "Content-Type: application/json" \
-d '{
  "botao1": "pressionado",
  "botao2": "solto",
  "temperatura": "23.45 °C",
  "joystick": {
    "x": 2048,
    "y": 1024,
    "direcao": "Noroeste"
  },
  "data": "2025-04-30T12:34:56.789Z"
}'
```

---

#### 📋 Listar Dados (GET)

`GET /api/sensores`

* Retorna todos os registros, ordenados do mais recente ao mais antigo.

---

#### 🛠 Atualizar por ID (PUT)

`PUT /api/sensores/:id`

* Atualiza os campos de um registro existente pelo seu ID.

---

### ⚙️ Como Rodar o Projeto

```bash
# Instale as dependências
npm install

# Inicie o servidor
npm start
```

---

### 🌐 Configuração do MongoDB

Certifique-se de que o MongoDB está em execução e que a variável de ambiente `MONGODB_URI` está definida corretamente no seu `.env`:

```
MONGODB_URI=mongodb://localhost:27017/sensores
```

---
