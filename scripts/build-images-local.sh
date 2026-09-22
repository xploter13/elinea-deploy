#!/usr/bin/env bash
set -euo pipefail

environment=${1:-}
source_root=${2:-/opt/elinea-build}
version=${3:-$(date -u +%Y.%m.%d-%H%M)}
namespace=${REGISTRY_NAMESPACE:-elinea}
deploy_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

case "$environment" in
  homologation)
    branch=develop
    api_url=https://api.homolog.elinea.com.br/api/v1
    ;;
  production)
    branch=master
    api_url=https://api.elinea.com.br/api/v1
    ;;
  *)
    echo "Uso: $0 {homologation|production} [diretorio-dos-fontes] [versao]" >&2
    exit 1
    ;;
esac

repositories=(elinea-api elinea-admin elinea-gestao elinea-storefront elinea-customer elinea-sdk elinea-ui elinea-site)
for repository in "${repositories[@]}"; do
  repository_path="$source_root/$repository"
  if [[ ! -d "$repository_path/.git" ]]; then
    echo "Repositório ausente: $repository_path" >&2
    exit 1
  fi
  current_branch=$(git -C "$repository_path" branch --show-current)
  if [[ "$current_branch" != "$branch" ]]; then
    echo "$repository deve estar em $branch, mas está em $current_branch" >&2
    exit 1
  fi
done

install -m 0644 "$deploy_root/root.dockerignore" "$source_root/.dockerignore"

build_image() {
  local name=$1
  shift
  docker build \
    --tag "$namespace/$name:$environment" \
    --tag "$namespace/$name:$environment-$version" \
    "$@"
}

build_image elinea-api --target app "$source_root/elinea-api"
build_image elinea-api-web --target web "$source_root/elinea-api"

build_image elinea-site \
  --file "$deploy_root/docker/static.Dockerfile" \
  --build-arg APP_DIR=elinea-site \
  --build-arg NUXT_PUBLIC_API_BASE="$api_url" \
  "$source_root"

for app in elinea-admin elinea-gestao; do
  build_image "$app" \
    --file "$deploy_root/docker/static.Dockerfile" \
    --build-arg APP_DIR="$app" \
    --build-arg NUXT_PUBLIC_API_BASE="$api_url" \
    --build-arg NUXT_PUBLIC_SITE=default \
    "$source_root"
done

for app in elinea-storefront elinea-customer; do
  build_args=()
  if [[ "$app" == elinea-storefront ]]; then
    build_args+=(--build-arg NUXT_CUSTOMER_APP_URL=http://customer:3000)
  fi
  build_image "$app" \
    --file "$deploy_root/docker/nuxt.Dockerfile" \
    --build-arg APP_DIR="$app" \
    "${build_args[@]}" \
    "$source_root"
done

echo "Imagens locais criadas com as tags $environment e $environment-$version."
