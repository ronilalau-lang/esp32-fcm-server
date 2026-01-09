// server.js
const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

// ================= CONFIGURAÇÃO DO FIREBASE =================
// Substitua pelo caminho do seu arquivo JSON de credenciais do Firebase
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(bodyParser.json());

// ================= ROTAS =================

// Teste simples
app.get("/", (req, res) => {
  res.send("Servidor FCM rodando!");
});

// Rota para enviar notificação
// POST /send
// Body JSON: { "token": "<SEU_TOKEN_FCM>", "title": "Título", "body": "Mensagem" }
app.post("/send", async (req, res) => {
  const { token, title, body } = req.body;

  if (!token || !title || !body) {
    return res.status(400).send({ error: "token, title e body são obrigatórios" });
  }

  const message = {
    notification: { title, body },
    token: token
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Mensagem enviada com sucesso:", response);
    res.send({ success: true, response });
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    res.status(500).send({ success: false, error });
  }
});

// ================= INICIAR SERVIDOR =================
const PORT = 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});