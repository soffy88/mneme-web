'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  listTextbookFiles,
  uploadTextbookFile,
  type TextbookFile,
} from '@/lib/reader-api';

const FILE_ICONS: Record<string, string> = { pdf: '📄', epub: '📖' };

function FileCard({ file, onClick }: { file: TextbookFile; onClick: () => void }) {
  const sizeLabel = file.file_size
    ? file.file_size > 1024 * 1024
      ? `${(file.file_size / 1024 / 1024).toFixed(1)} MB`
      : `${Math.round(file.file_size / 1024)} KB`
    : '';

  return (
    <button
      type="button"
      onClick={onClick}
      className="mn-card mn-card-interactive"
      style={{
        width: '100%', textAlign: 'left', padding: '14px 16px',
        display: 'flex', gap: '14px', alignItems: 'flex-start',
      }}
    >
      <div style={{
        width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
        background: 'var(--mn-blue-dim)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px',
      }}>
        {FILE_ICONS[file.file_type] ?? '📁'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '14px', fontWeight: 700, color: 'var(--mn-ink)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {file.filename}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--mn-ink-3)', marginTop: '3px', display: 'flex', gap: '8px' }}>
          <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{file.file_type}</span>
          {sizeLabel && <span>{sizeLabel}</span>}
          {!file.owner_student_id && (
            <span style={{ color: 'var(--mn-blue)', fontWeight: 600 }}>平台预置</span>
          )}
        </div>
      </div>
      <span style={{ color: 'var(--mn-ink-3)', fontSize: '18px', flexShrink: 0 }}>›</span>
    </button>
  );
}

export default function LibraryPage() {
  const router = useRouter();
  const [files,     setFiles]     = useState<TextbookFile[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [toast,     setToast]     = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadFiles = async () => {
    setLoading(true);
    try {
      const fs = await listTextbookFiles();
      setFiles(fs);
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFiles(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'epub'].includes(ext ?? '')) {
      showToast('仅支持 PDF / EPUB 格式');
      return;
    }
    setUploading(true);
    try {
      await uploadTextbookFile(file);
      showToast('上传成功！');
      loadFiles();
    } catch (e) {
      showToast(e instanceof Error ? e.message : '上传失败');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--mn-ink)' }}>
            教材库
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--mn-ink-3)', marginTop: '3px' }}>
            PDF / EPUB 教材，支持高亮和笔记
          </p>
        </div>
        <label style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '8px 14px', borderRadius: '8px',
          background: uploading ? 'var(--mn-border)' : 'var(--mn-blue)',
          color: '#fff', fontSize: '13px', fontWeight: 600,
          cursor: uploading ? 'default' : 'pointer',
          flexShrink: 0,
        }}>
          {uploading ? '上传中…' : '+ 上传'}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.epub"
            onChange={handleUpload}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: '8px',
          background: 'var(--mn-red-dim)', border: '1px solid var(--mn-red)',
          color: 'var(--mn-red)', fontSize: '13px',
        }}>
          {error}
        </div>
      )}

      {/* File list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="mn-skeleton" style={{ height: '68px', borderRadius: '12px' }} />
          ))}
        </div>
      ) : files.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 0',
          color: 'var(--mn-ink-3)', fontSize: '14px',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.3 }}>📚</div>
          还没有教材<br />
          <span style={{ fontSize: '12px' }}>上传 PDF/EPUB 开始阅读</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {files.map(f => (
            <FileCard
              key={f.file_id}
              file={f}
              onClick={() => router.push(`/reader/${f.file_id}`)}
            />
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
          background: 'var(--mn-ink)', color: '#fff',
          padding: '10px 20px', borderRadius: '20px',
          fontSize: '13px', fontWeight: 500, zIndex: 200,
          boxShadow: 'var(--mn-shadow-lg)',
          whiteSpace: 'nowrap',
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
