#!/usr/bin/env bash
set -euo pipefail

APP_NAME="ncmapi"

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PROJECT_ROOT="$SCRIPT_DIR"
cd "$PROJECT_ROOT"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${PROJECT_ROOT}/data/deploy_${TIMESTAMP}.log"
COMPOSE_FILE="${PROJECT_ROOT}/docker-compose.yml"
SKIP_BUILD=false
PULL_BASE=false

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info()  { echo -e "${CYAN}[INFO]${NC}  $(date '+%H:%M:%S')  $*" | tee -a "$LOG_FILE"; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $(date '+%H:%M:%S')  $*" | tee -a "$LOG_FILE"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $(date '+%H:%M:%S')  $*" | tee -a "$LOG_FILE"; }
log_error() { echo -e "${RED}[ERROR]${NC} $(date '+%H:%M:%S')  $*" | tee -a "$LOG_FILE"; }

cleanup() {
    if [ $? -ne 0 ]; then
        log_error "部署失败！请检查上方错误信息。"
        log_error "如需回退，请手动切换 git 版本后重新执行部署。"
    fi
}
trap cleanup EXIT

while [[ $# -gt 0 ]]; do
    case "$1" in
        --skip-build) SKIP_BUILD=true; shift ;;
        --pull-base) PULL_BASE=true; shift ;;
        --help|-h)
            cat <<'EOF'
用法: ./deploy.sh [--skip-build] [--pull-base]

说明:
  1. 拉取当前分支最新代码
  2. docker compose build
  3. docker compose up -d

选项:
  --skip-build   跳过镜像构建，直接执行 docker compose up -d
  --pull-base    构建前主动拉取最新基础镜像
EOF
            exit 0
            ;;
        *)
            log_error "未知参数: $1"
            exit 1
            ;;
    esac
done

check_prerequisites() {
    log_info "检查前置依赖..."

    command -v docker >/dev/null 2>&1 || { log_error "docker 未安装"; exit 1; }
    command -v git    >/dev/null 2>&1 || { log_error "git 未安装";    exit 1; }

    if docker compose version >/dev/null 2>&1; then
        COMPOSE_CMD="docker compose"
    elif docker-compose --version >/dev/null 2>&1; then
        COMPOSE_CMD="docker-compose"
    else
        log_error "docker compose 未安装"
        exit 1
    fi

    if [ ! -f "$COMPOSE_FILE" ]; then
        log_error "请在项目根目录执行此脚本（未找到 $COMPOSE_FILE）"
        exit 1
    fi

    log_ok "前置检查通过"
}

fetch_code() {
    log_info "拉取最新代码..."
    local branch
    branch=$(git rev-parse --abbrev-ref HEAD)
    git pull --ff-only origin "$branch"
    log_ok "代码更新完成，当前 commit: $(git rev-parse --short HEAD)"
}

build_images() {
    if [ "$SKIP_BUILD" = true ]; then
        log_info "跳过构建（--skip-build）"
        return
    fi

    log_info "构建 Docker 镜像..."
    if [ "$PULL_BASE" = true ]; then
        $COMPOSE_CMD build --pull
    else
        $COMPOSE_CMD build
    fi
    log_ok "镜像构建完成"
}

deploy_services() {
    log_info "开始部署服务..."

    $COMPOSE_CMD up -d --remove-orphans 2>&1 | tee -a "$LOG_FILE"
    log_ok "容器已启动"
}

print_summary() {
    echo ""
    echo "=============================================="
    echo -e "  ${GREEN}${APP_NAME} 部署完成${NC}"
    echo "=============================================="
    echo "  时间:    $(date '+%Y-%m-%d %H:%M:%S')"
    echo "  版本:    $(git rev-parse --short HEAD)"
    echo "  日志:    ${LOG_FILE}"
    echo "------------------------------------------------"
    echo "  服务状态:"
    $COMPOSE_CMD ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || true
    echo "=============================================="
}

main() {
    mkdir -p "$(dirname "$LOG_FILE")"

    echo ""
    echo -e "${CYAN}==============================================${NC}"
    echo -e "${CYAN}  ${APP_NAME} 生产环境部署${NC}"
    echo -e "${CYAN}  开始时间: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo -e "${CYAN}==============================================${NC}"
    echo ""

    check_prerequisites

    fetch_code
    build_images
    deploy_services
    print_summary
}

main "$@"
