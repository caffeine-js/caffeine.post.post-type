# @caffeine-packages/post.post-type

> Módulo responsável pelo gerenciamento de tipos de post (PostType) no ecossistema Caffeine.

[![Bun](https://img.shields.io/badge/Bun-v1.3.7-f9f1e1?logo=bun)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Elysia](https://img.shields.io/badge/Elysia-1.4.x-a855f7)](https://elysiajs.com/)

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Arquitetura](#-arquitetura)
- [Instalação](#-instalação)
- [Executando](#-executando)
- [Dependências](#-dependências)
- [Rotas da API](#-rotas-da-api)
- [Navegação no Projeto](#-navegação-no-projeto)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Testes](#-testes)

---

## 🎯 Visão Geral

O `PostType` define a estrutura de diferentes tipos de conteúdo no sistema. Cada tipo de post possui:
- **Nome** único e **slug** para identificação
- **Schema** (Typebox) que define campos adicionais
- Flag de **destaque** para exibição no painel lateral

---

## 🏗️ Arquitetura

O projeto segue a **Clean Architecture**, separando responsabilidades em camadas:

```
src/
├── 📁 domain/          # Entidades, regras de negócio
├── 📁 application/     # Casos de uso, orquestração
├── 📁 infra/           # Implementações (DB, Cache)
└── 📁 presentation/    # Controllers HTTP (Elysia)
```

### Fluxo de Dados
```
┌────────────────┐    ┌─────────────────┐    ┌────────────────┐    ┌──────────────┐
│  Presentation  │ ─▶ │   Application   │ ─▶ │    Domain      │ ◀─ │    Infra     │
│  (Controllers) │    │   (Use Cases)   │    │   (Entities)   │    │ (Repositories)
└────────────────┘    └─────────────────┘    └────────────────┘    └──────────────┘
```

### 📖 Documentação por Camada

| Camada | Documentação | Descrição |
|--------|--------------|-----------|
| Domain | [src/domain/README.md](./src/domain/README.md) | Entidades, regras de negócio, interfaces |
| Application | [src/application/README.md](./src/application/README.md) | Casos de uso e DTOs |
| Infrastructure | [src/infra/README.md](./src/infra/README.md) | Repositórios e factories |
| Presentation | [src/presentation/README.md](./src/presentation/README.md) | Controllers e rotas HTTP |

---

## 📦 Instalação

```bash
# Instalar dependências
bun install

# Configurar variáveis de ambiente
cp .env.example .env

# Subir serviços (PostgreSQL, Redis)
docker compose up -d

# Build do projeto
bun run build
```

---

## 🚀 Executando

### Desenvolvimento
```bash
bun run dev
```

### Produção
```bash
bun run build
bun run start
```

---

## 🔗 Dependências

### Pacotes Internos (Caffeine)

| Pacote | Descrição |
|--------|-----------|
| `@caffeine/auth` | Autenticação e guards de autorização |
| `@caffeine/constants` | Constantes compartilhadas do ecossistema |
| `@caffeine/errors` | Tratamento padronizado de erros |
| `@caffeine/models` | Modelos base (Entity, Schema) |
| `@caffeine-packages/post.db.prisma-drive` | Driver Prisma para banco de dados |
| `@caffeine/redis-drive` | Cliente Redis para cache |

### Dependências Externas

| Pacote | Versão | Uso |
|--------|--------|-----|
| `elysia` | ^1.4.22 | Framework HTTP |
| `typescript` | ^5.x | Tipagem estática |
| `vitest` | ^4.x | Framework de testes |
| `tsup` | ^8.x | Bundler |

---

## 🛣️ Rotas da API

Todas as rotas estão sob o prefixo `/post-type`.

| Método | Rota | Auth | Descrição |
|--------|------|:----:|-----------|
| `POST` | `/` | 🔐 | Criar novo PostType |
| `GET` | `/:id` | - | Buscar por ID (UUID) |
| `GET` | `/by-slug/:slug` | - | Buscar por slug |
| `GET` | `/?page=n` | - | Listar paginado |
| `GET` | `/highlights` | - | Listar destaques |
| `GET` | `/number-of-pages` | - | Total de páginas |
| `PATCH` | `/:slug` | 🔐 | Atualizar PostType |
| `DELETE` | `/:slug` | 🔐 | Remover PostType |


> 🔐 = Requer autenticação via header `Authorization: Bearer <token>`

---

## 🗺️ Navegação no Projeto

### Para entender o domínio
```
src/domain/
├── post-type.ts              # ⭐ Entidade principal
├── types/                    # Interfaces e contratos
│   ├── post-type.interface.ts
│   └── post-type-repository.interface.ts
└── README.md                 # 📖 Documentação
```

### Para entender os casos de uso
```
src/application/
├── use-cases/                # ⭐ Lógica de negócio
│   ├── create-post-type.use-case.ts
│   └── find-post-type-by-slug.use-case.ts
└── README.md                 # 📖 Documentação
```

### Para entender a persistência
```
src/infra/
├── repositories/
│   ├── prisma/               # 💾 Banco de dados
│   ├── cached/               # ⚡ Cache Redis
│   └── test/                 # 🧪 Testes
└── README.md                 # 📖 Documentação
```

### Para entender as rotas
```
src/presentation/
├── controllers/              # 🌐 Endpoints HTTP
│   ├── create-post-type.controller.ts
│   └── get-post-type-by-slug.controller.ts
└── README.md                 # 📖 Documentação
```

---

## 📜 Scripts Disponíveis

| Script | Comando | Descrição |
|--------|---------|-----------|
| Build | `bun run build` | Compila o projeto |
| Test | `bun run test:unit` | Executa testes unitários |
| Test UI | `bun run test:ui` | Interface visual de testes |
| Coverage | `bun run test:coverage` | Relatório de cobertura |
| Setup | `bun run setup` | Build + link para desenvolvimento |

---

## 🧪 Testes

### Executar todos os testes
```bash
bun run test:unit
```

### Executar com interface visual
```bash
bun run test:ui
```

### Gerar relatório de cobertura
```bash
bun run test:coverage
```

### Estrutura de testes
Os testes seguem a convenção `*.spec.ts` e estão localizados junto aos arquivos que testam:
```
src/
├── domain/
│   ├── post-type.ts
│   └── post-type.spec.ts        # ✅
├── application/
│   └── use-cases/
│       ├── create-post-type.use-case.ts
│       └── create-post-type.use-case.spec.ts  # ✅
```

---

## 📄 Licença

Projeto privado - Caffeine
