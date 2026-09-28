# 📅 AgendaFlow

> Uma aplicação web para organização de atividades, compromissos recorrentes e lembretes.

O **AgendaFlow** nasceu da necessidade de organizar uma rotina com múltiplas atividades simultâneas, como trabalho, aulas, tutorias, estudos e projetos pessoais.

A proposta é oferecer uma agenda simples, local e objetiva, permitindo visualizar compromissos semanais, identificar conflitos de horário, criar atividades recorrentes e receber lembretes durante o uso do computador.

---

## ✨ Funcionalidades

### 📋 Gerenciamento de atividades

O AgendaFlow permite:

- criar atividades;
- editar atividades;
- excluir atividades;
- concluir atividades;
- definir título e descrição;
- definir categoria;
- definir prioridade;
- informar data;
- informar horário inicial e final.

---

### 📆 Agenda semanal

As atividades são distribuídas visualmente durante a semana de acordo com seus horários.

É possível:

- visualizar a semana atual;
- navegar entre semanas;
- retornar rapidamente para a semana atual;
- visualizar atividades de acordo com o horário;
- clicar em atividades para interagir com elas.

---

### 🔎 Filtros

As atividades podem ser filtradas por:

- categoria;
- prioridade;
- status.

Isso permite visualizar apenas os compromissos relevantes para determinado contexto.

---

### ⚠️ Detecção de conflitos

Quando duas ou mais atividades ocupam horários que se sobrepõem, o AgendaFlow identifica automaticamente o conflito.

Atividades conflitantes são organizadas lado a lado na agenda semanal para facilitar sua identificação.

---

### 🔁 Atividades recorrentes

O AgendaFlow permite criar atividades:

- não recorrentes;
- recorrentes diariamente;
- recorrentes semanalmente.

Nas recorrências semanais, é possível selecionar os dias desejados:

- segunda-feira;
- terça-feira;
- quarta-feira;
- quinta-feira;
- sexta-feira;
- sábado;
- domingo.

Também é possível definir uma data final para a recorrência.

A série recorrente é armazenada apenas uma vez no banco de dados. As ocorrências são calculadas dinamicamente pela API de acordo com o período solicitado.

---

### ✅ Conclusão individual de recorrências

Cada ocorrência de uma atividade recorrente possui seu próprio estado.

Por exemplo:

```text
Tutoria
Segunda e quarta

Segunda  → ✅ concluída
Quarta   → ⬜ pendente
Próxima segunda → ⬜ pendente
```

Assim, concluir uma ocorrência não encerra toda a série.

---

### 🔔 Lembretes e alertas

Uma atividade pode possuir:

- sem lembrete;
- lembrete no horário;
- 10 minutos antes;
- 30 minutos antes;
- 1 hora antes.

Quando o momento do lembrete é atingido, o AgendaFlow pode utilizar:

- 🔊 aviso sonoro;
- 🔔 notificação do navegador/sistema operacional;
- 💬 pop-up dentro da aplicação.

Os alertas precisam ser ativados pelo usuário no navegador.

---

## 🧠 Arquitetura

O projeto utiliza uma arquitetura simples dividida entre frontend, API e banco de dados.

```text
┌──────────────────────┐
│      Navegador       │
│                      │
│ HTML + CSS + JS      │
└──────────┬───────────┘
           │
           │ HTTP / JSON
           ▼
┌──────────────────────┐
│       FastAPI        │
│                      │
│ Rotas + validações   │
│ Regras de negócio    │
└──────────┬───────────┘
           │
           │ SQLAlchemy ORM
           ▼
┌──────────────────────┐
│        MySQL         │
│                      │
│ Persistência         │
└──────────────────────┘
```

---

## 🛠️ Tecnologias

### Backend

- Python
- FastAPI
- Uvicorn
- Pydantic
- SQLAlchemy
- PyMySQL

### Banco de dados

- MySQL

### Frontend

- HTML5
- CSS3
- JavaScript

### APIs do navegador

- Notifications API
- Web Audio API
- Local Storage

---

## 📁 Estrutura do projeto

```text
Agenda/
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

# 🚀 Executando o projeto

## 1. Clone o repositório

```bash
git clone URL_DO_REPOSITORIO
```

Entre na pasta:

```bash
cd Agenda
```

---

## 2. Crie o ambiente virtual

No Windows:

```powershell
python -m venv .venv
```

Ative:

```powershell
.\.venv\Scripts\Activate.ps1
```

---

## 3. Instale as dependências

```powershell
pip install -r requirements.txt
```

---

## 4. Configure o MySQL

Crie o banco:

```sql
CREATE DATABASE agendaflow
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

---

## 5. Configure o `.env`

Crie um arquivo:

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

> O arquivo `.env` não deve ser enviado para o GitHub.

---

## 6. Execute a aplicação

Na raiz do projeto:

```powershell
uvicorn app.main:app --reload
```

O servidor deverá iniciar em:

```text
http://127.0.0.1:8000
```

Abra esse endereço no navegador.

---

## 📚 Documentação da API

O FastAPI gera automaticamente uma documentação interativa.

Swagger UI:

```text
http://127.0.0.1:8000/docs
```

Através dela é possível testar os endpoints diretamente no navegador.

---

## 🔗 Principais endpoints

### Atividades

```http
POST /atividades
```

Cria uma atividade.

```http
GET /atividades
```

Lista as atividades cadastradas.

```http
GET /atividades/{id}
```

Consulta uma atividade.

```http
PATCH /atividades/{id}
```

Atualiza parcialmente uma atividade.

```http
PATCH /atividades/{id}/concluir
```

Conclui uma atividade não recorrente.

```http
DELETE /atividades/{id}
```

Exclui uma atividade.

---

### Ocorrências

```http
GET /ocorrencias
```

Calcula as ocorrências existentes dentro de um intervalo.

Exemplo:

```text
/ocorrencias?data_inicio=2026-09-28&data_fim=2026-10-04
```

---

### Conclusão de ocorrências recorrentes

```http
PATCH /ocorrencias/{atividade_id}/{data}/concluir
```

Conclui somente uma ocorrência.

```http
DELETE /ocorrencias/{atividade_id}/{data}/concluir
```

Reabre uma ocorrência concluída.

---

# 🔁 Como funciona a recorrência?

O AgendaFlow não cria dezenas de cópias de uma atividade recorrente.

Uma série como:

```text
Tutoria
Segunda e quarta
19:00 às 21:00
```

é armazenada apenas uma vez.

```text
MySQL

Atividade #15
    │
    ├── recorrente = true
    ├── tipo = semanal
    ├── dias = segunda, quarta
    └── término = 20/12/2026
```

Quando a agenda solicita determinada semana:

```text
FastAPI
   │
   ▼
calcula as ocorrências
   │
   ├── segunda
   └── quarta
```

Esse modelo evita duplicação desnecessária de dados.

---

# 🔔 Como funcionam os lembretes?

O AgendaFlow verifica periodicamente as ocorrências do dia.

```text
Atividade do dia
      │
      ▼
possui lembrete?
      │
      ▼
já chegou o horário?
      │
      ▼
já foi avisada?
      │
      ▼
🔊 Som
🔔 Notificação
💬 Pop-up
```

O navegador exige que o usuário permita notificações e interaja com a página antes da reprodução automática de áudio.

Por isso existe o botão:

```text
Ativar alertas
```

---

# 🗺️ Roadmap

## v0.1

- [x] CRUD de atividades
- [x] persistência com MySQL
- [x] ORM com SQLAlchemy
- [x] agenda semanal
- [x] filtros
- [x] prioridades
- [x] detecção de conflitos
- [x] atividades recorrentes
- [x] conclusão individual de ocorrências
- [x] lembretes
- [x] notificações
- [x] alertas sonoros

---

## Possíveis versões futuras

Algumas funcionalidades que poderão ser avaliadas após o uso real da aplicação:

- [ ] visão mensal;
- [ ] dashboard;
- [ ] horas planejadas × horas realizadas;
- [ ] categorias personalizáveis;
- [ ] melhorias de interface;
- [ ] PWA;
- [ ] Service Worker;
- [ ] funcionamento mais robusto em segundo plano;
- [ ] deploy online.

Essas funcionalidades serão priorizadas de acordo com as necessidades identificadas durante o uso real do AgendaFlow.

---

# 📌 Status do projeto

**Versão atual:** `v0.1.0`

A primeira versão funcional está concluída e pronta para uso diário.

---

## 👨‍💻 Autor

Desenvolvido como projeto pessoal de organização e produtividade, utilizando conceitos de desenvolvimento web, APIs REST, persistência de dados e arquitetura de software.
