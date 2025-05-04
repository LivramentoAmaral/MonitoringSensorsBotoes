## 🎯 **Cenário de Aplicação: Estação de Monitoramento em Transporte Escolar Acessível**

### 📘 Descrição

Imagine um sistema de **monitoramento embarcado** em veículos de transporte escolar acessível. A **Raspberry Pi Pico W** atua como unidade embarcada, coletando informações de interação dos passageiros com botões físicos e um joystick adaptado (por exemplo, usado por cadeirantes ou pessoas com deficiência motora para sinalizar ao motorista).

### 🚍 Como funciona:

* **Botão 1**: Passageiro pressiona para solicitar parada acessível.
* **Botão 2**: Motorista pressiona para confirmar que visualizou o pedido.
* **Joystick**: Passageiro pode indicar uma direção de destino (ex: esquerda/direita na próxima esquina), como um método de comunicação não verbal.
* **Sensor de Temperatura**: Permite verificar condições térmicas dentro do veículo, importantes para conforto de passageiros com limitações.

Todos esses dados são coletados **a cada segundo** e enviados para um **servidor central** da Secretaria de Educação ou da operadora do transporte, por meio de uma API HTTP. O servidor pode registrar os eventos, alertar responsáveis ou acionar notificações para motoristas.

---

### 🧩 Benefícios do Sistema:

* **Inclusão digital e acessibilidade**: usuários com deficiência têm uma forma direta de comunicação.
* **Segurança**: todas as interações são monitoradas em tempo real.
* **Escalável**: múltiplos veículos podem usar o mesmo código, alterando apenas o IP do servidor.
* **Baixo custo**: utiliza hardware acessível e conexão Wi-Fi.

---
