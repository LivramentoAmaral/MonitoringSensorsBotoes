#include "pico/cyw43_arch.h"
#include "pico/stdlib.h"
#include "lwip/tcp.h"
#include "hardware/adc.h"
#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <math.h>

// Pinos
#define BUTTON1_PIN 5
#define BUTTON2_PIN 6
#define JOYSTICK_X_PIN 27
#define JOYSTICK_Y_PIN 26

// Wi-Fi e servidor
#define WIFI_SSID "...."
#define WIFI_PASS "#tudoepossivel"
#define SERVER_IP "192.168.1.109"
#define SERVER_PORT 5000
#define API_ENDPOINT "/api/sensores/"

// Variáveis globais
char button1_message[20] = "solto";
char button2_message[20] = "solto";
char temperature_message[30] = "Temperatura: N/A";
char joystick_direction[20] = "Centro";
int joy_x = 0, joy_y = 0;

typedef struct {
    struct tcp_pcb *pcb;
    char *data;
    u16_t len;
    bool connected;
} tcp_connection_t;

// Mapeia o joystick para direção textual
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

// Leitura da temperatura
float read_temperature_celsius() {
    adc_select_input(4);
    uint16_t raw = adc_read();
    float voltage = raw * 3.3f / 4096;
    float temp = 27.0f - (voltage - 0.706f) / 0.001721f;
    return (temp < -10.0f || temp > 100.0f) ? NAN : temp;
}

// Gera timestamp no formato ISO 8601 fixo (simulado)
void get_iso8601_timestamp(char *buffer, size_t size) {
    // Simulando "2025-04-30T12:34:56.789Z"
    snprintf(buffer, size, "2025-04-30T12:34:56.789Z");
}

// Callback de recepção TCP
static err_t tcp_recv_cb(void *arg, struct tcp_pcb *pcb, struct pbuf *p, err_t err) {
    if (!p) {
        tcp_close(pcb);
        tcp_connection_t *conn = (tcp_connection_t *)arg;
        mem_free(conn->data);
        mem_free(conn);
        return ERR_OK;
    }
    printf("Resposta: %.*s\n", p->len, (char*)p->payload);
    tcp_recved(pcb, p->tot_len);
    pbuf_free(p);
    return ERR_OK;
}

// Callback de envio TCP
static err_t tcp_sent_cb(void *arg, struct tcp_pcb *pcb, u16_t len) {
    printf("Dados enviados (%d bytes)\n", len);
    return ERR_OK;
}

// Callback de erro TCP
void tcp_error_cb(void *arg, err_t err) {
    printf("Erro TCP: %d\n", err);
}

// Callback de conexão TCP
static err_t tcp_connected_cb(void *arg, struct tcp_pcb *pcb, err_t err) {
    tcp_connection_t *conn = (tcp_connection_t *)arg;
    if (err != ERR_OK) {
        printf("Erro na conexão: %d\n", err);
        tcp_abort(pcb);
        mem_free(conn->data);
        mem_free(conn);
        return err;
    }

    conn->connected = true;
    tcp_arg(pcb, conn);
    tcp_recv(pcb, tcp_recv_cb);
    tcp_sent(pcb, tcp_sent_cb);
    tcp_write(pcb, conn->data, conn->len, TCP_WRITE_FLAG_COPY);
    tcp_output(pcb);
    return ERR_OK;
}

// Envia os dados em formato JSON
void send_sensor_data() {
    char json[512];
    char iso_date[40];
    get_iso8601_timestamp(iso_date, sizeof(iso_date));

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

    int json_len = strlen(json);
    printf("JSON:\n%s\n", json);

    char request[1024];
    int req_len = snprintf(request, sizeof(request),
        "POST %s HTTP/1.1\r\n"
        "Host: %s:%d\r\n"
        "Content-Type: application/json\r\n"
        "Content-Length: %d\r\n\r\n%s",
        API_ENDPOINT, SERVER_IP, SERVER_PORT, json_len, json);

    ip_addr_t ip;
    ipaddr_aton(SERVER_IP, &ip);
    struct tcp_pcb *pcb = tcp_new();
    if (!pcb) return;

    tcp_connection_t *conn = (tcp_connection_t *)mem_malloc(sizeof(tcp_connection_t));
    if (!conn) {
        tcp_abort(pcb);
        return;
    }

    conn->data = (char *)mem_malloc(req_len);
    memcpy(conn->data, request, req_len);
    conn->len = req_len;
    conn->pcb = pcb;
    conn->connected = false;

    tcp_arg(pcb, conn);
    tcp_err(pcb, tcp_error_cb);

    err_t err = tcp_connect(pcb, &ip, SERVER_PORT, tcp_connected_cb);
    if (err != ERR_OK) {
        printf("Erro ao conectar: %d\n", err);
        mem_free(conn->data);
        mem_free(conn);
        tcp_abort(pcb);
    }
}


// Lê os sensores e atualiza as variáveis globais
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

// Função principal
int main() {
    stdio_init_all();
    sleep_ms(2000);
    if (cyw43_arch_init()) return 1;
    cyw43_arch_enable_sta_mode();

    while (cyw43_arch_wifi_connect_timeout_ms(WIFI_SSID, WIFI_PASS, CYW43_AUTH_WPA2_AES_PSK, 10000) != 0) {
        printf("Tentando conectar ao WiFi...\n");
        sleep_ms(5000);
    }

    printf("WiFi conectado. IP: %s\n", ip4addr_ntoa(netif_ip4_addr(netif_list)));
    gpio_init(BUTTON1_PIN); gpio_set_dir(BUTTON1_PIN, GPIO_IN); gpio_pull_up(BUTTON1_PIN);
    gpio_init(BUTTON2_PIN); gpio_set_dir(BUTTON2_PIN, GPIO_IN); gpio_pull_up(BUTTON2_PIN);
    adc_init(); adc_gpio_init(JOYSTICK_X_PIN); adc_gpio_init(JOYSTICK_Y_PIN);

    while (1) {
        monitor_sensors();
        send_sensor_data(); // Envia a cada 3s
        sleep_ms(3000);
    }

    cyw43_arch_deinit();
    return 0;
}
