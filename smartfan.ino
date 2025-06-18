#include <DHT.h>
#include <WiFi.h>
#include <HTTPClient.h>

#define DHT_SENSOR_PIN 23
#define RELAY_PIN 16
#define RELAY_PIN_2 17

#define DHT_SENSOR_TYPE DHT11
#define TEMP_UPPER_THRESHOLD 32.00
#define TEMP_LOWER_THRESHOLD 20.00

#define MQ2_SENSOR_PIN 34
#define GAS_THRESHOLD 400

// WiFi bilgileri
//const char* ssid = "SUPERONLINE_Wi-Fi_7494";
//const char* password = "huGxD4UyQetT";
const char* ssid = "ESP32";   // telefonunda belirlediğin SSID
const char* password = "12345678"; // telefonundaki hotspot şifresi
// Firebase Firestore URL (kendi proje ID’ne göre düzenle!)
String firebaseUrl = "https://firestore.googleapis.com/v1/projects/smartfanapp/databases/(default)/documents/sensor_data";

DHT dht_sensor(DHT_SENSOR_PIN, DHT_SENSOR_TYPE);

void setup() {
  Serial.begin(9600);
  dht_sensor.begin();
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(RELAY_PIN_2, OUTPUT);
  pinMode(MQ2_SENSOR_PIN, INPUT);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("WiFi bağlantısı kuruluyor...");
  }

  Serial.println("WiFi'ye bağlandı!");
  Serial.print("IP Adresi: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  float temperature = dht_sensor.readTemperature();
  int gasValue = analogRead(MQ2_SENSOR_PIN);

  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.println(" °C");

  Serial.print("Gas Sensor Value (MQ-2): ");
  Serial.println(gasValue);

  if (gasValue > GAS_THRESHOLD) {
    Serial.println("⚠️ WARNING: High gas level detected!");
  }

  if (!isnan(temperature)) {
    if (temperature > TEMP_UPPER_THRESHOLD || gasValue > GAS_THRESHOLD) {
      Serial.println("Turn the fan ON");
      digitalWrite(RELAY_PIN, LOW);
      digitalWrite(RELAY_PIN_2, LOW);
    } else if (temperature < TEMP_LOWER_THRESHOLD) {
      Serial.println("Turn the fan OFF");
      digitalWrite(RELAY_PIN, HIGH);
      digitalWrite(RELAY_PIN_2, HIGH);
    } else {
      digitalWrite(RELAY_PIN, HIGH);
      digitalWrite(RELAY_PIN_2, HIGH);
    }
  } else {
    Serial.println("Failed to read from DHT sensor!");
  }

  unsigned long currentMillis = millis();

String jsonData = "{ \"fields\": {";
jsonData += "\"temperature\": {\"doubleValue\": " + String(temperature) + "},";
jsonData += "\"gas_value\": {\"integerValue\": \"" + String(gasValue) + "\"},";
jsonData += "\"timestamp\": {\"integerValue\": \"" + String(currentMillis) + "\"}";
jsonData += "} }";


  // HTTP POST işlemi
  HTTPClient http;
  http.begin(firebaseUrl);
  http.addHeader("Content-Type", "application/json");

  int httpResponseCode = http.POST(jsonData);

  Serial.print("HTTP Response Code: ");
  Serial.println(httpResponseCode);

  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("Firebase yanıtı:");
    Serial.println(response);
  } else {
    Serial.println("Veri gönderme başarısız.");
  }

  http.end();
  delay(5000);
}
