import express from "express";
import admin from "firebase-admin";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// -----------------------------------------
// ?? Inicializa Firebase Admin usando Render
// -----------------------------------------
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)),
  databaseURL: "https://esp32-painel-default-rtdb.firebaseio.com"
});

// ------------------------------------------------
// ?? Token do seu celular (coloquei o seu aqui)
// ------------------------------------------------
const DEVICE_TOKEN = "fAovYUcZX1b4-RyhGsHBr8:APA91bHAXEsp4qsGn63plIaW-2AyFVwNG3vGc_2tqNbqSP9GzgHc6nhwDYGykpZ1Or2dkmNh3sqv_Bdwa0Y-bYrFIc9aUMAzyiq8mMAYfCcFccNH0mi09gc";

// ------------------------------------------------
// ?? MONITORAMENTO DO FIREBASE EM TEMPO REAL
// ------------------------------------------------
const db = admin.database();
const ref = db.ref("/quarto/ambiente");

let ultimoValor = null;

console.log("?? Monitorando: /quarto/ambiente ...");

ref.on("value", async (snapshot) => {
  const valor = snapshot.val();
  console.log("? Valor atualizado:", valor);

  // Evita notificação ao iniciar
  if (ultimoValor === null) {
    ultimoValor = valor;
    return;
  }

  // Se mudou, envia notificação
  if (valor !== ultimoValor) {
    console.log("?? Mudança detectada! Enviando notificação...");

    const message = {
      notification: {
        title: "Mudança no Quarto",
        body: Novo valor: ${valor}
      },
      token: DEVICE_TOKEN
    };

    try {
      await admin.messaging().send(message);
      console.log("? Notificação enviada!");
    } catch (e) {
      console.error("? Erro ao enviar:", e);
    }

    ultimoValor = valor;
  }
});

// ------------------------------------------------
// Rota básica (apenas para Render saber que existe)
// ------------------------------------------------
app.get("/", (req, res) => {
  res.send("Servidor de notificações rodando ?");
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log("?? Servidor rodando na porta " + PORT);
});