# Fase 5 — Migração dos consumidores (em andamento)

## Objetivo e alcance atual

Migrar consumidores preservando contratos e a referência visual do Admin.
O primeiro consumidor, E-commerce Admin, já usa UI e SDK compartilhados.
Storefront, Gestão e Site ainda precisam concluir a migração desta fase; não
iniciar Core/Hub/AI SPA antes de consolidar esse passo.

## Admin: implementação

- 20 nomes locais de componentes viraram adapters para os componentes Painel;
  AppShell compõe PainelShell e mantém seus slots e regras específicas de loja,
  notificações, conta e upgrade. Nenhum domínio comercial foi levado ao UI.
- Tema importado uma vez de @elinea/ui/painel/styles.css. O main.css duplicado foi
  removido depois de comparar a tela de Clientes com o build anterior.
- 26 composables *Api delegam aos serviços oficiais. useApi configura HttpClient
  com token e loja dinâmicos; a aplicação mantém a limpeza/navegação da sessão.
- useAuth usa os contratos e serviços SDK de login, 2FA, recuperação, perfil e
  logout. Tipos locais reexportam os DTOs oficiais, sem copiar suas definições.
- Aliases locais seguem o padrão já utilizado pelo Storefront. Dependências
  file: dos dois pacotes adicionadas. @types/node é ferramenta de desenvolvimento.
- Resoluções preexistentes do Yarn e do npm foram preservadas. Os lockfiles
  históricos divergem; não atualizar bibliotecas transitivas para uniformizá-los.

## Correções verificadas durante a migração

- Rota de Clientes usa a permissão customers, validada pelo backend existente.
- Falha ao recarregar permissões limpa os grants antigos e loaded.
- Parser do teste CustomerForm aceita CRLF; regras do formulário preservadas.
- SDK vincula o fetch nativo a globalThis para funcionar também no navegador.
- ShippingQuoteOption continua disponível no adapter local como export de tipo.
- A confirmação compartilhada mantém o foco no modal durante Tab/Shift+Tab.
- Ações flutuantes usam composable do UI; posicionamento considera o limite
  inferior da viewport. Não foi introduzida lógica de produto no pacote.

## Checks e evidência

- Admin: 40 testes de comportamento existentes aprovados com Node sem isolamento
  de processos; build Nuxt aprovado.
- UI: 26 testes aprovados, build/declarations e lint sem erros.
- SDK: 62 testes aprovados, build/declarations e lint sem erros.
- Typecheck adicional do Admin: 75 diagnósticos no fonte original, 28 no atual,
  sem novos pares arquivo/código. Ambos têm problema preexistente no plugin
  vue-router/volar/sfc-route-blocks. O check completo continua **reprovado**.
  Detalhes persistidos em baseline/phase5-admin-typecheck.json.
- Harness Playwright versionado em tests/browser, com fixture fictícia, API
  interceptada e container sem rede externa. A comparação já executada em
  Clientes produziu PNGs idênticos em desktop claro/escuro (1440×1000) e mobile
  claro (390×844), sem erro de runtime nem overflow horizontal do documento.
  O teste final inclui interação com menu e modal; seu resultado final é
  registrado abaixo após a execução.

A lista cumulativa dos arquivos modificados/criados/removidos está nos manifests
baseline/phase5-*-files.json. Não houve deploy, publicação de pacote, alteração de
remotos, migração de banco ou uso de credenciais reais nos testes de navegador.

## Aceite parcial e limitações

Atendidos no Admin: UI/SDK oficiais, preservação visual nos três cenários citados,
compatibilidade dos nomes existentes, ausência de HTTP duplicado nos adapters e
retirada do tema duplicado. As páginas com regra de negócio continuam no produto.

Não equivalem a validação integral: outras telas, fluxos com APIs reais,
integrações externas e SSO. Não declarar a Fase 5 concluída enquanto faltarem os
outros consumidores. A Gestão contém divergências de contratos e um DELETE de
configuração de e-mail sem endpoint correspondente; resolver/adaptar somente o
fluxo afetado, sem inventar rotas ou copiar serviços.

Próxima etapa: Gestão, preservando suas áreas existentes; depois Site/Storefront
e revisão dos consumidores para encerrar a Fase 5. Os builds de Site/Storefront
já passaram na consolidação do UI, mas seus serviços locais não foram todos
migrados ainda.


## Resultado final da validação do Admin

- Build Nuxt aprovado após a migração completa e instalação com as resoluções Yarn originais.
- 40 testes Node do Admin aprovados; correção do harness para CRLF e contratos
  de integração consultados agora no SDK, sua fonte oficial.
- UI: 26 testes, build e lint sem erros. SDK: 62 testes, build e lint aprovados.
- Chromium/Playwright 1.64.1 em Docker sem rede: comparação PNG exata da tela de
  Clientes em desktop claro, desktop escuro e mobile; zero diferenças nas três
  imagens. Sem erros de runtime nem overflow horizontal do documento.
- Interações em navegador: menu mobile abre/fecha com Escape; ações da linha abrem
  confirmação; foco permanece no modal ao navegar com Tab; Cancelar fecha o modal.
- Evidência versionável: baseline/phase5-admin-browser.json. Capturas temporárias:
  /tmp/elinea-visual/verified. Harness: ../../tests/browser.
- Typecheck adicional: 75 diagnósticos na fonte original, 28 na migrada, sem novo
  par arquivo/código. Ambos ainda falham, inclusive pela incompatibilidade anterior
  vue-router/volar/sfc-route-blocks. Não declarar typecheck do Admin aprovado.
  Detalhes: baseline/phase5-admin-typecheck.json.

Durante os testes foram corrigidos o receiver do fetch nativo no SDK, contenção
horizontal/vertical do menu flutuante e ciclo de foco do modal no UI. A lógica de
permissões da aplicação descarta grants ao falhar refresh e usa customers para a
rota de Clientes. As APIs permanecem responsáveis pela autorização efetiva.


## Gestão — migração parcial executada

- 26 adapters *Api e autenticação usam SDK; getters preservam o contexto de loja
  e o token atual. 2FA, recuperação de senha e sessões permanecem na aplicação.
- 14 componentes genéricos passam a consumir o UI; os formulários de negócio
  continuam na Gestão. O CSS passa a escanear os componentes Painel compartilhados.
- Tipos HTTP existentes reexportam contratos oficiais; tipos de apresentação
  financeira e DataGrid continuam pendentes de separação.
- CRUD dos planos da Gestão foi incorporado ao serviço SDK a partir dos endpoints
  existentes, sem transferência de autoridade para um Core ainda inexistente.
- DELETE de e-mail configurado gera UNSUPPORTED_OPERATION explícito, sem request
  fictício. A antiga operação já apontava para uma rota inexistente.
- 39 testes passaram, incluindo autenticação real do adapter com fetch simulado e
  garantia de ausência de request na operação não suportada.
- Resoluções transitivas dos lockfiles preservadas; somente pacotes locais e tipos
  Node adicionados. A instalação frozen foi conferida por comparação byte a byte.
- Pendentes: Button/DataTable/filtros exclusivos, AppShell/tema, repositório
  financeiro, validação visual completa e análise das divergências de integrações.

## Nome oficial de AI

Confirmado pelo usuário: elinea-ai-agents passou a elinea-ai-api. O diretório Git
já estava correto; módulo do editor, nome de apresentação, fallback de configuração
e documentação foram alinhados. Mounts/volumes antigos e o .env real foram
preservados. Sintaxe de config/app.php validada por php -l.


## Evidência complementar

A Gestão teve 55 diagnósticos no fonte original e 9 no fonte migrado, sem novas
combinações de arquivo/código. O typecheck continua reprovado por problemas já
presentes; os detalhes completos estão em baseline/phase5-gestao-typecheck.json.

A tela de Usuários foi comparada em desktop claro/escuro e mobile. O harness tem
tolerância de 16 pixels e delta máximo de 8/255 por canal para antialias de bordas;
registrou variação de até quatro pixels no avatar, sem mudança de dimensões ou
layout. Isso não equivale a validar todas as telas da Gestão.

O tratamento de erros foi centralizado em getApiErrorMessage, no SDK/core, com
quatro novos testes. Os helpers locais de ambos os painéis são adapters. Preserva
mensagens de validação, envelopes Laravel/AI e um fallback para erros de runtime.


## Última execução dos builds e navegador

Os builds de Admin e Gestão passaram após centralizar o helper de erros. A última
execução do harness verificou o tema efetivamente aplicado e teve **zero pixels
diferentes em todas as seis comparações** (três por aplicação). Preservam-se a
tolerância e os resultados anteriores documentados; os relatórios finais estão
em baseline/phase5-admin-browser.json e phase5-gestao-browser.json.

No Admin, a execução também aprovou as interações de menu e modal nativo. Na Gestão,
a validação desta rodada cobre apresentação e carregamento da tela de Usuários;
os widgets ainda não migrados não foram anunciados como concluídos.


Atualização de nomenclatura: o usuário determinou a remoção da pasta antiga de AI.
Ela foi removida após comprovar que só continha diretórios vazios e corrigir o único
bind mount que poderia recriá-la. O projeto existe somente em `elinea-ai-api`;
volumes e serviços de dados Docker foram preservados. Ver progress.md.


## Retomada — financeiro da Gestão no SDK (2026-11-25)

Concluída a extração do repositório financeiro existente para
`createPlatformFinanceService`, disponível também em
`createEcommerceAdminClient().platformFinance`. Foram conferidas as nove rotas do
FinanceController e seus envelopes na API E-commerce. Nenhum endpoint, cobrança
ou autoridade Core foi criado.

DTOs financeiros passam a ter fonte oficial no SDK. Os nomes públicos da Gestão
continuam como reexports; formulários, projeções calculadas, validação e estado
ficam na aplicação. O adapter preserva seleção POST/PUT por ID, DELETE com 204,
período e atualização exclusiva das seis premissas de custo dos planos.

Checks desta entrega: SDK com 64 testes, typecheck, build e lint aprovados; Gestão
com 39 testes e build aprovados. Typecheck da Gestão executado usando o vue-tsc já
instalado no UI, pois a Gestão não possui o binário local. Mantém os nove
diagnósticos registrados e o problema do plugin vue-router/volar, sem novos pares
arquivo/código. O check completo permanece reprovado.

Não houve alteração visual. A sessão não tem acesso ao socket Docker nem Chromium
instalado; a comparação de navegador não foi executada. Widgets e layout/tema
permanecem pendentes até sua migração e validação. Site/Storefront também continuam
pendentes. A Fase 5 não está concluída.

Arquivos criados/alterados e resultados estão em
[baseline/phase5-gestao-finance-sdk.json](baseline/phase5-gestao-finance-sdk.json).
Sem arquivos removidos, dependências novas, publicação ou deploy.


## Retomada — widgets, Shell e tema da Gestão (2026-11-25)

Implementação integrada, com aceite visual ainda pendente:

- Quatro componentes novos no UI: PainelDataGrid, PainelFilterToolbar,
  PainelFilterSearch e PainelFilterSelect. DataGrid compõe os recursos oficiais
  existentes; Button, DataTable e Pagination evoluíram sem substituir contratos.
- Seis nomes de componentes da Gestão viraram adapters; tipos de grid vêm do UI.
  NuxtLink, dados, filtros de negócio, autenticação e navegação ficam na aplicação.
- AppShell compõe PainelShell. `exact` é uma opção genérica de navegação que
  preserva o destaque exclusivo do item financeiro atual. O botão de menu é
  acessível por teclado e o Shell mantém fechamento por navegação/Escape.
- Gestão importa o tema oficial. O CSS local passou de 572 para sete linhas,
  mantendo somente a fonte histórica dos títulos e o padding inferior do menu.
  O CSS compilado contém a regra de fonte da Gestão depois da regra compartilhada.

Validação desta rodada: UI com 32 testes/typecheck/build aprovados, lint sem erros
(20 warnings); Gestão com 39 testes e build aprovados; Admin com 40 testes e build
aprovados. Typecheck da Gestão mantém os nove diagnósticos históricos e o problema
do plugin vue-router/volar, sem novo par arquivo/código após a correção do adapter.

O novo harness SSR/CSS aprovou 31 comparações com o fonte anterior, incluindo
estados de tabela, botões, filtros e shell. Exceções semânticas e normalizações
estão explícitas no [README do harness](../../tests/browser/README.md). Nenhum
pacote ou endpoint foi acrescentado. Esses checks permitem revisar a consolidação,
mas não equivalem a validação visual de layout ou execução de navegador.

Navegador não executado: socket Docker sem acesso, Chromium ausente e download
falhou por DNS (EAI_AGAIN). O build anterior está preservado em
`/tmp/elinea-gestao-ui/build-before`; repetir comparação visual e menu mobile
quando houver ambiente de navegador. Não declarar a Fase 5 concluída.

Evidência, arquivos e comandos em
[baseline/phase5-gestao-ui.json](baseline/phase5-gestao-ui.json).
Próximo: aceite visual da Gestão e revisão de serviços/contratos Site/Storefront.
