#include "pico/cyw43_arch.h"
#include "pico/stdlib.h"
#include "lwip/tcp.h"
#include "hardware/adc.h"
#include "hardware/pwm.h"
#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <math.h>

// Pinos
#define BUTTON1_PIN 5
#define BUTTON2_PIN 6
#define JOYSTICK_X_PIN 27
#define JOYSTICK_Y_PIN 26
#define GREEN_LED_PIN 11
#define BLUE_LED_PIN 12
#define RED_LED_PIN 13

#define LED_BRIGHTNESS 0.3f  // 30% brilho

#define WIFI_SSID "Marcos"
#define WIFI_PASS "98765432"
#define SERVER_IP "192.168.134.204"
#define SERVER_PORT 5000
#define API_ENDPOINT "/api/sensores/"

// Variáveis globais de estado dos sensores
char button1_message[20] = "solto";
char button2_message[20] = "solto";
char temperature_message[30] = "Temperatura: N/A";
char joystick_direction[20] = "Centro";
int joy_x = 0, joy_y = 0;

// Função para configurar PWM no LED (0-1.0 brightness)
void set_led_pwm(uint gpio, float brightness) {
    gpio_set_function(gpio, GPIO_FUNC_PWM);
    uint slice = pwm_gpio_to_slice_num(gpio);
    pwm_set_wrap(slice, 100);
    pwm_set_chan_level(slice, pwm_gpio_to_channel(gpio), (int)(100 * brightness));
    pwm_set_enabled(slice, true);
}

// Desliga o LED
void set_led_off(uint gpio) {
    gpio_set_function(gpio, GPIO_FUNC_SIO);
    gpio_set_dir(gpio, GPIO_OUT);
    gpio_put(gpio, 0);
}

// Mapeia posição do joystick para direção textual
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

// Lê a temperatura interna da RP2040 com média e offset para ambiente
float read_temperature_celsius_ambient(int samples) {
    float sum = 0.0f;
    for (int i = 0; i < samples; i++) {
        adc_select_input(4);
        uint16_t raw = adc_read();
        float voltage = raw * (3.3f / 4095.0f);
        float temp_celsius = 27.0f - (voltage - 0.706f) / 0.001721f;
        sum += temp_celsius;
        sleep_ms(10);
    }
    float avg_temp = sum / samples;

    // Limita valores absurdos
    if (avg_temp < -40.0f || avg_temp > 125.0f) {
        return NAN;
    }

    // Ajusta com offset aproximado para ambiente
    const float offset = -15.0f;
    return avg_temp + offset;
}

// Atualiza o estado dos sensores e mensagens para enviar
void monitor_sensors(bool read_temp) {
    // Leitura botões
    button1_message[0] = gpio_get(BUTTON1_PIN) ? 's' : 'p'; // solto/preso (simples)
    strcpy(button1_message, gpio_get(BUTTON1_PIN) ? "solto" : "pressionado");

    button2_message[0] = gpio_get(BUTTON2_PIN) ? 's' : 'p';
    strcpy(button2_message, gpio_get(BUTTON2_PIN) ? "solto" : "pressionado");

    // Leitura joystick
    adc_select_input(0);
    joy_x = adc_read();

    adc_select_input(1);
    joy_y = adc_read();

    // Mapeia direção
    strcpy(joystick_direction, map_joystick_to_direction(joy_x, joy_y));

    // Leitura temperatura se pedido
    if (read_temp) {
        float temp = read_temperature_celsius_ambient(10);
        if (isnan(temp)) {
            snprintf(temperature_message, sizeof(temperature_message), "Temperatura: N/A");
        } else {
            snprintf(temperature_message, sizeof(temperature_message), " %.2f °C", temp);
        }
    }

    // Debug serial
    printf("[Sensores] Botão1: %s | Botão2: %s | %s | Joy: X=%d Y=%d Dir=%s\n",
           button1_message, button2_message, temperature_message, joy_x, joy_y, joystick_direction, "\n", "\n", "\n");
}

// Struct para manter contexto da conexão TCP
typedef struct {
    struct tcp_pcb *pcb;
    char *data;
    u16_t len;
    bool connected;
} tcp_connection_t;

// Callbacks TCP LWIP (mantidos iguais, só adaptei indentação)
static err_t tcp_recv_cb(void *arg, struct tcp_pcb *pcb, struct pbuf *p, err_t err) {
    if (!p) {
        tcp_close(pcb);
        return ERR_OK;
    }
    tcp_recved(pcb, p->tot_len);
    pbuf_free(p);
    return ERR_OK;
}

static err_t tcp_sent_cb(void *arg, struct tcp_pcb *pcb, u16_t len) {
    set_led_off(BLUE_LED_PIN);
    printf("✓ Dados enviados com sucesso (%d bytes)\n", len);
    if (arg) {
        mem_free(arg);  // Libera memória do struct
    }
    tcp_close(pcb);      // Fecha conexão
    return ERR_OK;
}


void tcp_error_cb(void *arg, err_t err) {
    set_led_pwm(RED_LED_PIN, LED_BRIGHTNESS);
    printf("✗ Erro de conexão TCP (%d)\n", err);
}

static err_t tcp_connected_cb(void *arg, struct tcp_pcb *pcb, err_t err) {
    tcp_connection_t *conn = (tcp_connection_t *)arg;
    if (err != ERR_OK) {
        set_led_pwm(RED_LED_PIN, LED_BRIGHTNESS);
        printf("✗ Falha na conexão ao servidor\n");
        tcp_close(pcb);
        mem_free(conn);
        return err;
    }

    tcp_recv(pcb, tcp_recv_cb);
    tcp_sent(pcb, tcp_sent_cb);
    
    tcp_write(pcb, conn->data, conn->len, TCP_WRITE_FLAG_COPY);
    tcp_output(pcb);

    return ERR_OK;
}

// Envia dados ao servidor via HTTP POST
void send_sensor_data() {
    set_led_pwm(BLUE_LED_PIN, LED_BRIGHTNESS);
    printf("→ Enviando dados para o servidor...\n");

    // Monta JSON
    char json[512];
    snprintf(json, sizeof(json),
        "{ \"botao1\": \"%s\", \"botao2\": \"%s\", \"temperatura\": \"%s\", \"joystick\": { \"x\": %d, \"y\": %d, \"direcao\": \"%s\" } }",
        button1_message, button2_message, temperature_message, joy_x, joy_y, joystick_direction);

    int json_len = strlen(json);

    // Monta requisição HTTP POST
    char request[1024];
    int req_len = snprintf(request, sizeof(request),
        "POST %s HTTP/1.1\r\n"
        "Host: %s:%d\r\n"
        "Content-Type: application/json\r\n"
        "Content-Length: %d\r\n"
        "Connection: close\r\n\r\n%s",
        API_ENDPOINT, SERVER_IP, SERVER_PORT, json_len, json);

    ip_addr_t server_ip;
    if (!ipaddr_aton(SERVER_IP, &server_ip)) {
        set_led_pwm(RED_LED_PIN, LED_BRIGHTNESS);
        printf("✗ IP inválido\n");
        return;
    }

    struct tcp_pcb *pcb = tcp_new_ip_type(IPADDR_TYPE_V4);
    if (!pcb) {
        set_led_pwm(RED_LED_PIN, LED_BRIGHTNESS);
        printf("✗ Falha ao criar PCB TCP\n");
        return;
    }

    tcp_connection_t *conn = (tcp_connection_t *)mem_malloc(sizeof(tcp_connection_t));
    if (!conn) {
        set_led_pwm(RED_LED_PIN, LED_BRIGHTNESS);
        tcp_close(pcb);
        printf("✗ Falha ao alocar memória para conexão\n");
        return;
    }

    // Buffer estático para evitar falha de buffer
    static char static_request_buffer[1024];
    memcpy(static_request_buffer, request, req_len);

    conn->pcb = pcb;
    conn->data = static_request_buffer;
    conn->len = req_len;
    conn->connected = false;

    tcp_arg(pcb, conn);
    tcp_err(pcb, tcp_error_cb);

    err_t err = tcp_connect(pcb, &server_ip, SERVER_PORT, tcp_connected_cb);

    if (err != ERR_OK) {
        set_led_pwm(RED_LED_PIN, LED_BRIGHTNESS);
        printf("✗ Falha ao iniciar conexão TCP (%d)\n", err);
        mem_free(conn);
        tcp_close(pcb);
    }
}

int main() {
    stdio_init_all();
    sleep_ms(2000);
    printf("Inicializando sistema...\n");

    if (cyw43_arch_init()) return 1;
    cyw43_arch_enable_sta_mode();

    gpio_init(BUTTON1_PIN); gpio_set_dir(BUTTON1_PIN, GPIO_IN); gpio_pull_up(BUTTON1_PIN);
    gpio_init(BUTTON2_PIN); gpio_set_dir(BUTTON2_PIN, GPIO_IN); gpio_pull_up(BUTTON2_PIN);
    adc_init();
    adc_set_temp_sensor_enabled(true);
    adc_gpio_init(JOYSTICK_X_PIN);
    adc_gpio_init(JOYSTICK_Y_PIN);

    set_led_off(GREEN_LED_PIN);
    set_led_off(BLUE_LED_PIN);
    set_led_off(RED_LED_PIN);

    printf("Conectando ao Wi-Fi...\n");
    while (cyw43_arch_wifi_connect_timeout_ms(WIFI_SSID, WIFI_PASS, CYW43_AUTH_WPA2_AES_PSK, 10000) != 0) {
        printf("Tentando nova conexão...\n");
        sleep_ms(3000);
    }

    printf("✓ Conectado ao Wi-Fi!\n");
    set_led_pwm(GREEN_LED_PIN, LED_BRIGHTNESS);  // Indica sucesso de conexão

    uint64_t last_temp_read_time = 0;
    const uint64_t temp_read_interval_ms = 60000;

    while (1) {
        uint64_t current_time = to_ms_since_boot(get_absolute_time());
        bool read_temp = (current_time - last_temp_read_time) >= temp_read_interval_ms;

        monitor_sensors(read_temp);
        if (read_temp) last_temp_read_time = current_time;

        send_sensor_data();
        sleep_ms(10000);
    }

    cyw43_arch_deinit();
    return 0;
}
