'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DocumentViewer } from '@/components/reader/DocumentViewer';
import { HighlightPanel } from '@/components/reader/HighlightPanel';
import {
  listHighlights, listReadingNotes,
  type TextbookFile, type HighlightItem, type ReadingNoteItem,
} from '@/lib/reader-api';
import { getTextbookFileMeta } from '@/lib/api-client';

// ── 知识点占位栏 ────────────────────────────────────────────

function KuSidebar() {
  return (
    <div style={{
      height: '100%', overflowY: 'auto',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        padding: '14px 16px 10px',
        borderBottom: '1px solid var(--mn-border)',
        flexShrink: 0,
      }}>
        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--mn-ink)' }}>知识点</div>
        <div style={{ fontSize: '11px', color: 'var(--mn-ink-3)', marginTop: '2px' }}>
          按章节对应知识单元
        </div>
      </div>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '28px', marginBottom: '12px', opacity: 0.3 }}>◑</div>
        <div style={{ fontSize: '13px', color: 'var(--mn-ink-3)', lineHeight: 1.6 }}>
          知识点列表建设中<br />敬请期待
        </div>
        <div style={{
          marginTop: '16px', fontSize: '11px', color: 'var(--mn-ink-3)',
          background: 'var(--mn-surface-2)', borderRadius: '8px',
          padding: '8px 12px', border: '1px solid var(--mn-border)',
        }}>
          未来: 点击知识点<br />自动跳转对应页码
        </div>
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

  // 初始化:获取文件元数据 + 高亮 + 笔记
  useEffect(() => {
    (async () => {
      try {
        const [metaRes, hs, ns] = await Promise.all([
          getTextbookFileMeta(fileId),
          listHighlights(fileId),
          listReadingNotes(fileId),
        ]);
        const f: TextbookFile | null = metaRes.ok ? {
          file_id: metaRes.data.file_id,
          filename: metaRes.data.filename,
          file_type: metaRes.data.file_type,
          file_size: metaRes.data.file_size,
          uploaded_at: metaRes.data.uploaded_at,
          textbook_id: metaRes.data.textbook_id,
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

  const handleHighlightsChange = useCallback((hs: HighlightItem[]) => {
    setHighlights(hs);
  }, []);

  const handleHighlightDelete = useCallback((id: string) => {
    setHighlights(prev => prev.filter(h => h.id !== id));
  }, []);

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
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '0 16px',
        background: 'rgba(248,246,242,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--mn-border)',
        zIndex: 30,
      }}>
        <button
          onClick={() => router.back()}
          style={{
            fontSize: '20px', color: 'var(--mn-blue)', background: 'none',
            border: 'none', cursor: 'pointer', lineHeight: 1, padding: '4px 0',
          }}
        >‹</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '14px', fontWeight: 700, color: 'var(--mn-ink)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{file.filename}</div>
        </div>
        <span style={{
          fontSize: '10px', fontWeight: 600, padding: '2px 7px',
          borderRadius: '99px', background: 'var(--mn-blue-dim)', color: 'var(--mn-blue)',
          flexShrink: 0, textTransform: 'uppercase',
        }}>{file.file_type}</span>
      </header>

      {/* Body — desktop 3 columns, mobile single + tab switcher */}

      {/* ── Desktop layout (≥768px) ── */}
      <div className="reader-desktop-layout" style={{ flex: 1, overflow: 'hidden', display: 'none' }}>
        {/* left: KU list */}
        <div style={{
          width: '200px', flexShrink: 0, borderRight: '1px solid var(--mn-border)',
          background: 'var(--mn-surface)', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}>
          <KuSidebar />
        </div>
        {/* center: viewer */}
        <div style={{ flex: 1, overflow: 'hidden', padding: '12px' }}>
          {readerEl}
        </div>
        {/* right: highlights + notes */}
        <div style={{
          width: '280px', flexShrink: 0, borderLeft: '1px solid var(--mn-border)',
          background: 'var(--mn-surface)', overflow: 'hidden',
        }}>
          <HighlightPanel
            fileId={fileId}
            highlights={highlights}
            notes={notes}
            onHighlightDelete={handleHighlightDelete}
            onNotesChange={setNotes}
          />
        </div>
      </div>

      {/* ── Mobile layout (<768px) ── */}
      <div className="reader-mobile-layout" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Content area */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {mobileTab === 'ku'     && <KuSidebar />}
          {mobileTab === 'reader' && <div style={{ height: '100%', padding: '8px' }}>{readerEl}</div>}
          {mobileTab === 'notes'  && (
            <HighlightPanel
              fileId={fileId}
              highlights={highlights}
              notes={notes}
              onHighlightDelete={handleHighlightDelete}
              onNotesChange={setNotes}
            />
          )}
        </div>
        {/* Mobile tab bar */}
        <nav style={{
          display: 'flex', borderTop: '1px solid var(--mn-border)',
          background: 'rgba(248,246,242,0.97)',
          paddingBottom: 'env(safe-area-inset-bottom, 4px)',
          flexShrink: 0,
        }}>
          {MOBILE_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setMobileTab(tab.id)}
              style={{
                flex: 1, padding: '10px 4px 8px', border: 'none', background: 'none',
                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '3px',
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
