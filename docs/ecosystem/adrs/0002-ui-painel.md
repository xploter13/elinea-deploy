# ADR 0002 — Painel compartilhado e tema opt-in

Status: aceito. Data: 2026-11-25.

O UI já segmenta core/marketing/storefront/painel; o Admin é a referência visual,
mas seus componentes dependem de autoimports Nuxt, rotas e composables locais.

Preservar a estrutura e os exports legados. Extrair apresentação para componentes
Painel, importar Vue explicitamente e receber navegação/dados por props e slots.
A aplicação filtra permissões, fornece linkComponent e coordena autenticação,
notificações e promoção comercial. Não copiar essas regras para o UI.

O tema original é distribuído em @elinea/ui/painel/styles.css, separado do tema
base e nunca importado implicitamente. É fonte Tailwind/DaisyUI para o pipeline
do consumidor; os plugins são peers opcionais. A licença dos cinco glyphs Lucide
utilizados internamente acompanha o pacote; não existe novo sistema de ícones.

O UI usa contratos de apresentação Storefront*Data e não depende do SDK em runtime
ou como peer. A dependência de desenvolvimento só verifica compatibilidade de tipos.

Consequências: versão aditiva 0.2.0, sem publicação. As cópias locais do Admin ficam
para comparação até a Fase 5. Testes DOM não substituem inspeção visual, teclado,
foco modal e breakpoints no navegador. Remoção só após validar o consumidor.
