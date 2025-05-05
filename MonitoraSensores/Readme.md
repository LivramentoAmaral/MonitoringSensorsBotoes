
# Código para Raspberry Pi Pico: Monitoramento de Sensores e Envio via TCP

Este código utiliza a Raspberry Pi Pico W para monitorar botões, um joystick e a temperatura interna. Os dados são enviados via TCP para um servidor, utilizando uma rede Wi-Fi. Abaixo está o código completo com explicações.

## Cabeçalhos e Definições Iniciais

```c
#include "pico/cyw43_arch.h"  // Biblioteca para o Wi-Fi da Raspberry Pi Pico W
#include "pico/stdlib.h"       // Biblioteca padrão da Raspberry Pi Pico (GPIO, UART, etc.)
#include "lwip/tcp.h"          // Biblioteca para TCP/IP, usada para comunicação com a API
#include "hardware/adc.h"      // Biblioteca para leitura de ADC (para o joystick e temperatura)
#include <string.h>            // Biblioteca para manipulação de strings
#include <stdio.h>             // Biblioteca para funções de entrada/saída, como printf
#include <stdlib.h>            // Biblioteca para alocação de memória dinâmica
#include <math.h>              // Biblioteca matemática, utilizada para cálculos de temperatura
````

Essas bibliotecas são necessárias para o funcionamento de vários componentes da Raspberry Pi Pico W, como GPIO, comunicação TCP, manipulação de strings e leitura de ADC.

## Definição de Pinos e Configurações de Wi-Fi

```c
#define BUTTON1_PIN 5            // Botão 1 conectado ao pino GPIO 5
#define BUTTON2_PIN 6            // Botão 2 conectado ao pino GPIO 6
#define JOYSTICK_X_PIN 27        // Pino ADC para leitura do eixo X do joystick
#define JOYSTICK_Y_PIN 26        // Pino ADC para leitura do eixo Y do joystick

#define WIFI_SSID "Marcos"       // Nome da rede Wi-Fi
#define WIFI_PASS "98765432"     // Senha da rede Wi-Fi
#define SERVER_IP "192.168.142.62"  // IP do servidor de destino
#define SERVER_PORT 5000         // Porta do servidor
#define API_ENDPOINT "/api/sensores/"  // Endpoint da API para onde os dados serão enviados
```

Aqui, são definidos os pinos dos botões, joystick e as configurações de rede Wi-Fi. O IP e a porta do servidor de destino são configurados para que os dados sejam enviados para esse servidor.

## Variáveis Globais

```c
char button1_message[20] = "solto";  // Armazena o estado do botão 1
char button2_message[20] = "solto";  // Armazena o estado do botão 2
char temperature_message[30] = "Temperatura: N/A";  // Armazena a temperatura lida
char joystick_direction[20] = "Centro";  // Armazena a direção do joystick
int joy_x = 0, joy_y = 0;  // Armazena as leituras do joystick (eixos X e Y)
```

Estas variáveis são usadas para armazenar os estados dos sensores. Elas armazenam o estado atual dos botões, a temperatura e as leituras do joystick.

## Função `map_joystick_to_direction`

```c
const char* map_joystick_to_direction(int x, int y) {
    const int low = 1500, high = 2500;
    if (x < low && y > high) return "Noroeste";
    if (x > high && y > high) return "Nordeste";
    if (x < low && y < low) return "Sudoeste";
    if (x > high && y < low) return "Sudeste";
    if (x < low) return "Oeste";
    if (x > high) return "Leste";
    if (y > high) return "Norte";
    if (y < low) return "Sul";
    return "Centro";
}
```

Esta função mapeia os valores lidos do joystick para direções. Com base nos valores dos eixos X e Y, ela retorna a direção do joystick.

## Função `read_temperature_celsius`

```c
float read_temperature_celsius() {
    adc_select_input(4);  // Seleciona o canal do sensor de temperatura interno
    uint16_t raw = adc_read();  // Lê o valor bruto do ADC
    float voltage = raw * 3.3f / 4095.0f;  // Converte o valor ADC para tensão
    float temp_celsius = 27.0f - (voltage - 0.706f) / 0.001721f;  // Converte a tensão para temperatura

    float temp_fahrenheit = temp_celsius * 9.0f / 5.0f + 32.0f;  // Converte para Fahrenheit (opcional)

    printf("ADC Raw: %d | Tensão: %.4f V | Temp: %.2f °C | %.2f °F\n", raw, voltage, temp_celsius, temp_fahrenheit);

    return (temp_celsius < -10.0f || temp_celsius > 100.0f) ? NAN : temp_celsius;  // Se a temperatura estiver fora da faixa válida, retorna "não numérico"
}
```

Essa função lê o valor do sensor de temperatura da Raspberry Pi Pico e converte o valor analógico para uma temperatura em Celsius. A função retorna a temperatura ou `NAN` se a leitura estiver fora da faixa válida.

## Função `get_iso8601_timestamp`

```c
void get_iso8601_timestamp(char *buffer, size_t size) {
    snprintf(buffer, size, "2025-04-30T12:34:56.789Z");
}
```

A função `get_iso8601_timestamp` gera um timestamp no formato ISO 8601. Aqui, ele usa um valor fixo, mas poderia ser modificado para usar a data e hora reais do sistema.

## Funções de Callback TCP

As funções de callback lidam com o fluxo de comunicação TCP entre a Raspberry Pi Pico e o servidor. Essas funções são configuradas para:

* **`tcp_recv_cb`**: Processa os dados recebidos.
* **`tcp_sent_cb`**: Chamada quando os dados são enviados com sucesso.
* **`tcp_error_cb`**: Gerencia erros durante a comunicação.
* **`tcp_connected_cb`**: Envia os dados para o servidor quando a conexão for estabelecida.

## Função `send_sensor_data`

```c
void send_sensor_data() {
    char json[512];
    char iso_date[40];
    get_iso8601_timestamp(iso_date, sizeof(iso_date));  // Obtém o timestamp

    snprintf(json, sizeof(json),
        "{\n"
        "  \"botao1\": \"%s\",\n"
        "  \"botao2\": \"%s\",\n"
        "  \"temperatura\": \"%s\",\n"
        "  \"joystick\": {\n"
        "    \"x\": %d,\n"
        "    \"y\": %d,\n"
        "    \"direcao\": \"%s\"\n"
        "  },\n"
        "  \"data\": \"\"\n"
        "}",
        button1_message, button2_message, temperature_message,
        joy_x, joy_y, joystick_direction, iso_date
    );

    int json_len = strlen(json);  // Calcula o comprimento do JSON
    printf("JSON:\n%s\n", json);  // Exibe o JSON no terminal

    char request[1024];
    int req_len = snprintf(request, sizeof(request),
        "POST %s HTTP/1.1\r\n"
        "Host: %s:%d\r\n"
        "Content-Type: application/json\r\n"
        "Content-Length: %d\r\n\r\n%s",
        API_ENDPOINT, SERVER_IP, SERVER_PORT, json_len, json
    );

    ip_addr_t ip;
    ipaddr_aton(SERVER_IP, &ip);  // Converte o IP para um formato utilizável

    struct tcp_pcb *pcb = tcp_new();  // Cria uma nova conexão TCP
    if (!pcb) return;  // Se não conseguir criar a conexão, retorna

    tcp_connection_t *conn = (tcp_connection_t *)mem_malloc(sizeof(tcp_connection_t));  // Aloca memória para os dados da conexão
    if (!conn) {
        tcp_abort(pcb);  // Se não conseguir alocar memória, aborta a conexão
        return;
    }

    conn->data = (char *)mem_malloc(req_len);  // Aloca memória para os dados do pedido
    memcpy(conn->data, request, req_len);  // Copia os dados para a memória alocada
    conn->len = req_len;
    conn->pcb = pcb;
    conn->connected = false;

    // Configura callbacks antes da conexão
    tcp_arg(pcb, conn);
    tcp_err(pcb, tcp_error_cb);

    // Conecta ao servidor e envia os dados
    err_t err = tcp_connect(pcb, &ip, SERVER_PORT, tcp_connected_cb);
    if (err != ERR_OK) {
        printf("Erro ao conectar: %d\n", err);
        mem_free(conn->data);
        mem_free(conn);
        tcp_abort(pcb);
    }
}
```

A função `send_sensor_data` gera um JSON com os dados dos sensores e o envia para o servidor usando uma requisição POST. A função configura a conexão TCP, aloca memória para os dados e envia a solicitação ao servidor.

## Função `monitor_sensors`

```c
void monitor_sensors() {
    bool b1 = !gpio_get(BUTTON1_PIN);
    bool b2 = !gpio_get(BUTTON2_PIN);
    snprintf(button1_message, sizeof(button1_message), b1 ? "pressionado" : "solto");
    snprintf(button2_message, sizeof(button2_message), b2 ? "pressionado" : "solto");

    adc_select_input(1);
    joy_x = adc_read();
    adc_select_input(0);
    joy_y = adc_read();

    snprintf(joystick_direction, sizeof(joystick_direction), "%s", map_joystick_to_direction(joy_x, joy_y));

    float temp = read_temperature_celsius();
    if (!isnan(temp)) {
        snprintf(temperature_message, sizeof(temperature_message), "%.2f °C", temp);
    } else {
        snprintf(temperature_message, sizeof(temperature_message), "Erro de leitura");
    }

    printf("\n----------------------\nSTATUS DO SISTEMA:\n----------------------\n");
    printf("Botão 1: %s\nBotão 2: %s\nTemperatura: %s\nJoystick X: %d | Y: %d\nDireção: %s\n----------------------\n",
           button1_message, button2_message, temperature_message, joy_x, joy_y, joystick_direction);
}
```

A função `monitor_sensors` lê os dados dos botões, joystick e sensor de temperatura, e imprime o status dos sensores no terminal. Ela também atualiza as variáveis globais para serem enviadas na próxima requisição.

## Função Principal (`main`)

```c
int main() {
    stdio_init_all();
    sleep_ms(2000);  // Espera 2 segundos
    if (cyw43_arch_init()) return 1;  // Inicializa o Wi-Fi
    cyw43_arch_enable_sta_mode();  // Habilita o modo estação (conectar a uma rede Wi-Fi)

    while (cyw43_arch_wifi_connect_timeout_ms(WIFI_SSID, WIFI_PASS, CYW43_AUTH_WPA2_AES_PSK, 10000) != 0) {
        printf("Tentando conectar ao WiFi...\n");
        sleep_ms(5000);  // Tentativa de reconexão a cada 5 segundos
    }

    printf("WiFi conectado. IP: %s\n", ip4addr_ntoa(netif_ip4_addr(netif_list)));

    gpio_init(BUTTON1_PIN); gpio_set_dir(BUTTON1_PIN, GPIO_IN); gpio_pull_up(BUTTON1_PIN);  // Inicializa o botão 1
    gpio_init(BUTTON2_PIN); gpio_set_dir(BUTTON2_PIN, GPIO_IN); gpio_pull_up(BUTTON2_PIN);  // Inicializa o botão 2
    adc_init();  // Inicializa o ADC para o joystick

    while (true) {
        monitor_sensors();
        send_sensor_data();
        sleep_ms(5000);  // Intervalo de 5 segundos entre cada envio
    }
}
```

A função `main` inicializa a Raspberry Pi Pico, conecta-se ao Wi-Fi e entra em um loop onde lê os dados dos sensores e os envia para o servidor a cada 5 segundos.

## Resumo

Este código permite monitorar os estados de botões, a posição de um joystick e a temperatura interna da Raspberry Pi Pico W. Os dados são enviados a cada 5 segundos para um servidor via TCP, utilizando o protocolo HTTP.
