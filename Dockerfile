# Multi-stage build for Next.js application

# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
# 公网部署默认走 DeepSeek：CodeBuddy 依赖腾讯内网网关，公网/容器环境连不到，
# 故镜像默认用 DeepSeek 公网直连；可在 CloudBase「服务环境变量」覆盖为其它 provider。
ENV AI_PROVIDER deepseek

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files (Next.js standalone output).
# 关键修复：@cloudbase/node-sdk 通过 next.config 的 serverExternalPackages 声明为
# 外部包，Next 构建时会将其与 ws 等依赖一并复制进 .next/standalone/node_modules，
# 因此 standalone 运行包已包含云数据库 SDK，无需复制完整 node_modules。
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# 计费 sidecar（独立纯 Node 进程，规避 SDK 与 Next 运行时全局流冲突）
# 仅为其安装 @cloudbase/node-sdk —— standalone 的 nft 追踪不到该动态依赖，
# 故让 sidecar 自带 node_modules，不污染 Next 的精简 standalone 包。
COPY --from=builder --chown=nextjs:nodejs /app/billing-service/index.mjs ./billing-service/index.mjs
COPY --from=builder --chown=nextjs:nodejs /app/billing-service/billing.impl.mjs ./billing-service/billing.impl.mjs
COPY --from=builder --chown=nextjs:nodejs /app/billing-service/package.json ./billing-service/package.json
RUN cd /app/billing-service && npm install --omit=dev --no-audit --no-fund

COPY --from=builder --chown=nextjs:nodejs /app/start.sh ./start.sh
RUN chmod +x ./start.sh

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
ENV BILLING_PORT 3100
ENV BILLING_HOST 127.0.0.1

# 同时拉起 sidecar 与 Next
CMD ["sh", "start.sh"]
