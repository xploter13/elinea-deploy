# Consolidação do ecossistema Elínea

Gênios Mídia → Elínea → produtos independentes. Produtos independentes, fundação tecnológica compartilhada e experiência unificada.

Este diretório mantém o registro versionável da migração coordenada entre repositórios. Não transforma o workspace em monorepo. Cada aplicação mantém Git, dependências, dados, contratos e publicação próprios.

- [Diagnóstico e baseline](phase-01-diagnosis.md).
- [Reorganização local](phase-02-reorganization.md).
- [Consolidação do UI](phase-03-ui.md).
- [Consolidação do SDK](phase-04-sdk.md).
- [Migração dos consumidores](phase-05-consumers.md).
- [Decisões arquiteturais](adrs/0002-ui-painel.md).
- [Plano incremental e aceite por fase](migration-plan.md).
- [Inventário inicial dos repositórios](baseline/repositories.json).
- [Mapeamento inicial dos componentes do Admin](baseline/admin-components.json).
- [Progresso e retomada](progress.md).

## Regras comuns

1. Componentes visuais genéricos pertencem ao `@elinea/ui`, preservando core/painel/storefront/marketing.
2. HTTP, contratos e tipos reutilizáveis pertencem ao `@elinea/sdk`, sem dependência do UI.
3. O Admin de e-commerce é a referência administrativa; não criar outra identidade visual.
4. As regras e dados operacionais permanecem no produto proprietário.
5. Integrações entre domínios usam contratos e APIs; nenhum banco de outro domínio é acessado diretamente.
6. Tenant e permissão são validados na API; contexto do frontend não é prova de autorização.
7. Procurar recursos existentes antes de criar implementações compartilháveis.
8. Preservar exports e contratos ou documentar a migração e sua versão.
9. Novos produtos reutilizam a fundação, com configuração independente.
10. Nenhum produto exige a contratação de outro nem publicação simultânea do workspace.

Remotos, DNS, certificados e produção não serão alterados por esta execução local. Nenhuma migration destrutiva é autorizada. Dados locais, volumes e alterações preexistentes devem ser preservados.
