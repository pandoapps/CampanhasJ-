# CLAUDE.md — CampanhasJá

## ⚠️ Regras Fundamentais

- **NUNCA faça commits automáticos.** Sempre aguarde instrução explícita do usuário.
- Use **português correto** com acentuação adequada em toda comunicação (ex: "contato", "criação", "configuração").
- Idioma dos commits: português.

---

## 🗂️ Stack Tecnológica

### Backend
- Laravel 11+ / PHP 8.4+
- MySQL 8
- Laravel Sanctum (autenticação via API)
- Arquitetura MVC com Services
- REST JSON API

### Frontend
- React 19 + TypeScript 5+
- Vite
- Tailwind CSS
- React Router v6
- Framer Motion (animações)
- Recharts (gráficos)

### Infraestrutura
- Docker + Docker Compose
- Nginx (reverse proxy)
- Makefile obrigatório

---

## 📁 Estrutura de Pastas

```
/
├── backend/                  # Laravel 11
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   ├── Requests/
│   │   │   └── Resources/
│   │   └── Services/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/api.php
├── src/
│   ├── pages/                # Telas (Landing, Login, Dashboard, etc.)
│   ├── components/           # Componentes reutilizáveis
│   ├── services/             # Chamadas de API (axios)
│   ├── hooks/                # Hooks customizados
│   └── utils/                # Utilitários
├── docker/
│   ├── nginx/
│   └── php/
├── CLAUDE.md
├── README.md
├── Makefile
├── docker-compose.yml
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 🛠️ Comandos Make

```bash
make up          # Sobe todos os containers
make up-prod     # Sobe em modo produção
make down        # Derruba os containers
make migrate     # Executa migrations
make seed        # Executa seeders
make fresh       # Recria o banco com seeders
make deploy      # Pull + build + migra em produção
make send        # Pede comentário, aplica lint e faz commit + push
make db          # Acessa o banco via CLI
make thinker     # Abre tinker do Laravel
make shell       # Acessa shell do container PHP
make install     # Instala dependências (composer + npm)
```

---

## 📐 Convenções de Código

### React
- Somente componentes funcionais
- Props tipadas com interfaces TypeScript
- Hooks para lógica de estado
- Serviços isolados em `/services` — **sem fetch direto nos componentes**
- Sem comentários desnecessários

### Laravel
- Controllers retornam JSON consistente
- FormRequest para validação
- API Resources para transformação de resposta
- Lógica de negócio em Services
- Controllers leves

---

## 🎨 Padrões de UI

### Glass Design
- Cards: `background: rgba(255,255,255,0.08)`, `backdrop-filter: blur(20px)`, `border: 1px solid rgba(255,255,255,0.15)`
- Fundo escuro: `#1A1A2E`
- Cor primária: `#FF6B00` (laranja)

### Tipografia
- Títulos: **Outfit** (Google Fonts), pesos 400–700
- Corpo: **DM Sans** (Google Fonts), pesos 400, 500, 700

### Animações (Framer Motion)
- Entrada de cards: stagger delay de 0.1s por card
- Modais: scale 0.9→1 + opacity 0→1
- Transições de tela: fade-in/out via AnimatePresence

---

## 🪟 Modais e Erros

- Modal fecha ao clicar fora (overlay) ou pressionar `ESC`
- Erros tratados com mensagem clara ao usuário — **nunca exibir "Error 500"**
- Toasts para feedback de ações (sucesso, erro, loading)
- Overlay com `bg-black/60` + `backdrop-blur`

---

## 🗄️ Padrão de Banco de Dados

Toda tabela deve incluir:
```php
$table->id();
$table->timestamps();
$table->softDeletes();
```

Relacionamentos:
```php
$table->foreignId('user_id')->constrained()->onDelete('cascade');
```

Seeders usam `updateOrCreate()` — nunca inserts estáticos.

Credenciais de admin padrão: `admin@admin.com` / `123456`

---

## 🔐 Autenticação

- Laravel Sanctum para autenticação via token
- Dois tipos de usuário: **Candidato** e **Admin (Gestor)**
- Rotas protegidas por middleware `auth:sanctum`
- Candidato não acessa rotas do admin e vice-versa
