<div align="center">

  <img src="./public/logo_cnes.png" alt="CNES Logo" height="60" />
  <img src="./public/logo_prefeitura.png" alt="Prefeitura Logo" height="60" />

  # 🏥 Planilha CNES — Dashboard de Atualização Cadastral

  **Gestão e atualização cadastral de profissionais de saúde — CNES/SEMUSA**

  <p>
    <a href="https://monitoramento-cnes.vercel.app" target="_blank">
      <img src="https://img.shields.io/badge/Vercel-Live_App-000?logo=vercel&logoColor=white" alt="Vercel" />
    </a>
    <a href="https://github.com/cristianmarquesdevx/monitoramento-cnes/actions">
      <img src="https://img.shields.io/github/actions/workflow/status/cristianmarquesdevx/monitoramento-cnes/deploy.yml?branch=main&label=CI/CD&logo=github" alt="CI/CD" />
    </a>
    <a href="https://react.dev">
      <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19" />
    </a>
    <a href="https://vite.dev">
      <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite" alt="Vite 8" />
    </a>
    <a href="https://tailwindcss.com">
      <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind 4" />
    </a>
    <a href="https://supabase.com">
      <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase" alt="Supabase" />
    </a>
    <a href="https://recharts.org">
      <img src="https://img.shields.io/badge/Recharts-3-FF6C37?logo=chartdotjs" alt="Recharts" />
    </a>
    <br/>
    <img src="https://img.shields.io/badge/license-MIT-green" alt="License" />
    <img src="https://img.shields.io/github/last-commit/cristianmarquesdevx/monitoramento-cnes?logo=git" alt="Last Commit" />
    <img src="https://img.shields.io/github/repo-size/cristianmarquesdevx/monitoramento-cnes" alt="Repo Size" />
  </p>

  <br/>

  <img src="./src/assets/hero.png" alt="Dashboard Preview" width="800" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);" />

  <br/>
  <br/>

  <p>
    <strong>SEMUSA</strong> — Secretaria Municipal de Saúde de Porto Velho/RO<br/>
    <em>Divisão de Controle e Avaliação do SUS (GECAV)</em>
  </p>

</div>

---

## 📋 Índice

- [Funcionalidades](#-funcionalidades)
- [Stack Tecnológica](#-stack-tecnológica)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Componentes](#-componentes)
- [Guia de Instalação](#-guia-de-instalação)
- [Deploy no Vercel](#-deploy-no-vercel)
- [Configuração Supabase](#-configuração-supabase)
  - [Tabelas do Banco](#tabelas-do-banco)
  - [Autenticação](#autenticação)
  - [Edge Function — E-mail Resend](#edge-function--e-mail-resend)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [CI/CD Pipeline](#-cicd-pipeline)
- [Contato](#-desenvolvido-por)

---

## 📊 Funcionalidades

### Dashboard / Analytics
- **12 KPIs clicáveis**: Profissionais, Unidades, Médicos, Enfermeiros, ACS, Dentistas, CBOs, Cadastrados Hoje, Alertas, Completude (%), Pendentes, Concluídos
- **4 gráficos interativos** (Recharts) com modal expandido:
  - 📊 Movimentação Mensal (barras empilhadas)
  - 📈 Tendência com Área (linha com gradiente)
  - 🥧 CBO Top 10 (pizza com rosca)
  - 🕐 Carga Horária (radar)
- **Ranking**: Profissionais com múltiplas lotações (Top 15)
- **Alertas inteligentes**: CBO ausente, CPF duplicado, CPF ausente, sem unidade
- **KPIs do dia**: Inclusões, Alterações, Exclusões, Pendentes e Aprovados de hoje

### 🔍 Filtros e Busca Avançada
- Seleção de unidade com **autocomplete** por nome ou CNES
- Busca global por **nome, CPF (com stripped mask), CNS ou CBO**
- Filtro por especialidade: Médico (2231), Enfermeiro (2235), Dentista (2232)
- Filtro por controle: Pendentes / Concluídos
- Filtro por **período personalizado** (data início / data fim)
- Paginação flexível: **25/50/100 registros por página** com navegação inteligente
- Atalho de teclado: <kbd>Ctrl+K</kbd> para focar o campo de busca global instantaneamente

### ✅ Controle de Qualidade
- **Checkbox individual** com estado otimista (marca na hora, salva em background)
- **"Marcar todos"** em lote com confirmação individual no Supabase
- Auditoria automática via `log_audit` RPC para cada marcação

### 📄 Aprovação de Solicitações (Editor/Admin)
- Listagem de solicitações de alteração/exclusão pendentes
- **Modal de comparação lado a lado** (dados atuais × novos)
- Campos editáveis antes de aprovar
- Aprovação / Rejeição com refresh automático
- **Detalhes de alteração**: campos alterados são registrados em auditoria e podem ser expandidos

### 👥 Administração de Usuários (Admin)
- Listagem de todos os usuários autenticados
- **Avatar com iniciais** colorido para cada usuário
- **Filtro por perfil**: Admin/Editor/Visualizador
- **Confirmação obrigatória** ao alterar perfil (evita erros)
- **Auditoria de role_change**: toda mudança de perfil é registrada
- Alteração de **perfis**: Administrador, Editor, Visualizador
- Edição inline do nome do usuário
- Busca por nome ou e-mail
- Coluna **último acesso** com data/hora

### 📋 Histórico de Auditoria
- Timeline completa de todas as ações com **avatar do usuário**
- **Filtros avançados**: tipo de ação, usuário, data início/fim, busca textual
- **Paginação real**: 50 registros por página com navegação
- **Expandir detalhes**: clique para ver campos alterados (antes → depois)
- **Exportar CSV** do log de auditoria
- **Novos tipos de ação**: `login`, `export`, `role_change`
- Ordenação cronológica reversa

### 🖨️ Exportação
- **CSV**: Exporta profissionais filtrados com 12 colunas
- **PDF**: Impressão com layout institucional (logo, timbre, tabela formatada)
- **Impressão**: Suporte a `@media print` com ficha completa

### 🧩 Modais de Gestão
| Modal | Função |
|-------|--------|
| **Múltiplas Lotações** | Visualiza e gerencia profissionais com vínculos em >1 unidade |
| **CPFs Duplicados** | Identifica e remove vínculos duplicados pelo mesmo CPF |
| **Unidades sem Cadastro** | Lista unidades órfãs e envia e-mail aos responsáveis |
| **Detalhes KPI** | Abre lista filtrada ao clicar em qualquer KPI |
| **Relatórios** | Relatórios consolidados por unidade/período |
| **Meu Perfil** | Visualize e edite seu nome, veja seu perfil e dados da conta |
| **Documentação Técnica** | Documentação da integração Zimbra SOAP API disponível no sistema |

### 🎨 Experiência do Usuário
- **🌙 Dark Mode** com toggle e persistência em `localStorage`
- **📱 Responsivo**: Layout adaptável para desktop, tablet e mobile
- **🔔 Toast de notificações** com 4 tipos (success, error, warning, info)
- **⚡ Loading Skeleton**: Componente de loading animado para todos os blocos
- **🛡️ ErrorBoundary**: Captura erros de renderização sem derrubar o app
- **🔄 Realtime**: Indicador visual 🟢 Conectado / 🔴 Desconectado
- **⌨️ Acessibilidade**: Navegação por teclado, roles ARIA, focus ring

---

## 🛠️ Stack Tecnológica

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| [React](https://react.dev) | ^19.2.7 | Interface de usuário |
| [Vite](https://vite.dev) | ^8.1.1 | Bundler e dev server (HMR instantâneo) |
| [Tailwind CSS](https://tailwindcss.com) | ^4.3.2 | Estilização utilitária com CSS-first config |
| [Supabase JS](https://supabase.com/docs/reference/javascript) | ^2.110.2 | Backend: PostgreSQL + Auth + Realtime + Storage |
| [Recharts](https://recharts.org) | ^3.9.2 | Gráficos responsivos (bar, pie, radar, area) |
| [Lucide React](https://lucide.dev) | ^1.24.0 | Iconografia |
| [Oxlint](https://oxc.rs) | ^1.71.0 | Linter (10-100x mais rápido que ESLint) |
| [Vitest](https://vitest.dev) | ^3.1.3 | Test runner |
| [Brevo](https://brevo.com) | — | Envio de e-mails (fallback) |
| [Zimbra SOAP API](https://zimbra.org) | — | Envio de e-mails via servidor do governo |
| [Python](https://python.org) | ^3.12 | Serverless function (api/send-email.py) |

---

## 🏗️ Estrutura do Projeto

```
monitoramento-cnes/
├── index.html                     # Entry point HTML + Service Worker
├── package.json                   # Dependências e scripts
├── vite.config.js                 # Config Vite + React + Tailwind
├── vercel.json                    # Config de deploy Vercel
├── .oxlintrc.json                 # Config do linter
├── vitest.config.js               # Config do Vitest
├── .gitignore
├── README.md                      # Esta documentação
│
├── public/                        # Assets estáticos (PWA)
│   ├── favicon.svg
│   ├── icons.svg
│   ├── logo_cnes.png
│   ├── logo_prefeitura.png
│   ├── manifest.json              # Manifest PWA
│   └── sw.js                      # Service Worker (cache-first)
│
├── api/
│   └── send-email.py               # 🆕 Python — Zimbra SOAP API
├── requirements.txt                # 🆕 Dependências Python
├── supabase/
│   ├── functions/
│   │       └── enviar-email-relacionar/
│       │       └── index.ts           # Edge Function — e-mail Brevo (fallback)
│   └── migrations/
│       ├── 003_add_email_responsavel.sql
│       └── 004_audit_details.sql   # 🆕 Migration V4
│
├── src/
│   ├── main.jsx                   # Entry point React
│   ├── App.jsx                    # Providers aninhados
│   ├── index.css                  # Tailwind + variáveis CSS + @media print
│   │
│   ├── lib/
│   │   └── supabase.js            # Conexão com Supabase
│   │
│   ├── context/
│   │   ├── AuthContext.jsx        # Autenticação (login/logout/roles)
│   │   └── DataContext.jsx        # Dados (unidades, profissionais, solicitações)
│   │
│   ├── data/
│   │   └── cboData.js             # ~700 CBOs da Classificação Brasileira
│   │
│   ├── components/
│   │   ├── Dashboard.jsx          # Página principal
│   │   ├── LoginScreen.jsx        # Tela de login
│   │   ├── ErrorBoundary.jsx      # Tratamento de erros (class component)
│   │   ├── KPICards.jsx           # 12 cards de indicadores
│   │   ├── TodayKPIs.jsx          # KPIs do dia (6 indicadores)
│   │   ├── ChartsGrid.jsx         # Grid de 4 gráficos + expand modal
│   │   ├── ProfessionalsTable.jsx # Tabela responsiva (desktop + mobile card)
│   │   ├── ApprovalModal.jsx      # Modal de aprovação (diff lado a lado + audit detalhes)
│   │   ├── KpiDetailModal.jsx     # Detalhes ao clicar em KPI
│   │   ├── ReportsModal.jsx       # Relatórios consolidados
│   │   ├── Modal.jsx              # Componente modal genérico
│   │   ├── Skeleton.jsx           # Loading skeleton (KPI, chart, table, etc.)
│   │   ├── Toast.jsx              # Sistema de notificações + confirm dialog
│   │   ├── PrintFicha.jsx         # Ficha de impressão institucional
│   │   ├── AdminUsers.jsx         # 🆕 Admin de usuários (avatar, filtro role, confirmação, auditoria)
│   │   ├── AuditLog.jsx           # 🆕 Histórico de auditoria (filtros, paginação, expand, CSV)
│   │   ├── Avatar.jsx             # 🆕 Componente de avatar com iniciais (compartilhado)
│   │   ├── ProfileModal.jsx       # 🆕 Modal "Meu Perfil"
│   │   ├── DocumentationModal.jsx # 🆕 Documentação técnica integrada
│   │   ├── MultiLotacaoModal.jsx  # Gestão de múltiplas lotações
│   │   ├── DuplicadosModal.jsx    # Gestão de CPFs duplicados
│   │   └── UnidadesSemCadastroModal.jsx  # Unidades órfãs + e-mail (Zimbra + Brevo fallback)
│   │
│   ├── assets/
│   │   ├── hero.png               # Screenshot do dashboard
│   │   ├── react.svg
│   │   └── vite.svg
│   │
│   └── test/
│       ├── setup.js               # Setup do Vitest + jsdom
│       └── basic.test.jsx         # Testes básicos
│
└── dist/                          # Build de produção (gitignorado)
```

---

## 🧩 Componentes

### Arquitetura de Providers

```
<App>
  └── <ErrorBoundary>
      └── <AuthProvider>                      # Context de autenticação
          └── <ToastProvider>                  # Notificações + confirm dialog
              └── <AppContent>
                  ├── <LoginScreen />          # Se não autenticado
                  ├── <AdminUsers />           # Se admin e page='admin'
                  ├── <AuditLog />             # Se page='audit'
                  └── <ErrorBoundary>          # Aninhado para o Dashboard
                      └── <DataProvider>       # Context de dados
                          └── <Dashboard />
```

### Árvore do Dashboard

```
<Dashboard>
  ├── Header (logos, usuário, dark mode, sair, status realtime)
  ├── KPICards (12 indicadores clicáveis)
  ├── TodayKPIs (6 indicadores do dia)
  ├── ChartsGrid (4 gráficos — Suspense + lazy loading)
  ├── Alertas + Multilotação + Solicitações
  ├── Filtros (unidade, busca global, especialidade, controle, período)
  ├── Dados da Unidade (CNES + nome)
  ├── ProfessionalsTable (tabela desktop / cards mobile)
  ├── Paginação (50/página)
  │
  ├── <Suspense> → <ReportsModal />
  ├── <Suspense> → <KpiDetailModal />
  ├── <Suspense> → <ApprovalModal />
  ├── <Suspense> → <PrintFicha />
  ├── <Suspense> → <MultiLotacaoModal />
  ├── <Suspense> → <DuplicadosModal />
  └── <Suspense> → <UnidadesSemCadastroModal />
```

---

## 🚀 Guia de Instalação

### Pré-requisitos
- **Node.js** 18+
- **npm** (ou yarn/pnpm)
- Conta **Supabase** com projeto ativo

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/cristianmarquesdevx/monitoramento-cnes.git
cd monitoramento-cnes

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: [http://localhost:5173](http://localhost:5173)

> ⚠️ **Nota**: As credenciais do Supabase já estão configuradas em `src/lib/supabase.js`. Para usar seu próprio projeto, substitua a `SUPABASE_URL` e `SUPABASE_ANON_KEY`.

> 🐍 **Python**: A função Zimbra SOAP API requer Python 3.12+ no Vercel. As dependências estão em `requirements.txt` (bibliotecas built-in — sem instalação adicional necessária).

---

## 🌐 Deploy no Vercel

Este projeto está configurado para deploy automático no **Vercel** via GitHub Actions.

### Deploy automático (recomendado)

1. Faça push para a branch `main` do repositório
2. A **GitHub Action** é disparada automaticamente
3. Após passar por `lint → test → build`, o Vercel faz o deploy

### Deploy manual

```bash
# Instale a Vercel CLI
npm install -g vercel

# Faça deploy
vercel --prod
```

### Variáveis de ambiente no Vercel

Caso use seu próprio projeto Supabase:
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

Para envio de e-mails via Zimbra:
```
ZIMBRA_URL=https://webmail.portovelho.ro.gov.br
ZIMBRA_USERNAME=gecav.semusa@portovelho.ro.gov.br
ZIMBRA_PASSWORD=sua-senha
FROM_EMAIL=gecav.semusa@portovelho.ro.gov.br
FROM_NAME="SEMUSA - Divisão de Controle e Avaliação do SUS"
```

---

## 🗄️ Configuração Supabase

### Tabelas do Banco

#### `profissionais`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `bigint` (PK) | Identificador único |
| `cnes` | `text` | Código CNES da unidade |
| `nome_profissional` | `text` | Nome completo |
| `cpf` | `text` | CPF do profissional |
| `cns` | `text` | CNS (Cartão Nacional de Saúde) |
| `cbo` | `text` | Código CBO (ex: 2235-05) |
| `conselho` | `text` | Conselho profissional (CRM, COREN, CRO…) |
| `registro` | `text` | Número do registro no conselho |
| `uf_conselho` | `text` | UF do conselho |
| `cargo_funcao` | `text` | Cargo ou função |
| `tipo_vinculo` | `text` | Tipo de vínculo |
| `carga_horaria` | `text` | Carga horária semanal |
| `setor_equipe` | `text` | Setor ou equipe |
| `controle_feito` | `boolean` | ✅ Flag de controle (default: `false`) |
| `created_at` | `timestamptz` | Data de criação |
| `updated_at` | `timestamptz` | Data de atualização |

```sql
ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS controle_feito BOOLEAN DEFAULT false;
UPDATE profissionais SET controle_feito = false WHERE controle_feito IS NULL;
```

#### `unidades_saude`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `cnes` | `text` (PK) | Código CNES da unidade |
| `nome_unidade` | `text` | Nome da unidade |
| `municipio` | `text` | Município |
| `email_responsavel` | `text` | E-mail do responsável (para notificações) |

```sql
ALTER TABLE unidades_saude ADD COLUMN IF NOT EXISTS email_responsavel TEXT;
```

#### `solicitacoes`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `bigint` (PK) | Identificador único |
| `profissional_id` | `bigint` | FK → profissionais(id) |
| `tipo` | `text` | `'update'` ou `'delete'` |
| `status` | `text` | `'pendente'`, `'aprovado'`, `'rejeitado'` |
| `dados_antigos` | `jsonb` | Dados antes da alteração |
| `dados_novos` | `jsonb` | Dados propostos |
| `criado_em` | `timestamptz` | Data da solicitação |
| `aprovado_em` | `timestamptz` | Data de aprovação |

```sql
CREATE TABLE solicitacoes (
  id BIGSERIAL PRIMARY KEY,
  profissional_id BIGINT REFERENCES profissionais(id),
  tipo TEXT NOT NULL CHECK (tipo IN ('update', 'delete')),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  dados_antigos JSONB,
  dados_novos JSONB,
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  aprovado_em TIMESTAMPTZ
);
ALTER publication supabase_realtime ADD TABLE solicitacoes;
```

#### `profiles`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `uuid` (PK) | FK → auth.users(id) |
| `nome` | `text` | Nome de exibição |
| `role` | `text` | `'admin'`, `'editor'` ou `'viewer'` |

#### `audit_log` (V4)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | `bigint` (PK) | Identificador único |
| `usuario_id` | `uuid` | FK → auth.users(id) |
| `usuario_nome` | `text` | Nome do usuário no momento da ação |
| `acao` | `text` | `'approve'`, `'reject'`, `'controle'`, `'update'`, `'delete'`, `'login'`, `'export'`, `'role_change'` |
| `tipo` | `text` | Tipo do alvo (`'profissional'`, `'solicitacao'`, `'sessao'`, `'csv'`, `'usuario'`) |
| `target_id` | `text` | ID do alvo |
| `descricao` | `text` | Descrição legível (pode conter `|||JSON|||` com detalhes de alteração) |
| `detalhes` | `jsonb` | 🆕 Dados estruturados (ex: campos alterados antes/depois) |
| `ip_address` | `text` | 🆕 Endereço IP de origem |
| `created_at` | `timestamptz` | Data do evento |

**Índices:** `created_at DESC`, `acao`, `usuario_id`, `descricao` (gin_trgm), composto `(created_at DESC, acao)`

### Autenticação

O sistema usa **Supabase Auth** com 3 perfis:

| Perfil | Ações Permitidas |
|--------|-----------------|
| 👑 **Administrador** | Tudo + Admin de usuários + Auditoria |
| ✏️ **Editor** | Aprovar/rejeitar solicitações, marcar controle |
| 👁️ **Visualizador** | Apenas visualização |

A role é definida na tabela `profiles`. Por padrão, novos usuários são criados como `viewer`.

### Envio de E-mails — Zimbra SOAP API (principal) + Brevo (fallback)

O sistema envia e-mails para gestores de unidades sem cadastro de profissionais usando **dois métodos** com fallback automático:

```
1️⃣ Zimbra SOAP API (gecav.semusa@portovelho.ro.gov.br) ← principal
   ↓ se falhar...
2️⃣ Brevo Edge Function (cristianmarques.devx@gmail.com) ← fallback
```

#### Método 1 — Zimbra SOAP API (recomendado)

O webmail da prefeitura roda **Zimbra**, que expõe uma API SOAP via HTTPS (porta 443). A função Python `api/send-email.py`:

1. Autentica no Zimbra via `AuthRequest` (e-mail + senha)
2. Envia o e-mail via `SendMsgRequest` com template HTML institucional
3. Retorna `{ success: true }` para o frontend

**Vantagens:**
- ✅ Domínio oficial do governo — e-mails **não vão para SPAM**
- ✅ Zero configuração de DNS — usa a mesma autenticação do webmail
- ✅ Funciona de qualquer lugar — HTTPS na porta 443
- ✅ Custo zero — bibliotecas padrão Python

**Configuração no Vercel:**
```
ZIMBRA_URL=https://webmail.portovelho.ro.gov.br
ZIMBRA_USERNAME=gecav.semusa@portovelho.ro.gov.br
ZIMBRA_PASSWORD=sua-senha
FROM_EMAIL=gecav.semusa@portovelho.ro.gov.br
FROM_NAME="SEMUSA - Divisão de Controle e Avaliação do SUS"
```

#### Método 2 — Brevo (fallback)

A Edge Function `enviar-email-relacionar` usa [Brevo](https://brevo.com) como contingência caso o Zimbra esteja indisponível.

```bash
supabase secrets set BREVO_API_KEY=xkeysib-xxxxxxxxxxxx
supabase secrets set BREVO_FROM_EMAIL=cristianmarques.devx@gmail.com
supabase secrets set BREVO_FROM_NAME="SEMUSA - Divisão de Controle e Avaliação do SUS"
supabase functions deploy enviar-email-relacionar --no-verify-jwt
```

#### Uso

O modal **"Unidades sem Cadastro"** no Dashboard permite:
- Visualizar unidades sem profissionais cadastrados
- Cadastrar/editar e-mail do responsável
- Enviar e-mail individual ou em massa (fallback automático Zimbra → Brevo)
- Copiar lista de unidades para área de transferência

> ⚡ **Envio otimizado**: os e-mails são processados com fallback automático — o sistema tenta Zimbra primeiro e, se falhar, usa Brevo.

---

## 📜 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento (HMR) |
| `npm run build` | Gera build de produção em `dist/` |
| `npm run preview` | Visualiza o build de produção localmente |
| `npm run lint` | Executa oxlint |
| `npm test` | Executa testes (Vitest) |
| `npm run test:watch` | Executa testes em modo watch |

---

## 🔄 CI/CD Pipeline

O arquivo `.github/workflows/deploy.yml` define a pipeline automática:

```
Push na branch main
       ↓
   [quality job]
  ┌──────────────┐
  │  oxlint      │
  │  npm test    │
  │  npm build   │
  └──────┬───────┘
         ↓ (se main)
   [deploy job]
  ┌──────────────┐
  │ Vercel       │
  │ --prod       │
  └──────────────┘
```

**Status atual:** [![CI/CD](https://img.shields.io/github/actions/workflow/status/cristianmarquesdevx/monitoramento-cnes/deploy.yml?branch=main)](https://github.com/cristianmarquesdevx/monitoramento-cnes/actions)

---

## 👨‍💻 Desenvolvido por

**Cristian Marques**  
SEMUSA — Secretaria Municipal de Saúde de Porto Velho  
Divisão de Controle e Avaliação do SUS (GECAV)

| Canal | Info |
|-------|------|
| 📍 | Avenida Campos Sales, 2283 — Centro — Porto Velho/RO |
| 📞 | (69) 3901-6126 |
| 📧 | gecav.semusa@portovelho.ro.gov.br |
| 🐙 | [github.com/cristianmarquesdevx](https://github.com/cristianmarquesdevx) |
| 🌐 | [monitoramento-cnes.vercel.app](https://monitoramento-cnes.vercel.app) |

---

## 📄 Licença

© 2026 — SEMUSA. Todos os direitos reservados.

---

<div align="center">
  <sub>Feito com ❤️ pela equipe GECAV — SEMUSA Porto Velho/RO</sub>
</div>
