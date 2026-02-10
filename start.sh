#!/bin/bash

# 数字炸弹游戏启动脚本
# 支持本地运行、Docker 运行等多种方式

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 显示帮助信息
show_help() {
    echo -e "${BLUE}数字炸弹游戏 - 启动脚本${NC}"
    echo ""
    echo "用法: ./start.sh [选项]"
    echo ""
    echo "选项:"
    echo "  local       本地运行（需要 Node.js）"
    echo "  docker      使用 Docker 运行"
    echo "  build       构建 Docker 镜像"
    echo "  stop        停止 Docker 容器"
    echo "  logs        查看 Docker 日志"
    echo "  help        显示帮助信息"
    echo ""
}

# 检查依赖
check_node() {
    if ! command -v node &> /dev/null; then
        echo -e "${RED}错误: 未检测到 Node.js，请先安装 Node.js 16+${NC}"
        echo "下载地址: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        echo -e "${RED}错误: Node.js 版本过低，需要 16+，当前版本: $(node -v)${NC}"
        exit 1
    fi
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}错误: 未检测到 Docker，请先安装 Docker${NC}"
        echo "下载地址: https://docs.docker.com/get-docker/"
        exit 1
    fi
}

# 本地运行
run_local() {
    check_node
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  💣 数字炸弹游戏 - 本地模式${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # 检查依赖
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 正在安装依赖...${NC}"
        npm install
    fi
    
    echo -e "${GREEN}🚀 启动服务器...${NC}"
    echo -e "${YELLOW}   访问地址: http://localhost:3000${NC}"
    echo -e "${YELLOW}   按 Ctrl+C 停止服务${NC}"
    echo ""
    
    npm start
}

# Docker 运行
run_docker() {
    check_docker
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  💣 数字炸弹游戏 - Docker 模式${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # 检查镜像是否存在
    if ! docker images | grep -q "number-bomb"; then
        echo -e "${YELLOW}🔨 镜像不存在，先构建镜像...${NC}"
        build_docker
    fi
    
    # 检查容器是否已运行
    if docker ps | grep -q "number-bomb-game"; then
        echo -e "${YELLOW}⚠️ 容器已在运行${NC}"
        echo -e "${GREEN}   访问地址: http://localhost:3000${NC}"
        exit 0
    fi
    
    # 检查是否有停止的容器
    if docker ps -a | grep -q "number-bomb-game"; then
        echo -e "${YELLOW}🔄 启动已有容器...${NC}"
        docker start number-bomb-game
    else
        echo -e "${YELLOW}🚀 创建并启动容器...${NC}"
        docker run -d -p 3000:3000 --name number-bomb-game number-bomb
    fi
    
    echo ""
    echo -e "${GREEN}✅ 服务已启动！${NC}"
    echo -e "${GREEN}   访问地址: http://localhost:3000${NC}"
    echo -e "${YELLOW}   使用 ./start.sh logs 查看日志${NC}"
    echo -e "${YELLOW}   使用 ./start.sh stop 停止服务${NC}"
}

# 构建 Docker 镜像
build_docker() {
    check_docker
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  🔨 构建 Docker 镜像${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    docker build -t number-bomb .
    
    echo ""
    echo -e "${GREEN}✅ 镜像构建完成！${NC}"
}

# 停止 Docker 容器
stop_docker() {
    check_docker
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}  🛑 停止服务${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    if docker ps | grep -q "number-bomb-game"; then
        docker stop number-bomb-game
        echo -e "${GREEN}✅ 服务已停止${NC}"
    else
        echo -e "${YELLOW}⚠️ 服务未在运行${NC}"
    fi
}

# 查看 Docker 日志
view_logs() {
    check_docker
    
    if ! docker ps | grep -q "number-bomb-game"; then
        echo -e "${RED}❌ 容器未在运行${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}  📋 查看日志（按 Ctrl+C 退出）${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    docker logs -f number-bomb-game
}

# 主逻辑
case "${1:-local}" in
    local)
        run_local
        ;;
    docker)
        run_docker
        ;;
    build)
        build_docker
        ;;
    stop)
        stop_docker
        ;;
    logs)
        view_logs
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}未知选项: $1${NC}"
        show_help
        exit 1
        ;;
esac
