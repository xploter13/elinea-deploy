# Deploy Elínea

Deploy de produção permanente e homologação sob demanda para uma VPS Debian 13 com 1 vCPU, 4 GB de RAM e 50 GB. As imagens são construídas local e sequencialmente na VPS, com cache do Docker e 2 GB de swap.

## Arquivos Compose

- `compose.yml`: serviços compartilhados pelos dois ambientes.
- `compose.production.yml`: adiciona o Traefik, as portas 80/443 e o certificado TLS.
- `compose.homologation.yml`: reduz os limites de CPU e memória da homologação.

Produção e homologação possuem projetos Compose, MySQL, Redis, storage e redes internas independentes. Somente a rede `elinea-proxy` e o Traefik são compartilhados.

## Domínios

Produção:

- `elinea.com.br`: site institucional e compra dos planos
- `api.elinea.com.br`: API Laravel
- `admin.elinea.com.br`: painel do lojista
- `gestao.elinea.com.br`: gestão da plataforma
- `*.elinea.com.br`: lojas dos tenants

Homologação:

- `homolog.elinea.com.br`: site institucional
- `api.homolog.elinea.com.br`: API Laravel
- `admin.homolog.elinea.com.br`: painel do lojista
- `gestao.homolog.elinea.com.br`: gestão da plataforma
- `*.homolog.elinea.com.br`: lojas de teste

No DNS da Cloudflare, aponte todos esses nomes e wildcards para o IPv4 da VPS. O Traefik usa DNS-01 com a API da Cloudflare para emitir os certificados wildcard. Crie um API Token limitado à zona `elinea.com.br`, com `Zone:Read` e `DNS:Edit`, e grave-o em `CF_DNS_API_TOKEN`.

## Build local das imagens

Clone os nove repositórios como diretórios irmãos em um workspace temporário. Use `develop` para homologação e `master` para produção. O script gera as sete imagens localmente com duas tags:

```text
production
production-2026.09.10-1

homologation
homologation-2026.09.10-1
```

A primeira acompanha a versão atual do ambiente. A segunda identifica o build e permite rollback enquanto a imagem continuar no cache local. Para um deploy controlado, altere `IMAGE_TAG` no arquivo do ambiente para a tag versionada.

Exemplo de workspace:

```text
/tmp/elinea-build/
├── elinea-deploy
├── elinea-api
├── elinea-admin
├── elinea-gestao
├── elinea-storefront
├── elinea-customer
├── elinea-sdk
├── elinea-ui
└── elinea-site
```

Execute o build a partir do repositório de deploy:

```bash
./scripts/build-images-local.sh homologation /tmp/elinea-build 2026.09.11-1
./scripts/build-images-local.sh production /tmp/elinea-build 2026.09.11-1
```

O script valida a branch de cada fonte e compila cada frontend com a URL da API correspondente ao ambiente. Nenhum segredo da aplicação é incluído nas imagens. Os builds são sequenciais para limitar o uso de memória e CPU.

## Deploy simplificado

O script `scripts/deploy.sh` executa o fluxo completo: verifica alterações locais, atualiza os repositórios na branch correta, constrói as imagens, seleciona uma tag versionada, inicia MySQL e Redis, executa as migrations, sobe os serviços e valida as aplicações.

```bash
# Publica develop em homologação com uma versão automática
./scripts/deploy.sh homologation

# Publica master em produção e solicita confirmação explícita
./scripts/deploy.sh production

# Também é possível informar a versão
./scripts/deploy.sh production 2026.09.11-2

# Desliga homologação preservando bancos e volumes
./scripts/deploy.sh stop-homologation
```

Antes das migrations de produção, o script cria um dump compactado em `backups/`. Se os fontes estiverem em outro diretório, informe `SOURCE_ROOT=/caminho`. O modo `SKIP_SOURCE_UPDATE=1` existe para builds deliberadamente offline.

## Preparação da VPS

1. Instale Docker Engine e o plugin Compose pelo repositório oficial do Docker.
2. Crie 2 GB de swap e habilite o firewall somente para SSH, 80 e 443.
3. Clone o `elinea-deploy` permanentemente e prepare um workspace temporário com os fontes durante cada build.
4. Crie a rede compartilhada:

```bash
docker network create elinea-proxy
```

5. Crie os arquivos de configuração:

```bash
cp .env.example .env.production
cp .env.homologation.example .env.homologation
```

Use senhas, `APP_KEY`, banco, Redis, SMTP, Stripe e tokens diferentes nos dois arquivos. Em homologação, utilize somente chaves de teste do Stripe.

## Primeiro deploy de produção

Valide a configuração:

```bash
docker compose --env-file .env.production -p elinea-production -f compose.yml -f compose.production.yml config --quiet
```

Construa as imagens, suba a infraestrutura, execute as migrations e inicie os serviços:

```bash
./scripts/build-images-local.sh production /tmp/elinea-build 2026.09.11-1
docker compose --env-file .env.production -p elinea-production -f compose.yml -f compose.production.yml up -d mysql redis
docker compose --env-file .env.production -p elinea-production -f compose.yml -f compose.production.yml run --rm api php artisan migrate --force
docker compose --env-file .env.production -p elinea-production -f compose.yml -f compose.production.yml up -d
```

Cadastre no Stripe o webhook `https://api.elinea.com.br/api/v1/webhooks/stripe` e grave o signing secret em `STRIPE_WEBHOOK_SECRET`.

## Homologação sob demanda

Para iniciar:

```bash
./scripts/build-images-local.sh homologation /tmp/elinea-build 2026.09.11-1
docker compose --env-file .env.homologation -p elinea-homologation -f compose.yml -f compose.homologation.yml up -d mysql redis
docker compose --env-file .env.homologation -p elinea-homologation -f compose.yml -f compose.homologation.yml run --rm api php artisan migrate --force
docker compose --env-file .env.homologation -p elinea-homologation -f compose.yml -f compose.homologation.yml up -d
```

Para desligar depois dos testes:

```bash
docker compose --env-file .env.homologation -p elinea-homologation -f compose.yml -f compose.homologation.yml down
```

O comando `down` preserva os volumes e o banco de homologação. Não utilize `down -v`, pois essa opção exclui os dados do ambiente.

## Atualização e rollback

Depois de construir uma nova versão, defina a tag versionada no arquivo do ambiente, por exemplo:

```text
IMAGE_TAG=production-2026.09.10-2
```

Depois execute as migrations e `up -d` usando o comando Compose daquele ambiente. Para rollback, restaure a tag anterior ainda presente no Docker local e repita o processo. Migrations destrutivas precisam ser planejadas separadamente, pois trocar a imagem não desfaz alterações no banco.

## Operação e recursos

A homologação foi limitada a aproximadamente 1,8 GB no pior caso. Mesmo assim, ela deve permanecer ligada somente durante os testes, pois o único vCPU será compartilhado com produção.

Comandos úteis de produção:

```bash
docker compose --env-file .env.production -p elinea-production -f compose.yml -f compose.production.yml ps
docker compose --env-file .env.production -p elinea-production -f compose.yml -f compose.production.yml logs --tail=200 api horizon
docker compose --env-file .env.production -p elinea-production -f compose.yml -f compose.production.yml exec api php artisan about
docker compose --env-file .env.production -p elinea-production -f compose.yml -f compose.production.yml exec horizon php artisan horizon:status
```

O backup da Hostinger deve cobrir a VPS inteira, mas mantenha também dumps lógicos de cada banco em armazenamento externo e teste a restauração periodicamente.
