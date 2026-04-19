# CLAUDE.md

Este arquivo fornece orientações ao Claude Code (claude.ai/code) ao trabalhar com o código neste repositório.

## Comandos

```bash
npm start          # Inicia o servidor de desenvolvimento Vite
npm run build      # Build de produção (saída em /build)
npm run preview    # Visualiza o build de produção
npm run format     # Formata e corrige lint automaticamente (roda prettier:fix + lint:fix)
npm run lint       # Verifica ESLint nos arquivos .ts/.tsx
npm run prettier   # Verifica formatação com Prettier
```

Nenhuma suite de testes está configurada.

## Visão Geral da Arquitetura

Este é um dashboard de gestão de saúde/clínica (React 19 + Vite + TypeScript). O código segue uma arquitetura em camadas:

```
src/
├── api/           # Instâncias Axios e funções de serviço por domínio
├── services/      # Wrappers de ApiService, AuthService, RtkQueryService
├── store/         # Redux Toolkit store + Redux Persist
├── configs/       # Configurações de rotas, navegação, tema e app
├── views/         # Páginas de funcionalidades (paciente, funcionário, catálogo, etc.)
├── components/
│   ├── ui/        # Primitivos base de UI (Button, Input, Modal…)
│   ├── shared/    # Componentes reutilizáveis compostos (DataTable, AdaptableCard…)
│   ├── layouts/   # 6 tipos de layout: CLASSIC, MODERN, STACKED_SIDE, SIMPLE, DECKED, BLANK
│   └── route/     # AppRoute, ProtectedRoute, AuthorityGuard, PublicRoute
├── utils/hooks/   # Hooks customizados (useAuth, useResponsive, useLocale…)
├── locales/       # Strings de i18n (en, pt-BR)
├── webSocket/     # WebSocketContext para atualizações em tempo real
└── @types/        # Definições de tipos TypeScript compartilhadas
```

## Padrões Principais

### Camada de API
Cada domínio de backend tem sua própria instância Axios em `src/api/apiBaseService.jsx` (loginAuthenticationApi, enterpriseApi, catalogApi, appointmentApi, consultationTypeApi). As URLs base vêm de variáveis `.env`:

```
VITE_AUTHENTICATION_URL=https://localhost:7212
VITE_ENTERPRISE_URL=https://localhost:7020
VITE_CATALOG_URL=https://localhost:7174
VITE_APPOINTMENT_URL=https://localhost:7207
VITE_CONSULTATION_TYPE_URL=https://localhost:7109/
```

O código das apis estão no caminho C:\Git\FluxyCorp\FluxyCorp


O interceptor de requisição lê o JWT do localStorage do Redux Persist pela chave `admin` e injeta `Authorization: Bearer {token}`. O interceptor de resposta extrai `response.data` e exibe toasts de erro (erros 422 são tratados separadamente para validação por campo).

Os serviços de domínio são wrappers simples:
```javascript
// src/api/AuthenticationService.jsx
export const authenticationUserLogin = async (param) =>
    loginAuthenticationApi.post(endpoints.userAPI_Auth_Login, param)
```

### Fluxo de Autenticação
1. `useAuth().signIn()` chama o serviço de login
2. O JWT da resposta é decodificado; `signInSuccess(token)` e `setUser(userData)` são despachados ao Redux
3. O Redux Persist salva auth + locale no localStorage sob a chave `admin`
4. `useAuth().authenticated` (verifica `session.signedIn && token`) protege todas as rotas autenticadas
5. Falha de autenticação redireciona para `/sign-in?redirectUrl=...`

### Gerenciamento de Estado
A store Redux possui quatro slices: `auth/session`, `auth/user`, `theme`, `locale`, `base`. Os slices `auth` e `locale` são persistidos. Use `useAppDispatch` / `useAppSelector` de `src/store/hooks.js` — nunca importe hooks do Redux diretamente.

### Roteamento
As rotas são definidas em `src/configs/routes.config/routes.config.ts` usando React.lazy para code splitting. O componente `AppRoute` seleciona o layout correto por rota; `ProtectedRoute` aplica a autenticação.

### Formulários
Formik + Yup para todos os formulários. React Input Mask / React IMask para campos mascarados, React Number Format para campos numéricos, React Select para dropdowns.
para campos dadronizados crie com máscaras: cpf, data , cnpj,

### INTERNACIONALIZAÇÃO 

Pesnse que para tudo que eu vou construir, precisa pensar em como vai ficar nas culturas pt portugal , pt brasil , ingles e espanhol



### Grid / Listagem — padrão obrigatório

**Para qualquer lista de entidades use o componente `Pattern1`** (slim row com avatar, info e badge).
Arquivo: `src/components/shared/listPatterns/Pattern1.jsx`  
Import: `import { Pattern1 } from '@/components/shared/listPatterns'`


grids ja disponiveis:`src/components/shared/listPatterns/Pattern2.jsx`,`src/components/shared/listPatterns/Pattern3.jsx`,`src/components/shared/listPatterns/Pattern1.jsx`,`src/components/shared/listPatterns/Pattern4.jsx`,`src/components/shared/listPatterns/Pattern5.jsx`

#### Estrutura de cada item

```js
{
    id,                     // chave única
    name,                   // texto principal (bold)
    email?,                 // info secundária linha 1 (ícone customizável via emailIcon)
    emailIcon?,             // ícone react-icons para o campo email (default: HiOutlineMail)
    meta?,                  // info secundária linha 2 (ícone customizável via metaIcon)
    metaIcon?,              // ícone react-icons para o campo meta (default: HiOutlineIdentification)
    badge?,                 // texto do badge direito
    badgeColor?,            // classes Tailwind para cor do badge (default: indigo)
    badgeIcon?,             // ícone react-icons dentro do badge
    status?,                // 'ativo'|'inativo' — exibe StatusDot; omitir para não mostrar
    avatarName?,            // nome para gerar iniciais do avatar (default: name)
    avatarColor?,           // classes Tailwind para cor do avatar (default: automático por hash)
    _raw,                   // objeto original (passado nos callbacks de actions)
}
```

#### Actions por linha (condicionais)

```js
const actions = [
    {
        key:       'edit',
        label:     'Editar',          // texto → botão pill; omitir → botão ícone
        icon:      <HiOutlinePencil />, // usado quando label é omitido
        tooltip:   'Editar',
        visible:   (item) => item._raw.status === 'ativo',  // opcional — filtra por linha
        onClick:   (item) => handleEdit(item._raw),
        className: 'px-2.5 py-1.5 rounded-lg text-xs ...',  // opcional
    },
]
```

#### Uso completo

```jsx
<Card className="border border-gray-100">
    <Pattern1
        items={items}          // array mapeado conforme estrutura acima
        loading={loading}
        actions={actions}      // opcional
        onItemClick={(item) => navigate(`/view/${item._raw.publicId}`)}  // opcional
        emptyMessage="Nenhum item encontrado"
    />
</Card>
```

- Filtros e busca ficam em um `<Card>` separado acima do Card da lista
- Paginação manual abaixo do Pattern (ou usar componente `Pagination` do UI)
- **Nunca** construa rows/cards de lista manualmente — sempre use um dos Patterns
- **Clique na linha sempre abre edição** — `onItemClick` deve chamar a função de editar o item (`openEdit(item._raw)`). Nunca use clique na linha para navegar ou para outra ação que não seja editar.

#### Qual pattern usar?

| Pattern | Descrição | Ideal para |
|---------|-----------|------------|
| `Pattern1` | Slim row com avatar + info + badge + StatusDot | Listas de pessoas/entidades genéricas |
| `Pattern2` | Grid de cards centrados | Diretórios visuais, catálogos |
| `Pattern3` | Tabela ultra-compacta sem bordas | Grandes volumes, views administrativas |
| `Pattern4` | Card com faixa gradiente no topo | Destaque premium, home dashboards |
| `Pattern5` | Slim row + barra lateral colorida + métrica | **Movimentações, solicitações, transações com quantidade** |

#### Pattern5 — item extra (além dos campos comuns do Pattern1)

```js
{
    barColor?,      // classe Tailwind da barra lateral esquerda (ex: 'bg-orange-400')
    sub1?,          // sub-linha 1 (usa sub1Icon)
    sub1Icon?,      // componente react-icons
    sub2?,          // sub-linha 2 (usa sub2Icon)
    sub2Icon?,      // componente react-icons
    metric?,        // valor numérico destacado (ex: '+3', '−5')
    metricColor?,   // classe Tailwind de cor (ex: 'text-emerald-600')
    metricSub?,     // texto abaixo do metric (ex: 'un  ·  10→7')
}
```

### Estilização
Tailwind CSS v4 com JIT. Cor primária customizada `#4f39f6`. Dark mode via estratégia `class`. Classes dinâmicas são safelistadas em `safelist.txt`. Estilo de código: aspas simples, sem ponto e vírgula, indentação de 4 espaços (aplicado por Prettier + ESLint).

### Localização
Todas as strings visíveis ao usuário passam pelo i18next (hook `useTranslation`). Adicione novas chaves em `src/locales/en/` e `src/locales/pt-BR/`.


### personalidade de desing 
seja  profissional muito exigente com o layout das pagina. gosto de resultados elegantes , com transparencia , detalhes que podem fazer toda a diferença na usabilidade das telas 

### Convenção de cores em modais de ação

- **Criar** → roxo/violet (`bg-violet-600`, `text-violet-*`) — ação nova, tom primário do sistema
- **Editar** → âmbar (`bg-amber-500`, `text-amber-*`) — modificação de algo existente, sinaliza atenção

Manter essa distinção em todos os dialogs/modais de CRUD para dar feedback visual imediato ao usuário sobre o contexto da ação.

## CORS nos microserviços ASP.NET Core (padrão obrigatório)

`UseCors()` sem nome de política NÃO funciona de forma confiável. **Sempre use política nomeada:**

```csharp
// ✅ CORRETO — em Program.cs de qualquer microserviço
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

// Ordem do middleware (não alterar):
app.UseHttpsRedirection();
app.UseCors("CorsPolicy");   // ← antes de Auth e MapControllers
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
```

`ERR_CONNECTION_REFUSED` nos logs do browser pode indicar:
1. Microserviço não está rodando — verificar se o processo está de pé
2. Porta errada no `.env` — confirmar `VITE_*_URL` bate com `launchSettings.json`
3. Instância anterior travada na porta — matar com `Get-Process -Id (Get-NetTCPConnection -LocalPort XXXX).OwningProcess | Stop-Process`


# Architecture Guide 

Este guia descreve os padrões de arquitetura utilizados no projeto `FluxyCorp.Consumer`. Ele serve como referência para o desenvolvimento de novas funcionalidades, garantindo consistência e qualidade no código.

## BACkend Estrutura de Pastas 

- **Controllers**: Localizados na pasta `Controllers`, são responsáveis por expor endpoints HTTP e delegar a lógica para os handlers.
- **Handlers**: Localizados na pasta `Handlers`, contêm a lógica de negócios e interagem com os repositórios.
- **Repositories**: Localizados na pasta `Repositories`, são responsáveis por acessar e manipular os dados no banco de dados.
- **Models**: Contêm as classes de domínio e DTOs (Data Transfer Objects).

## BACkend Controllers

Os controllers devem:
- Ser nomeados com o sufixo `Controller` (ex.: `ConsumerController`).
- Utilizar atributos como `[HttpGet]`, `[HttpPost]`, `[HttpPut]`, etc., para definir os endpoints.
- Delegar a lógica de negócios para os handlers correspondentes.

Exemplo:

```csharp
[ApiController]
[Route("api/[controller]")]
public class ConsumerController : ControllerBase
{
    private readonly ICreateConsumerHandler _createConsumerHandler;

    public ConsumerController(ICreateConsumerHandler createConsumerHandler)
    {
        _createConsumerHandler = createConsumerHandler;
    }

    [HttpPost]
    public async Task<IActionResult> CreateConsumer([FromBody] CreateConsumerRequest request)
    {
        var result = await _createConsumerHandler.HandleAsync(request);
        return Ok(result);
    }
}
```

## BACkend Handlers

Os handlers devem:
- Implementar uma interface específica (ex.: `ICreateConsumerHandler`).
- Conter a lógica de negócios principal.
- Utilizar métodos de repositórios para acessar ou manipular dados.

Exemplo:

```csharp
public class CreateConsumerHandler : ICreateConsumerHandler
{
    private readonly IConsumerRepository _consumerRepository;

    public CreateConsumerHandler(IConsumerRepository consumerRepository)
    {
        _consumerRepository = consumerRepository;
    }

    public async Task<ConsumerResponse> HandleAsync(CreateConsumerRequest request)
    {
        var consumer = new Consumer
        {
            Name = request.Name,
            Email = request.Email,
            CreatedAt = DateTime.UtcNow
        };

        await _consumerRepository.AddAuditableAsync(consumer);
        return new ConsumerResponse { Id = consumer.Id, Name = consumer.Name };
    }
}
```

## BACkend Repositórios

Os repositórios devem:
- Implementar interfaces específicas (ex.: `IConsumerRepository`).
- Utilizar métodos como `AddAuditableAsync` e `UpdateAuditableAsync` para manipular dados.

### Backend Migrations

- execute sempre que precisar (criacao e alteracao de coluna, criacao de tabela , entidades )
### BACkend Métodos Padrão

- **AddAuditableAsync**: Adiciona uma nova entidade ao banco de dados e preenche os campos de auditoria (ex.: `CreatedAt`, `CreatedBy`).
- **UpdateAuditableAsync**: Atualiza uma entidade existente e preenche os campos de auditoria (ex.: `UpdatedAt`, `UpdatedBy`).

Exemplo:

```csharp
public class ConsumerRepository : IConsumerRepository
{
    private readonly DbContext _context;

    public ConsumerRepository(DbContext context)
    {
        _context = context;
    }

    public async Task AddAuditableAsync(Consumer consumer)
    {
        consumer.CreatedAt = DateTime.UtcNow;
        _context.Consumers.Add(consumer);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAuditableAsync(Consumer consumer)
    {
        consumer.UpdatedAt = DateTime.UtcNow;
        _context.Consumers.Update(consumer);
        await _context.SaveChangesAsync();
    }
}
```

## BACkend Padrões Gerais

- **Injeção de Dependência**: Utilize o padrão de injeção de dependência para gerenciar dependências entre classes.
- **Validação**: Realize validações nos DTOs utilizando bibliotecas como `FluentValidation`.
- **Logs**: Utilize uma biblioteca de logging (ex.: `Serilog`) para registrar informações importantes.

- Sempre crie um migration para as as entidades que criar ou se o serviço for novo precisa criar o migration 

Este guia deve ser seguido para garantir consistência e qualidade no desenvolvimento do projeto `FluxyCorp.Consumer`. Caso tenha dúvidas, consulte a equipe de arquitetura.

os tipos de licenças Vet, PEt m odonto , piscicolo , pedico sao sempre  1 por usuario/assinatura então um prontuario de um usuario que a licença é de odonto os campos serao de odonto 
