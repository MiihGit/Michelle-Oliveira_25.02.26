const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
app.use(cors());
app.use(bodyParser.json());

// ============================================================================
// CONFIGURAÇÃO DO GMAIL
// As credenciais vêm SOMENTE de variáveis de ambiente (nunca do código-fonte).
// 1. Gere uma "Senha de App" na sua conta Google: https://myaccount.google.com/apppasswords
// 2. Defina EMAIL_USER e EMAIL_PASS nas variáveis de ambiente do Vercel
//    (Project Settings > Environment Variables) e/ou num arquivo .env local
//    (que já está no .gitignore e nunca deve ser commitado).
// ============================================================================

const SEU_EMAIL_GMAIL = process.env.EMAIL_USER;
const SUA_SENHA_DE_APP = process.env.EMAIL_PASS;

let transporter = null;

if (!SEU_EMAIL_GMAIL || !SUA_SENHA_DE_APP) {
    console.log("⚠️  EMAIL_USER/EMAIL_PASS não configurados: o envio de e-mail está desativado até essas variáveis de ambiente serem definidas.");
} else {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: SEU_EMAIL_GMAIL,
            pass: SUA_SENHA_DE_APP
        }
    });

    // VERIFICAÇÃO DE CREDENCIAIS AO INICIAR
    transporter.verify(function (error, success) {
        if (error) {
            console.log("❌ ERRO NO GMAIL: Verifique se o e-mail e a senha de app estão corretos. (EAUTH)");
            console.error(error.message);
        } else {
            console.log("🚀 GMAIL PRONTO: O sistema de e-mail está funcionando!");
        }
    });
}


app.post('/enviar-email', (req, res) => {
    console.log("\n--- Nova Requisição ---");
    console.log(`[${new Date().toLocaleTimeString()}] Recebido pedido para enviar email.`);
    console.log("Dados:", req.body);

    const { email, codigo, tipo } = req.body;

    if (!email || !codigo || !tipo) {
        console.log("ERRO: Dados incompletos na requisição.");
        return res.status(400).json({ sucesso: false, erro: "Dados incompletos." });
    }

    if (!transporter) {
        console.log("ERRO: Tentativa de envio de e-mail sem EMAIL_USER/EMAIL_PASS configurados.");
        return res.status(503).json({ sucesso: false, erro: "Envio de e-mail não configurado no servidor." });
    }

    const mailOptions = {
        from: `"Senna Recicla" <${SEU_EMAIL_GMAIL}>`,
        to: email,
        subject: `Seu Código de ${tipo} - Senna Recicla`,
        html: `
            <div style="font-family: sans-serif; text-align: center; padding: 20px;">
                <h2>Senna Recicla</h2>
                <p>Olá!</p>
                <p>Seu código de ${tipo} é:</p>
                <h1 style="font-size: 48px; letter-spacing: 10px; margin: 20px 0; color: #008751;">${codigo}</h1>
                <p>Se você não solicitou este código, pode ignorar este e-mail.</p>
            </div>
        `
    };

    console.log(`Enviando para ${email}...`);

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("!!!!!!!!!! ERRO AO ENVIAR O EMAIL !!!!!!!!!!");
            console.error(error);
            if (error.code === 'EAUTH') {
                console.log("\n>>> DICA: O erro 'EAUTH' ou 'Invalid login' significa que EMAIL_USER ou EMAIL_PASS (variáveis de ambiente) estão incorretos!\n");
            }
            return res.status(500).json({ sucesso: false, erro: error.toString() });
        }
        console.log(`Email enviado com sucesso para ${email}! ID: ${info.messageId}`);
        res.json({ sucesso: true });
    });
});

// Roda localmente; na Vercel o app é exportado abaixo
if (require.main === module) {
    app.listen(3000, () => {
        console.log("========================================================");
        console.log("✅ SERVIDOR ONLINE: http://localhost:3000");
        console.log("✅ BANCO DE DADOS: senna.db (Conectado)");
        console.log("Pode testar o envio de email no site agora.");
        console.log("NÃO FECHE ESTA JANELA.");
        console.log("========================================================");
    });
}

module.exports = app;