# 🧠 Raspberry Pi Pico - Leitura de Sensores e Envio via TCP

Este projeto implementa a leitura de sensores conectados à **Raspberry Pi Pico W** e o envio dos dados formatados em JSON para uma API REST via conexão TCP/IP, utilizando a biblioteca **lwIP**. Ele lê botões, joystick analógico e temperatura interna da Pico, enviando os dados para um servidor backend.

## 📦 Funcionalidades

* Leitura do estado de dois botões físicos (GPIO 5 e 6)
* Leitura do eixo X e Y de um joystick analógico (GPIO 27 e 26)
* Mapeamento da direção do joystick (ex: Norte, Sul, Leste, etc.)
* Leitura da temperatura interna da Raspberry Pi Pico
* Conexão Wi-Fi com autenticação WPA2
* Formatação dos dados em JSON
* Envio de dados para servidor remoto via protocolo **TCP** com requisição **HTTP POST**

## 🔌 Componentes Utilizados

* Raspberry Pi Pico W
* 2 Botões táteis
* 1 Joystick analógico
* Conexão Wi-Fi
* Servidor backend com API escutando na porta 5000

## 📡 Requisitos

* **Raspberry Pi Pico W** com firmware C/C++ SDK
* Servidor rodando em `192.168.1.109:5000` com endpoint `/api/sensores`
* Bibliotecas:

  * `pico/stdlib.h`
  * `hardware/adc.h`
  * `lwip/tcp.h`
  * `cyw43_arch.h`

## 🔧 Configuração

### Pinos

| Componente | Pino Pico |
| ---------- | --------- |
| Botão 1    | GPIO 5    |
| Botão 2    | GPIO 6    |
| Joystick X | GPIO 27   |
| Joystick Y | GPIO 26   |

### Wi-Fi

Altere as credenciais no código:

```c
#define WIFI_SSID "SEU_SSID"
#define WIFI_PASS "SUA_SENHA"
```

### Servidor

O servidor deve aceitar conexões HTTP POST em:

```
http://seuServerId:5000/api/sensores
```

## 🧪 Formato da Requisição JSON

```json
{
  "botao1": "pressionado",
  "botao2": "solto",
  "temperatura": "27.56 °C",
  "joystick": {
    "x": 2060,
    "y": 1980,
    "direcao": "Centro"
  },
  "data": "2025-04-30T12:34:56.789Z"
}
```

## 🔁 Fluxo de A

1. Inicializa Wi-Fi e sensores
2. Lê os dados dos sensores a cada segundo
3. Formata os dados como JSON
4. Conecta ao servidor TCP e envia uma requisição HTTP POST
5. Exibe a resposta no terminal

## 📂 Organização do Código

* `main()` — Ponto de entrada; realiza setup de rede e sensores
* `monitor_sensors()` — Leitura dos sensores e atualização de variáveis
* `send_sensor_data()` — Envia os dados como JSON via TCP para o servidor
* `map_joystick_to_direction()` — Converte os valores X/Y em direção textual
* Callbacks `tcp_*` — Lida com os eventos TCP: conexão, envio, erro e resposta

## 📈 Exemplo de Saída no Terminal

```
----------------------
STATUS DO SISTEMA:
----------------------
Botão 1: pressionado
Botão 2: solto
Temperatura: 28.12 °C
Joystick X: 2090 | Y: 2010
Direção: Centro
----------------------
JSON enviado com sucesso!
```


