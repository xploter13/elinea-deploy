# Regressão do Admin

Harness de desenvolvimento, separado das dependências das aplicações. Usa dados
fictícios identificados como exemplos e intercepta todas as chamadas às APIs.
Nenhuma operação é feita em serviços ou bancos reais.

1. Antes da migração, salve a pasta `.output` de um build do Admin em um diretório
   temporário. Essa é a referência; não use um build posterior como baseline.
2. Após as alterações, faça o novo build do Admin.
3. Instale as dependências deste diretório com `npm ci --ignore-scripts`.
4. Execute com Playwright 1.64.1 e browsers da mesma versão.

Exemplo executado no workspace, com a imagem oficial conforme
[documentação do Playwright](https://playwright.dev/docs/docker):

```sh
sg docker -c 'docker run --rm --network none --shm-size 1g --user 1000:1000 -e HOME=/tmp -e ELINEA_ADMIN_BEFORE_DIR=/visual/admin-before -e ELINEA_UI_ARTIFACTS_DIR=/visual/verified -v /home/xploter13/htdocs/elinea:/workspace:ro -v /tmp/elinea-visual:/visual -w /workspace/elinea-deploy/tests/browser mcr.microsoft.com/playwright:v1.64.1-noble node admin-regression.mjs'
```

Os paths do exemplo são locais e devem ser adaptados em outras máquinas.
O script inicia dois servidores Nuxt somente em loopback dentro do container,
encerra-os ao terminar e grava capturas/resultados no diretório de artefatos.
ELINEA_ADMIN_AFTER_DIR permite configurar outro build após a migração.

Valida a tela de Clientes em 1440×1000 (claro/escuro) e 390×844 (claro), ausência
de overflow no documento e de erros JS, igualdade dos PNGs antes/depois e, na versão
migrada, menu mobile, Escape, foco/Tab na confirmação nativa e cancelamento.

Essa cobertura não equivale a revisar todas as rotas, dados, integrações reais ou
navegadores. Não atualize a referência para fazer uma divergência passar sem
investigar as capturas. JSON inclui apenas fixtures fictícias e hashes de imagens.


Para a Gestão, use ELINEA_PANEL_APP=gestao e ELINEA_PANEL_BEFORE_DIR com o build
anterior correspondente. O harness escolhe a rota real /platform/users; no Admin,
usa /customers. As chaves de tema próprias de cada app são respeitadas e o estado
dark/light é verificado antes da captura.

A comparação permite no máximo 16 pixels alterados e diferença de até 8/255 por
canal, com dimensões idênticas. Isso cobre pequenas variações de antialias nas
bordas de gradientes; mudanças de posição, cores ou layout excedem esses limites.
Os números reais ficam em results.json. Menu mobile e Escape são verificados
nos dois painéis; o foco modal nativo continua coberto somente no Admin.

Imagem e pacote Playwright são fixados na mesma versão, conforme a
[documentação oficial de Docker](https://playwright.dev/docs/docker).


## Paridade estrutural da Gestão

`gestao-ui-parity.mjs` compara HTML normalizado dos componentes anteriores e
compartilhados, CSS scoped do botão e fonte do tema administrativo. Usa apenas
esbuild já instalado na Gestão e Vue/compiler-sfc/jsdom já instalados no UI.
Não requer navegador, sockets ou APIs. Dados e identidade são exemplos fictícios.

Para reproduzir a referência anterior, extraia o diretório app do commit
`e05c7c73e48857b40c6dbd0e80f7dffa0deaf160` da Gestão para um diretório temporário
com `git archive`. Informe o diretório **app** extraído:

```sh
ELINEA_GESTAO_REFERENCE_DIR=/tmp/gestao-reference/app node gestao-ui-parity.mjs
```

São comparados 20 combinações de botão, dois estados disabled/loading, busca,
seletor, quatro estados de grid, shell, CSS do botão e fonte do tema: 31 checks.
O normalizador ignora comentários, whitespace, ordem de classes/atributos e IDs
de CSS scoped. SVGs decorativos agora são aria-hidden; no shell são normalizados
o botão de menu acessível, labels de navegação, aria-current e IDs do drawer.
O padding do menu é compensado pelo CSS da Gestão. Esses ajustes são explícitos
no script; diferenças restantes falham e gravam os dois resultados para inspeção.

Resultados: `/tmp/elinea-gestao-ui/parity-results.json` ou ELINEA_PARITY_RESULT.
O bundle compilado e diferenças de diagnóstico ficam em `/tmp/elinea-gestao-ui`.

**Isso não comprova layout, pixels, fontes, overflow ou foco nativo.** A rodada
atual de navegador está pendente: socket Docker inacessível, Chromium ausente e
instalação falhou com EAI_AGAIN para cdn.playwright.dev. Para a próxima comparação,
o build anterior foi preservado localmente em `/tmp/elinea-gestao-ui/build-before`.
A referência de fonte usada nesta rodada está em `/tmp/elinea-gestao-ui/app-before`.
