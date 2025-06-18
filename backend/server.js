// server.js veya mail.js (backend dosyan)
const express = require("express");
const nodemailer = require("nodemailer");

const app = express();

app.use(express.json());

let lastSent = 0; // timestamp

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "deneme@gmail.com", // kendi gmail
    pass: "yourpass", // uygulama şifresi (2 adımlı doğrulama açıksa)
  },
});

app.post("/send-alert", (req, res) => {
  const now = Date.now();
  if (now - lastSent < 10 * 60 * 1000) {
    return res.status(200).send("Mail zaten gönderildi, bekleniyor...");
  }

  const mailOptions = {
    from: "deneme@gmail.com",
    to: "s.durmaz2208@gmail.com",
    subject: "🔥 Hot Smoke Alert - Chimney",
    text: "Hot smoke detected in the chimney! Please take necessary actions immediately.",
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error("Mail gönderilemedi:", err);
      return res.status(500).send("Mail gönderilemedi.");
    } else {
      console.log("Mail gönderildi:", info.response);
      lastSent = now; // zaman güncelleniyor
      return res.status(200).send("Mail başarıyla gönderildi.");
    }
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
