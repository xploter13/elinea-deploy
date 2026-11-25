# Progresso e retomada

## Estado atual

- Fase 1 concluída: nove repositórios inspecionados, baseline executado e plano registrado.
- Fase 2 concluída: renomeações locais e referências validadas, histórico/remotos preservados; ver `phase-02-reorganization.md`.
- Fase 3 concluída para a biblioteca: 28 componentes Painel, tema opt-in, 25 testes e builds UI/Storefront/Site aprovados; ver `phase-03-ui.md`. Validação visual ocorre na migração do Admin (Fase 5).
- Fase 4 concluída para a biblioteca: clientes independentes, 29 serviços extraídos, 62 testes/typecheck/build/lint aprovados; ver `phase-04-sdk.md`.
- Fase 5 em andamento: Admin migrado para UI/SDK, layout compartilhado, 40 testes e comparação PNG idêntica em três cenários da tela de Clientes. Typecheck tem 28 diagnósticos anteriores (baseline 75). Gestão com adapters HTTP/auth, 14 componentes compartilhados e 39 testes; ainda há recursos pendentes. Site/Storefront aguardam ajustes restantes; ver `phase-05-consumers.md`.
- Fases 6–13 ainda não implementadas.
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
