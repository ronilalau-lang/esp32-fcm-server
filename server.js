import express from "express";
import admin from "firebase-admin";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Inicializa Firebase Admin com a chave do Render
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)),
  databaseURL: process.env.DATABASE_URL
});

// Token do FCM (guardado no Render)
const DEVICE_TOKEN = process.env.DEVICE_TOKEN;

// Ambientes que o ESP32 atualiza
const ambientes = ["quarto", "cozinha", "banheiro", "quintal"];

// Armazena último estado para evitar notificações repetidas
const ultimoEstado = {};

const db = admin.database();

ambientes.forEach((amb) => {

  const ref = db.ref(`${amb}/ambiente`);ref.on("value", async (snap) => {
  const novoValor = snap.val();
  console.log([DEBUG] ${amb} mudou para: ${novoValor});  // <-- log extra

  if (ultimoEstado[amb] === undefined) {
    ultimoEstado[amb] = novoValor;
    return;
  }

  if (novoValor !== ultimoEstado[amb]) {
    ultimoEstado[amb] = novoValor;

    const texto =
      novoValor === 1
        ? ${amb.toUpperCase()} ficou CLARO ??
        : ${amb.toUpperCase()} ficou ESCURO ??;

    console.log([DEBUG] Tentando enviar notificação: ${texto}); // <-- log extra

    const message = {
      token: DEVICE_TOKEN,
      notification: {
        title: Mudança no ${amb},
        body: texto
      }
    };

    try {
      const response = await admin.messaging().send(message);
      console.log(?? Notificação enviada: ${texto}, response);
    } catch (e) {
      console.error("? Erro ao enviar notificação:", e);
    }
  }
});