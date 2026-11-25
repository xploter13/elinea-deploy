# GitHub: branches e ambientes

Atualização autorizada em 2026-11-25. Os nove repositórios permanecem independentes.

- `master`: referência de produção. Promoções ocorrem após validação deliberada.
- `develop`: desenvolvimento integrado e homologação. Recebe a consolidação em andamento.
- Não houve deploy, publicação de imagens, alteração de DNS ou promoção da migração para produção.
- Branches legadas permanecem preservadas; nenhum force push ou renomeação remota.

## Repositórios

| Diretório local | Repositório GitHub | Branches oficiais |
| --- | --- | --- |
| elinea-ecommerce-api | xploter13/elinea-api | master / develop |
| elinea-ecommerce-admin | xploter13/elinea-admin | master / develop |
| elinea-ecommerce-storefront | xploter13/elinea-storefront | master / develop |
| elinea-ai-api | xploter13/elinea-ai-api | master / develop |
| elinea-gestao | xploter13/elinea-gestao | master / develop |
| elinea-site | xploter13/elinea-site | master / develop |
| elinea-sdk | xploter13/elinea-sdk | master / develop |
| elinea-ui | xploter13/elinea-ui | master / develop |
| elinea-deploy | xploter13/elinea-deploy | master / develop |

No AI, `master` foi criada a partir da `main` remota existente; `develop` contém a atualização de nomenclatura e governança. A `main` foi preservada.

No Deploy, as duas branches já existiam no remoto na inspeção. As correções recentes de produção (serviços estáticos e TLS) foram incorporadas à `develop`, preservando os caminhos locais novos. Um commit local antigo de credenciais foi mantido exclusivamente na branch local `archive/develop-local-before-normalization-20261125`; não deve ser publicado nem integrado. A `develop` parte do histórico remoto saneado.

## Infraestrutura

O workflow `Publicar imagens` continua manual. Todos os checkouts selecionam explicitamente `master` para `production` e `develop` para `homologation`, incluindo o próprio Deploy. Os scripts locais seguem o mesmo mapeamento. Nomes de imagens GHCR e URLs remotas existentes foram preservados.

A configuração nova permanece na `develop` até promoção revisada para produção. O push não executa esse workflow nem publica ambientes. Políticas de proteção e alteração da branch padrão no GitHub não foram modificadas.

## Validação desta atualização

- UI: 26 testes aprovados; SDK: 62 testes aprovados.
- Admin: nove arquivos de testes Node aprovados; Gestão: três arquivos aprovados.
- Deploy: oito testes Python aprovados, incluindo seleção de branch e dry runs.
- Script de build exercitado para os dois ambientes com executáveis substitutos: seis builds planejados por ambiente, sem construir/publicar imagens.
- Builds completos e limitações preexistentes: consultar o diagnóstico e os relatórios das fases. Não foram repetidos neste ajuste de Git.
- Dois previews locais previamente preparados no index do Site permanecem fora dos commits publicados.

A confirmação dos SHAs remotos após envio será registrada em `baseline/github-branches.json`.
