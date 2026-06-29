'use client';

export default function DictionaryPage() {
  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '40px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#374151', margin: 0 }}>字词典</h1>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: '4px 0 0' }}>成语 · 文化常识 · 汉字检索</p>
        </div>
        <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 20, background: '#f3f4f6', color: '#6b7280', fontWeight: 500, marginTop: 4 }}>建设中</span>
      </div>

      <div style={{ marginBottom: 32 }}>
        <div style={{ position: 'relative' }}>
          <input
            disabled
            placeholder="搜索汉字、成语、文化常识…"
            style={{ width: '100%', boxSizing: 'border-box', fontSize: 14, border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px 44px 12px 16px', background: '#f9fafb', color: '#9ca3af', cursor: 'not-allowed' }}
          />
          <span style={{ position: 'absolute', right: 14, top: 12, fontSize: 18, color: '#d1d5db' }}>🔍</span>
        </div>
      </div>

      {[
        { icon: '📝', title: '成语词典', desc: '1500+ 常用成语，含出处·典故·近义辨析' },
        { icon: '🏛️', title: '文化常识库', desc: '古代官制·礼仪·天文·地理全覆盖' },
        { icon: '字', title: '汉字字源', desc: '字形演变、部首拆分、六书分析' },
        { icon: '📜', title: '文言虚词手册', desc: '18个高考必考虚词，例句精讲' },
      ].map(item => (
        <div
          key={item.title}
          style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16, borderRadius: 12, border: '1px dashed #e5e7eb', background: '#f9fafb', opacity: 0.6, marginBottom: 12 }}
        >
          <span style={{ fontSize: 20, width: 32, textAlign: 'center' }}>{item.icon}</span>
          <div>
            <p style={{ fontSize: 14, fontWeight: 500, color: '#6b7280', margin: 0 }}>{item.title}</p>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>{item.desc}</p>
          </div>
        </div>
      ))}

      <div style={{ marginTop: 32, padding: 16, background: '#f9fafb', borderRadius: 12, border: '1px solid #f3f4f6', fontSize: 12, color: '#9ca3af', textAlign: 'center', lineHeight: 1.8 }}>
        字词典模块正在建设中，数据接入完成后上线。
        <br />
        现有约 7700 个知识点可在{' '}
        <a href="/subjects/chinese/lesson" style={{ color: '#d97706', textDecoration: 'underline' }}>知识体系</a>
        {' '}中查阅。
      </div>
    </div>
  );
}
