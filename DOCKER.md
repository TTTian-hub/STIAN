# 🐳 Docker 部署指南

## 快速开始（用户只需 3 步）

### 1. 安装 Docker

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
```

**CentOS/RHEL/OpenCloudOS:**
```bash
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
```

**macOS/Windows:**
下载 [Docker Desktop](https://www.docker.com/products/docker-desktop)

### 2. 一键运行

```bash
# 拉取并运行（替换 your_api_key 为你的 AI API Key）
docker run -d \
  --name fortuning-ai \
  -p 3000:3000 \
  -e AI_API_KEY=your_api_key \
  -e AI_PROVIDER=kimi \
  -e AI_BASE_URL=https://api.moonshot.cn/v1 \
  --restart unless-stopped \
  Tempo1221/fortuning-ai:latest
```

### 3. 访问应用

打开浏览器访问: http://localhost:3000

---

## 常用命令

```bash
# 查看运行状态
docker ps

# 查看日志
docker logs -f fortuning-ai

# 停止服务
docker stop fortuning-ai

# 重启服务
docker restart fortuning-ai

# 删除容器
docker rm -f fortuning-ai
```

---

## 环境变量配置

| 变量名 | 必填 | 说明 | 默认值 |
|--------|------|------|--------|
| `AI_API_KEY` | ✅ | AI 服务的 API Key | - |
| `AI_PROVIDER` | ❌ | AI 提供商 | `kimi` |
| `AI_BASE_URL` | ❌ | API 基础 URL | `https://api.moonshot.cn/v1` |

### 支持的 AI 提供商

- **Kimi (Moonshot)** - 默认
- **OpenAI** - 设置 `AI_PROVIDER=openai`
- **自定义** - 设置 `AI_PROVIDER=custom` 和对应的 `AI_BASE_URL`

---

## Docker Compose 方式（推荐）

创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  fortuning-ai:
    image: Tempo1221/fortuning-ai:latest
    ports:
      - "3000:3000"
    environment:
      - AI_API_KEY=${AI_API_KEY}
      - AI_PROVIDER=${AI_PROVIDER:-kimi}
      - AI_BASE_URL=${AI_BASE_URL:-https://api.moonshot.cn/v1}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

运行:
```bash
# 创建 .env 文件
echo "AI_API_KEY=your_api_key" > .env

# 启动
docker-compose up -d

# 查看日志
docker-compose logs -f
```

---

## 构建自己的镜像

```bash
# 克隆仓库
git clone https://github.com/yourusername/fortuning-ai.git
cd fortuning-ai

# 构建镜像
docker build -t fortuning-ai:local .

# 本地运行
docker run -p 3000:3000 -e AI_API_KEY=your_key fortuning-ai:local
```

---

## 故障排除

### 端口被占用
```bash
# 更换端口映射（主机 8080 映射到容器 3000）
docker run -p 8080:3000 ...
```

### 查看详细日志
```bash
docker logs fortuning-ai 2>&1 | tail -100
```

### 进入容器调试
```bash
docker exec -it fortuning-ai sh
```

---

## 更新到最新版本

```bash
# 拉取最新镜像
docker pull Tempo1221/fortuning-ai:latest

# 停止并删除旧容器
docker stop fortuning-ai && docker rm fortuning-ai

# 用新镜像启动
docker run -d \
  --name fortuning-ai \
  -p 3000:3000 \
  -e AI_API_KEY=your_api_key \
  --restart unless-stopped \
  Tempo1221/fortuning-ai:latest
```

或者使用 Docker Compose:
```bash
docker-compose pull
docker-compose up -d
```
