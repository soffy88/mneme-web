'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DocumentViewer } from '@/components/reader/DocumentViewer';
import { HighlightPanel } from '@/components/reader/HighlightPanel';
import {
  listHighlights, listReadingNotes,
  type TextbookFile, type HighlightItem, type ReadingNoteItem,
} from '@/lib/reader-api';
import {
  getTextbookFileMeta, listKnowledgePoints, startSocraticForKu, getKnowledgePoint,
} from '@/lib/api-client';
import { RichContentView } from '@/components/student/RichContentView';
import { getUserId } from '@/lib/auth-store';
import type { KnowledgeUnitItem } from '@/types/api';

// ── 掌握度 ────────────────────────────────────────────────────

const MC: Record<string, string> = {
  green: '#34c759', yellow: '#ff9500', red: '#ff3b30', unknown: '#c7c7cc',
};
const ML: Record<string, string> = {
  green: '已掌握', yellow: '学习中', red: '待加强', unknown: '未学习',
};

// ── KU 详情面板 ────────────────────────────────────────────────

function KuDetail({ ku, onBack }: { ku: KnowledgeUnitItem; onBack: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [richContent, setRichContent] = useState<Record<string, string | string[]> | null>(null);
  const studentId = getUserId();
  const pct = ku.p_mastery !== null ? Math.round((ku.p_mastery ?? 0) * 100) : null;

  useEffect(() => {
    getKnowledgePoint(ku.id, studentId ?? undefined)
      .then(d => { if (d.ok && d.data.rich_content) setRichContent(d.data.rich_content as Record<string, string | string[]>); })
      .catch(() => {});
  }, [ku.id, studentId]);

  const handleSocratic = async () => {
    if (!studentId) { router.push('/login'); return; }
    setLoading(true);
    const res = await startSocraticForKu(ku.id, studentId);
    setLoading(false);
    if (!res.ok) { alert('无法启动引导'); return; }
    router.push(`/socratic?session_id=${res.data.session_id}&first_q=${encodeURIComponent(res.data.first_question)}`);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      {/* header */}
      <div style={{
        padding: '10px 12px', borderBottom: '1px solid var(--mn-border)',
        display: 'flex', gap: '6px', alignItems: 'flex-start', flexShrink: 0,
        background: 'var(--mn-surface)',
      }}>
        <button onClick={onBack} style={{
          fontSize: '17px', color: 'var(--mn-blue)', background: 'none',
          border: 'none', cursor: 'pointer', flexShrink: 0, lineHeight: 1, paddingTop: '1px',
        }}>‹</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--mn-ink)', lineHeight: 1.4 }}>
            {ku.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: MC[ku.mastery_color] }} />
            <span style={{ fontSize: '10px', color: 'var(--mn-ink-3)' }}>
              {ML[ku.mastery_color]}{pct !== null ? ` · ${pct}%` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* body */}
      <div style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {ku.description && (
          <p style={{ fontSize: '11px', color: 'var(--mn-ink)', lineHeight: 1.65, margin: 0 }}>
            {ku.description}
          </p>
        )}

        {/* 难度 + 考频 */}
        <div style={{ display: 'flex', gap: '5px' }}>
          {[
            { label: '难度', value: ku.difficulty < 0.4 ? '易' : ku.difficulty < 0.7 ? '中' : '难' },
            { label: '考频', value: ({ low: '低', mid: '中', high: '高' } as Record<string, string>)[ku.exam_frequency] ?? '-' },
          ].map(({ label, value }) => (
            <div key={label} style={{
              flex: 1, padding: '6px 0', textAlign: 'center',
              background: 'var(--mn-surface)', borderRadius: '6px',
              border: '1px solid var(--mn-border)',
            }}>
              <div style={{ fontSize: '9px', color: 'var(--mn-ink-3)', fontWeight: 600 }}>{label}</div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--mn-ink)' }}>{value}</div>
            </div>
          ))}
        </div>

        {richContent && (
          <div style={{ marginTop: 2 }}>
            <RichContentView kuType={ku.ku_type} richContent={richContent} />
          </div>
        )}

        {/* 操作 */}
        <button
          onClick={() => router.push(ku.subject === 'math'
            ? `/subjects/math/practice?ku_id=${encodeURIComponent(ku.id)}`
            : `/practice?subject=${ku.subject}`)}
          style={{
            width: '100%', padding: '9px 10px', borderRadius: '8px',
            background: 'var(--mn-green)', border: 'none',
            fontSize: '12px', fontWeight: 700, color: '#fff',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
          }}>
          ✏️ 做几道题
        </button>

        <button
          onClick={handleSocratic}
          disabled={loading}
          style={{
            width: '100%', padding: '9px 10px', borderRadius: '8px',
            background: 'var(--mn-blue-dim)', border: '1px solid var(--mn-blue)',
            fontSize: '12px', fontWeight: 600, color: 'var(--mn-blue)',
            cursor: loading ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
          💡 {loading ? '启动中…' : '不懂问一问'}
        </button>
      </div>
    </div>
  );
}

// ── 簇分组 ────────────────────────────────────────────────────

function ClusterGroup({ name, kus, onSelect }: {
  name: string; kus: KnowledgeUnitItem[];
  onSelect: (ku: KnowledgeUnitItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const green = kus.filter(k => k.mastery_color === 'green').length;
  return (
    <div style={{ borderBottom: '1px solid var(--mn-border)' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '8px 12px', cursor: 'pointer',
          background: 'var(--mn-surface)',
          position: 'sticky', top: 0, zIndex: 2,
        }}
      >
        <span style={{
          fontSize: '10px', color: 'var(--mn-ink-3)',
          transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
          display: 'inline-block', transition: 'transform 0.15s', flexShrink: 0,
        }}>▾</span>
        <span style={{
          flex: 1, fontSize: '11px', fontWeight: 700, color: 'var(--mn-ink)',
          lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{name}</span>
        <span style={{ fontSize: '9px', color: 'var(--mn-ink-3)', flexShrink: 0 }}>
          {green}/{kus.length}
        </span>
      </div>
      {open && kus.map(ku => (
        <div
          key={ku.id}
          onClick={() => onSelect(ku)}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '6px 12px 6px 26px',
            cursor: 'pointer', borderBottom: '1px solid var(--mn-border)',
            transition: 'background 0.1s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--mn-blue-dim)')}
          onMouseLeave={e => (e.currentTarget.style.background = '')}
        >
          <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: MC[ku.mastery_color] }} />
          <span style={{
            fontSize: '12px', color: 'var(--mn-ink)', lineHeight: 1.4,
            flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{ku.name}</span>
        </div>
      ))}
    </div>
  );
}

// ── 知识点侧栏 ─────────────────────────────────────────────────

function KuSidebar({ textbookId }: { textbookId: string | null }) {
  const [kus,      setKus]      = useState<KnowledgeUnitItem[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [selected, setSelected] = useState<KnowledgeUnitItem | null>(null);
  const studentId = getUserId();

  useEffect(() => {
    if (!textbookId) return;
    setLoading(true);
    listKnowledgePoints({ textbook_id: textbookId, student_id: studentId ?? undefined })
      .then(res => { if (res.ok) setKus(res.data); })
      .finally(() => setLoading(false));
  }, [textbookId, studentId]);

  if (selected) {
    return <KuDetail ku={selected} onBack={() => setSelected(null)} />;
  }

  // 按簇分组
  const clusterMap = new Map<string, { name: string; order: number; kus: KnowledgeUnitItem[] }>();
  for (const ku of kus) {
    if (!clusterMap.has(ku.cluster_id)) {
      clusterMap.set(ku.cluster_id, { name: ku.cluster_name, order: ku.cluster_order, kus: [] });
    }
    clusterMap.get(ku.cluster_id)!.kus.push(ku);
  }
  const clusters = [...clusterMap.values()].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'zh'));

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '12px 12px 8px', borderBottom: '1px solid var(--mn-border)', flexShrink: 0,
      }}>
        <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--mn-ink)' }}>知识点</div>
        <div style={{ fontSize: '10px', color: 'var(--mn-ink-3)', marginTop: '1px' }}>
          {loading ? '加载中…' : !textbookId ? '无关联教材' : `${kus.length} 个`}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {!textbookId ? (
          <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--mn-ink-3)', fontSize: '11px', lineHeight: 1.6 }}>
            此文件未关联<br />平台教材
          </div>
        ) : loading ? (
          <div style={{ padding: '24px 12px', textAlign: 'center' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="mn-skeleton" style={{ height: '32px', borderRadius: '6px', marginBottom: '6px' }} />
            ))}
          </div>
        ) : kus.length === 0 ? (
          <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--mn-ink-3)', fontSize: '11px' }}>
            暂无知识点数据
          </div>
        ) : (
          clusters.map(c => (
            <ClusterGroup key={c.name} name={c.name} kus={c.kus} onSelect={setSelected} />
          ))
        )}
      </div>
    </div>
  );
}

// ── 移动端 Tab ─────────────────────────────────────────────

type MobileTab = 'ku' | 'reader' | 'notes';

const MOBILE_TABS: { id: MobileTab; label: string; icon: string }[] = [
  { id: 'ku',     label: '知识点', icon: '◑' },
  { id: 'reader', label: '阅读',   icon: '◎' },
  { id: 'notes',  label: '笔记',   icon: '✐' },
];

// ── Main Page ──────────────────────────────────────────────

export default function ReaderPage() {
  const params = useParams();
  const router = useRouter();
  const fileId = params.fileId as string;

  const [file,       setFile]       = useState<TextbookFile | null>(null);
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [notes,      setNotes]      = useState<ReadingNoteItem[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [mobileTab,  setMobileTab]  = useState<MobileTab>('reader');

  useEffect(() => {
    (async () => {
      try {
        const [metaRes, hs, ns] = await Promise.all([
          getTextbookFileMeta(fileId),
          listHighlights(fileId),
          listReadingNotes(fileId),
        ]);
        const f: TextbookFile | null = metaRes.ok ? {
          file_id:          metaRes.data.file_id,
          filename:         metaRes.data.filename,
          file_type:        metaRes.data.file_type,
          file_size:        metaRes.data.file_size,
          uploaded_at:      metaRes.data.uploaded_at,
          textbook_id:      metaRes.data.textbook_id,
          owner_student_id: metaRes.data.owner_student_id,
        } : null;
        setFile(f);
        setHighlights(hs);
        setNotes(ns);
      } finally {
        setLoading(false);
      }
    })();
  }, [fileId]);

  const handleHighlightsChange = useCallback((hs: HighlightItem[]) => setHighlights(hs), []);
  const handleHighlightDelete  = useCallback((id: string) => setHighlights(prev => prev.filter(h => h.id !== id)), []);

  if (loading) {
    return (
      <div style={{ height: '100svh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--mn-paper)' }}>
        <div style={{ color: 'var(--mn-ink-3)', fontSize: '14px' }}>加载中…</div>
      </div>
    );
  }

  if (!file) {
    return (
      <div style={{ height: '100svh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--mn-paper)' }}>
        <div style={{ fontSize: '14px', color: 'var(--mn-ink-3)', marginBottom: '16px' }}>文件不存在或无访问权限</div>
        <button onClick={() => router.back()} style={{ fontSize: '13px', color: 'var(--mn-blue)', background: 'none', border: 'none', cursor: 'pointer' }}>← 返回</button>
      </div>
    );
  }

  const readerEl = (
    <DocumentViewer
      fileId={file.file_id}
      fileType={file.file_type}
      filename={file.filename}
      fileSize={file.file_size}
      onHighlightsChange={handleHighlightsChange}
    />
  );

  return (
    <div style={{ height: '100svh', display: 'flex', flexDirection: 'column', background: 'var(--mn-paper)', overflow: 'hidden' }}>

      {/* Top bar */}
      <header style={{
        height: '48px', flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: '12px', padding: '0 16px',
        background: 'rgba(248,246,242,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--mn-border)', zIndex: 30,
      }}>
        <button onClick={() => router.back()} style={{
          fontSize: '20px', color: 'var(--mn-blue)', background: 'none',
          border: 'none', cursor: 'pointer', lineHeight: 1, padding: '4px 0',
        }}>‹</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '14px', fontWeight: 700, color: 'var(--mn-ink)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{file.filename}</div>
        </div>
        <span style={{
          fontSize: '10px', fontWeight: 600, padding: '2px 7px', borderRadius: '99px',
          background: 'var(--mn-blue-dim)', color: 'var(--mn-blue)',
          flexShrink: 0, textTransform: 'uppercase',
        }}>{file.file_type}</span>
      </header>

      {/* ── Desktop layout (≥768px) ── */}
      <div className="reader-desktop-layout" style={{ flex: 1, overflow: 'hidden', display: 'none' }}>
        <div style={{
          width: '200px', flexShrink: 0, borderRight: '1px solid var(--mn-border)',
          background: 'var(--mn-surface)', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}>
          <KuSidebar textbookId={file.textbook_id} />
        </div>
        <div style={{ flex: 1, overflow: 'hidden', padding: '12px' }}>
          {readerEl}
        </div>
        <div style={{
          width: '280px', flexShrink: 0, borderLeft: '1px solid var(--mn-border)',
          background: 'var(--mn-surface)', overflow: 'hidden',
        }}>
          <HighlightPanel
            fileId={fileId} highlights={highlights} notes={notes}
            onHighlightDelete={handleHighlightDelete} onNotesChange={setNotes}
          />
        </div>
      </div>

      {/* ── Mobile layout (<768px) ── */}
      <div className="reader-mobile-layout" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {mobileTab === 'ku'     && <KuSidebar textbookId={file.textbook_id} />}
          {mobileTab === 'reader' && <div style={{ height: '100%', padding: '8px' }}>{readerEl}</div>}
          {mobileTab === 'notes'  && (
            <HighlightPanel
              fileId={fileId} highlights={highlights} notes={notes}
              onHighlightDelete={handleHighlightDelete} onNotesChange={setNotes}
            />
          )}
        </div>
        <nav style={{
          display: 'flex', borderTop: '1px solid var(--mn-border)',
          background: 'rgba(248,246,242,0.97)',
          paddingBottom: 'env(safe-area-inset-bottom, 4px)', flexShrink: 0,
        }}>
          {MOBILE_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setMobileTab(tab.id)}
              style={{
                flex: 1, padding: '10px 4px 8px', border: 'none', background: 'none',
                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px',
                color: mobileTab === tab.id ? 'var(--mn-blue)' : 'var(--mn-ink-3)',
              }}
            >
              <span style={{ fontSize: '18px', lineHeight: 1 }}>{tab.icon}</span>
              <span style={{ fontSize: '10px', fontWeight: mobileTab === tab.id ? 700 : 400 }}>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .reader-desktop-layout { display: flex !important; }
          .reader-mobile-layout  { display: none !important; }
        }
      `}</style>
    </div>
  );
}
