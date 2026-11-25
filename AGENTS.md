# Instruções de desenvolvimento

## Governança do ecossistema Elínea

Leia `../elinea-deploy/docs/ecosystem/README.md`, `migration-plan.md` e `progress.md` no mesmo diretório antes de executar uma fase. O workspace é multirepo; não criar monorepo.

- UI First: componente genérico no Elínea UI; preservar os contextos e a referência visual do Admin.
- SDK First: HTTP, contratos e tipos reutilizáveis no Elínea SDK; manter UI e SDK independentes.
- Dados e regras no domínio proprietário, sem acesso direto a bancos de outros produtos. APIs validam tenant e permissões.
- Não duplicar recursos compartilhados, criar dependências circulares ou exigir outro produto para operar. Novos produtos usam a fundação existente.
- Preservar compatibilidade ou documentar migração/versionamento; cada aplicação tem publicação independente.
- Não sobrescrever mudanças locais, destruir dados, renomear remotos ou modificar produção. Registrar checks reais e pendências por fase.

Infraestrutura e registro coordenado da migração em docs/ecosystem. Repositórios continuam independentes. Preservar remotos, imagens e domínios reais durante mudanças de paths. Validar Compose/shell e dry runs; não disparar deploy, push ou alterações DNS/TLS sem autorização explícita.


## Branches e ambientes

- `master`: código da produção; promoção de versão deve ser deliberada.
- `develop`: desenvolvimento integrado e homologação; publicar aqui o trabalho em andamento.
- Não promover alterações incompletas para `master` nem executar deploy ao sincronizar o GitHub.
- Preservar branches legadas e histórico; não usar force push para adequar a nomenclatura.
