'use client';

import { useState } from 'react';
import {
  patchHighlight, deleteHighlight,
  createReadingNote, patchReadingNote, deleteReadingNote,
  type HighlightItem, type ReadingNoteItem,
} from '@/lib/reader-api';

const COLOR_BG: Record<string, string> = {
  yellow: '#facc15', green: '#22c55e', blue: '#60a5fa', red: '#f87171',
};

// ── Note editor modal ──────────────────────────────────────

function NoteEditor({
  fileId,
  highlightId,
  existing,
  onSaved,
  onCancel,
}: {
  fileId: string;
  highlightId?: string;
  existing?: ReadingNoteItem;
  onSaved: (note: ReadingNoteItem) => void;
  onCancel: () => void;
}) {
  const [title,   setTitle]   = useState(existing?.title   ?? '');
  const [content, setContent] = useState(existing?.content ?? '');
  const [saving,  setSaving]  = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      let note: ReadingNoteItem;
      if (existing) {
        note = await patchReadingNote(existing.id, { title: title || undefined, content: content || undefined });
      } else {
        note = await createReadingNote({ file_id: fileId, highlight_id: highlightId, title: title || undefined, content: content || undefined });
      }
      onSaved(note);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(26,24,20,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }} onClick={onCancel}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--mn-surface)', borderRadius: '12px',
          boxShadow: 'var(--mn-shadow-lg)',
          width: '100%', maxWidth: '440px',
          padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--mn-ink)' }}>
          {existing ? '编辑笔记' : '添加笔记'}
        </div>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="标题（选填）"
          style={{
            border: '1px solid var(--mn-border)', borderRadius: '8px',
            padding: '8px 12px', fontSize: '14px', outline: 'none',
            color: 'var(--mn-ink)', background: 'var(--mn-surface)',
          }}
        />
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="笔记内容…"
          rows={5}
          style={{
            border: '1px solid var(--mn-border)', borderRadius: '8px',
            padding: '8px 12px', fontSize: '14px', resize: 'vertical', outline: 'none',
            color: 'var(--mn-ink)', background: 'var(--mn-surface)',
          }}
        />
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            padding: '7px 16px', borderRadius: '8px', fontSize: '13px',
            border: '1px solid var(--mn-border)', background: 'transparent',
            color: 'var(--mn-ink-2)', cursor: 'pointer',
          }}>
            取消
          </button>
          <button onClick={save} disabled={saving} style={{
            padding: '7px 16px', borderRadius: '8px', fontSize: '13px',
            background: 'var(--mn-blue)', color: '#fff', border: 'none',
            cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1,
          }}>
            {saving ? '保存中…' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Highlight card ─────────────────────────────────────────

function HighlightCard({
  hl,
  notes,
  fileId,
  onDelete,
  onNoteChange,
}: {
  hl: HighlightItem;
  notes: ReadingNoteItem[];
  fileId: string;
  onDelete: () => void;
  onNoteChange: (notes: ReadingNoteItem[]) => void;
}) {
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [editNote, setEditNote]             = useState<ReadingNoteItem | undefined>();
  const relatedNotes = notes.filter(n => n.highlight_id === hl.id);

  const handleNoteDelete = async (note: ReadingNoteItem) => {
    await deleteReadingNote(note.id);
    onNoteChange(notes.filter(n => n.id !== note.id));
  };

  return (
    <div style={{
      padding: '10px 12px', borderRadius: '8px',
      background: 'var(--mn-surface)', border: '1px solid var(--mn-border)',
      display: 'flex', flexDirection: 'column', gap: '6px',
    }}>
      {/* 高亮色条 + 文字 */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <div style={{
          width: '3px', borderRadius: '2px', flexShrink: 0, alignSelf: 'stretch',
          background: COLOR_BG[hl.color] ?? '#facc15',
        }} />
        <div style={{ flex: 1, fontSize: '13px', color: 'var(--mn-ink-2)', lineHeight: 1.5 }}>
          {hl.text}
        </div>
        <button
          onClick={onDelete}
          title="删除高亮"
          style={{
            fontSize: '14px', color: 'var(--mn-ink-3)', background: 'none',
            border: 'none', cursor: 'pointer', padding: '0 2px', flexShrink: 0,
          }}
        >×</button>
      </div>

      {/* 颜色选择 */}
      <div style={{ display: 'flex', gap: '4px', paddingLeft: '11px' }}>
        {Object.entries(COLOR_BG).map(([key, bg]) => (
          <button
            key={key}
            onClick={() => patchHighlight(hl.id, { color: key })}
            title={key}
            style={{
              width: '14px', height: '14px', borderRadius: '50%', background: bg,
              border: `1px solid ${hl.color === key ? 'var(--mn-ink)' : 'transparent'}`,
              cursor: 'pointer',
            }}
          />
        ))}
        <button
          onClick={() => { setEditNote(undefined); setShowNoteEditor(true); }}
          style={{
            marginLeft: '4px', fontSize: '11px', color: 'var(--mn-blue)',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >+ 笔记</button>
      </div>

      {/* 关联笔记 */}
      {relatedNotes.map(note => (
        <div key={note.id} style={{
          marginLeft: '11px', padding: '6px 10px',
          borderRadius: '6px', background: 'var(--mn-surface-2)',
          fontSize: '12px', color: 'var(--mn-ink-2)', position: 'relative',
        }}>
          {note.title && <div style={{ fontWeight: 600, marginBottom: '2px' }}>{note.title}</div>}
          {note.content && <div style={{ whiteSpace: 'pre-wrap' }}>{note.content}</div>}
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button
              onClick={() => { setEditNote(note); setShowNoteEditor(true); }}
              style={{ fontSize: '11px', color: 'var(--mn-blue)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >编辑</button>
            <button
              onClick={() => handleNoteDelete(note)}
              style={{ fontSize: '11px', color: 'var(--mn-red)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >删除</button>
          </div>
        </div>
      ))}

      {showNoteEditor && (
        <NoteEditor
          fileId={fileId}
          highlightId={hl.id}
          existing={editNote}
          onSaved={saved => {
            setShowNoteEditor(false);
            onNoteChange(
              editNote
                ? notes.map(n => n.id === saved.id ? saved : n)
                : [...notes, saved]
            );
          }}
          onCancel={() => setShowNoteEditor(false)}
        />
      )}
    </div>
  );
}

// ── HighlightPanel (main export) ───────────────────────────

interface PanelProps {
  fileId: string;
  highlights: HighlightItem[];
  notes: ReadingNoteItem[];
  onHighlightDelete: (id: string) => void;
  onNotesChange: (notes: ReadingNoteItem[]) => void;
}

export function HighlightPanel({ fileId, highlights, notes, onHighlightDelete, onNotesChange }: PanelProps) {
  const [showNoteEditor, setShowNoteEditor] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px 10px',
        borderBottom: '1px solid var(--mn-border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--mn-ink)' }}>
          我的高亮 · 笔记
        </span>
        <button
          onClick={() => setShowNoteEditor(true)}
          style={{
            fontSize: '12px', color: 'var(--mn-blue)', background: 'var(--mn-blue-dim)',
            border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer',
          }}
        >+ 独立笔记</button>
      </div>

      {/* Scrollable list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {highlights.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--mn-ink-3)', fontSize: '13px' }}>
            选中文字即可高亮
          </div>
        ) : (
          highlights.map(hl => (
            <HighlightCard
              key={hl.id}
              hl={hl}
              notes={notes}
              fileId={fileId}
              onDelete={() => {
                deleteHighlight(hl.id).then(() => onHighlightDelete(hl.id));
              }}
              onNoteChange={onNotesChange}
            />
          ))
        )}

        {/* 独立笔记 (无 highlight_id) */}
        {notes.filter(n => !n.highlight_id).length > 0 && (
          <div style={{ marginTop: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--mn-ink-3)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              独立笔记
            </div>
            {notes.filter(n => !n.highlight_id).map(note => (
              <div key={note.id} style={{
                padding: '10px 12px', borderRadius: '8px',
                background: 'var(--mn-surface)', border: '1px solid var(--mn-border)',
                marginBottom: '8px',
              }}>
                {note.title && <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--mn-ink)', marginBottom: '4px' }}>{note.title}</div>}
                {note.content && <div style={{ fontSize: '12px', color: 'var(--mn-ink-2)', whiteSpace: 'pre-wrap' }}>{note.content}</div>}
                <button
                  onClick={() => deleteReadingNote(note.id).then(() => onNotesChange(notes.filter(n => n.id !== note.id)))}
                  style={{ marginTop: '6px', fontSize: '11px', color: 'var(--mn-red)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >删除</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showNoteEditor && (
        <NoteEditor
          fileId={fileId}
          onSaved={saved => {
            setShowNoteEditor(false);
            onNotesChange([...notes, saved]);
          }}
          onCancel={() => setShowNoteEditor(false)}
        />
      )}
    </div>
  );
}
