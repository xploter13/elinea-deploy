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


Para a migração parcial da Gestão, use `ELINEA_PRODUCT=gestao` e
`ELINEA_PANEL_BEFORE_DIR` ou `ELINEA_ADMIN_BEFORE_DIR` apontando ao seu build anterior.
O harness compara os três cenários visuais. As interações novas de shell/modal só
são exigidas no Admin, que já adotou esses componentes; a Gestão ainda mantém seu
layout e confirmações locais. Fixtures de Gestão usam o papel super, sem serviços reais.


Para a Gestão, use ELINEA_PANEL_APP=gestao e ELINEA_PANEL_BEFORE_DIR com o build
anterior correspondente. O harness escolhe a rota real /platform/users; no Admin,
usa /customers. As chaves de tema próprias de cada app são respeitadas e o estado
dark/light é verificado antes da captura.

A comparação permite no máximo 16 pixels alterados e diferença de até 8/255 por
canal, com dimensões idênticas. Isso cobre pequenas variações de antialias nas
bordas de gradientes; mudanças de posição, cores ou layout excedem esses limites.
Os números reais ficam em results.json. Interações de menu/foco modal são
verificadas no Admin; a Gestão ainda tem componentes exclusivos em consolidação.

Imagem e pacote Playwright são fixados na mesma versão, conforme a
[documentação oficial de Docker](https://playwright.dev/docs/docker).
