import admin from "firebase-admin";
import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

// -------------------------------
// 🔐 CARREGAR CREDENCIAIS DO FIREBASE
// -------------------------------
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)),
  databaseURL: process.env.DATABASE_URL
});

// -------------------------------
// 🔥 MONITORAR VALOR DO FIREBASE
// -------------------------------
const DEVICE_TOKEN = process.env.DEVICE_TOKEN;
const db = admin.database();
const ref = db.ref("/quarto/ambiente");

let ultimoValor = null;

console.log("👀 Monitorando alterações em /quarto/ambiente ...");

ref.on("value", async (snapshot) => {
  const valor = snapshot.val();
  console.log("Valor do Firebase:", valor);

  if (ultimoValor === null) {
    ultimoValor = valor;
    return; // evita disparo na inicialização
  }

  if (valor !== ultimoValor) {
    console.log("📨 Mudança detectada! Enviando notificação...");

    const message = {
      token: DEVICE_TOKEN,
      notification: {
        title: "Mudança no Quarto",
        body: Novo valor: ${valor}
      }
    };

    try {
      await admin.messaging().send(message);
      console.log("✅ Notificação enviada!");
    } catch (e) {
      console.error("❌ Erro ao enviar:", e);
    }

    ultimoValor = valor;
  }
});

// -------------------------------
// ROTA DE TESTE
// -------------------------------
app.get("/", (req, res) => {
  res.send("🔥 Servidor rodando no Render!");
});

// -------------------------------
app.listen(PORT, () => {
  console.log("🌐 Server ON porta " + PORT);
});
