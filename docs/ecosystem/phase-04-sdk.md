# Fase 4 — Consolidação do Elínea SDK

## Objetivo e projetos

Centralizar comunicação preservando contratos. Analisados: SDK, Admin, Gestão,
Storefront, Site, rotas/controllers/resources E-commerce e AI.

## Entrega

- @elinea/sdk 0.2.0 local, não publicado: raiz e createElineaClient preservados;
  entradas core/ecommerce/ai e alias createEcommerceClient adicionados.
- Transporte extraído para transport.ts, reexportado por core.ts. Configuração,
  token e headers independentes por cliente; nenhum estado global ou dependência UI.
- 26 serviços do Admin e três da Gestão extraídos com injeção de HttpClient.
  Tipos administrativos preservam snake_case; mappers Storefront mantêm camelCase.
  Origem e hashes: elinea-sdk/docs/extraction-map.json.
- createEcommerceAdminClient compõe os serviços, autenticação e 2FA existentes.
  AI usa somente auth/login, auth/me, auth/logout, tenant, tenant/settings e members.
- Core disponibiliza somente request até a implementação da API na Fase 6.
- Headers dinâmicos, query Laravel, FormData, downloads, cache/credentials,
  cancelamento, timeout e erros normalizados. Aliases data/statusCode para migração
  de consumidores ofetch. 401 pode acionar limpeza de sessão; 403 preserva sessão.
- Não há retry automático nem implementação fictícia de renovação de sessão.

## Arquivos e dependências

Criados: transport.ts, ai.ts, ecommerce.ts, ecommerce/admin.ts, services.ts,
services/*, contracts/*, tests/transport.test.ts, tests/domains.test.ts,
docs/extraction-map.json e CHANGELOG.md. Alterados: core.ts, index.ts, errors.ts,
package.json e README.md. Nenhum arquivo removido dos consumidores. Nenhuma
biblioteca de runtime adicionada ou atualizada.

A Fase 5 coordenará instalação/locks dos consumidores locais e substituirá os
wrappers HTTP e tipos duplicados depois de verificar cada aplicação.

## Verificação executada

- SDK: 56 testes aprovados (32 preexistentes + 24 novos), typecheck/build/lint aprovados.
- Imports compilados de raiz/core/ecommerce/ai aprovados.
- 124 paths extraídos dos serviços conferidos contra route:list da API: todos
  correspondem. Isso não comprova todos os verbos/permissões ou gateways em runtime.
- Testes cobrem clientes independentes, 2FA, headers/token dinâmicos, erros AI/Laravel,
  401/403, multipart, downloads, timeout/cancelamento, filtros e ausência de retries.
- Não foram executados pagamentos, chamadas a provedores ou deploys.

## Decisões, riscos e pendências

ADR 0003. Administração de planos/assinaturas E-commerce não foi transferida ao
Core. Não existe SSO implementado. AI não tem agentes/campanhas operacionais.
A Gestão possui um DELETE de configuração de e-mail sem rota correspondente;
não exposto no SDK, deve ser tratado ao migrar esse consumidor. Tipos visuais de
DataGrid e cálculos financeiros permanecem na aplicação.

Compatibilidade: respostas JSON inválidas agora falham explicitamente e paths
absolutos/escapes são rejeitados. Export raiz/cliente legado permanecem. As cópias
locais ficam até a Fase 5 para comparação e migração segura.

## Aceite e próxima etapa

Consolidação dos pacotes preparada e verificada. Consumidores ainda não migrados;
compatibilidade visual e funcional completa será verificada na Fase 5, Admin primeiro.
Nenhum novo frontend foi criado antes desta fundação.
