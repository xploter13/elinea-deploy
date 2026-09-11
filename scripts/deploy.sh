#!/usr/bin/env bash
set -Eeuo pipefail

umask 077

deploy_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
source_root=${SOURCE_ROOT:-/tmp/elinea-build}
environment=
version=$(date -u +%Y.%m.%d-%H%M%S)
action=deploy
dry_run=0
version_set=0
repositories=(elinea-api elinea-admin elinea-gestao elinea-storefront elinea-customer elinea-sdk elinea-ui elinea-site)

usage() {
  cat <<'EOF'
Uso:
  ./scripts/deploy.sh --homologation [opções]
  ./scripts/deploy.sh --production [opções]

Flags:
  --homologation                 Deploy de develop em homologação.
  --production                   Deploy de master em produção.
  -e, --env AMBIENTE              production ou homologation.
  -v, --version VERSAO            Tag da versão (padrão: data/hora UTC).
  -y, --yes                       Confirma produção sem prompt.
  --source-root DIRETORIO         Local dos oito repositórios.
  --skip-update                   Usa fontes locais sem fetch.
  --stop                         Desliga somente homologação, preservando dados.
  --dry-run                      Mostra o plano sem alterar arquivos ou serviços.
  -h, --help                     Mostra esta ajuda.

Exemplos:
  ./scripts/deploy.sh --homologation
  ./scripts/deploy.sh --production --version 2026.09.11-2 --yes
  ./scripts/deploy.sh --homologation --stop

Compatibilidade: homologation [versao], production [versao], stop-homologation.
Variáveis opcionais: SOURCE_ROOT, SKIP_SOURCE_UPDATE=1, DEPLOY_YES=1.
EOF
}

fail() {
  echo "Erro: $*" >&2
  exit 1
}

on_error() {
  echo "Deploy interrompido. Consulte a saída acima; os containers existentes não foram removidos." >&2
}
trap on_error ERR

set_environment() {
  [[ -z "$environment" || "$environment" == "$1" ]] || fail "selecione apenas um ambiente"
  environment=$1
}

require_value() {
  [[ $# -ge 2 && -n "$2" && "$2" != -* ]] || fail "a flag $1 exige um valor"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --production|--homologation) set_environment "${1#--}"; shift ;;
    -e|--env) require_value "$@"; set_environment "$2"; shift 2 ;;
    -v|--version)
      require_value "$@"
      [[ "$version_set" == 0 ]] || fail "versão informada mais de uma vez"
      version=$2; version_set=1; shift 2 ;;
    --source-root) require_value "$@"; source_root=$2; shift 2 ;;
    -y|--yes) DEPLOY_YES=1; shift ;;
    --skip-update) SKIP_SOURCE_UPDATE=1; shift ;;
    --stop) action=stop; shift ;;
    --dry-run) dry_run=1; shift ;;
    -h|--help|help) usage; exit 0 ;;
    production|homologation) set_environment "$1"; shift ;;
    stop-homologation) set_environment homologation; action=stop; shift ;;
    -*) fail "flag desconhecida: $1" ;;
    *)
      [[ -n "$environment" && "$version_set" == 0 ]] || fail "argumento inesperado: $1"
      version=$1; version_set=1; shift ;;
  esac
done

[[ "$version" =~ ^[A-Za-z0-9][A-Za-z0-9._-]*$ ]] || fail "versão inválida: $version"
[[ "$action" != stop || "$environment" == homologation ]] || fail "--stop exige --homologation"
[[ "$action" != stop || "$version_set" == 0 ]] || fail "--stop não aceita versão"

case "$environment" in
  homologation)
    branch=develop
    env_file="$deploy_root/.env.homologation"
    project=elinea-homologation
    override_file="$deploy_root/compose.homologation.yml"
    ;;
  production)
    branch=master
    env_file="$deploy_root/.env.production"
    project=elinea-production
    override_file="$deploy_root/compose.production.yml"
    ;;
  *)
    usage >&2
    exit 1
    ;;
esac

if [[ "$dry_run" == 1 ]]; then
  update_sources=sim
  [[ "${SKIP_SOURCE_UPDATE:-0}" != 1 ]] || update_sources=não
  printf 'Ação: %s\nAmbiente: %s\nBranch: %s\nProjeto Compose: %s\nTag: %s-%s\nFontes: %s\nAtualizar fontes: %s\n' \
    "$action" "$environment" "$branch" "$project" "$environment" "$version" "$source_root" "$update_sources"
  exit 0
fi

if [[ "$action" == stop ]]; then
  exec docker compose --env-file "$env_file" -p "$project" \
    -f "$deploy_root/compose.yml" -f "$override_file" down
fi

for command in docker git awk; do
  command -v "$command" >/dev/null || fail "comando obrigatório não encontrado: $command"
done

[[ -f "$env_file" ]] || fail "arquivo não encontrado: $env_file"
[[ "$version" =~ ^[A-Za-z0-9][A-Za-z0-9._-]*$ ]] || fail "versão inválida: $version"

if [[ "$environment" == production && "${DEPLOY_YES:-0}" != 1 ]]; then
  [[ -t 0 ]] || fail "produção exige terminal interativo ou --yes"
  echo "Você está prestes a publicar a versão $version em PRODUÇÃO."
  read -r -p "Digite production para continuar: " confirmation
  [[ "$confirmation" == production ]] || fail "publicação cancelada"
fi

if [[ "${SKIP_SOURCE_UPDATE:-0}" != 1 ]]; then
  echo "Atualizando fontes para $branch..."
  for repository in "${repositories[@]}"; do
    repository_path="$source_root/$repository"
    [[ -d "$repository_path/.git" ]] || fail "repositório ausente: $repository_path"
    [[ -z "$(git -C "$repository_path" status --porcelain)" ]] || fail "$repository possui alterações locais"
    git -C "$repository_path" fetch origin
    git -C "$repository_path" switch "$branch"
    git -C "$repository_path" merge --ff-only "origin/$branch"
  done
else
  echo "Atualização dos fontes ignorada por SKIP_SOURCE_UPDATE=1."
fi

echo "Construindo imagens $environment-$version..."
"$deploy_root/scripts/build-images-local.sh" "$environment" "$source_root" "$version"

temporary_env=$(mktemp "$deploy_root/.env.deploy.XXXXXX")
awk -v value="$environment-$version" '
  BEGIN { updated = 0 }
  /^IMAGE_TAG=/ { print "IMAGE_TAG=" value; updated = 1; next }
  { print }
  END { if (!updated) print "IMAGE_TAG=" value }
' "$env_file" > "$temporary_env"
chmod 600 "$temporary_env"
mv "$temporary_env" "$env_file"

compose=(
  docker compose
  --env-file "$env_file"
  -p "$project"
  -f "$deploy_root/compose.yml"
  -f "$override_file"
)

"${compose[@]}" config --quiet
docker network inspect elinea-proxy >/dev/null 2>&1 || docker network create elinea-proxy >/dev/null
"${compose[@]}" up -d mysql redis

if [[ "$environment" == production ]]; then
  backup_dir="$deploy_root/backups"
  backup_file="$backup_dir/production-before-$version.sql.gz"
  mkdir -p "$backup_dir"
  echo "Criando backup em $backup_file..."
  "${compose[@]}" exec -T mysql sh -c \
    'exec mysqldump --no-tablespaces --single-transaction --quick --lock-tables=false -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' \
    | gzip > "$backup_file"
  [[ -s "$backup_file" ]] || fail "o backup do banco ficou vazio"
fi

echo "Executando migrations..."
"${compose[@]}" run --rm api php artisan migrate --force

echo "Iniciando serviços..."
"${compose[@]}" up -d

echo "Validando serviços..."
"${compose[@]}" exec -T api php artisan about --only=environment,cache,drivers
# The container entrypoint prepares caches before Horizon starts.
horizon_ready=0
for attempt in {1..30}; do
  if "${compose[@]}" exec -T horizon php artisan horizon:status; then
    horizon_ready=1
    break
  fi
  sleep 2
done
[[ "$horizon_ready" == 1 ]] || fail "Horizon não iniciou no prazo esperado"
"${compose[@]}" exec -T site wget -qO /dev/null http://127.0.0.1/
"${compose[@]}" exec -T api-web wget -qO /dev/null http://127.0.0.1/
"${compose[@]}" exec -T admin wget -qO /dev/null http://127.0.0.1/
"${compose[@]}" exec -T gestao wget -qO /dev/null http://127.0.0.1/
"${compose[@]}" exec -T storefront wget -qO /dev/null http://127.0.0.1:3000/
"${compose[@]}" exec -T customer wget -qO /dev/null http://127.0.0.1:3000/login
"${compose[@]}" ps

echo "Deploy concluído: $environment-$version"
