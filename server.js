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

  const ref = db.ref(${amb}/ambiente);

  ref.on("value", async (snap) => {
    const novoValor = snap.val();

    console.log(📌 Ambiente ${amb} mudou para:, novoValor);

    // Se é a primeira leitura, apenas registra
    if (ultimoEstado[amb] === undefined) {
      ultimoEstado[amb] = novoValor;
      return;
    }

    // Se mudou, então notifica
    if (novoValor !== ultimoEstado[amb]) {
      ultimoEstado[amb] = novoValor;

      const texto =
        novoValor === 1
          ? ${amb.toUpperCase()} ficou CLARO 💡
          : ${amb.toUpperCase()} ficou ESCURO 🌑;

      const message = {
        token: DEVICE_TOKEN,
        notification: {
          title: Mudança no ${amb},
          body: texto
        }
      };

      try {
        await admin.messaging().send(message);
        console.log(📨 Notificação enviada: ${texto});
      } catch (e) {
        console.error("❌ Erro ao enviar notificação:", e);
      }
    }
  });
});

// Página padrão
app.get("/", (req, res) => {
  res.send("Servidor FCM funcionando e monitorando ambientes!");
});

app.listen(PORT, () => {
  console.log("🚀 Server listening on port " + PORT);
});
