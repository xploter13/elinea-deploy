# Plano incremental e critérios de aceite

Executar fases em ordem. Este plano foi elaborado após inspeção do código; não autoriza produção ou mudanças remotas. Cada fase deve atualizar `progress.md`, listar arquivos/diferenças, executar checks pertinentes e preservar falhas de baseline como categoria separada.

| Fase | Entrega concreta | Critério de aceite |
|---|---|---|
| 1 — Diagnóstico | Nove repositórios, grafo, inventários, contratos, baseline e riscos | Fontes verificadas, builds/testes executados e falhas preexistentes explícitas. |
| 2 — Reorganização | Diretórios ecommerce-api/admin/storefront e referências locais | Mesmo Git HEAD, remotos e trabalho local; manifests válidos; builds/checks sem nova regressão; remotos, domínios e imagens legadas preservados. |
| 3 — UI | Componentes apresentacionais extraídos do Admin, tokens e entradas Painel | Props/slots/eventos, testes de interação/renderização; storefront e exports legados preservados; UI sem serviços de negócio; identidade original mantida. |
| 4 — SDK | Transporte comum e clientes ecommerce/core/ai segmentados | Clientes independentes; tipos/erros/headers/paginação/uploads/cancelamento testados; nenhum segredo em bundles; export raiz compatível. |
| 5 — Consumidores | Admin primeiro, depois Storefront/Gestão/Site | UI/SDK oficiais consumidos; regras de produto locais; duplicatas removidas somente após equivalência; falhas de permissões da baseline tratadas; builds e checks visuais. |
| 6 — Core | API Laravel modular para identidade, empresas, vínculos, soluções, planos, assinaturas, entitlements e provisionamento | Multi-tenancy, permissão, idempotência e auditoria testados; fonte de cada entidade definida; contratos reais no SDK; sem cobrança fictícia. |
| 7 — Gestão | Navegação global + áreas de soluções, mantendo funções legadas | Globais usam Core, e-commerce continua em sua API; UI/SDK sem cópias; acesso interno protegido. |
| 8 — Hub | Aplicação Nuxt/Vue com catálogo, empresa e soluções contratadas | Nasce após UI/SDK; sem API própria; dados reais do Core, navegação/permissões/estados de falha; sem vender produtos indisponíveis. |
| 9 — AI | SPA alinhada aos recursos efetivamente disponíveis da AI API | Não depende do e-commerce; UI/SDK; sem simular agentes ainda inexistentes; integração Core opcional com contrato/identidade mapeada. |
| 10 — Integração | Acesso direto e pelo Hub, identidade e entitlements progressivos | Tokens sem query string; emissor/audiência/validade/escopo quando aplicáveis; APIs autorizam; indisponibilidade opcional não derruba domínio autônomo. |
| 11 — Site | Nova home institucional, contexto /e-commerce e SEO | Conteúdo/checkout preservados; links/canonical/sitemap e 301 reais para hospedagem; AI marcada conforme disponibilidade; identidade preservada. |
| 12 — Infra | Builds/releases por aplicação, configuração e documentação | Dry runs e Compose validados; domínio real preservado; nenhuma publicação/deploy; DNS/TLS/CORS/cookies novos documentados como procedimentos externos. |
| 13 — Validação | Matriz final de builds, testes, segurança e compatibilidade | Resultado real por check, falhas pendentes explícitas, isolamento/regressão visual/contratos documentados. |

## Ordem de extração UI

1. Primitivas apresentacionais, feedback e paginação.
2. Cards, cabeçalhos e gráficos sem domínio.
3. Estrutura de painel com navegação/usuário/ações recebidas; aplicação permanece dona das rotas/permissões/dados.
4. Tema administrativo em ponto de entrada isolado. Não importar seus tokens globais no Storefront/Site.
5. Admin valida primeiro; consumidores novos só depois.

## Ordem de extração SDK

1. Evoluir o transporte fetch existente, preservando o contrato raiz e erros.
2. Adicionar subpaths e adapters para envelopes distintos; ecommerce mantém createElineaClient.
3. Migrar transporte local de Admin/Gestão, incluindo FormData e erros esperados.
4. Extrair os serviços/contratos efetivamente usados, sem implementar rotas imaginárias.
5. Adicionar Core e AI com suas respectivas configurações independentes.

## Transferência de autoridade

Durante a migração, o e-commerce permanece fonte oficial dos Sites, usuários/consumidores legados, assinaturas e cobrança SaaS existentes. Core será fonte global de identidade/empresas/soluções novas somente quando seus módulos e contratos estiverem disponíveis. A transferência de registros legados exige mapeamento explícito de identificadores, execução idempotente, verificação e definição do ponto de corte; não será feita por copiar tabelas ou ler outro banco.

Não forçar substituição imediata de auth própria e 2FA do e-commerce por Sanctum da AI. Primeiro definir e testar o contrato de SSO/validação por aplicação, preservando sessões legadas e acesso direto. Consumidores finais e administradores não compartilham o mesmo fluxo global.

## Rollback e proteção

Renomeações locais são reversíveis e preservam `.git`. Arquivos do Site previamente no índice permanecem intactos. Novos módulos usam migrations aditivas; nenhum banco operacional será migrado neste processo sem etapa explícita e validação. Contratos/exportações antigos continuam como ponte enquanto consumidores são migrados. Builds não fazem publicação.
