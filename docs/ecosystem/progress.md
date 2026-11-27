# Progresso e retomada

## Estado atual

- Fase 1 concluída: nove repositórios inspecionados, baseline executado e plano registrado.
- Fase 2 concluída: renomeações locais e referências validadas, histórico/remotos preservados; ver `phase-02-reorganization.md`.
- Fase 3 concluída para a biblioteca: 28 componentes Painel, tema opt-in, 25 testes e builds UI/Storefront/Site aprovados; ver `phase-03-ui.md`. Validação visual ocorre na migração do Admin (Fase 5).
- Fase 4 concluída para a biblioteca: clientes independentes, 29 serviços extraídos, 62 testes/typecheck/build/lint aprovados; ver `phase-04-sdk.md`.
- Fase 5 concluída. O usuário confirmou o aceite visual da Gestão e os resultados finais estão na [matriz de aceite](phase-05-consumers.md#aceite-final-da-fase-5). Histórico da migração: Admin migrado para UI/SDK, layout compartilhado, 40 testes e comparação PNG idêntica em três cenários da tela de Clientes. Typecheck tem 28 diagnósticos anteriores (baseline 75). Gestão com adapters HTTP/auth, 14 componentes compartilhados e 39 testes; ainda há recursos pendentes. Site/Storefront aguardam ajustes restantes; ver `phase-05-consumers.md`.
- Fase 6 concluída. Core e SDK implementados, com suíte da API aprovada em PostgreSQL 17.12. Consulte [o relatório da Fase 6](phase-06-core.md).
- Fases 7–13 ainda não iniciadas.
- Produção e remotos não foram alterados.

## Cuidados obrigatórios

- Preservar os dois arquivos `AD` preexistentes do `elinea-site`.
- Não recriar `elinea-ai-agents`: diretório residual removido por instrução explícita do usuário. Preservar os volumes Docker existentes; mounts apontam para `elinea-ai-api`.
- Não confundir baseline falha com regressão. Consultar `phase-01-diagnosis.md`.
- Não remover contratos legados de pacotes nem migrar assinatura/identidade sem transferência explícita da fonte oficial.
- Documentação central versionável fica neste repositório; o workspace continua multirepo.

## Relatório da Fase 1

Objetivo: diagnóstico antes de código. Projetos: os nove existentes. Alterações: somente documentação/inventários deste diretório. Componentes/serviços migrados: nenhum. Dependências atualizadas: nenhuma. Arquivos removidos: nenhum. Builds: SDK, UI, Admin, Gestão, Storefront, Site e assets da API executados. Testes: PHPUnit/Vitest/Node conforme matriz do diagnóstico. Bloqueios: sockets no host contornados por container isolado para SSR; problemas preexistentes de testes/manifests/CRLF registrados. Próxima etapa: reorganização local com preservação de histórico.


## Confirmação de nomenclatura

O usuário confirmou que `elinea-ai-agents` foi renomeado para `elinea-ai-api`.
A API já está no diretório oficial. Referências de módulo do editor foram
ajustadas para `elinea-ai-api.iml`. O diretório residual antigo é somente um
cuidado de compatibilidade dos mounts Docker, sem repositório independente.


## Última validação

- UI: 26 testes, build e lint aprovados.
- SDK: 62 testes, typecheck/build/lint aprovados.
- Admin: 40 testes e build aprovados; typecheck registra 28 diagnósticos anteriores (baseline 75).
- Gestão: 39 testes e build aprovados; typecheck registra 9 diagnósticos anteriores (baseline 55).
- Browser: Admin/Clientes e Gestão/Usuários comparados nos três cenários de tema/resolução;
  última execução teve zero pixels diferentes em todas as seis comparações.
- Infraestrutura: sete testes de governança/renomeação aprovados.
- Fase 5 permanece em andamento. Próximos recursos: widgets exclusivos, layout/tema e
  repositório financeiro da Gestão; concluir Site/Storefront antes de iniciar Core.


## Remoção do diretório antigo de AI — 2026-11-25

Por instrução explícita do usuário, o diretório `elinea-ai-agents` foi removido.
Continha apenas três diretórios vazios, criados pelo bind mount de um Nginx parado.
O container Nginx foi recriado sem iniciar, mantendo seu estado parado, com o bind
mount correto em `elinea-ai-api/docker/nginx/default.conf`. Nenhum volume de dados
foi removido, e os demais serviços continuaram em execução. Os identificadores
legados dos recursos Docker permanecem para compatibilidade dos dados locais.


## Sincronização GitHub — 2026-11-25

Trabalho das fases 1–5 preparado para publicação em `develop`, preservando `master` como produção. A fase 5 continua parcial, conforme os relatórios existentes. A política consta nos AGENTS.md dos nove repositórios e em [github-branches.md](github-branches.md). O Deploy incorporou as correções remotas de produção sem executar deploy. O histórico local divergente com credenciais foi preservado somente em arquivo local; os previews preexistentes do Site não entraram nos commits. A afirmação anterior de que remotos não foram alterados descreve o estado antes desta sincronização autorizada.

Publicação concluída nos nove repositórios e 18 referências remotas verificadas com `git ls-remote`, comparadas aos commits locais. Evidência: [snapshot GitHub](baseline/github-branches-20261125.json), anterior ao commit final deste relatório. `master` e `develop` criadas no AI; `develop` criada no Deploy. Nenhuma `master` existente foi alterada remotamente e nenhum deploy foi executado. Os dois previews AD do Site continuam intactos no índice local. Testes desta sincronização: UI 26, SDK 62, nove arquivos Node do Admin, três da Gestão, oito testes Python de infraestrutura aprovados. Admin/Gestão não têm script npm test; suas suítes foram executadas diretamente pelo runner Node. Builds e demais limitações permanecem registrados nos relatórios das fases anteriores.


## Retomada da Fase 5 — financeiro (2026-11-25)

Repositório financeiro da Gestão migrado para o SDK, preservando imports locais,
contratos, cálculos e comportamento. Evidência:
[phase5-gestao-finance-sdk.json](baseline/phase5-gestao-finance-sdk.json).
SDK: 64 testes/typecheck/build/lint aprovados. Gestão: 39 testes/build aprovados;
typecheck mantém nove diagnósticos históricos, sem novos pares arquivo/código.
A comparação visual não foi executada nesta sessão (socket Docker inacessível e
Chromium ausente); componentes, layout e tema continuam inalterados e pendentes.
Próximo trabalho: widgets e layout/tema da Gestão com validação de equivalência;
concluir revisão e ajustes Site/Storefront antes do Core. A Fase 5 continua aberta.


## Retomada da Fase 5 — UI da Gestão (2026-11-25)

Widgets, AppShell e tema da Gestão agora consomem o UI oficial, preservando
adapters, navegação, tipografia e regras da aplicação. A implementação está
integrada; aceite visual da rodada permanece pendente. Evidência:
[phase5-gestao-ui.json](baseline/phase5-gestao-ui.json).

Checks: UI 32 testes/typecheck/build, Gestão 39 testes/build e Admin 40 testes/build
aprovados. Lint UI sem erros, com 20 warnings. Typecheck da Gestão mantém os nove
diagnósticos anteriores, sem novos pares arquivo/código. Paridade SSR/CSS: 31 checks.
Sem Chromium ou acesso a Docker; download falhou por DNS. Essa comparação
estrutural não substitui o navegador. Build anterior em
`/tmp/elinea-gestao-ui/build-before` para a próxima comparação visual.

Próximo trabalho: executar aceite visual da Gestão, revisar Site/Storefront e
resolver as divergências remanescentes de contratos antes de iniciar Core.
Sem dependências novas, publicação, alteração de banco ou deploy nesta rodada.


## Retomada da Fase 5 — Site/Storefront (2026-11-27)

Site usa o SDK para planos, termos e contratação pública. Storefront usa o SDK
para recuperação de senha pelo Nitro, mantendo sua identidade visual e contextos.
Evidência: [phase5-public-consumers.json](baseline/phase5-public-consumers.json).
SDK: 68 testes/typecheck/build/lint aprovados; Site: 22 testes/typecheck/build (38
rotas estáticas) aprovados; Storefront: 31 testes sem sockets/typecheck/build
aprovados. Regressão dos painéis: Admin 40 testes e Gestão 39 aprovados.

Templates/estilos do Site preservados e nenhum arquivo visual do Storefront
alterado. Chamadas locais BFF e carregamento de assets permanecem nas aplicações.
Typechecks Site/Storefront passaram antes e depois. Mantidos os previews AD.
A fase continua aberta: falta navegador da Gestão e suítes SSR com sockets,
bloqueadas nesta sessão por permissões de rede/Docker. Sem Core ou publicação.

## Retomada da Fase 5 — SSR do Storefront

As cinco suítes SSR do Storefront passaram com 17 cenários usando o Nitro
compilado e uma API fictícia em memória. A fixture de catálogo agora fornece
o número de WhatsApp no campo esperado, resolvendo as duas falhas da baseline.
A comparação visual da Gestão permanece pendente. Consulte os comandos e
limites em [phase-05-consumers.md](phase-05-consumers.md#aceite-ssr-do-storefront).

## Retomada da Fase 5 — typecheck dos painéis

Os diagnósticos TypeScript do Admin e da Gestão foram corrigidos e os
dois comandos de typecheck passaram. O aviso do plugin Vue Router/Volar
continua registrado. A validação visual da Gestão segue pendente.
Consulte [os resultados](phase-05-consumers.md#typecheck-do-admin-e-da-gestão).


## Encerramento da Fase 5

O usuário confirmou a validação visual da Gestão em seu ambiente.
A [matriz de aceite](phase-05-consumers.md#aceite-final-da-fase-5) consolida
a confirmação e os checks registrados de Admin, Gestão, Storefront e Site.
A próxima etapa é a Fase 6, API Core. Restam oito fases.

## Início da Fase 6

O Core tem repositório próprio e entrega local de sessão, empresas, catálogo,
assinaturas e direitos de acesso. Cinco testes PHP e 69 testes do SDK passaram.
Os contratos administrativos HTTP já estão disponíveis no SDK.
A validação em PostgreSQL foi concluída na rodada de aceite abaixo.


## Aceite da Fase 6 em PostgreSQL

A suíte do Core passou em PostgreSQL 17.12 com 7 testes e 136 verificações.
A instância descartável foi encerrada ao fim da execução. Consulte
[o relatório da Fase 6](phase-06-core.md#aceite-em-postgresql).
A próxima etapa é a Fase 7, integração da Gestão com o Core.

## Aceite local da Fase 7

A Gestão passou a consumir os contratos administrativos do Core para
empresas, usuários, catálogo, assinaturas e auditoria. A sessão de operador
é independente da sessão do E-commerce. A Gestão passou em 40 testes,
build, geração estática, typecheck e teste no Chromium com a API real.
Consulte o [relatório da Fase 7](phase-07-gestao.md).
A próxima etapa é a Fase 8, Hub. Restam seis fases.
