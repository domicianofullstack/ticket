# 🎫 Sistema de Gestão de Tickets & Portfólio

Este é um ecossistema completo de gestão de chamados e exposição de projetos, desenvolvido para demonstrar habilidades em arquitetura **Full Stack**, integração com banco de dados e deploy em ambiente de produção (VPS).

👨‍💻 Desenvolvido por Danilo Souza

## 🚀 Tecnologias Utilizadas

* **Frontend:** HTML5, CSS3, JavaScript (Vanilla).
* **Backend:** Node.js com Framework Express.
* **Banco de Dados:** MySQL (Relacional).
* **Infraestrutura/Deploy:** VPS (Ubuntu), PM2 para gestão de processos, Git para Versionamento.

## 📋 Funcionalidades

* **Sistema de Tickets:** Abertura, priorização e acompanhamento de chamados.
* **Gestão de Projetos:** Exibição dinâmica de tecnologias e links de repositórios.
* **Drive Interno:** Sistema de upload e gerenciamento de anexos vinculados aos tickets.
* **Painel Administrativo:** Interface para controle de status e respostas.

## 🛠️ Como rodar o projeto localmente

1. Clone o repositório:
   ```bash
   git clone [https://github.com/domicianofullstack/ticket.git](https://github.com/domicianofullstack/ticket.git)

2. Instale as dependências:
npm install

3. Configure o arquivo .env com suas credenciais locais do MySQL.
4. Inicie o servidor:
node server.js