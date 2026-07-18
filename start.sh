#!/bin/sh
# AskFate 容器启动脚本：
# 1) 启动计费 sidecar（纯 Node，监听 127.0.0.1:3100，内部仅容器可达）
# 2) 启动 Next.js standalone server（端口 3000，对外服务）
# 任一进程退出则整体退出，便于 CloudBase 健康检查与重启。
set -e

node /app/billing-service/index.mjs &
SIDECAR_PID=$!

# 等待 sidecar 就绪（最多约 15s），避免 Next 首请求时 sidecar 尚未监听
for i in $(seq 1 30); do
  if curl -sf -X POST http://127.0.0.1:3100/billing -H 'Content-Type: application/json' -d '{"op":"health"}' >/dev/null 2>&1; then
    echo "[start] billing-sidecar ready"
    break
  fi
  sleep 0.5
done

node /app/server.js &
NEXT_PID=$!

# 等待任一子进程退出
wait -n

# 收到退出信号，清理其余进程
kill "$SIDECAR_PID" "$NEXT_PID" 2>/dev/null || true
