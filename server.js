const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// ============================================================================
// CONFIGURAÇÃO DO GMAIL
// 1. Coloque seu email do Gmail abaixo.
// 2. Gere uma "Senha de App" na sua conta Google e cole abaixo.
// Link para gerar: https://myaccount.google.com/apppasswords
// ============================================================================

// Recomendação: Use variáveis de ambiente para não expor senhas no GitHub/Vercel
const SEU_EMAIL_GMAIL = process.env.EMAIL_USER || 'sennarecicla@gmail.com';
const SUA_SENHA_DE_APP = process.env.EMAIL_PASS || '2657568951050775';

const transporter = nodemailer.createTransport({
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


app.post('/enviar-email', (req, res) => {
    console.log("\n--- Nova Requisição ---");
    console.log(`[${new Date().toLocaleTimeString()}] Recebido pedido para enviar email.`);
    console.log("Dados:", req.body);

    const { email, codigo, tipo } = req.body;

    if (!email || !codigo || !tipo) {
        console.log("ERRO: Dados incompletos na requisição.");
        return res.status(400).json({ sucesso: false, erro: "Dados incompletos." });
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
                console.log("\n>>> DICA: O erro 'EAUTH' ou 'Invalid login' significa que o email ou a Senha de App estão incorretos no arquivo server.js!\n");
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