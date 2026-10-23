# EchoMimic V2 Prebaked Clips

Pre-rendered video clips for common Aria actions.

## Generation

```bash
# From mneme backend (requires EchoMimic sidecar running)
./scripts/prebake_echo.sh --output-dir ../mneme-web/public/aria/echo_cache
```

## Clips

| File | Action | Emotion | Description |
|------|--------|---------|-------------|
| `coaching.mp4` | play_piano | focused | "Focus on the rhythm..." |
| `greeting.mp4` | speak | warm | "Hello, I'm Aria..." |
| `encourage.mp4` | speak | warm | "That was beautiful..." |
| `reflect.mp4` | think | gentle | "Take a breath..." |
| `praise.mp4` | speak | warm | "Wonderful! You're improving..." |

## Fallback

When no prebaked clips exist, the frontend falls back to:
1. Dynamic EchoDrive (TTS audio → real-time generation)
2. P2 simulated hands (SVG + GSAP)
3. Static person PNG
