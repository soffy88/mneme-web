# mneme-web 生产发布 · 康奈尔对接（2026-07-28）

## 原因

- 源码已有 `/subjects/math/cornell` + 云同步 API 客户端
- 生产镜像创建于 2026-07-20，**未含康奈尔** → `sxueji.com/.../cornell` 404
- 后端 `api.sxueji.com` 康奈尔路由已就绪

## 步骤

```bash
cd /data/soffy/projects/mneme-web
# 构建期读 .env.production → NEXT_PUBLIC_API_BASE=https://api.sxueji.com
docker compose build mneme-web
docker compose up -d mneme-web
```

## 验收

| 检查 | 期望 |
|------|------|
| `curl -sI http://127.0.0.1:3300/subjects/math/cornell` | 200 |
| `curl -sI https://sxueji.com/subjects/math/cornell` | 200 |
| 数学学科页有「康奈尔笔记」卡片 | 可见 |
| 登录后打开勾股定理 → 同步 → 推云 | 200，非 404 |

## 回滚

```bash
# 若有旧 image id：docker tag <old> mneme-web:latest && docker compose up -d
docker image ls mneme-web
```
