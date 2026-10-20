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
    ;;
  production)
    branch=master
    ;;
  *)
    echo "Uso: $0 {homologation|production} [diretorio-dos-fontes] [versao]" >&2
    exit 1
    ;;
esac

repositories=(elinea-api elinea-storefront elinea-sdk elinea-ui)
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

build_image elinea-storefront \
  --file "$deploy_root/docker/nuxt.Dockerfile" \
  --build-arg APP_DIR=elinea-storefront \
  "$source_root"

echo "Imagens locais criadas com as tags $environment e $environment-$version."
