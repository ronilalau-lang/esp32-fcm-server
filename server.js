import express from "express";
import admin from "firebase-admin";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Inicializa o Firebase Admin com as credenciais guardadas no ambiente da Render
admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)),
  databaseURL: "https://esp32-painel-default-rtdb.firebaseio.com"
});

// Rota principal (Render usa para testar)
app.get("/", (req, res) => {
  res.send("Servidor rodando!");
});

// ---------------------------------
// ROTA PARA ENVIAR NOTIFICAÇÃO
// ---------------------------------
app.post("/send", async (req, res) => {

  // SEU DEVICE TOKEN
  const deviceToken = "fAovYUcZX1b4-RyhGsHBr8:APA91bHAXEsp4qsGn63plIaW-2AyFVwNG3vGc_2tqNbqSP9GzgHc6nhwDYGykpZ1Or2dkmNh3sqv_Bdwa0Y-bYrFIc9aUMAzyiq8mMAYfCcFccNH0mi09gc";

  const message = {
    token: deviceToken,
    notification: {
      title: "Notificação ESP32",
      body: "Mensagem enviada pelo servidor Render!"
    }
  };

  try {
    const response = await admin.messaging().send(message);
    res.send("Notificação enviada: " + response);
  } catch (error) {
    console.error("Erro ao enviar:", error);
    res.status(500).send("Erro ao enviar notificação");
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
});