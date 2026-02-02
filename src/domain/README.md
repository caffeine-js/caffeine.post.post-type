# 📦 Domain - PostType

> Camada de domínio responsável por definir as regras de negócio relacionadas ao tipo de cada Post. Ele é responsável por informar os schemas de cada tipo de conteúdo, permitindo com que seja criado e consultado.

## 📋 Visão Geral

O `PostType` é uma entidade que define a estrutura de diferentes tipos de conteúdo no sistema. Assim como todo domínio, ele estende de `Entity`.

```
#################################################################
# PostType -> Informa o esquema de cada PostContent             #
#                                                               # 
# Post -> Informa uma postagem em sua forma mais simples        #
#                                                               #
# PostContent -> Informa o conteúdo de cada Post e o            #
#                conteúdo das informações adicionais            #
#################################################################
```

---

## 📁 Estrutura de Arquivos

```
domain/
├── dtos/                    # Data Transfer Objects do domínio
│   └── build-post-type.dto.ts
├── factories/               # Fábricas para criação de objetos
│   └── post-type-schema.factory.ts
├── services/                # Serviços de domínio
│   ├── build-post-type.service.ts
│   └── post-type-uniqueness-checker.service.ts
├── types/                   # Interfaces e tipos
│   ├── post-type.interface.ts
│   ├── post-type-repository.interface.ts
│   └── unmounted-post-type.interface.ts
├── post-type.ts             # Entidade principal
├── post-type.spec.ts        # Testes unitários
└── index.ts                 # Barrel exports
```

---

## ⚙️ Funcionalidades

| Funcionalidade | Descrição |
|----------------|-----------|
| **Criar** | Cria um novo tipo de post com nome, slug e schema |
| **Consultar** | Busca tipos de post por ID, slug ou listagem paginada |
| **Atualizar** | Atualiza propriedades permitidas (exceto schema) |
| **Deletar** | Remove um tipo de post (soft delete via `isHighlighted`) |

---

## 🏗️ Propriedades da Entidade

### `name: string`
> Nome do tipo de Post. Deve ser único no sistema.

### `slug: string`
> Identificador URL-friendly gerado automaticamente a partir do nome.

### `schema: Schema`
> Esquema do Typebox que define a estrutura de dados adicional. É serializado e armazenado no banco de dados. Representa todo o conteúdo adicional a ser apresentado na página.

### `isHighlighted: boolean`
> Define se o tipo de Post será exibido no painel lateral do site.

---

## 🔧 Serviços de Domínio

### `PostTypeUniquenessChecker`
Verifica se já existe um PostType com o slug fornecido.

```typescript
const checker = new PostTypeUniquenessChecker(repository);
const exists = await checker.run(slug); // true | false
```

### `BuildPostType`
Reconstrói uma entidade PostType a partir de dados não montados (unmounted).

```typescript
const postType = BuildPostType.run(unmountedPostType);
```

---

## 📐 Interfaces

### `IPostType`
Interface que define a estrutura da entidade PostType.

### `IUnmountedPostType`
Representação "desmontada" do PostType, usada para persistência e transferência de dados.

### `IPostTypeRepository`
Contrato para implementações de repositório:

```typescript
interface IPostTypeRepository {
  create(postType: PostType): Promise<void>;
  findById(id: string): Promise<IUnmountedPostType | null>;
  findBySlug(slug: string): Promise<IUnmountedPostType | null>;
  findMany(page: number): Promise<IUnmountedPostType[]>;
  update(postType: PostType): Promise<void>;
  getHighlights(): Promise<IUnmountedPostType[]>;
  delete(postType: PostType): Promise<void>;
  length(): Promise<number>;
}
```

---

## ⚠️ Regras de Negócio (Limites)

| Regra | Descrição |
|-------|-----------|
| **Schema imutável** | Um PostType não pode ter o Schema alterado após criação |
| **Soft delete** | Um PostType não pode ser removido diretamente. Para "remover", altere as referências e defina `isHighlighted` como `false` |
| **Nome único** | Não pode haver um PostType com nome/slug repetido |

---

## 🧪 Testes

Os testes unitários estão localizados em `post-type.spec.ts` e cobrem:
- Criação de entidade com dados válidos
- Validação de dados inválidos
- Método `unpack()` para serialização