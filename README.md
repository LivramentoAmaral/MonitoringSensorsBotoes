
---

## 🎯 **Cenário de Aplicação: Estação de Monitoramento em Transporte Escolar Acessível**

### 📘 Descrição

Imagine um sistema de **monitoramento embarcado** em veículos de transporte escolar acessível. A **Raspberry Pi Pico W** atua como unidade embarcada, coletando informações de interação dos passageiros com botões físicos e um joystick adaptado (por exemplo, usado por cadeirantes ou pessoas com deficiência motora para sinalizar ao motorista).

Este projeto foi desenvolvido no contexto do **Desafio Embarca Tech**, e incorporou **desafios extras** como:

* A integração de **sensores de temperatura** para controle ambiental interno;
* A criação de uma **rosa dos ventos interativa**, por meio do uso do joystick;
* O monitoramento detalhado das **ações dos botões físicos** e do **joystick adaptado**, permitindo comunicação alternativa com o condutor.

---

### 🚍 Como funciona:

* **Botão 1**: Passageiro pressiona para solicitar uma parada acessível.
* **Botão 2**: Motorista pressiona para confirmar que visualizou o pedido.
* **Joystick**: Passageiro pode indicar a direção de destino (ex: esquerda/direita na próxima esquina), representando uma **rosa dos ventos adaptada** como método de comunicação não verbal.
* **Sensor de Temperatura**: Verifica as condições térmicas dentro do veículo, promovendo conforto e bem-estar, especialmente para passageiros com mobilidade reduzida.

---

### 🌐 Comunicação com o servidor

Todos os dados são coletados **a cada segundo** e enviados via **HTTP (Wi-Fi)** para um **servidor central** mantido pela Secretaria de Educação ou pela operadora de transporte. O sistema:

* Registra os eventos;
* Gera alertas em tempo real para os responsáveis;
* Possibilita ações imediatas por parte dos motoristas ou centrais de monitoramento.

---

### 🧩 Benefícios do Sistema:

✅ **Inclusão digital e acessibilidade**: oferece meios de comunicação simples e eficientes para passageiros com deficiência.

✅ **Segurança em tempo real**: permite que familiares, escolas e gestores acompanhem o trajeto e interações dos passageiros.

✅ **Escalabilidade**: múltiplos veículos podem ser integrados à solução, alterando apenas a configuração da rede.

✅ **Baixo custo e alta eficiência**: utiliza componentes de fácil aquisição, como a Raspberry Pi Pico W e sensores simples.

✅ **Personalização e inovação**: o sistema atende a requisitos específicos de acessibilidade e traz **desafios técnicos avançados** solucionados com criatividade e responsabilidade social.

---

