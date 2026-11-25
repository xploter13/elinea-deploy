# Fase 2 — Reorganização local

Objetivo: alinhar os repositórios aos domínios, preservando código, histórico e integração existente. Status: concluída, sem regressões adicionais nos checks executados.

## Alterações

| Antes | Depois |
|---|---|
| elinea-api | elinea-ecommerce-api |
| elinea-admin | elinea-ecommerce-admin |
| elinea-storefront | elinea-ecommerce-storefront |

Gestão, Site, AI API, UI, SDK e Deploy mantêm seus diretórios. Os diretórios foram movidos junto com `.git`; não houve clone, exclusão, recriação, commit ou push. HEADs e hashes das configurações remotas foram comparados antes/depois e permaneceram iguais. A prova está em `baseline/rename-proof.json`.

Identificadores privados: Admin, Storefront e Gestão agora usam seus nomes oficiais. O pacote de assets Laravel passa a se chamar `elinea-ecommerce-api`. Os manifests npm e os nomes raiz dos respectivos locks foram sincronizados sem atualizar dependências. Composer usa `genios-midia/elinea-ecommerce-api` e `genios-midia/elinea-ai-api`; locks atualizados pelo Composer sem mudanças de versões. O nome inválido preexistente da AI foi corrigido.

Atualizados caminhos locais na configuração MCP da API, documentação entre projetos, fixture dos termos do Site, checkout/build do workflow e scripts locais de deploy. Os remotos `xploter13/elinea-api`/`elinea-storefront`, imagens `elinea-api`/`elinea-api-web`/`elinea-storefront`, URLs públicas e hostname local legado `elinea-api.test` permanecem compatíveis. Não alterar DNS implicitamente por renomear pasta.

Os dois scripts do Deploy atualizados foram normalizados para LF, corrigindo o erro Bash Linux da baseline; `.gitattributes` fixa LF para shell. AGENTS.md foi criado/estendido nos nove repositórios, preservando instruções anteriores e referenciando a governança comum. Metadados gerados de IDE não foram reescritos.

## Validação

- Sete testes de contratos do workspace aprovados: histórico inicial acessível, Git separado, dependências file resolvidas, identidade manifest/lock, paths/fixture legal, nomes de imagem compatíveis e shell Linux válido.
- Builds pós-renomeação: assets da API, Admin, Storefront e Gestão aprovados.
- API e-commerce: os mesmos 379 testes/4723 assertions e o mesmo único erro preexistente em RetirePlansTest. Nenhuma nova falha.
- Admin: mesmas duas falhas preexistentes nos nove arquivos Node. Build aprovado.
- Storefront: 84 casos novamente em container isolado, com as mesmas duas assertions textuais de catalog-mode. Nenhuma nova falha.
- Teste do Site que lê os termos na API renomeada: aprovado.
- Composer da AI agora válido; plataforma PHP instalada aprovada. Composer do e-commerce válido, mantendo o aviso da versão exata Mercado Pago já existente.
- Compose produção/homologação e sintaxe Bash: aprovados, sem executar deploy.
- As entradas `AD` do Site permanecem intactas. Nenhum dado ou volume foi alterado.

Os comandos Composer usados somente para atualização de metadados rodaram no container Composer, com extensões ausentes desse container ignoradas individualmente. Os requisitos PHP não foram ignorados; a plataforma real do host foi validada separadamente. Não usar essas flags para instalar a aplicação em runtime sem extensões.

## Arquivos e escopo

Arquivos alterados: manifests/locks dos quatro projetos com identidade atualizada, configurações MCP e contexto da API, READMEs/contextos com paths entre projetos, teste de termos do Site, manual de marca com link atualizado, workflow/README/scripts do Deploy e governança AGENTS dos nove repositórios. Arquivos novos: `.gitattributes`, `tests/test_ecosystem.py` e relatórios/provas deste diretório. Arquivos removidos: nenhum; as três pastas foram movidas integralmente.

Componentes/serviços migrados: nenhum nesta fase. Dependências atualizadas: nenhuma. Não foram criados Core, Hub, AI SPA ou Marketing prematuramente.

## Decisões e pendências

- Preservar nomes externos existentes evita exigir renomeação remota ou republicação para uma alteração local.
- Alterações posteriores de domínios/remotos/imagens terão migração explícita e autorização externa quando aplicável.
- As falhas de baseline seguem registradas e serão corrigidas nas fases dos consumidores/validação; não copiar permissões problemáticas para novos produtos.
- Próxima fase: consolidar a apresentação compartilhável no Elínea UI, antes de migrar consumidores e criar novos frontends.
