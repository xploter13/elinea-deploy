# ADR 0003 — Clientes independentes no SDK

Status: aceito em 2026-11-25, implementação local não publicada.

## Contexto

O SDK tem transporte fetch e cliente Storefront funcionais. Admin/Gestão repetem
HTTP e contratos. AI possui somente identidade/tenant; Core ainda não existe.

## Decisão

Preservar raiz, createElineaClient e mappers. Adicionar core/ecommerce/ai, alias
createEcommerceClient e factory administrativa separada com DTOs snake_case.
Extrair serviços existentes para funções que recebem HttpClient, sem Vue/Nuxt/UI.
Aplicações mantêm sessão, rotas e estado; transporte recebe getters de credenciais
por instância. Backend continua autorizando tenant e permissões.

Core oferece apenas transporte enquanto sua API não for implementada. AI oferece
somente os seis endpoints existentes. Não inventar SSO, billing ou agentes.

Centralizar multipart, downloads, timeout, cancelamento, headers e normalização
dos dois formatos de erro. Não repetir mutations automaticamente. Preservar erro
401 mesmo se callback de limpeza da sessão falhar; 403 não encerra sessão.

## Consequências

Versão 0.2.0; URLs absolutas/escapes de caminho são rejeitados e JSON inválido
bem-sucedido gera INVALID_RESPONSE. Migração dos consumidores ocorre na Fase 5.
Tipos de apresentação financeira e DataGrid ficam fora do SDK. O DELETE de e-mail
configurado usado pela Gestão não existe na API e não será propagado como serviço.
Assinaturas e identidade E-commerce continuam no domínio atual até transferência
explícita ao Core. Credenciais de loja permanecem exclusivamente server-side.
