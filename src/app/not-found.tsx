import Link from 'next/link';

/**
 * 404 —— 全站此前没有 not-found，未知路径会落到 Next 默认英文页。
 */
export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '60svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        textAlign: 'center',
        padding: '24px',
      }}
    >
      <div style={{ fontSize: '44px', lineHeight: 1 }} aria-hidden>
        🔍
      </div>
      <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--mn-ink)', margin: 0 }}>
        没找到这一页
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--mn-ink-3)', margin: 0, lineHeight: 1.7 }}>
        链接可能过期了，或者地址输入有误。
      </p>
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <Link href="/home" className="mn-btn-primary" style={{ textDecoration: 'none' }}>
          回今日首页
        </Link>
        <Link href="/subjects" className="mn-btn-secondary" style={{ textDecoration: 'none' }}>
          去学科中心
        </Link>
      </div>
    </div>
  );
}
