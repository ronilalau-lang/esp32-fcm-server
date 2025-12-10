const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// Token do seu celular
const DEVICE_TOKEN = "fAovYUcZX1b4-RyhGsHBr8:APA91bHAXEsp4qsGn63plIaW-2AyFVwNG3vGc_2tqNbqSP9GzgHc6nhwDYGykpZ1Or2dkmNh3sqv_Bdwa0Y-bYrFIc9aUMAzyiq8mMAYfCcFccNH0mi09gc";

// Inicializar Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://esp32-painel-default-rtdb.firebaseio.com"
});

const db = admin.database();
const ref = db.ref("/quarto/ambiente");

let ultimoValor = null;

console.log("📡 Monitorando mudanças em /quarto/ambiente ...");

ref.on("value", async (snapshot) => {
  const valor = snapshot.val();

  console.log("🔥 Valor atual:", valor);

  // Evita enviar notificação repetida ao iniciar
  if (ultimoValor === null) {
    ultimoValor = valor;
    return;
  }

  if (valor !== ultimoValor) {
    console.log("📨 Mudança detectada! Enviando notificação...");

    const mensagem = {
      notification: {
        title: "Mudança no Quarto",
        body: `Novo valor do ambiente: ${valor}`
      },
      token: DEVICE_TOKEN
    };

    try {
      await admin.messaging().send(mensagem);
      console.log("✅ Notificação enviada com sucesso!");
    } catch (erro) {
      console.error("❌ Erro ao enviar notificação:", erro);
    }

    ultimoValor = valor;
  }
});