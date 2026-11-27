# Fase 6 — API Core

Foi criado o repositório local independente `elinea-core-api` na branch
`develop`. O recorte inicial entrega sessão própria, empresas, papéis de
proprietário e membro, catálogo, assinaturas administrativas e consulta de
direitos de acesso. O SDK expõe os contratos que já possuem rotas reais.

| Área | Entrega |
| --- | --- |
| Identidade | Conta criada por operador, login com limitação de tentativas, expiração, logout e revogação administrativa. Tokens Sanctum restritos ao Core. |
| Empresas | Provisionamento idempotente por slug. O vínculo ativo é consultado em cada requisição. Proprietários podem conceder e revogar vínculos de membro. |
| Catálogo | Solução e plano com chaves estáveis. Cadastro por operador e leitura autenticada. |
| Assinaturas | Uma assinatura por empresa e solução. Acesso exige assinatura, plano e solução ativos. Ativação ou revogação por comando auditado. |
| Auditoria | Registro transacional de alterações de conta, catálogo, vínculo e direito. Operações CLI registram a origem operacional sem usuário HTTP. |
| SDK | `session`, `companies` e `catalog` em `createCoreClient`, com o transporte `request` preservado. |

## Autoridade e integração

O Core é autoridade para os registros criados no seu banco. O E-commerce
continua responsável por identidades administrativas legadas, consumidores,
lojas e seus planos, assinaturas e cobranças existentes. A AI mantém
identidades, tenants e tokens próprios. Nenhum identificador legado foi
mapeado automaticamente. A concessão administrativa de acesso no Core
funciona de forma independente dos provedores de pagamento.

Este recorte permite que a Gestão e o Hub usem contratos de sessão, seleção
de empresa, membros e acesso. Os contratos administrativos já permitem à Gestão operar empresas,
catálogo e assinaturas por HTTP. A integração do painel pertence à Fase 7.
SSO, integração entre produtos, provisionamento remoto e eventual
transferência de autoridade exigem etapas próprias.

## Evidências

- Core: `composer test` passou com 5 testes e 75 assertions em SQLite.
  Foram verificados login, expiração, logout, revogação, autorização por
  papel, isolamento por empresa e ativação idempotente por solução.
- Core: `composer validate --strict`, `composer lint` e
  `php artisan route:list --path=api/v1` passaram.
- SDK: 69 testes, typecheck, build e lint aprovados.
- O Composer reutilizou localmente os pacotes da AI nas versões exatas do
  lock para executar a instalação sem rede. O autoload é próprio do Core,
  e a resolução do lock removeu Horizon e Sentinel desta API.
- Os testes iniciais usaram SQLite. O resultado posterior em PostgreSQL está no aceite abaixo.

Arquivos do Core estão em `elinea-core-api`, incluindo configuração,
migrations, módulos PHP, CLI, rotas, testes e README de operação.
No SDK foram alterados `src/core.ts`, `README.md` e `CHANGELOG.md`.
O teste de contrato foi criado em `tests/core.test.ts`.
A especificação local e os registros de execução foram atualizados.
Nenhum arquivo de aplicação preexistente foi removido.

## Administração HTTP

O Core expõe dez rotas administrativas paginadas ou com retorno de recurso
para identidades, empresas, catálogo, assinaturas e auditoria. O SDK expõe
o namespace `core.admin`. Uma migration aditiva cria o papel global de
operador. A CLI concede o papel, uma nova sessão obtém a permissão e a
revogação invalida os tokens da conta. Proprietários seguem restritos aos
seus vínculos. Operações administrativas HTTP registram o ID do operador.

As alterações estão no módulo `Administration`, na migration do papel
global, nos serviços reaproveitados de provisionamento e catálogo, nas
rotas, nos testes `PlatformTest.php` e nos contratos `src/core.ts` do SDK.

Nova validação com 7 testes PHP e 136 assertions em SQLite, 70 testes do SDK,
typecheck, build e lint. A mesma suíte foi exercitada posteriormente em PostgreSQL.

## Aceite em PostgreSQL

A suíte completa do Core passou em PostgreSQL **17.12** e PHP **8.4.28**
com `pdo_pgsql`. Foram **7 testes e 136 verificações**. O PHPUnit 11.5.58
executou os mesmos testes do SQLite, com `DB_CONNECTION=pgsql` em uma
cópia temporária da configuração. A consulta `select version(), current_database()`
confirmou o servidor e o banco `elinea_core_validation` antes da suíte.

O banco começou vazio e as migrations foram aplicadas por `RefreshDatabase`.
Os testes cobriram autenticação e expiração, revogação, papéis e isolamento
entre empresas, provisionamento idempotente, catálogo, concessão por solução,
operações administrativas e auditoria.

A instância e os binários usados eram descartáveis. O PostgreSQL escutou somente
em um socket Unix privado e foi encerrado ao fim da execução. A Fase 6 está
concluída. A integração do painel da Gestão começa na Fase 7.
