#!/bin/bash

# Docker 镜像构建和发布脚本
# 用法: ./scripts/docker-publish.sh [版本号]

set -e

# 配置
DOCKER_USERNAME="${DOCKER_USERNAME:-Tempo1221}"
IMAGE_NAME="fortuning-ai"
VERSION="${1:-latest}"

# 完整镜像名
FULL_IMAGE_NAME="$DOCKER_USERNAME/$IMAGE_NAME:$VERSION"

echo "🚀 开始构建 Docker 镜像..."
echo "📦 镜像名称: $FULL_IMAGE_NAME"

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 检查是否登录 Docker Hub
if ! docker info | grep -q "Username"; then
    echo "⚠️  请先登录 Docker Hub:"
    echo "   docker login"
    exit 1
fi

# 构建镜像
echo "🔨 构建镜像..."
docker build -t "$IMAGE_NAME:$VERSION" .

# 打标签
echo "🏷️  打标签..."
docker tag "$IMAGE_NAME:$VERSION" "$FULL_IMAGE_NAME"

# 同时打 latest 标签（如果不是 latest 版本）
if [ "$VERSION" != "latest" ]; then
    echo "🏷️  同时标记为 latest..."
    docker tag "$IMAGE_NAME:$VERSION" "$DOCKER_USERNAME/$IMAGE_NAME:latest"
fi

# 推送到 Docker Hub
echo "📤 推送到 Docker Hub..."
docker push "$FULL_IMAGE_NAME"
if [ "$VERSION" != "latest" ]; then
    docker push "$DOCKER_USERNAME/$IMAGE_NAME:latest"
fi

echo "✅ 发布成功!"
echo ""
echo "📝 用户使用方式:"
echo ""
echo "   # 一键运行（最简单）"
echo "   docker run -d \\"
echo "     --name fortuning-ai \\"
echo "     -p 3000:3000 \\"
echo "     -e AI_API_KEY=your_api_key \\"
echo "     -e AI_PROVIDER=kimi \\"
echo "     --restart unless-stopped \\"
echo "     $FULL_IMAGE_NAME"
echo ""
echo "   # 或者使用 Docker Compose"
echo "   # 参考 DOCKER.md 获取完整配置"
echo ""
echo "🔗 Docker Hub 地址:"
echo "   https://hub.docker.com/r/$DOCKER_USERNAME/$IMAGE_NAME"
