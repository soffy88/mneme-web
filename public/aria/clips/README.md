# Aria clip 池

| 文件 | 用途 |
|------|------|
| `playing_00.jpg` … `playing_02.jpg` | 弹琴静图池（无 mp4 时轮播） |
| `playing_loop.mp4` | **默认弹琴主视觉**（ffmpeg Ken Burns 三机位合成 ~8s） |
| `conversation_breathe.mp4` | 对话态缓慢推镜 |

## 替换成真 OmniHuman / Echo 片

把导出的短片覆盖同名文件即可，或设环境变量：

- `ARIA_CLIP_PLAYING_URL`
- `ARIA_CLIP_TALK_URL`

## 本地重建 Ken Burns（无 GPU 视频 API 时）

```bash
# 见 scripts 或历史：三张 still → zoompan → xfade → playing_loop.mp4
```
