# 📦 Application - PostType

> Camada de aplicação responsável por orquestrar os casos de uso do PostType. Contém a lógica de negócio que coordena as operações entre o domínio e a infraestrutura.

## 📋 Visão Geral

A camada de aplicação implementa os **casos de uso** (Use Cases) que representam as operações disponíveis no sistema. Cada caso de uso:
- Recebe dados através de DTOs
- Coordena serviços de domínio
- Interage com repositórios
- Retorna dados no formato esperado

---

## 📁 Estrutura de Arquivos

```
application/
├── dtos/                              # Data Transfer Objects
│   ├── create-post-type.dto.ts        # DTO para criação
│   └── update-post-type.dto.ts        # DTO para atualização
└── use-cases/                         # Casos de uso
    ├── create-post-type.use-case.ts
    ├── delete-post-type-by-slug.use-case.ts
    ├── find-highlighted-post-types.use-case.ts
    ├── find-many-post-types.use-case.ts
    ├── find-post-type-by-id.use-case.ts
    ├── find-post-type-by-slug.use-case.ts
    ├── get-post-type-number-of-pages.use-case.ts
    └── update-post-type-by-slug.use-case.ts
```

---

## 🎯 Casos de Uso

### `CreatePostTypeUseCase`
Cria um novo tipo de post.

| Entrada | Saída |
|---------|-------|
| `CreatePostTypeDTO` | `IUnmountedPostType` |

**Fluxo:**
1. Gera slug a partir do nome
2. Verifica unicidade via `PostTypeUniquenessChecker`
3. Cria o schema via `PostTypeSchemaFactory`
4. Instancia e persiste a entidade
5. Retorna dados desmontados

```typescript
const useCase = new CreatePostTypeUseCase(repository);
const result = await useCase.run({ name, schema });
```

---

### `FindPostTypeByIdUseCase`
Busca um PostType pelo seu ID.

| Entrada | Saída |
|---------|-------|
| `id: string` | `IUnmountedPostType` |

**Exceções:**
- `ResourceNotFoundException` - Quando não encontrado

---

### `FindPostTypeBySlugUseCase`
Busca um PostType pelo seu slug.

| Entrada | Saída |
|---------|-------|
| `slug: string` | `IUnmountedPostType` |

**Exceções:**
- `ResourceNotFoundException` - Quando não encontrado

---

### `FindManyPostTypesUseCase`
Lista PostTypes com paginação.

| Entrada | Saída |
|---------|-------|
| `page: number` | `IUnmountedPostType[]` |

---

### `FindHighlightedPostTypesUseCase`
Retorna todos os PostTypes com `isHighlighted = true`.

| Entrada | Saída |
|---------|-------|
| - | `IUnmountedPostType[]` |

---

### `GetPostTypeNumberOfPagesUseCase`
Retorna o número total de páginas para paginação.

| Entrada | Saída |
|---------|-------|
| - | `number` |

---

### `UpdatePostTypeBySlugUseCase`
Atualiza um PostType existente.

| Entrada | Saída |
|---------|-------|
| `slug: string`, `UpdatePostTypeDTO` | `IUnmountedPostType` |

**Regras:**
- Não permite alteração do schema
- Verifica unicidade se nome for alterado

---

### `DeletePostTypeBySlugUseCase`
Remove um PostType pelo slug.

| Entrada | Saída |
|---------|-------|
| `slug: string` | `void` |

**Exceções:**
- `ResourceNotFoundException` - Quando não encontrado

---

## 📝 DTOs

### `CreatePostTypeDTO`
```typescript
{
  name: string;      // Nome do tipo de post
  schema: object;    // Estrutura do schema Typebox
}
```

### `UpdatePostTypeDTO`
```typescript
{
  name?: string;         // Novo nome (opcional)
  isHighlighted?: boolean; // Novo estado de destaque (opcional)
}
```

---

## 🔗 Dependências

| Dependência | Uso |
|-------------|-----|
| `@/domain/post-type` | Entidade PostType |
| `@/domain/services/*` | Serviços de domínio |
| `@/domain/types/*` | Interfaces e tipos |
| `@caffeine/errors/application` | Exceções de aplicação |

---

## 🧪 Testes

Cada caso de uso possui seu arquivo de teste correspondente (`*.spec.ts`) que cobre:
- Cenários de sucesso
- Cenários de erro (recursos não encontrados, duplicados)
- Validação de dados de entrada
