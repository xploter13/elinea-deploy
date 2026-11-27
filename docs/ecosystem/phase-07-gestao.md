# Fase 7 — Gestão

O catálogo e as assinaturas do Core descritos no aceite original foram
substituídos por vínculos com lojas e tenants antes da Fase 8. Consulte
[a revisão do Core](progress.md#revisão-do-core-antes-da-fase-8).

A aplicação existente `elinea-gestao` integra a área `/ecossistema` ao
Core. O painel usa os componentes de `@elinea/ui/painel` e os contratos
de `@elinea/sdk/core`.

| Área | Operação |
| --- | --- |
| Visão geral | Totais de empresas, usuários e soluções obtidos da paginação do Core. |
| Empresas e usuários | Consulta paginada de identidades e empresas, com provisionamento por ID do proprietário. |
| Catálogo | Consulta de soluções e planos por solução. Cadastro com as chaves e nomes usados pelo Core. |
| Assinaturas | Consulta por empresa, concessão ou troca de plano e revogação com confirmação. |
| Auditoria | Consulta paginada, filtro por ID de empresa, identificação de operador e contexto do evento. |

A Gestão usa uma sessão separada por API. O painel do Core verifica
`can_manage_platform` em `/me`. As rotas administrativas do Core validam
o token e a permissão em cada chamada. A revogação de operador encerra o
acesso à área. A concessão de papel continua disponível via CLI do Core.

As operações e o financeiro legados permanecem no E-commerce. A
administração da AI, o faturamento global e as configurações globais
aguardam contratos próprios. A fase usa os contratos HTTP já entregues.

## Validação local

- Gestão com 40 testes aprovados. A regressão de sessão cobre a recusa de
  identidade comum, o descarte de token recusado e a independência das
  credenciais do E-commerce.
- Build Nuxt, geração estática e typecheck aprovados. O typecheck ainda
  emite o aviso conhecido do plugin Vue Router/Volar.
- Chromium com a Gestão estática e a API Core real, em origens locais
  distintas e SQLite descartável. Foram verificados o redirecionamento
  legado, a recusa a não operadores, o login e restauração da sessão, a
  paginação de usuários, o provisionamento, o cadastro e consulta de
  planos, a concessão e revogação de assinatura, o filtro de auditoria,
  o logout, o bloqueio após revogar a permissão e a navegação em largura
  móvel.
- Core com 7 testes e 143 verificações aprovados, além do lint.

Configure `NUXT_PUBLIC_CORE_API_BASE` para habilitar o painel em cada
ambiente. Na publicação estática, a variável é usada durante
`npm run generate`. O aceite desta fase é local. A Fase 8 é o Hub.
