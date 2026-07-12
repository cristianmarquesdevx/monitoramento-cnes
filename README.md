# Planilha CNES - Dashboard de Atualização Cadastral de Profissionais (React)

Sistema web para gestão e atualização cadastral de profissionais de saúde vinculados ao **CNES (Cadastro Nacional de Estabelecimentos de Saúde)** da **SEMUSA - Secretaria Municipal de Saúde de Porto Velho/RO**.

Versão migrada de Vanilla JS para **React 19 + Vite 8 + Tailwind CSS 4**.

---

## 📋 Índice

- [Funcionalidades](#-funcionalidades)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Tecnologias](#-tecnologias)
- [Como Usar](#-como-usar)
- [Estrutura de Componentes](#-estrutura-de-componentes)
- [Banco de Dados](#-banco-de-dados-supabase)
- [Observações](#-observações-importantes)
- [Contato](#-desenvolvido-por)

---

## 📊 Funcionalidades

### Dashboard / Analytics
- **12 KPIs clicáveis**: Profissionais, Unidades, Médicos, Enfermeiros, ACS, Dentistas, CBOs, Hoje, Alertas, Completude, Pendentes, Concluídos
- **4 gráficos interativos** (Recharts): Movimentação Mensal (barra), CBO Top 10 (pizza), Carga Horária (radar)
- **Ranking**: Profissionais com múltiplas lotações (Top 15)
- **Alertas inteligentes**: CBO ausente, CPF duplicado/ausente, sem unidade

### 🔍 Filtros e Busca
- Seleção de unidade com busca por nome ou CNES
- Busca global por nome, CPF ou especialidade
- Filtro por especialidade: Médico, Enfermeiro, Dentista
- Filtro por controle: Pendentes / Concluídos

### ✅ Controle de Profissionais
- Checkbox individual e "Marcar todos"
- Botão "Marcar todos como concluídos" em lote
- Controle direto no Supabase via Realtime

### 📄 Aprovação de Solicitações (Admin)
- Listagem de solicitações de alteração/exclusão
- Modal com comparação lado a lado (dados atuais × novos)
- Campos editáveis antes de aprovar

### 🖨️ Exportação
- **CSV**: Exporta profissionais filtrados
- **PDF**: Impressão via `window.print()` com layout institucional

### 🔌 Conexão com Banco
- Supabase Client via npm (`@supabase/supabase-js`)
- Realtime subscriptions automáticas
- Indicador visual de status: 🟢 Conectado / 🔴 Desconectado

---

## 🏗️ Estrutura do Projeto

```
bck-react/
├── index.html                 # Entry point HTML
├── package.json               # Dependências e scripts
├── vite.config.js             # Config Vite + React + Tailwind
├── .gitignore                 # Arquivos ignorados pelo git
├── .oxlintrc.json             # Config do linter
├── README.md                  # Documentação
│
├── public/                    # Assets estáticos
│   ├── favicon.svg
│   ├── icons.svg
│   ├── logo_cnes.png
│   └── logo_prefeitura.png
│
├── src/
│   ├── main.jsx               # Entry point React
│   ├── App.jsx                # App principal com providers
│   ├── index.css              # Tailwind + variáveis CSS + @media print
│   │
│   ├── lib/
│   │   └── supabase.js        # Conexão com Supabase
│   │
│   ├── context/
│   │   ├── AuthContext.jsx    # Autenticação (login/logout)
│   │   └── DataContext.jsx    # Dados (unidades, profissionais, solicitações)
│   │
│   ├── data/
│   │   └── cboData.js        # ~700 CBOs + categorias
│   │
│   ├── components/
│   │   ├── Dashboard.jsx      # Página principal
│   │   ├── LoginScreen.jsx   # Tela de login
│   │   ├── KPICards.jsx      # Cards de indicadores
│   │   ├── TodayKPIs.jsx     # KPIs do dia
│   │   ├── ChartsGrid.jsx    # Grid de gráficos (Recharts)
│   │   ├── ProfessionalsTable.jsx  # Tabela de profissionais
│   │   ├── ApprovalModal.jsx # Modal de aprovação
│   │   ├── KpiDetailModal.jsx# Modal de detalhes KPI
│   │   ├── ReportsModal.jsx  # Modal de relatórios
│   │   ├── PrintFicha.jsx    # Ficha de impressão
│   │   ├── Modal.jsx         # Componente modal genérico
│   │   ├── Skeleton.jsx      # Loading skeleton
│   │   ├── Toast.jsx         # Sistema de notificações
│   │   └── ErrorBoundary.jsx # Tratamento de erros
│   │
│   └── assets/               # (removido - assets do template)
│
└── dist/                     # Build de produção
```

---

## 🛠️ Tecnologias

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| React | ^19.2.7 | Interface de usuário |
| Vite | ^8.1.1 | Bundler e dev server |
| Tailwind CSS | ^4.3.2 | Estilização utilitária |
| Supabase JS | ^2.110.2 | Backend PostgreSQL + Auth + Realtime |
| Recharts | ^3.9.2 | Gráficos (bar, pie, radar) |
| Lucide React | ^1.24.0 | Iconografia |
| Oxlint | ^1.71.0 | Linter |

---

## 🚀 Como Usar

### Pré-requisitos
- Node.js 18+ 
- Conta Supabase ativa com as tabelas configuradas

### Instalação

```bash
# Clone o repositório
git clone <seu-repo>
cd bck-react

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: [http://localhost:5173](http://localhost:5173)

### Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Gera build de produção |
| `npm run preview` | Visualiza build de produção |
| `npm run lint` | Executa oxlint |

---

## 🗄️ Banco de Dados (Supabase)

### Tabela `profissionais`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | int8 (PK) | Identificador único |
| `cnes` | text | Código CNES da unidade |
| `nome_profissional` | text | Nome completo |
| `cpf` | text | CPF do profissional |
| `cbo` | text | Código CBO (ex: 2235-05) |
| `conselho` | text | Conselho profissional |
| `registro` | text | Número do registro no conselho |
| `uf_conselho` | text | UF do conselho |
| `cargo_funcao` | text | Cargo ou função |
| `tipo_vinculo` | text | Tipo de vínculo |
| `carga_horaria` | text | Carga horária semanal |
| `setor_equipe` | text | Setor ou equipe |
| `controle_concluido` | bool | Flag de controle |
| `created_at` | timestamptz | Data de criação |
| `updated_at` | timestamptz | Data de atualização |

### Tabela `unidades_saude`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `cnes` | text (PK) | Código CNES |
| `nome_unidade` | text | Nome da unidade |
| `municipio` | text | Município |

### Tabela `solicitacoes`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | int8 (PK) | Identificador único |
| `profissional_id` | int8 | FK para profissionais |
| `tipo` | text | 'update' ou 'delete' |
| `status` | text | 'pendente', 'aprovado', 'rejeitado' |
| `dados_antigos` | jsonb | Dados antes da alteração |
| `dados_novos` | jsonb | Dados propostos |
| `criado_em` | timestamptz | Data da solicitação |
| `aprovado_em` | timestamptz | Data de aprovação |

> **SQL para criar a tabela `solicitacoes`:**
> ```sql
> CREATE TABLE solicitacoes (
>   id BIGSERIAL PRIMARY KEY,
>   profissional_id BIGINT REFERENCES profissionais(id),
>   tipo TEXT NOT NULL CHECK (tipo IN ('update', 'delete')),
>   status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
>   dados_antigos JSONB,
>   dados_novos JSONB,
>   criado_em TIMESTAMPTZ DEFAULT NOW(),
>   aprovado_em TIMESTAMPTZ
> );
> alter publication supabase_realtime add table solicitacoes;
> ```

---

## 📌 Observações Importantes

- **Supabase**: As credenciais estão em `src/lib/supabase.js`. Não modificar sem necessidade.
- **Lista CBO**: `src/data/cboData.js` contém ~700 códigos da Classificação Brasileira de Ocupações.
- **Coluna `controle_concluido`**: Necessário executar no SQL Editor do Supabase:
  ```sql
  ALTER TABLE profissionais ADD COLUMN controle_concluido BOOLEAN DEFAULT false;
  UPDATE profissionais SET controle_concluido = false WHERE controle_concluido IS NULL;
  ```
- **Realtime**: As subscriptions são automáticas ao carregar o Dashboard.

---

## 👨‍💻 Desenvolvido por

**Cristian Marques**  
SEMUSA - Secretaria Municipal de Saúde de Porto Velho  
Divisão de Controle e Avaliação do SUS (GECAV)

**Contato:** gecav.semusa@portovelho.ro.gov.br  
**Telefone:** (69) 3901-6126  
**Endereço:** Avenida Campos Sales, 2283 - Centro - Porto Velho/RO - CEP: 76804-358

---

## 📄 Licença

© 2026 - SEMUSA - Todos os direitos reservados.
