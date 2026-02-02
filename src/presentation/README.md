# 📦 Presentation - PostType

> Camada de apresentação responsável por expor as funcionalidades através de uma API HTTP usando o framework Elysia.

## 📋 Visão Geral

A camada de apresentação contém os **controllers** que:
- Definem as rotas HTTP
- Validam dados de entrada via DTOs
- Delegam a lógica para os casos de uso
- Retornam respostas formatadas
- Documentam a API via OpenAPI/Swagger

---

## 📁 Estrutura de Arquivos

```
presentation/
├── controllers/
│   ├── create-post-type.controller.ts
│   ├── delete-post-type.controller.ts
│   ├── get-post-type-by-id.controller.ts
│   ├── get-post-type-by-page.controller.ts
│   ├── get-post-type-by-slug.controller.ts
│   ├── get-post-type-highlights.controller.ts
│   ├── get-post-type-number-of-pages.controller.ts
│   └── update-post-type.controller.ts
└── index.ts                    # Agregador de rotas
```

---

## 🛣️ Rotas da API

Todas as rotas estão sob o prefixo `/post-type`.

| Método | Rota | Controller | Autenticação | Descrição |
|--------|------|------------|--------------|-----------|
| `POST` | `/` | `CreatePostTypeController` | ✅ Requerida | Cria um novo PostType |
| `GET` | `/:id` | `GetPostTypeByIdController` | ❌ | Busca por ID (UUID) |
| `GET` | `/by-slug/:slug` | `GetPostTypeBySlugController` | ❌ | Busca por slug |
| `GET` | `/?page=n` | `GetPostTypeByPageController` | ❌ | Lista paginada |
| `GET` | `/highlights` | `GetPostTypeHighlightsController` | ❌ | Lista destaques |
| `GET` | `/number-of-pages` | `GetPostTypeNumberOfPagesController` | ❌ | Total de páginas |
| `PATCH` | `/:slug` | `UpdatePostTypeController` | ✅ Requerida | Atualiza PostType |
| `DELETE` | `/:slug` | `DeletePostTypeController` | ✅ Requerida | Remove PostType |

---

## 🔐 Autenticação

Rotas que modificam dados (POST, PATCH, DELETE) requerem autenticação via `AuthGuard`:

```typescript
.use(AuthGuard({ layerName: "post@post-type" }))
```

O guard valida o token de autorização no header `Authorization`.

---

## 📝 Controllers

### `CreatePostTypeController`
```typescript
POST /post-type
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Article",
  "schema": { ... }
}
```

**Resposta:** `201 Created`
```json
{
  "id": "uuid",
  "name": "Article",
  "slug": "article",
  "schema": "...",
  "isHighlighted": false,
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

### `GetPostTypeByIdController`
```typescript
GET /post-type/:id
```

> O `:id` deve ser um UUID válido.

**Resposta:** `200 OK` ou `404 Not Found`

---

### `GetPostTypeBySlugController`
```typescript
GET /post-type/by-slug/:slug
```

**Resposta:** `200 OK` ou `404 Not Found`

---

### `GetPostTypeByPageController`
```typescript
GET /post-type?page=1
```

**Resposta:** `200 OK`
```json
[
  { "id": "...", "name": "...", ... },
  { "id": "...", "name": "...", ... }
]
```

---

### `GetPostTypeHighlightsController`
```typescript
GET /post-type/highlights
```

**Resposta:** `200 OK` (array de PostTypes com `isHighlighted: true`)

---

### `GetPostTypeNumberOfPagesController`
```typescript
GET /post-type/number-of-pages
```

**Resposta:** `200 OK`
```json
{ "pages": 5 }
```

---

### `UpdatePostTypeController`
```typescript
PATCH /post-type/:slug
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "New Name",        // opcional
  "isHighlighted": true      // opcional
}
```

**Resposta:** `200 OK` ou `404 Not Found`

---

### `DeletePostTypeController`
```typescript
DELETE /post-type/:slug
Authorization: Bearer <token>
```

**Resposta:** `204 No Content` ou `404 Not Found`

---

## 📚 Documentação OpenAPI

Todos os controllers incluem metadados para documentação automática:

```typescript
{
  detail: {
    summary: "Create Post Type",
    tags: ["Post Types"],
    description: "Creates a new post type with the provided details."
  }
}
```

---

## 🔧 Uso

### Importando as rotas
```typescript
import { PostTypeRoutes } from "@caffeine-packages/post.post-type/presentation";

const app = new Elysia()
  .use(PostTypeRoutes)
  .listen(3000);
```

### Tipo das rotas (para Eden)
```typescript
import type { PostTypeRoutes } from "@caffeine-packages/post.post-type/presentation";

// Usar com Eden Treaty para chamadas tipo-safe
```

---

## 🔗 Dependências

| Dependência | Uso |
|-------------|-----|
| `elysia` | Framework HTTP |
| `@caffeine/auth` | Guards de autenticação |
| `@/application/dtos/*` | DTOs de validação |
| `@/infra/factories/*` | Fábricas de casos de uso |
