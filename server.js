// server.js
const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// Carrega credenciais
const serviceAccount = require(path.join(__dirname, "serviceAccountKey.json"));

// Inicia Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://esp32-painel-default-rtdb.firebaseio.com"
});

// Token do celular que você gerou no FCM Tester
const DEVICE_TOKEN = "fAovYUcZX1b4-RyhGsHBr8:APA91bHAXEsp4qsGn63plIaW-2AyFVwNG3vGc_2tqNbqSP9GzgHc6nhwDYGykpZ1Or2dkmNh3sqv_Bdwa0Y-bYrFIc9aUMAzyiq8mMAYfCcFccNH0mi09gc";

// Referência no Realtime Database
const db = admin.database();
const ref = db.ref("eventos/esp32");

// Escuta mudanças do ESP32
ref.on("value", (snapshot) => {
  const data = snapshot.val();
  if (!data) return;

  console.log("🔥 Evento recebido do ESP32:", data);

  const message = {
    notification: {
      title: "Alerta do ESP32",
      body: data.msg || "O ESP32 enviou um evento!"
    },
    token: DEVICE_TOKEN
  };

  admin.messaging().send(message)
    .then((response) => {
      console.log("📨 Notificação enviada:", response);
    })
    .catch((error) => {
      console.error("❌ Erro ao enviar:", error);
    });
});

console.log("👂 Servidor ouvindo eventos do Firebase...");