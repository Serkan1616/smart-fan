import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "./firebase";

let lastMailSentTime = 0; // 10 dakika kontrolü için local state (sunucuya da güveniyoruz)

export default function Sensor() {
  const [temperature, setTemperature] = useState(25);
  const [smokeLevel, setSmokeLevel] = useState(100);
  const [fanStatus, setFanStatus] = useState(false);
  const [warning, setWarning] = useState(false);
  const [lastSensorTime, setLastSensorTime] = useState(null);

  const [rotation, setRotation] = useState(0);

  // Fan döndürme animasyonu - KAPATILDI
  /*
  useEffect(() => {
    let animationFrame;
    const ROTATION_SPEED = 5; // Degrees per frame

    const animate = () => {
      setRotation((prevRotation) => (prevRotation + ROTATION_SPEED) % 360);
      animationFrame = requestAnimationFrame(animate);
    };

    if (fanStatus) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      setRotation(0);
    }

    return () => cancelAnimationFrame(animationFrame);
  }, [fanStatus]);
  */

  useEffect(() => {
    const sensorCollectionRef = collection(db, "sensor_data");
    const q = query(
      sensorCollectionRef,
      orderBy("timestamp", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data();

        setTemperature(data.temperature);
        setSmokeLevel(data.gas_value);
        setLastSensorTime(new Date());

        const danger = data.temperature > 32 || data.gas_value > 400;

        setFanStatus(danger);
        setWarning(danger);

        if (danger) {
          const now = Date.now();

          if (now - lastMailSentTime > 10 * 60 * 1000) {
            // Mail gönderme isteği at
            axios
              .post("http://localhost:5000/send-alert")
              .then((res) => {
                console.log("Mail durumu:", res.data);
                lastMailSentTime = now;
              })
              .catch((err) => {
                console.error("Mail gönderim hatası:", err);
              });
          } else {
            console.log("10 dakika dolmadı, mail tekrar gönderilmedi.");
          }
        }
      } else {
        console.warn("Veri bulunamadı!");
      }
    });

    return () => unsubscribe();
  }, []);

  const formatTime = (date) => {
    if (!date) return "Veri alınmadı";
    return date.toLocaleTimeString();
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        background: "linear-gradient(180deg, #e0f7fa, #f8f9fa)",
        minHeight: "100vh",
        paddingTop: 60,
        textAlign: "center",
        color: "#2c3e50",
      }}
    >
      <h1 style={{ fontWeight: "700", marginBottom: 30 }}>
        Chimney Monitoring App
      </h1>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 20,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: 1,
            maxWidth: 250,
            padding: 25,
            borderRadius: 20,
            backgroundColor: "#e3f2fd",
            boxShadow: "0 5px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2>🌡️ Temperature</h2>
          <p style={{ fontSize: 32, fontWeight: "600", margin: 0 }}>
            {temperature} °C
          </p>
        </div>

        <div
          style={{
            flex: 1,
            maxWidth: 250,
            padding: 25,
            borderRadius: 20,
            backgroundColor: "#ede7f6",
            boxShadow: "0 5px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2>💨 Smoke Level</h2>
          <p style={{ fontSize: 32, fontWeight: "600", margin: 0 }}>
            {smokeLevel}
          </p>
        </div>
      </div>

      <div
        style={{
          width: 180,
          padding: 25,
          margin: "30px auto",
          borderRadius: 20,
          backgroundColor: "#ffffff",
          boxShadow: "0 5px 10px rgba(0,0,0,0.12)",
          border: `2px solid ${fanStatus ? "#e74c3c" : "#3498db"}`,
          textAlign: "center",
        }}
      >
        <h2>🔄 Fan Status</h2>
        <p style={{ fontSize: 32, fontWeight: "600" }}>
          {fanStatus ? "ON" : "OFF"}
        </p>
        <img
          src="/fan3.png"
          alt="Fan"
          style={{
            width: 90,
            height: 90,
            marginTop: 20,
            transform: `rotate(0deg)`, // Sabit
            transition: "transform 0.1s linear",
          }}
        />
      </div>

      {warning ? (
        <div
          style={{
            marginTop: 20,
            backgroundColor: "#ffe9e9",
            padding: 18,
            borderRadius: 12,
            borderColor: "#e74c3c",
            borderWidth: 2,
            borderStyle: "solid",
            maxWidth: 600,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <p
            style={{
              color: "#c0392b",
              fontSize: 17,
              fontWeight: "600",
              margin: 0,
            }}
          >
            Hot smoke detected in chimney!
          </p>
        </div>
      ) : (
        <div
          style={{
            marginTop: 20,
            backgroundColor: "#d0e7ff",
            padding: 18,
            borderRadius: 12,
            borderColor: "#5a4d8b",
            borderWidth: 2,
            borderStyle: "solid",
            maxWidth: 600,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <p
            style={{
              color: "#3a2e6e",
              fontSize: 17,
              fontWeight: "600",
              margin: 0,
            }}
          >
            The condition of the chimney is good
          </p>
        </div>
      )}

      <p style={{ marginTop: 15, fontSize: 16, fontWeight: "500" }}>
        The latest sensor data has arrived: {formatTime(lastSensorTime)}
      </p>
    </div>
  );
}
