// SWACHH-AI — ESP32 Firmware
// Team Strawhats | Sanjivani College of Engineering, Kopargaon
// India Innovate 2026

#include <WiFi.h>
#include <esp_now.h>
#include <esp_sleep.h>

#define BIN_ID          1             // CHANGE PER NODE (0–255)
#define TRIG_PIN        5
#define ECHO_PIN        18
#define BATTERY_PIN     34
#define SLEEP_US        30000000ULL   // 30 seconds
#define MAX_BIN_DEPTH   100.0f        // cm — full empty bin depth
#define READINGS_AVG    5

// Gateway bridge ESP32 MAC — replace with actual MAC
uint8_t gatewayMAC[] = {0xAA, 0xBB, 0xCC, 0xDD, 0xEE, 0xFF};

typedef struct __attribute__((packed)) {
  uint8_t  bin_id;
  float    fill_pct;
  float    distance_cm;
  float    battery_v;
  uint32_t reading_count;
  uint32_t timestamp;
} BinPayload;

RTC_DATA_ATTR uint32_t rtc_reading_count = 0;

void OnDataSent(const uint8_t *mac_addr, esp_now_send_status_t status) {
  Serial.print("Last Packet Send Status: ");
  Serial.println(status == ESP_NOW_SEND_SUCCESS ? "TX OK" : "TX FAIL");
}

void setup() {
  Serial.begin(115200);
  
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BATTERY_PIN, INPUT);
  
  WiFi.mode(WIFI_STA);
  
  if (esp_now_init() != ESP_OK) {
    Serial.println("ESP-NOW init failed");
    return;
  }
  
  esp_now_register_send_cb(OnDataSent);
  
  esp_now_peer_info_t peerInfo;
  memcpy(peerInfo.peer_addr, gatewayMAC, 6);
  peerInfo.channel = 0;  
  peerInfo.encrypt = false;
  
  if (esp_now_add_peer(&peerInfo) != ESP_OK) {
    Serial.println("Failed to add peer");
    return;
  }

  // Ultrasonic
  float total_dist = 0;
  int valid_readings = 0;
  for (int i = 0; i < READINGS_AVG; i++) {
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);
    
    long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout
    if (duration > 0) {
      total_dist += duration * 0.034 / 2;
      valid_readings++;
    }
    delay(50);
  }
  
  float dist = (valid_readings > 0) ? (total_dist / valid_readings) : MAX_BIN_DEPTH;
  float fill_pct = ((MAX_BIN_DEPTH - dist) / MAX_BIN_DEPTH) * 100.0f;
  if (fill_pct < 0) fill_pct = 0;
  if (fill_pct > 100) fill_pct = 100;
  
  // Battery
  float bat_v = (analogRead(BATTERY_PIN) / 4095.0f) * 3.3f * 2.0f;
  
  BinPayload payload;
  payload.bin_id = BIN_ID;
  payload.fill_pct = fill_pct;
  payload.distance_cm = dist;
  payload.battery_v = bat_v;
  payload.reading_count = ++rtc_reading_count;
  payload.timestamp = millis();
  
  esp_now_send(gatewayMAC, (uint8_t *) &payload, sizeof(payload));
  
  delay(100);
  esp_deep_sleep(SLEEP_US);
}

void loop() {
  // Empty, device sleeps
}
