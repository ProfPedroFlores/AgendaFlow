## 🚀 Executando o AgendaFlow localmente

O AgendaFlow é uma aplicação web desenvolvida com **Python, FastAPI, SQLAlchemy, MySQL, HTML, CSS e JavaScript** para organização pessoal de atividades, recorrências e lembretes.

### Pré-requisitos

Antes de iniciar, tenha instalado:

- Python 3
- Git
- MySQL Server
- MySQL Workbench (opcional, mas recomendado)

---

## 📥 Clonando o projeto

Abra o terminal na pasta onde deseja salvar o projeto e execute:

```bash
git clone <URL_DO_REPOSITORIO>
```

Depois acesse a pasta:

```bash
cd AgendaFlow
```

---

## 🐍 Criando o ambiente virtual

No Windows:

```powershell
python -m venv .venv
```

Ative o ambiente:

```powershell
.\.venv\Scripts\Activate.ps1
```

Quando o ambiente estiver ativo, o terminal deverá apresentar algo semelhante a:

```text
(.venv) PS C:\...\AgendaFlow>
```

---

## 📦 Instalando as dependências

Com o ambiente virtual ativo:

```powershell
pip install -r requirements.txt
```

---

## 🗄️ Criando o banco de dados

No MySQL Workbench ou outro cliente MySQL, execute:

```sql
CREATE DATABASE agendaflow
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

As tabelas utilizadas pela aplicação são criadas pelo SQLAlchemy durante a inicialização.

---

## 🔐 Configurando as variáveis de ambiente

O arquivo `.env` contém informações locais e senhas e, portanto, **não deve ser enviado para o GitHub**.

Crie um arquivo chamado:

```text
.env
```

na raiz do projeto.

Exemplo:

```env
DB_USER=root
DB_PASSWORD=sua_senha
DB_HOST=localhost
DB_PORT=3306
DB_NAME=agendaflow
```

Altere os valores conforme a configuração do seu MySQL.

---

## ▶️ Executando o AgendaFlow

Na raiz do projeto:

```powershell
uvicorn app.main:app --reload
```

O servidor deverá iniciar em:

```text
http://127.0.0.1:8000
```

Abra esse endereço no navegador.

A documentação automática da API pode ser acessada em:

```text
http://127.0.0.1:8000/docs
```

---

## 🔔 Alertas e notificações

Depois de abrir o AgendaFlow, clique em:

```text
Ativar alertas
```

O navegador poderá solicitar permissão para enviar notificações.

Quando permitido, o AgendaFlow poderá utilizar:

```text
🔔 Notificações do navegador
🔊 Alertas sonoros
🪟 Avisos dentro da aplicação
```

Os alertas funcionam enquanto o AgendaFlow estiver aberto no navegador.

---

## 🔁 Atividades recorrentes

O AgendaFlow suporta atualmente:

```text
Atividades únicas
Recorrência diária
Recorrência semanal
Seleção de dias da semana
Data final de recorrência
Conclusão individual de ocorrências
```

Uma atividade recorrente é armazenada como uma única atividade-base no banco de dados.

As ocorrências são calculadas dinamicamente conforme o período exibido na agenda.

---

## 📁 Estrutura principal

```text
AgendaFlow/
│
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   └── schemas.py
│
├── frontend/
│   ├── index.html
│   │
│   ├── css/
│   │   └── style.css
│   │
│   └── js/
│       └── app.js
│
├── .env
├── .gitignore
├── requirements.txt
└── README.md
```

---

## 🛠️ Tecnologias utilizadas

```text
Python
FastAPI
SQLAlchemy
PyMySQL
MySQL
HTML5
CSS3
JavaScript
Git
GitHub
```

---

## 📌 Status do projeto

Versão atual:

```text
v0.1
```

Principais funcionalidades:

```text
✅ Cadastro de atividades
✅ Edição e exclusão
✅ Agenda semanal
✅ Filtros
✅ Detecção de conflitos de horário
✅ Atividades recorrentes
✅ Conclusão individual de ocorrências
✅ Lembretes
✅ Alertas sonoros
✅ Notificações do navegador
✅ Tema claro/escuro
```

Funcionalidades planejadas para versões futuras incluem visão mensal, estatísticas, dashboard de produtividade e melhorias relacionadas a PWA e notificações.
