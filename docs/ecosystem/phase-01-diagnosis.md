# Fase 1 — Diagnóstico técnico

Data: 25/11/2026. Escopo: nove repositórios independentes efetivamente encontrados no workspace. Inspeção anterior às alterações de código da reorganização. Histórico e estado inicial estão em `baseline/repositories.json`.

## Estado inicial e divergências

- `elinea-ai-api` já existe e contém a fundação criada anteriormente; não recriar. Há um diretório residual `elinea-ai-agents/docker`, sem Git e pertencente a outro usuário. Ele é preservado, pois pode estar associado a mounts existentes.
- Core API, Hub SPA e AI SPA ainda não existem.
- Os nove repositórios estão limpos, exceto `elinea-site`: `docs/.flow-preview.html` e `docs/.segment-preview.html` aparecem como `AD` (adicionados ao índice e ausentes no working tree). Não corrigir, restaurar ou incluir essas alterações em outro trabalho.
- Admin e Gestão ainda têm o mesmo identificador privado `sass-farmacia-admin`. Storefront usa `elinea-frontstorage`. O Composer do e-commerce ainda se chama `laravel/laravel`; o da AI foi alterado para `elinea-ai-api`, um identificador inválido para o schema Composer por não possuir vendor/package.
- Existem locks npm e Yarn nos frontends. Preservar a distribuição atual e sincronizar apenas os manifests afetados; não trocar o gerenciador indiscriminadamente.

## Aplicações verificadas

| Repositório atual | Tecnologia instalada / organização | Responsabilidade e dependências |
|---|---|---|
| elinea-api | Laravel 12.62.0, PHP 8.4, Vanilo 5.2.1, Horizon 5.48.3; monólito modular | E-commerce e capacidades transversais legadas. Banco MySQL operacional; SQLite nos testes. Auth por ApiToken próprio, tokens com hash, usuários vinculados a site e exceção explícita para superusuários. |
| elinea-admin | Nuxt 4.4.8, Vue 3.5.38, Router 4.6.4, Vite 7.3.5; app/pages, composables, types e components | Administração de loja; `useApi`/`useAuth` e contratos locais. Não declara UI/SDK compartilhados. Tailwind 4/DaisyUI 5, tema claro/escuro, tokens e componentes próprios. |
| elinea-storefront | Nuxt 4.5.2, Vue 3.5.41, Router 5.2.0, Vite 8.2.2 | SSR/Nitro, rotas BFF, SDK server-side, contexto por hostname, camada storefront-core. UI/SDK por file dependencies e aliases para fontes irmãs. |
| elinea-gestao | Nuxt 4.4.8 e mesma base do Admin | Gestão de usuários/lojistas/planos/implantações/termos e financeiro. Clientes/composables e tipos próprios; ainda sem UI/SDK como dependências. |
| elinea-ai-api | Laravel 12.74.0, Sanctum 4.5.0, Horizon 5.52.0 | Apenas Core/Tenancy/Identity da fundação de agentes. Tenant por membership do token, permissões e expiração. PostgreSQL e Redis próprios. Paperclip é infraestrutura opcional independente; não há agentes, campanhas ou ferramentas executáveis. |
| elinea-site | Nuxt 4.5.2, Vue 3.5.42, Router 5.3.1, Vite 8.3.0; Nitro static | Site comercial de e-commerce, contratação, termos, apresentação local/PDF, políticas e conteúdo. Usa UI marketing e SDK, mas planos/termos/contratação ainda têm chamadas locais. |
| elinea-ui | Vue 3.5.42, Vite 7.3.6, Vitest 3.2.7, TypeScript 5.9.3 | Biblioteca `@elinea/ui` 0.1.0 com core/marketing/storefront/painel e aliases legados na raiz. Painel está vazio. Peer dependency e imports de tipos do SDK ainda acoplam os pacotes. |
| elinea-sdk | TypeScript 5.9.3, Vitest 3.2.7, sem framework | `@elinea/sdk` 0.1.0, cliente fetch injetável, erros e mappers de e-commerce, export raiz. Não há clientes Core/AI nem serviços administrativos. |
| elinea-deploy | Compose, Traefik, MySQL 8.4.7, Redis 8.2.4, imagens GHCR | VPS para API, Nginx, Horizon, Scheduler e Storefront. Site/Admin/Gestão são publicados separadamente como estáticos. Um workflow manual constrói/publica três imagens a partir de quatro repositórios. |

Não padronizar versões por substituição indiscriminada: os produtos existentes usam versões instaladas diferentes, e os builds são a referência de compatibilidade inicial.

## Arquitetura, identidade e dados

O e-commerce possui os módulos Auth, Tenant, Catalog, Inventory, Sales, Payments, Promotions, Billing, Customer, Notifications, Marketing, Integration, Platform, Reports, Support, Configuration, CRM, Messaging e Automation. Providers registram rotas/casos de uso. `docs/context.md` determina Actions, Form Requests, DTOs, Resources e preservação dos contratos existentes. Vanilo permanece proprietário das entidades comerciais que implementa.

Tenancy usa `site_id`, `App/Tenancy/TenantContext`, `BelongsToSite` e `ResolveSite`. O middleware prioriza credenciais de loja, normaliza domínio e mantém fallback legado X-Site. A autenticação verifica token/usuário contra o site resolvido; superusuários são um caso separado. A seleção de site no browser nunca deve ser interpretada como autorização.

Admin e Gestão usam tokens em localStorage, estado Nuxt e clientes próprios. Não existe SSO entre origens. A sessão dos consumidores das lojas é um domínio diferente. A AI API usa Sanctum bearer-only com token associado a membership; contratos de login e envelopes diferem dos do e-commerce. Um token existente não pode ser simplesmente copiado entre APIs.

Platform mantém planos, assinaturas SaaS, limites, aplicações de lojistas, termos e financeiro. Há contratos separados para cobrança SaaS/implantação e gateways de pagamentos operacionais. A futura extração para Core deve manter a fonte legada até transferência explícita e testada; não duplicar a autoridade de assinatura nem substituir os webhooks existentes. Core não receberá catálogo, carrinhos, pedidos ou pagamentos das lojas.

## UI: inventário e reaproveitamento

Foram mapeados 39 componentes no Admin. `baseline/admin-components.json` registra arquivo, imports, acoplamentos Nuxt, slots e estilos.

| Grupo | Candidatos / decisão inicial |
|---|---|
| Estrutura | ElineaCard, ElineaPage e ElineaComingSoon são apresentacionais e extraíveis. AppShell tem 729 linhas e integra auth, sites, notificações, rotas e planos: separar apresentação por props/slots/eventos; não mover regras da loja. |
| Gráficos | AreaPanel, SparkArea, ElineaAreaChart, ElineaBarChart, ElineaDonutChart, ElineaHorizontalBarChart e ElineaLineChart recebem dados; preservar SVG, animações e responsividade. |
| Controles | Toggle, Skeleton, TableSkeleton, PanelSkeleton, EmptyTableState, ConfirmDialog e Pagination são compartilháveis. RowActions precisa injetar componente de link; Toast precisa receber estado/apresentação sem conhecer useElineaToast da aplicação. |
| Formulários específicos | Produtos, categorias, marcas, pedidos, clientes, campanhas, banners e blog permanecem no produto. Os elementos visuais podem ser consolidados sem mover validação/regras de negócio. |
| Assinaturas | PlanUpgradeCard depende de planos/billing/contexto da loja; permanece no produto, usando primitivas do Painel. |

O UI existente já possui UiInput/Modal/Drawer/Badge/EmptyState e componentes Marketing/Storefront. Não substituir seus contratos pela aparência administrativa. `commerce.ts` mantém estado de carrinho via adapter, não HTTP; seu acoplamento a tipos do SDK deve ser resolvido preservando compatibilidade estrutural e testes. Os tokens administrativos estão em `app/assets/css/main.css` do Admin, com Tailwind/DaisyUI, fontes Segoe UI/Inter e temas claro/escuro. Não impor esses estilos globalmente ao Storefront ou Site.

## SDK e serviços HTTP

`HttpClient` aceita baseUrl, fetch, headers, providers de bearer/cart-session e contexto de loja; normaliza erros 401/403/404/422/429, incluindo Retry-After. Não tem timeout/cancelamento explícitos e espera envelope de e-commerce. Root exports devem permanecer compatíveis.

Admin/Gestão mantêm useApi/useAuth, domínios de API em composables e tipos locais. A extração deve centralizar o transporte e serviços no SDK, deixando estado, navegação, stores e permissões de apresentação nos frontends. FormData/uploads precisam continuar funcionando: não converter toda entrada em JSON. Os domínios precisam ter configurações independentes; o futuro AI client só poderá implementar endpoints realmente presentes.

Storefront usa o SDK no Nitro e repassa ao browser rotas restritas, sem storeSecret no bundle. Site mantém chamadas próprias para planos, termos e contratação. A migração deve preservar os endpoints atuais, formatos de validação e regras contratuais.

## Site e SEO

Rotas verificadas incluem `/`, `/recursos`, `/precos`, `/plataforma`, `/operacao/[slug]`, `/ecossistema/[slug]`, `/contratar-loja`, `/compra-concluida`, `/termos`, `/privacidade`, `/cookies`, `/documentacao` e `/apresentacao`. Não há projetos comerciais de Marketing. AI ainda é uma fundação técnica e não pode ser anunciada como produto pronto com agentes executáveis.

AGENTS.md exige leitura de CONTEXTO-VISUAL.md. A direção aprovada é editorial, Inter, verde/preto/off-white, componentes compartilhados de marketing e apresentação PDF com tratamento próprio. A nova hierarquia comercial autorizada substitui o posicionamento exclusivo, preservando conteúdo, formulários e identidade. Redirecionamentos 301 precisam considerar a hospedagem estática real; routeRules sem regra de servidor não comprovam 301 nesse ambiente.

## Infraestrutura e publicação

Domínios reais documentados: elinea.com.br, api.elinea.com.br, admin.elinea.com.br, gestao.elinea.com.br e wildcards de lojas; homologação tem subdomínios próprios. Não substituir pelos exemplos do pedido. DNS/TLS/CORS de novas aplicações exigirão configuração externa posterior.

O workflow publicado usa remotos legados xploter13/elinea-api e xploter13/elinea-storefront. Renomear caminhos de checkout local sem renomear os remotos. As imagens existentes e tags por ambiente permanecem compatíveis. A separação de jobs/releases por aplicação será feita na Fase 12, sem disparar workflows ou publicar imagens.

O deploy da VPS tem orçamento documentado de 1 vCPU/4 GB/50 GB. Paperclip possui runtime/banco próprios e imagem oficial pesada; não incluí-lo automaticamente nessa VPS. O ambiente AI local não é uma topologia de produção aprovada.

## Baseline executado

Ambiente: Node 24.21.0, npm 11.19.0, Yarn 1.22.22, PHP 8.4.24. Logs brutos locais em `/tmp/elinea-ecosystem-baseline`; o resumo versionável abaixo é a evidência persistente.

| Projeto | Testes iniciais | Build / validação inicial |
|---|---|---|
| API e-commerce | PHPUnit: 379 testes, 4723 assertions, 1 erro | Vite aprovado; Composer válido com aviso da versão exata Mercado Pago. |
| AI API | PHPUnit: 30 testes, 129 assertions, aprovados | Compose aprovado; Composer inválido pelo nome sem vendor/package. |
| SDK | Vitest: 32 testes, aprovados | Typecheck e build aprovados. |
| UI | Vitest: 8 testes, aprovados | Typecheck e build aprovados. |
| Admin | 9 arquivos Node: 7 aprovados, 2 falharam | Nuxt build aprovado. |
| Gestão | 2 arquivos Node, aprovados | Nuxt build aprovado. |
| Storefront | 84 casos em Node 24 no container: 82 aprovados, 2 falharam | Nuxt build aprovado. |
| Site | 5 arquivos Node, aprovados | Build com `.env` local recusado pelo guard de API pública HTTPS; build com NUXT_PUBLIC_API_BASE=https://api.elinea.com.br/api/v1 aprovado, 38 rotas prerenderizadas. |
| Deploy | Sem suíte de testes própria | Compose produção/homologação aprovados com exemplos; bash -n falha em scripts com CRLF. |

Falhas preexistentes identificadas:

1. `RetirePlansTest::test_archived_plan_cannot_be_reused_by_checkout_or_plan_change_even_if_marked_active`: chama `CreateImplementationCheckoutRequest::rules()` sem o argumento injetado exigido. Corrigir a forma de exercitar a request, preservando regras.
2. Admin: customer-form e module-access. A execução direta do teste de permissões confirmou grant antigo após falha de refresh; não propagar esse comportamento para consumidores novos. A autorização backend permanece separada.
3. Storefront: duas assertions de catalog-mode esperam o texto `/Comprar pelo Whatsapp/`, incompatível com o HTML atual. Não atribuir à reorganização.
4. Deploy: arquivos shell CRLF causam erro de sintaxe no Bash Linux; normalizar ao atualizar os scripts e fixar LF via atributos Git.
5. O sandbox bloqueia sockets loopback do Node no host (EPERM). Os testes SSR do Storefront foram executados em container `--network none`, com fixtures locais e sem acesso externo. Não marcar a tentativa no host como aprovada.

## Critérios de aceite e limites

Os nove repositórios, instruções, manifests, dependências locais, autenticação, tenancy, integrações, deploy, rotas e candidatos compartilháveis foram mapeados. Builds/testes iniciais foram executados e falhas diferenciadas de alterações futuras. Não foi feito deploy, migration operacional, alteração remota, mudança de identidade visual ou extração de domínio nesta fase.

Próxima etapa: reorganizar os três repositórios de e-commerce, atualizar referências de arquivos/configuração e confirmar a preservação dos HEADs, remotos e alterações preexistentes. As falhas acima serão tratadas nas fases afetadas, com evidência antes/depois, sem interromper a reorganização independente.


Atualização posterior (2026-11-25): o diretório residual citado no diagnóstico
inicial foi removido por instrução explícita do usuário. O mount do Nginx foi
corrigido para `elinea-ai-api`; os volumes foram preservados. Não recriar a pasta
antiga. O texto inicial acima registra o estado encontrado, não uma orientação atual.
