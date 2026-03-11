/*
 * ═══════════════════════════════════════════════════════════════
 *  SWACHH-AI — ESP32 ESP-NOW Slave Node Firmware
 * ═══════════════════════════════════════════════════════════════
 *
 *  Hardware: ESP32 DevKit v1 + HC-SR04 Ultrasonic Sensor
 *  Protocol: ESP-NOW (peer-to-peer, no Wi-Fi router needed)
 *
 *  Function:
 *    - Read bin fill-level via HC-SR04 every 30 seconds
 *    - Calculate fill percentage based on bin depth
 *    - Transmit data to Raspberry Pi Master via ESP-NOW
 *    - Enter deep sleep between readings for power efficiency
 *
 *  Wiring:
 *    HC-SR04 VCC  → 5V (or 3.3V with HC-SR04P variant)
 *    HC-SR04 GND  → GND
 *    HC-SR04 TRIG → GPIO 5
 *    HC-SR04 ECHO → GPIO 18
 *    Battery VIN   → ADC GPIO 34 (voltage divider)
 *
 *  Author: SWACHH-AI Team — India Innovate 2026
 * ═══════════════════════════════════════════════════════════════
 */

#include <esp_now.h>
#include <WiFi.h>
#include <esp_sleep.h>
#include <esp_adc_cal.h>

// ── Configuration ──────────────────────────────────────────────

// Unique Bin Identifier (change per node)
#define BIN_ID            1

// HC-SR04 Pins
#define TRIG_PIN          5
#define ECHO_PIN          18

// Battery monitoring (ADC)
#define BATTERY_ADC_PIN   34
#define BATTERY_SAMPLES   10

// Bin dimensions (cm)
#define BIN_DEPTH_CM      60.0    // Total depth of the bin
#define MIN_DISTANCE_CM   3.0     // Sensor dead zone
#define MAX_DISTANCE_CM   60.0    // Max measurable distance

// Deep sleep duration (microseconds)
#define SLEEP_DURATION_US (30ULL * 1000000ULL)  // 30 seconds

// Number of distance readings for averaging
#define NUM_READINGS      5

// ── Master Gateway MAC Address ─────────────────────────────────
// Replace with your Raspberry Pi's ESP32 bridge MAC address
uint8_t masterMAC[] = {0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF};  // Broadcast

// ── Data Structure ─────────────────────────────────────────────
typedef struct __attribute__((packed)) {
    uint8_t  bin_id;         // Bin identifier
    float    fill_pct;       // Fill percentage (0.0 — 100.0)
    float    distance_cm;    // Raw distance reading
    float    battery_v;      // Battery voltage
    uint32_t reading_count;  // Boot count / reading number
    uint32_t timestamp;      // Millis since boot
} BinPayload;

BinPayload payload;

// ── Persistent boot counter (survives deep sleep) ──────────────
RTC_DATA_ATTR uint32_t bootCount = 0;

// ── ESP-NOW Callback ───────────────────────────────────────────
bool sendSuccess = false;

void onDataSent(const uint8_t *mac_addr, esp_now_send_status_t status) {
    sendSuccess = (status == ESP_NOW_SEND_SUCCESS);
    Serial.printf("[ESP-NOW] Send %s to %02X:%02X:%02X:%02X:%02X:%02X\n",
        sendSuccess ? "OK" : "FAIL",
        mac_addr[0], mac_addr[1], mac_addr[2],
        mac_addr[3], mac_addr[4], mac_addr[5]);
}

// ── Ultrasonic Distance Measurement ───────────────────────────
float measureDistance() {
    // Send trigger pulse
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);

    // Read echo pulse duration
    long duration = pulseIn(ECHO_PIN, HIGH, 30000);  // 30ms timeout

    if (duration == 0) {
        Serial.println("[SENSOR] Timeout — no echo received");
        return -1.0;
    }

    // Calculate distance: speed of sound = 343 m/s = 0.0343 cm/µs
    float distance = (duration * 0.0343) / 2.0;

    // Clamp to valid range
    if (distance < MIN_DISTANCE_CM || distance > MAX_DISTANCE_CM) {
        return -1.0;
    }

    return distance;
}

float getAverageDistance() {
    float total = 0;
    int   valid = 0;

    for (int i = 0; i < NUM_READINGS; i++) {
        float d = measureDistance();
        if (d > 0) {
            total += d;
            valid++;
        }
        delay(50);  // Brief pause between readings
    }

    if (valid == 0) return -1.0;
    return total / valid;
}

// ── Fill Percentage Calculation ────────────────────────────────
float calculateFillPercentage(float distance_cm) {
    if (distance_cm < 0) return -1.0;

    // Fill % = ((depth - distance) / depth) * 100
    // distance = distance from sensor to waste surface
    // Small distance = full bin, large distance = empty bin
    float fill = ((BIN_DEPTH_CM - distance_cm) / BIN_DEPTH_CM) * 100.0;

    // Clamp to 0-100
    if (fill < 0.0)   fill = 0.0;
    if (fill > 100.0)  fill = 100.0;

    return fill;
}

// ── Battery Voltage Reading ────────────────────────────────────
float readBatteryVoltage() {
    long total = 0;
    for (int i = 0; i < BATTERY_SAMPLES; i++) {
        total += analogRead(BATTERY_ADC_PIN);
        delay(2);
    }
    float avg = total / (float)BATTERY_SAMPLES;

    // Convert ADC reading to voltage
    // Assuming voltage divider: 2x ratio, 3.3V reference, 12-bit ADC
    float voltage = (avg / 4095.0) * 3.3 * 2.0;
    return voltage;
}

// ── Setup ──────────────────────────────────────────────────────
void setup() {
    Serial.begin(115200);
    delay(100);

    bootCount++;
    Serial.printf("\n[SWACHH-AI] Bin Node #%d — Boot #%lu\n", BIN_ID, bootCount);

    // Initialize HC-SR04 pins
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);

    // Initialize ADC for battery monitoring
    analogSetAttenuation(ADC_11db);  // Full range: 0-3.3V

    // ── Take Measurements ──────────────────────────
    float distance = getAverageDistance();
    float fillPct  = calculateFillPercentage(distance);
    float batteryV = readBatteryVoltage();

    Serial.printf("[SENSOR] Distance: %.1f cm | Fill: %.1f%% | Battery: %.2fV\n",
                  distance, fillPct, batteryV);

    // ── Build Payload ──────────────────────────────
    payload.bin_id        = BIN_ID;
    payload.fill_pct      = fillPct;
    payload.distance_cm   = distance;
    payload.battery_v     = batteryV;
    payload.reading_count = bootCount;
    payload.timestamp     = millis();

    // ── Initialize WiFi in STA mode (required for ESP-NOW) ─────
    WiFi.mode(WIFI_STA);
    WiFi.disconnect();
    delay(100);

    Serial.printf("[WIFI] MAC Address: %s\n", WiFi.macAddress().c_str());

    // ── Initialize ESP-NOW ─────────────────────────
    if (esp_now_init() != ESP_OK) {
        Serial.println("[ESP-NOW] Init FAILED!");
        goToSleep();
        return;
    }

    esp_now_register_send_cb(onDataSent);

    // Register master peer
    esp_now_peer_info_t peerInfo = {};
    memcpy(peerInfo.peer_addr, masterMAC, 6);
    peerInfo.channel = 0;  // Use current channel
    peerInfo.encrypt = false;

    if (esp_now_add_peer(&peerInfo) != ESP_OK) {
        Serial.println("[ESP-NOW] Add peer FAILED!");
        goToSleep();
        return;
    }

    // ── Send Data ──────────────────────────────────
    esp_err_t result = esp_now_send(
        masterMAC,
        (uint8_t *)&payload,
        sizeof(payload)
    );

    if (result == ESP_OK) {
        Serial.println("[ESP-NOW] Payload queued for transmission");
    } else {
        Serial.printf("[ESP-NOW] Send error: %d\n", result);
    }

    // Wait for send callback
    delay(500);

    // ── Clean up and sleep ─────────────────────────
    esp_now_deinit();
    goToSleep();
}

// ── Deep Sleep ─────────────────────────────────────────────────
void goToSleep() {
    Serial.printf("[SLEEP] Entering deep sleep for %llu seconds...\n",
                  SLEEP_DURATION_US / 1000000ULL);
    Serial.flush();

    esp_sleep_enable_timer_wakeup(SLEEP_DURATION_US);
    esp_deep_sleep_start();
}

// ── Loop (never reached due to deep sleep) ─────────────────────
void loop() {
    // This will never execute because the ESP32 enters
    // deep sleep at the end of setup() and reboots on wake.
}
