# Fase 3 — Consolidação do Elínea UI

## Objetivo e projetos

Consolidar o módulo Painel preservando a identidade do E-commerce Admin, a
segmentação e os contratos do UI. Analisados: UI, Admin de referência e consumidores
Storefront/Site. Código dos consumidores ainda não migrado nesta fase.

## Entrega

@elinea/ui 0.2.0 local, não publicado. 28 exports Painel:

- Card, Page, ComingSoon, AreaPanel, SparkArea, StatusPill.
- AreaChart, BarChart, DonutChart, HorizontalBarChart, LineChart.
- ConfirmDialog, EmptyTableState, Pagination, PanelSkeleton, RowActions, Skeleton,
  TableSkeleton, Toast, Toggle.
- Button, Input, FilterBar, DataTable.
- Shell, Header, Sidebar, Navigation.

Vinte componentes extraídos da referência com autoimports Vue explicitados e
sem rotas/stores/composables de produto. Oito composições genéricas seguem os
controles/layouts existentes. Eventos e slots permitem injetar regras da aplicação.
O tema original foi preservado integralmente após normalização de EOL, acrescido
de comentário e @source. Stylesheet administrativo opt-in; Storefront/Marketing
não recebem esse tema automaticamente. commerce.ts mantém a responsabilidade de
adapter visual existente, sem transporte HTTP.

Contratos de apresentação locais substituem imports de tipos do SDK no UI. Teste
estático assegura equivalência dos formatos Product/Cart/Category/Banner. SDK foi
removido dos peers, permanecendo dev-only para verificar a ponte de compatibilidade.

Melhorias verificadas: IDs únicos de gradiente, gráficos vazios sem NaN/Infinity,
confirmação inicialmente aberta, relações label/descrição de campos, paginação e
navegação com aria-current e estados loading que desabilitam ações.

## Arquivos e dependências

Manifesto completo em baseline/phase3-files.json. Criados componentes, tipos, tema,
testes, CHANGELOG e licença dos glyphs. Alterados manifest/lock, Vite, ESLint,
tsconfig, exports, documentação e imports de tipos de nove componentes Storefront.
Nenhum arquivo removido. Nenhum serviço HTTP migrado. Componentes do Admin ainda
não substituídos nem removidos; isso ocorre após o SDK, na Fase 5.

Adicionadas dependências de desenvolvimento jsdom, tipos Node e os plugins de tema
nas mesmas versões já usadas pelo Admin (Tailwind 4.3.1 / DaisyUI 5.5.23).
Tailwind/DaisyUI peers opcionais. Vue/Vite e bibliotecas existentes preservados.

## Verificação e aceite

- Vitest: 25 testes aprovados, incluindo os 8 testes anteriores.
- vue-tsc: aprovado; build Vite/declarations: aprovado.
- ESLint: sem erros; advertências de convenções de props e testes registradas.
- Imports dos cinco pontos públicos compilados: aprovados, 28 componentes Painel.
- Comparação do tema-fonte com Admin: aprovado após normalização de EOL.
- Build do Site com API HTTPS explícita: aprovado, 38 rotas prerenderizadas.
- Build do Storefront: aprovado; checagem também cobre imports locais com
  noUncheckedIndexedAccess mais estrito que o UI.

Decisão: ADR 0002. Segmentação, aliases, export raiz e tema Storefront preservados.
Sem publicação, deploy, serviços externos, migração de dados ou novos frontends.

## Limitações e próximo passo

Não declarar regressão visual aprovada: ainda falta comparar o Admin migrado em
navegador, resoluções desktop/mobile, tema escuro, teclado e foco modal nativo.
jsdom simula dialog e não executa layout CSS. Falhas preexistentes de Admin/API e
SSR catalog-mode continuam no baseline; não foram escondidas por esta fase.

Próximo passo: Fase 4, transporte e clientes SDK por domínio, mantendo o cliente
E-commerce e implementando apenas contratos comprovados nas APIs existentes.
