# ADR 0001 — Produtos independentes e transferência incremental

Status: aceito. Data: 2026-11-25.

O workspace possui nove repositórios independentes, duas APIs com autenticação e
multitenancy diferentes e faturamento SaaS já operacional no E-commerce.

Manter Git, dados operacionais, APIs, contratos e deploy próprios. A renomeação
local não altera remotos, imagens GHCR ou domínios reais. O Core assumirá entidades
transversais somente após definir mapeamento de IDs, sincronização, revogação,
compatibilidade e transferência explícita da fonte oficial. Até lá o proprietário
atual permanece responsável; não criar duas fontes oficiais para a mesma entidade.
Consumidores finais das lojas não viram usuários administrativos automaticamente.

Consequências: migração em etapas, integração por APIs, sem consulta cruzada a
bancos. SSO não equivale a compartilhar os atuais tokens opacos das duas APIs.
Nenhuma mudança em produção faz parte da validação local.
