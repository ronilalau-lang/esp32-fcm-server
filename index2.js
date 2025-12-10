// index.js
const admin = require("firebase-admin");

// carregando o JSON do Firebase Admin
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// COLOQUE AQUI O TOKEN DO SEU CELULAR
const DEVICE_TOKEN = "fAovYUcZX1b4-RyhGsHBr8:APA91bHAXEsp4qsGn63plIaW-2AyFVwNG3vGc_2tqNbqSP9GzgHc6nhwDYGykpZ1Or2dkmNh3sqv_Bdwa0Y-bYrFIc9aUMAzyiq8mMAYfCcFccNH0mi09gc";

// mensagem que será enviada
const message = {
  notification: {
    title: "ESP32",
    body: "Luz do quarto acendeu"
  },
  token: DEVICE_TOKEN
};

async function enviar() {
  try {
    const response = await admin.messaging().send(message);
    console.log("Notificação enviada:", response);
  } catch (err) {
    console.error("Erro ao enviar:", err);
  }
}

enviar();