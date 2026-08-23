'use client';

/**
 * 根级错误边界（必须自含 <html>/<body>，因为根布局本身可能已崩）。
 * 只在「连壳都渲染不出来」时出现；能救的都由 src/app/error.tsx 先接住。
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
      <body
        style={{
          margin: 0,
          minHeight: '100svh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          textAlign: 'center',
          padding: '24px',
          background: '#f8f6f2',
          color: '#1a1814',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
        }}
      >
        <div style={{ fontSize: '48px', lineHeight: 1 }} aria-hidden>
          🫧
        </div>
        <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0 }}>善学记暂时开了个小差</h1>
        <p style={{ fontSize: '14px', color: '#8a837a', margin: 0, maxWidth: '340px', lineHeight: 1.7 }}>
          你的学习档案是安全的。刷新页面通常会好；如果还不行，稍后再来。
        </p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: '12px 22px',
              borderRadius: '12px',
              border: 'none',
              background: '#1e3a5f',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            再试一次
          </button>
          <button
            type="button"
            onClick={() => {
              window.location.reload();
            }}
            style={{
              padding: '12px 22px',
              borderRadius: '12px',
              border: '1.5px solid #d0c8be',
              background: '#fff',
              color: '#1a1814',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            刷新页面
          </button>
        </div>
      </body>
    </html>
  );
}
