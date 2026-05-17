# CampanhasJá

Plataforma de estruturação e disparo de campanhas de mensagens em massa para candidatos eleitorais.

## Stack

- **Backend:** Laravel 11 + PHP 8.4 + MySQL 8
- **Frontend:** React 19 + TypeScript 5 + Vite + Tailwind CSS 4
- **Infraestrutura:** Docker + Docker Compose + Nginx

## Início Rápido

```bash
# 1. Instalar dependências
make install

# 2. Configurar variáveis de ambiente
cp backend/.env.example backend/.env

# 3. Subir containers (modo dev)
make up

# 4. Rodar migrations + seeders
make fresh

# 5. Acessar
# Frontend: http://localhost:5173
# API:      http://localhost/api
```

## Credenciais de Teste

| Tipo | Email | Senha |
|------|-------|-------|
| Admin | admin@admin.com | 123456 |
| Candidato 1 | candidato1@campanhasja.com | 123456 |
| Candidato 2 | candidato2@campanhasja.com | 123456 |

## Comandos

```bash
make up          # Sobe todos os containers (modo dev)
make up-prod     # Sobe em modo produção
make down        # Derruba os containers
make migrate     # Executa migrations
make seed        # Executa seeders
make fresh       # Recria o banco com seeders
make deploy      # Deploy completo (pull + build + migra)
make send        # Commit + push (pede mensagem)
make db          # Acessa o banco MySQL
make thinker     # Laravel Tinker
make shell       # Shell do container PHP
make install     # Instala todas as dependências
make build       # Build do frontend para produção
```

## Estrutura

```
/
├── backend/       # Laravel 11 API
├── src/           # React 19 Frontend
│   ├── pages/     # Telas da aplicação
│   ├── components/ # Componentes reutilizáveis
│   ├── services/  # Serviços de API
│   ├── hooks/     # Hooks customizados
│   └── utils/     # Utilitários
├── docker/        # Configs Docker (Nginx, PHP)
├── Makefile       # Comandos de desenvolvimento
└── docker-compose.yml
```
