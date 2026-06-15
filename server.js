const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(cors()); // Permite que o seu HTML fale com este servidor
app.use(bodyParser.json());

// ============================================================================
// CONFIGURAÇÃO DO GMAIL
// 1. Coloque seu email do Gmail abaixo.
// 2. Gere uma "Senha de App" na sua conta Google e cole abaixo.
// Link para gerar: https://myaccount.google.com/apppasswords
// ============================================================================
const SEU_EMAIL_GMAIL = 'sennarecicla@gmail.com'; // << MUDE AQUI
const SUA_SENHA_DE_APP = '2657568951050775'; // << MUDE AQUI

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

// ============================================================================
// BANCO DE DADOS (SQLite)
// Cria o arquivo senna.db e as tabelas automaticamente
// ============================================================================
const dbPath = path.join(__dirname, 'senna.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('✅ Conectado ao banco de dados SQLite (senna.db).');
    }
});

db.serialize(() => {
    // Tabela de Usuários (Alunos e Professores)
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        email TEXT,
        ra TEXT,
        telefone TEXT,
        senha TEXT,
        role TEXT,
        ano TEXT,
        turma TEXT
    )`);

    // Tabela de Registros de Reciclagem
    db.run(`CREATE TABLE IF NOT EXISTS registros (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        aluno_nome TEXT,
        material TEXT,
        qtd REAL,
        data TEXT
    )`);
    console.log("✅ Tabelas 'usuarios' e 'registros' verificadas.");
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

app.listen(3000, () => {
    console.log("========================================================");
    console.log("✅ SERVIDOR ONLINE: http://localhost:3000");
    console.log("✅ BANCO DE DADOS: senna.db (Conectado)");
    console.log("Pode testar o envio de email no site agora.");
    console.log("NÃO FECHE ESTA JANELA.");
    console.log("========================================================");
});