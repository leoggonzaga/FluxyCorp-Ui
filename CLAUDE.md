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

### Tabelas
TanStack React Table (`@tanstack/react-table`) encapsulado pelo componente compartilhado `DataTable`. Use `DataTable` para novas listagens em vez de implementar a lógica de tabela diretamente.

### Estilização
Tailwind CSS v4 com JIT. Cor primária customizada `#4f39f6`. Dark mode via estratégia `class`. Classes dinâmicas são safelistadas em `safelist.txt`. Estilo de código: aspas simples, sem ponto e vírgula, indentação de 4 espaços (aplicado por Prettier + ESLint).

### Localização
Todas as strings visíveis ao usuário passam pelo i18next (hook `useTranslation`). Adicione novas chaves em `src/locales/en/` e `src/locales/pt-BR/`.


### personalidade de desing 
seja  profissional muito exigente com o layout das pagina. gosto de resultados elegantes , com transparencia , detalhes que podem fazer toda a diferença na usabilidade das telas 
