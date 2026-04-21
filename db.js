const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Domiciano16',
  database: 'trabalhos'
});

connection.connect(error => {
  if (error) {
    console.error('Erro ao conectar ao banco:', error);
    return;
  }
  console.log('Sucesso! Node.js conectado ao banco "trabalhos".');
});

module.exports = connection;