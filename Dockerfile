# ── Mneme Web — 多阶段构建 ──────────────────────────────
# 参考 aegis-console 部署方式,output: standalone

# 1. 依赖安装
FROM node:20-slim AS deps
WORKDIR /app
# vendor tarball 必须在 install 前就位(file: 依赖)
COPY package.json ./
COPY vendor ./vendor
RUN npm install --no-audit --no-fund

# 2. 构建
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/vendor ./vendor
COPY . .
# 生产构建(读 .env.production)
ENV NODE_ENV=production
RUN npm run build

# 3. 运行(standalone 自包含)
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# 非 root 用户
RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs nextjs
# standalone 产出
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
