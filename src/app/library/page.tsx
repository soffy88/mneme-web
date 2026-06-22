'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  listLibraryTextbooks, listTextbookFiles, uploadTextbookFile,
  type LibrarySubject, type LibraryTextbook, type TextbookFile,
} from '@/lib/reader-api';

// ── 常量 ─────────────────────────────────────────────────────────────

const GRADE_SECTIONS = [
  { label: '小学', grades: ['G1','G2','G3','G4','G5','G6'] },
  { label: '初中', grades: ['G7','G8','G9'] },
  { label: '高中', grades: ['G10','G11','G12'] },
];

function gradeSection(grade: string): string {
  for (const s of GRADE_SECTIONS) {
    if (s.grades.some(g => grade.startsWith(g))) return s.label;
  }
  if (['高一','高二','高三'].some(g => grade.startsWith(g))) return '高中';
  if (['初一','初二','初三'].some(g => grade.startsWith(g))) return '初中';
  return '其他';
}

// ── 子组件 ────────────────────────────────────────────────────────────

function TextbookCard({ book, onClick }: { book: LibraryTextbook; onClick: () => void }) {
  const noText = book.has_text_layer === false;
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left',
        padding: '12px 14px', borderRadius: '10px',
        background: 'var(--mn-surface)',
        border: '1px solid var(--mn-border)',
        display: 'flex', alignItems: 'center', gap: '12px',
        cursor: 'pointer',
      }}
    >
      <div style={{
        width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
        background: 'var(--mn-blue-dim)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '17px',
      }}>
        📖
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '13px', fontWeight: 700, color: 'var(--mn-ink)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {book.book_name}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--mn-ink-3)', marginTop: '2px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span>{book.edition}</span>
          {noText && (
            <span style={{
              background: '#fff3e0',
              color: '#e65100',
              padding: '0 5px', borderRadius: '4px', fontWeight: 600,
            }}>
              仅供阅读
            </span>
          )}
        </div>
      </div>
      <span style={{
        flexShrink: 0, fontSize: '12px', fontWeight: 600,
        color: '#fff', background: 'var(--mn-blue)',
        padding: '4px 10px', borderRadius: '6px',
      }}>
        阅读
      </span>
    </button>
  );
}

function SubjectPanel({ subject, onRead }: { subject: LibrarySubject; onRead: (fileId: string) => void }) {
  const sections: Record<string, LibraryTextbook[]> = {};
  for (const book of subject.textbooks) {
    const sec = gradeSection(book.grade);
    if (!sections[sec]) sections[sec] = [];
    sections[sec].push(book);
  }
  const sectionOrder = ['小学', '初中', '高中', '其他'].filter(s => sections[s]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {sectionOrder.map(sec => (
        <div key={sec}>
          <div style={{
            fontSize: '11px', fontWeight: 700, color: 'var(--mn-ink-3)',
            letterSpacing: '0.06em',
            marginBottom: '8px', paddingLeft: '2px',
          }}>
            {sec} · {sections[sec].length} 册
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {sections[sec].map(book => (
              <TextbookCard key={book.file_id} book={book} onClick={() => onRead(book.file_id)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function UserFileCard({ file, onClick }: { file: TextbookFile; onClick: () => void }) {
  const sizeLabel = file.file_size
    ? file.file_size > 1024 * 1024
      ? `${(file.file_size / 1024 / 1024).toFixed(1)} MB`
      : `${Math.round(file.file_size / 1024)} KB`
    : '';
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left',
        padding: '12px 14px', borderRadius: '10px',
        background: 'var(--mn-surface)',
        border: '1px solid var(--mn-border)',
        display: 'flex', alignItems: 'center', gap: '12px',
        cursor: 'pointer',
      }}
    >
      <div style={{
        width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
        background: 'var(--mn-blue-dim)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '17px',
      }}>
        {file.file_type === 'epub' ? '📖' : '📄'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '13px', fontWeight: 700, color: 'var(--mn-ink)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {file.filename}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--mn-ink-3)', marginTop: '2px', display: 'flex', gap: '6px' }}>
          <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{file.file_type}</span>
          {sizeLabel && <span>{sizeLabel}</span>}
        </div>
      </div>
      <span style={{ color: 'var(--mn-ink-3)', fontSize: '18px', flexShrink: 0 }}>›</span>
    </button>
  );
}

// ── 主页 ────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const router = useRouter();
  const [subjects,   setSubjects]   = useState<LibrarySubject[]>([]);
  const [userFiles,  setUserFiles]  = useState<TextbookFile[]>([]);
  const [activeTab,  setActiveTab]  = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [uploading,  setUploading]  = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [toast,      setToast]      = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [lib, files] = await Promise.all([
          listLibraryTextbooks(),
          listTextbookFiles(),
        ]);
        setSubjects(lib.subjects.filter(s => s.textbooks.length > 0));
        setUserFiles(files);
      } catch (e) {
        setError(e instanceof Error ? e.message : '加载失败');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
      const files = await listTextbookFiles();
      setUserFiles(files);
    } catch (e) {
      showToast(e instanceof Error ? e.message : '上传失败');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const totalBooks = subjects.reduce((n, s) => n + s.textbooks.length, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--mn-ink)' }}>
          教材库
        </h1>
        <p style={{ fontSize: '12px', color: 'var(--mn-ink-3)', marginTop: '3px' }}>
          {loading ? '加载中…' : `${totalBooks} 本平台教材 · PDF 支持高亮和笔记`}
        </p>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: '8px',
          background: 'var(--mn-red-dim)', border: '1px solid var(--mn-red)',
          color: 'var(--mn-red)', fontSize: '13px',
        }}>
          {error}
        </div>
      )}

      {/* ── 平台教材 ── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="mn-skeleton" style={{ height: '60px', borderRadius: '10px' }} />
          ))}
        </div>
      ) : (
        <>
          {/* 学科 Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {subjects.map((s, i) => (
              <button
                key={s.subject}
                type="button"
                onClick={() => setActiveTab(i)}
                style={{
                  padding: '6px 14px', borderRadius: '20px',
                  fontSize: '13px', fontWeight: 600,
                  border: 'none', cursor: 'pointer',
                  background: activeTab === i ? 'var(--mn-blue)' : 'var(--mn-border)',
                  color: activeTab === i ? '#fff' : 'var(--mn-ink-2)',
                  transition: 'background 0.15s',
                }}
              >
                {s.name}
                <span style={{
                  marginLeft: '5px', fontSize: '11px',
                  opacity: activeTab === i ? 0.85 : 0.6,
                }}>
                  {s.textbooks.length}
                </span>
              </button>
            ))}
          </div>

          {/* 当前学科面板 */}
          {subjects[activeTab] && (
            <SubjectPanel
              subject={subjects[activeTab]}
              onRead={(fileId) => router.push(`/reader/${fileId}`)}
            />
          )}
        </>
      )}

      {/* ── 我的资料 ── */}
      <div style={{
        borderTop: '1px solid var(--mn-border)',
        paddingTop: '20px',
        display: 'flex', flexDirection: 'column', gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--mn-ink)' }}>我的资料</div>
            <div style={{ fontSize: '11px', color: 'var(--mn-ink-3)', marginTop: '2px' }}>
              自己上传的 PDF / EPUB
            </div>
          </div>
          <label style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '7px 14px', borderRadius: '8px',
            background: uploading ? 'var(--mn-border)' : 'var(--mn-blue)',
            color: '#fff', fontSize: '13px', fontWeight: 600,
            cursor: uploading ? 'default' : 'pointer', flexShrink: 0,
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

        {userFiles.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '28px 0',
            color: 'var(--mn-ink-3)', fontSize: '13px',
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px', opacity: 0.3 }}>📁</div>
            暂无上传资料
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {userFiles.map(f => (
              <UserFileCard
                key={f.file_id}
                file={f}
                onClick={() => router.push(`/reader/${f.file_id}`)}
              />
            ))}
          </div>
        )}
      </div>

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
