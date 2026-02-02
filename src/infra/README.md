# 📦 Infrastructure - PostType

> Camada de infraestrutura responsável por implementar os detalhes técnicos como persistência de dados, cache e fábricas de objetos.

## 📋 Visão Geral

A camada de infraestrutura contém as **implementações concretas** das interfaces definidas no domínio. Ela lida com:
- Persistência em banco de dados (Prisma)
- Cache (Redis)
- Fábricas para instanciar casos de uso
- Repositórios de teste

---

## 📁 Estrutura de Arquivos

```
infra/
├── factories/
│   ├── application/              # Fábricas de casos de uso
│   │   ├── create-post-type.use-case.factory.ts
│   │   ├── delete-post-type-by-slug.use-case.factory.ts
│   │   ├── find-highlighted-post-types.use-case.factory.ts
│   │   ├── find-many-post-types.use-case.factory.ts
│   │   ├── find-post-type-by-id.use-case.factory.ts
│   │   ├── find-post-type-by-slug.use-case.factory.ts
│   │   ├── get-post-type-number-of-pages.use-case.factory.ts
│   │   └── update-post-type-by-slug.use-case.factory.ts
│   └── repositories/             # Fábricas de repositórios
│       └── post-type.repository.factory.ts
└── repositories/
    ├── cached/                   # Repositório com cache Redis
    │   └── post-type.repository.ts
    ├── prisma/                   # Repositório Prisma (banco de dados)
    │   └── post-type.repository.ts
    └── test/                     # Repositório em memória (testes)
        └── post-type.repository.ts
```

---

## 🗄️ Repositórios

### `PrismaPostTypeRepository`
Implementação do repositório usando **Prisma ORM** para persistência em PostgreSQL.

**Localização:** `repositories/prisma/post-type.repository.ts`

**Características:**
- Conexão direta com banco de dados
- Operações CRUD completas
- Mapeamento de entidades

---

### `CachedPostTypeRepository`
Implementação com **cache Redis** para otimização de leituras.

**Localização:** `repositories/cached/post-type.repository.ts`

**Características:**
- Wrapper sobre o repositório Prisma
- Cache de leituras frequentes
- Invalidação automática em operações de escrita
- Melhora performance para consultas repetidas

**Estratégia de Cache:**
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Controller   │ ──▶ │  CachedRepo     │ ──▶ │   PrismaRepo    │
│                 │     │  (Redis)        │     │  (PostgreSQL)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

### `InMemoryPostTypeRepository` (Test)
Implementação em memória para **testes unitários**.

**Localização:** `repositories/test/post-type.repository.ts`

**Características:**
- Armazena dados em array na memória
- Rápido e isolado
- Ideal para testes unitários e de integração

---

## 🏭 Fábricas (Factories)

### Fábricas de Casos de Uso
Responsáveis por instanciar os casos de uso com suas dependências corretas.

| Factory | Caso de Uso |
|---------|-------------|
| `makeCreatePostTypeUseCase()` | `CreatePostTypeUseCase` |
| `makeDeletePostTypeBySlugUseCase()` | `DeletePostTypeBySlugUseCase` |
| `makeFindHighlightedPostTypesUseCase()` | `FindHighlightedPostTypesUseCase` |
| `makeFindManyPostTypesUseCase()` | `FindManyPostTypesUseCase` |
| `makeFindPostTypeByIdUseCase()` | `FindPostTypeByIdUseCase` |
| `makeFindPostTypeBySlugUseCase()` | `FindPostTypeBySlugUseCase` |
| `makeGetPostTypeNumberOfPagesUseCase()` | `GetPostTypeNumberOfPagesUseCase` |
| `makeUpdatePostTypeBySlugUseCase()` | `UpdatePostTypeBySlugUseCase` |

**Exemplo de uso:**
```typescript
import { makeCreatePostTypeUseCase } from "@/infra/factories/application";

const useCase = makeCreatePostTypeUseCase();
await useCase.run({ name: "Article", schema: {...} });
```

---

### Fábricas de Repositórios
Responsáveis por instanciar os repositórios com a configuração correta.

| Factory | Repositório |
|---------|-------------|
| `makePostTypeRepository()` | `CachedPostTypeRepository` (produção) |

---

## 🔗 Dependências Externas

| Pacote | Uso |
|--------|-----|
| `@caffeine-packages/post.db.prisma-drive` | Cliente Prisma configurado |
| `@caffeine/redis-drive` | Cliente Redis para cache |

---

## ⚙️ Configuração

### Variáveis de Ambiente
```env
DATABASE_URL=postgresql://...   # URL de conexão PostgreSQL
REDIS_URL=redis://...           # URL de conexão Redis
```

### Docker Compose
O projeto inclui `docker-compose.yml` para subir as dependências:
```bash
docker compose up -d
```

---

## 🧪 Testes

Os repositórios de teste (`test/`) são utilizados nos testes unitários e de integração, permitindo:
- Isolamento de testes
- Execução rápida
- Sem dependências externas
