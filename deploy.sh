#!/usr/bin/env bash
set -euo pipefail

APP_NAME="ncmapi"

cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)

BACKUP_DIR="${PROJECT_ROOT}/data/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${PROJECT_ROOT}/data/deploy_${TIMESTAMP}.log"
COMPOSE_FILE="${PROJECT_ROOT}/docker-compose.yml"
SKIP_BUILD=false
ROLLBACK=false
DEPLOY_TAG=""

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
        log_error "如有需要，执行 ./deploy.sh --rollback 进行回滚。"
    fi
}
trap cleanup EXIT

while [[ $# -gt 0 ]]; do
    case "$1" in
        --skip-build) SKIP_BUILD=true; shift ;;
        --rollback)   ROLLBACK=true; shift ;;
        --tag)        DEPLOY_TAG="$2"; shift 2 ;;
        --help|-h)
            sed -n '3,10p' "$0"
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

backup_database() {
    log_info "备份数据库..."

    local volume_name volume_path

    volume_name=$($COMPOSE_CMD config --volumes 2>/dev/null | head -1 || echo "platform-data")
    volume_path=$(docker volume inspect "$volume_name" --format '{{.Mountpoint}}' 2>/dev/null || true)

    if [ -z "$volume_path" ] || [ ! -f "${volume_path}/platform.db" ]; then
        local project_name
        project_name=$(basename "$(pwd)" | tr '[:upper:]' '[:lower:]' | tr -c 'a-z0-9_' '_')
        volume_path=$(docker volume inspect "${project_name}_platform-data" --format '{{.Mountpoint}}' 2>/dev/null || true)
    fi

    if [ -n "$volume_path" ] && [ -f "${volume_path}/platform.db" ]; then
        cp "${volume_path}/platform.db" "${BACKUP_DIR}/platform_${TIMESTAMP}.db"
        log_ok "数据库已备份: ${BACKUP_DIR}/platform_${TIMESTAMP}.db"
    elif [ -f "${PROJECT_ROOT}/data/platform.db" ]; then
        cp "${PROJECT_ROOT}/data/platform.db" "${BACKUP_DIR}/platform_${TIMESTAMP}.db"
        log_ok "数据库已备份 (host): ${BACKUP_DIR}/platform_${TIMESTAMP}.db"
    else
        log_warn "未找到数据库文件，跳过数据库备份"
    fi

    ls -t "${BACKUP_DIR}"/platform_*.db 2>/dev/null | tail -n +31 | xargs -r rm 2>/dev/null || true
    log_info "清理旧备份完成"
}

fetch_code() {
    if [ -n "$DEPLOY_TAG" ]; then
        log_info "切换到指定 tag: ${DEPLOY_TAG}"
        git fetch --tags
        git checkout "$DEPLOY_TAG"
    else
        log_info "拉取最新代码..."
        git fetch origin
        local branch
        branch=$(git rev-parse --abbrev-ref HEAD)
        git pull origin "$branch"
    fi
    log_ok "代码更新完成，当前 commit: $(git rev-parse --short HEAD)"
}

build_images() {
    if [ "$SKIP_BUILD" = true ]; then
        log_info "跳过构建（--skip-build）"
        return
    fi

    log_info "标记当前镜像为 prev（用于回滚）..."
    $COMPOSE_CMD images --format '{{.Repository}}:{{.Tag}}' | sort -u | while read -r img; do
        if [ -n "$img" ] && [ "$img" != "<none>:<none>" ]; then
            docker tag "$img" "${img%:*}:prev" 2>/dev/null || true
        fi
    done
    log_ok "旧镜像已标记"

    log_info "构建 Docker 镜像..."
    $COMPOSE_CMD build --pull
    log_ok "镜像构建完成"
}

health_check() {
    local service=$1
    local url=$2
    local retries=15
    local wait=3

    log_info "等待 ${service} 启动..."

    for i in $(seq 1 $retries); do
        if curl -sf "$url" >/dev/null 2>&1; then
            log_ok "${service} 健康检查通过"
            return 0
        fi
        sleep "$wait"
    done

    log_error "${service} 健康检查超时"
    return 1
}

deploy_services() {
    log_info "开始部署服务..."

    $COMPOSE_CMD up -d --remove-orphans --no-deps 2>&1 | tee -a "$LOG_FILE"
    log_ok "容器已启动"

    health_check "platform" "http://localhost/" || {
        log_error "platform 启动失败，触发回滚..."
        rollback
        exit 1
    }

    log_ok "所有服务已通过健康检查"
}

cleanup_images() {
    log_info "清理旧 Docker 镜像..."
    docker image prune -f --filter "until=24h" 2>&1 | tee -a "$LOG_FILE"
    log_ok "旧镜像清理完成"
}

rollback() {
    log_warn "执行回滚..."

    local latest_backup
    latest_backup=$(ls -t "${BACKUP_DIR}"/platform_*.db 2>/dev/null | head -1 || true)

    if [ -n "$latest_backup" ]; then
        log_info "恢复数据库: ${latest_backup}"

        local volume_path
        volume_name=$($COMPOSE_CMD config --volumes 2>/dev/null | head -1 || echo "platform-data")
        volume_path=$(docker volume inspect "$volume_name" --format '{{.Mountpoint}}' 2>/dev/null || true)
        if [ -z "$volume_path" ]; then
            local project_name
            project_name=$(basename "$(pwd)" | tr '[:upper:]' '[:lower:]' | tr -c 'a-z0-9_' '_')
            volume_path=$(docker volume inspect "${project_name}_platform-data" --format '{{.Mountpoint}}' 2>/dev/null || echo "${PROJECT_ROOT}/data")
        fi

        cp "$latest_backup" "${volume_path}/platform.db"
        log_ok "数据库已恢复"
    else
        log_warn "无可用备份，跳过数据库恢复"
    fi

    log_info "恢复上一版镜像..."
    $COMPOSE_CMD images --format '{{.Repository}}:{{.Tag}}' | sort -u | while read -r img; do
        local prev="${img%:*}:prev"
        if docker image inspect "$prev" >/dev/null 2>&1; then
            docker tag "$prev" "$img"
            log_info "  回滚镜像: $img"
        fi
    done

    log_info "重启服务..."
    $COMPOSE_CMD up -d --force-recreate 2>&1 | tee -a "$LOG_FILE"
    health_check "platform" "http://localhost/"
    log_ok "回滚完成"
}

print_summary() {
    echo ""
    echo "=============================================="
    echo -e "  ${GREEN}${APP_NAME} 部署完成${NC}"
    echo "=============================================="
    echo "  时间:    $(date '+%Y-%m-%d %H:%M:%S')"
    echo "  版本:    $(git rev-parse --short HEAD)"
    echo "  备份:    ${BACKUP_DIR}/platform_${TIMESTAMP}.db"
    echo "  日志:    ${LOG_FILE}"
    echo "------------------------------------------------"
    echo "  服务状态:"
    $COMPOSE_CMD ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || true
    echo "=============================================="
}

main() {
    mkdir -p "$BACKUP_DIR" "$(dirname "$LOG_FILE")"

    echo ""
    echo -e "${CYAN}==============================================${NC}"
    echo -e "${CYAN}  ${APP_NAME} 生产环境部署${NC}"
    echo -e "${CYAN}  开始时间: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
    echo -e "${CYAN}==============================================${NC}"
    echo ""

    check_prerequisites

    if [ "$ROLLBACK" = true ]; then
        rollback
        print_summary
        exit 0
    fi

    backup_database
    fetch_code
    build_images
    deploy_services
    cleanup_images
    print_summary
}

main "$@"
