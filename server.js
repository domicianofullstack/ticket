require('dotenv').config();
const express = require('express');
const path = require('path');
const db = require('./db'); // Importando a conexão que criamos no db.js
const multer = require('multer');
const fs = require('fs');

const app = express();

// Configurações do Express
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); // Para ler dados de formulários

// Garante que a pasta de uploads existe
const uploadDir = './public/uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração de armazenamento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Gera um nome único: id_ticket-timestamp.extensao
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const extensao = path.extname(file.originalname).toLowerCase();
        if (extensao === '.png' || extensao === '.jpg' || extensao === '.jpeg') {
            cb(null, true);
        } else {
            cb(new Error('Apenas imagens PNG ou JPG são permitidas!'));
        }
    }
});

// Rota Principal
// Rota Principal
app.get('/', (req, res) => {
    const sql = 'SELECT * FROM projetos ORDER BY data_criacao DESC';
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao buscar projetos:', err);
            return res.render('index', { 
                projetos: [], 
                ticket: null,      // Garante que ticket não seja undefined
                arquivos: [],      // Garante que arquivos não seja undefined
                modoCliente: false 
            });
        }
        
        res.render('index', { 
            projetos: results, 
            ticket: null,          // Define como null na home
            arquivos: [],          // Define como vazio na home
            modoCliente: false 
        });
    });
});

// Rota para processar o formulário
app.post('/solicitar-projeto', (req, res) => {
    const { nome, email, tipo, descricao } = req.body;
    
    const query = "INSERT INTO tickets (nome, email, tipo, descricao) VALUES (?, ?, ?, ?)";
    db.query(query, [nome, email, tipo, descricao], (err, result) => {
        if (err) return res.send("Erro ao abrir chamado.");
        
        // Redireciona o cliente para o painel usando o ID do ticket recém criado
        res.redirect('/painel-cliente/' + result.insertId);
    });
});

// Rota do Painel do Cliente
app.get('/painel-cliente/:id', (req, res) => {
    const ticketId = req.params.id;

    // Busca o Ticket
    db.query("SELECT * FROM tickets WHERE id = ?", [ticketId], (err, ticketResult) => {
        if (err || ticketResult.length === 0) return res.redirect('/');

        // Busca os Arquivos do Drive deste ticket
        db.query("SELECT * FROM arquivos_drive WHERE ticket_id = ?", [ticketId], (err, arquivos) => {
            res.render('index', { 
                ticket: ticketResult[0], 
                arquivos: arquivos, // Passa a lista de arquivos para o EJS
                modoCliente: true,
                projetos: [] // seus projetos aqui
            });
        });
    });
});

app.post('/login-ticket', (req, res) => {
    const { email, senha } = req.body;
    
    // Busca o ticket pelo e-mail e pela senha padrão
    db.query("SELECT * FROM tickets WHERE email = ? AND senha = ?", [email, senha], (err, result) => {
        if (err || result.length === 0) {
            return res.send("<script>alert('Acesso negado! E-mail ou senha incorretos.'); window.location='/';</script>");
        }
        
        // CORREÇÃO: Em vez de renderizar a página aqui, redirecionamos para a rota GET
        // Isso evita que, ao dar F5, o navegador tente logar novamente.
        res.redirect('/painel-cliente/' + result[0].id);
    });
});

app.post('/responder-ticket', (req, res) => {
    const { ticketId, novaMensagem } = req.body;
    
    // Usamos ||| como separador de balões
    const sqlUpdate = "UPDATE tickets SET descricao = CONCAT(descricao, '|||', ?) WHERE id = ?";
    
    db.query(sqlUpdate, [novaMensagem, ticketId], (err, result) => {
        if (err) return res.send("Erro ao enviar resposta.");
        res.redirect('/painel-cliente/' + ticketId);
    });
});

app.post('/upload-drive', upload.single('arquivo'), (req, res) => {
    const { ticketId } = req.body;
    
    // Verifica se um arquivo foi enviado para evitar erros
    if (!req.file) {
        return res.redirect(`/painel-cliente/${ticketId}`);
    }

    const { originalname, filename, path: filePath } = req.file;

    const sql = "INSERT INTO arquivos_drive (ticket_id, nome_original, nome_arquivo, caminho) VALUES (?, ?, ?, ?)";
    db.query(sql, [ticketId, originalname, filename, filePath], (err) => {
        if (err) {
            console.error("Erro no banco:", err);
            return res.status(500).send("Erro ao salvar no banco.");
        }
        // Redirecionamento fixo para o painel do cliente específico
        res.redirect(`/painel-cliente/${ticketId}`);
    });
});

app.post('/deletar-arquivo', (req, res) => {
    const { fileId, ticketId } = req.body; // Agora recebemos o ticketId aqui também

    db.query("SELECT nome_arquivo FROM arquivos_drive WHERE id = ?", [fileId], (err, results) => {
        if (err || results.length === 0) return res.redirect(`/painel-cliente/${ticketId}`);

        const filePath = path.join(__dirname, 'public/uploads', results[0].nome_arquivo);

        db.query("DELETE FROM arquivos_drive WHERE id = ?", [fileId], (err) => {
            if (err) return res.redirect(`/painel-cliente/${ticketId}`);

            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            
            // Retorno garantido para o painel do cliente
            res.redirect(`/painel-cliente/${ticketId}`);
        });
    });
});

// Porta do Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});