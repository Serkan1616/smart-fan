# Chimney Monitoring App

A real-time monitoring system for chimney environments using **React**, **Firebase**, **ESP32**, and **Node.js**. It measures temperature and gas levels, controls a fan, and sends email alerts if dangerous conditions are detected.

---

## 📦 Features

-  Live temperature and smoke/gas level monitoring
-  Automatic fan control based on sensor data
-  Email alert system (triggered every 10 mins in critical conditions)
-  Visual UI with real-time updates
-  Firebase Firestore integration for data logging

---

## 🛠️ Tech Stack

**Frontend:**
- React
- Firebase Firestore
- Axios

**Embedded System:**
- ESP32
- DHT11 Temperature Sensor
- MQ-2 Gas/Smoke Sensor
- Firestore REST API

**Backend:**
- Node.js
- Express.js
- Nodemailer

---

## 🖼️ Interface

Displays:
- Current **temperature** in °C
- **Smoke/gas sensor** value
- **Fan status** (ON/OFF)
- **Real-time warning** box
- **Last sensor update time**

---

## ⚙️ System Workflow

1. **ESP32 Board**
   - Reads temperature and gas values every 5 seconds.
   - Sends data to Firebase Firestore via REST API.
   - Turns fan ON/OFF based on thresholds:
     - Temp > `32°C` or Gas > `400` → Fan ON
     - Temp < `20°C` → Fan OFF

2. **React App**
   - Listens to Firestore for latest sensor data.
   - Displays data and alerts in a styled dashboard.
   - Automatically triggers email alerts if danger is detected.

3. **Mail API**
   - A Node.js service (`/send-alert`) sends mail using Gmail SMTP.
   - Avoids spam by enforcing a 10-minute cool-down between mails.

---


##📷 UI Preview
![finalfoto](https://github.com/user-attachments/assets/a8e979a8-bfc2-4d32-a3e2-0083fed8bd79)

