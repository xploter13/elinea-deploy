# Deploy Elínea

Deploy de produção permanente e homologação sob demanda para uma VPS Debian 13 com 1 vCPU, 4 GB de RAM e 50 GB. As imagens são construídas pelo GitHub Actions, publicadas no GitHub Container Registry (GHCR) e apenas baixadas pela VPS.

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

No DNS da Hostinger, aponte todos esses nomes e wildcards para o IPv4 da VPS. O Traefik usa DNS-01 com a API da Hostinger para emitir os certificados wildcard.

## Publicação das imagens

O workflow `.github/workflows/publish-images.yml` baixa os repositórios, gera as sete imagens e publica duas tags para cada imagem:

```text
production
production-2026.09.10-1

homologation
homologation-2026.09.10-1
```

A primeira acompanha a versão atual do ambiente. A segunda é imutável e permite rollback. Para um deploy controlado, altere `IMAGE_TAG` no arquivo do ambiente para a tag imutável.

Pré-requisitos no GitHub:

1. Crie os repositórios privados `xploter13/elinea-deploy` e `xploter13/elinea-site` e envie os respectivos projetos.
2. No repositório `elinea-deploy`, crie o secret `REPOSITORIES_TOKEN` com um fine-grained personal access token que tenha `Contents: Read` nos repositórios `elinea-api`, `elinea-admin`, `elinea-gestao`, `elinea-storefront`, `elinea-customer`, `elinea-sdk`, `elinea-ui` e `elinea-site`.
3. Nas configurações de Actions do `elinea-deploy`, mantenha a permissão de escrita em Packages para o `GITHUB_TOKEN`.
4. Use `develop` em todos os oito repositórios para homologação e `master` para produção. Após validar homologação, promova o código por PR de `develop` para `master`. O workflow seleciona a branch pelo ambiente, sem recorrer à branch padrão.
5. Crie os GitHub Environments `homologation` e `production` no repositório `elinea-deploy`. Configure revisores obrigatórios em `production` para exigir aprovação antes da publicação (conforme disponibilidade do plano).
6. Execute manualmente o workflow `Publicar imagens`, selecione `homologation` ou `production` e informe uma versão, como `2026.09.10-1`.

A seleção de ambiente não faz merge nem publica automaticamente ao enviar commits. O acionamento continua manual. No Site, crie `master` a partir de `main` e configure-a como padrão; mantenha `main` até atualizar eventuais integrações.

O workflow compila cada frontend com a URL da API correspondente ao ambiente. Nenhum segredo da aplicação é incluído nas imagens.

## Preparação da VPS

1. Instale Docker Engine e o plugin Compose pelo repositório oficial do Docker.
2. Crie 2 GB de swap e habilite o firewall somente para SSH, 80 e 443.
3. Clone apenas o repositório `elinea-deploy` na VPS.
4. Crie a rede compartilhada:

```bash
docker network create elinea-proxy
```

5. Autentique a VPS no GHCR usando um token com `Packages: Read`:

```bash
echo "$GHCR_TOKEN" | docker login ghcr.io -u xploter13 --password-stdin
```

6. Crie os arquivos de configuração:

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

Suba a infraestrutura, execute as migrations e inicie os serviços:

```bash
docker compose --env-file .env.production -p elinea-production -f compose.yml -f compose.production.yml pull
docker compose --env-file .env.production -p elinea-production -f compose.yml -f compose.production.yml up -d mysql redis
docker compose --env-file .env.production -p elinea-production -f compose.yml -f compose.production.yml run --rm api php artisan migrate --force
docker compose --env-file .env.production -p elinea-production -f compose.yml -f compose.production.yml up -d
```

Cadastre no Stripe o webhook `https://api.elinea.com.br/api/v1/webhooks/stripe` e grave o signing secret em `STRIPE_WEBHOOK_SECRET`.

## Homologação sob demanda

Para iniciar:

```bash
docker compose --env-file .env.homologation -p elinea-homologation -f compose.yml -f compose.homologation.yml pull
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

Depois de publicar uma nova versão, defina a tag imutável no arquivo do ambiente, por exemplo:

```text
IMAGE_TAG=production-2026.09.10-2
```

Depois execute `pull`, as migrations e `up -d` usando o comando Compose daquele ambiente. Para rollback, restaure a tag anterior e repita o processo. Migrations destrutivas precisam ser planejadas separadamente, pois trocar a imagem não desfaz alterações no banco.

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
