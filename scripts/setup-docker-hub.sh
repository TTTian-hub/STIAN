#!/bin/bash

# Docker Hub 发布设置脚本
# 用法: ./scripts/setup-docker-hub.sh

set -e

echo "🐳 Docker Hub 发布设置"
echo "========================"
echo ""

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装"
    exit 1
fi

# 检查是否已登录
if ! docker info | grep -q "Username"; then
    echo "请先登录 Docker Hub:"
    echo "  docker login"
    echo ""
    echo "如果没有账号，请先去 https://hub.docker.com 注册"
    exit 1
fi

# 获取当前登录的用户名
DOCKER_USER=$(docker info 2>/dev/null | grep Username | awk '{print $2}')
echo "✅ 已登录 Docker Hub: $DOCKER_USER"
echo ""

# 设置镜像名称
read -p "📦 请输入镜像名称 [默认: fortuning-ai]: " IMAGE_NAME
IMAGE_NAME=${IMAGE_NAME:-fortuning-ai}

# 更新发布脚本
sed -i "s/yourusername/$DOCKER_USER/g" "$(dirname "$0")/docker-publish.sh"
sed -i "s/yourusername/$DOCKER_USER/g" "$(dirname "$0")/../DOCKER.md"

echo ""
echo "📝 配置完成！"
echo ""
echo "下一步："
echo "  1. 构建并发布镜像: ./scripts/docker-publish.sh"
echo "  2. 或者指定版本: ./scripts/docker-publish.sh v1.0.0"
echo ""
echo "发布后用户可以这样使用："
echo "  docker run -p 3000:3000 -e AI_API_KEY=xxx $DOCKER_USER/$IMAGE_NAME:latest"
