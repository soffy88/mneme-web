# ── Mneme Web — 多阶段构建 ──────────────────────────────
# 参考 aegis-console 部署方式, output: standalone

# 1. 依赖安装
FROM node:20-slim AS deps
WORKDIR /app
# vendor tarball 必须在 install 前就位 (file: 依赖)
COPY package.json package-lock.json ./
COPY vendor ./vendor
# 完整装依赖（含 lightningcss 平台包），但 --ignore-scripts 跳过
# pdfjs optional canvas 的 node-gyp 编译（slim 上会卡死十几分钟）。
ENV npm_config_build_from_source=false
RUN npm ci --no-audit --no-fund --ignore-scripts --legacy-peer-deps

# 2. 构建
FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/vendor ./vendor
COPY . .
ARG NEXT_PUBLIC_MNEME_ENV=production
# 注意: 这个 ARG 默认值会 ENV 覆盖 .env.production(Next 的 dotenv 不覆盖已存在的
# process.env), 所以它才是真正被内联进 bundle 的值 —— 必须和 .env.production 一致。
ARG NEXT_PUBLIC_API_BASE=https://sxueji.com
ENV NEXT_PUBLIC_MNEME_ENV=${NEXT_PUBLIC_MNEME_ENV}
ENV NEXT_PUBLIC_API_BASE=${NEXT_PUBLIC_API_BASE}
ENV NODE_ENV=production
RUN test -n "$NEXT_PUBLIC_API_BASE" && npm run build

# 3. 运行 (standalone 自包含)
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
