'use client';

import { useRef, useState } from 'react';
import * as api from '@/lib/api-client';
import type { PaperResult } from '@/types/api';

export default function UploadPage() {
  const inputRef   = useRef<HTMLInputElement>(null);
  const [files,    setFiles]    = useState<File[]>([]);
  const [examName, setExamName] = useState('');
  const [phase,    setPhase]    = useState<'idle' | 'uploading' | 'polling' | 'done' | 'failed'>('idle');
  const [result,   setResult]   = useState<PaperResult | null>(null);
  const [error,    setError]    = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPoll = () => { if (pollRef.current) clearInterval(pollRef.current); };

  const onFiles = (fs: File[]) => setFiles(fs);

  const submit = async () => {
    if (!files.length) return;
    setPhase('uploading'); setError('');
    const up = await api.uploadPaper(files, examName || undefined);
    if (!up.ok) { setPhase('failed'); setError(up.error); return; }
    const paperId = up.data.paper_id;
    setPhase('polling');
    const deadline = Date.now() + 3 * 60 * 1000; // 最长轮询 3 分钟
    pollRef.current = setInterval(async () => {
      if (Date.now() > deadline) {
        stopPoll(); setPhase('failed'); setError('分析超时，请稍后重试'); return;
      }
      const r = await api.getPaper(paperId);
      if (!r.ok) { stopPoll(); setPhase('failed'); setError(r.error); return; }
      if (r.data.status === 'done' || r.data.status === 'failed') {
        stopPoll(); setResult(r.data); setPhase(r.data.status);
      }
    }, 2000);
  };

  const reset = () => { stopPoll(); setPhase('idle'); setFiles([]); setResult(null); setError(''); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--mn-ink)' }}>
          上传试卷
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--mn-ink-3)', marginTop: '4px' }}>
          拍照上传，AI 帮你找出薄弱考点和共同断点
        </p>
      </div>

      {phase === 'idle' && (
        <>
          {/* Drop zone */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            style={{
              width: '100%',
              padding: '32px 16px',
              borderRadius: '16px',
              border: `2px dashed ${files.length ? 'var(--mn-blue)' : 'var(--mn-border-2)'}`,
              background: files.length ? 'var(--mn-blue-dim)' : 'var(--mn-surface)',
              cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
              transition: 'all var(--mn-duration-fast) var(--mn-ease-out)',
            }}
          >
            <span style={{ fontSize: '32px' }}>{files.length ? '✓' : '⊕'}</span>
            <span style={{ fontSize: '15px', fontWeight: 600, color: files.length ? 'var(--mn-blue)' : 'var(--mn-ink-2)' }}>
              {files.length ? `已选 ${files.length} 张图片` : '点击上传 / 拍照'}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--mn-ink-3)' }}>支持 JPG、PNG，可多选</span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            style={{ display: 'none' }}
            onChange={(e) => onFiles(Array.from(e.target.files ?? []))}
          />

          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: 500, color: 'var(--mn-ink-2)' }}>
            考试名称（选填）
            <input
              type="text"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              placeholder="例如：期中数学"
              style={{
                padding: '12px 14px', borderRadius: '12px', fontSize: '15px',
                border: '1.5px solid var(--mn-border-2)',
                background: 'var(--mn-surface)', color: 'var(--mn-ink)',
                outline: 'none', transition: 'border-color var(--mn-duration-fast)',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--mn-blue)'; }}
              onBlur={(e)  => { e.target.style.borderColor = 'var(--mn-border-2)'; }}
            />
          </label>

          <button
            type="button"
            className="mn-btn-primary"
            disabled={!files.length}
            onClick={submit}
            style={{ width: '100%' }}
          >
            {files.length ? `分析 ${files.length} 张试卷` : '请先选择图片'}
          </button>
        </>
      )}

      {(phase === 'uploading' || phase === 'polling') && (
        <div className="mn-card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            border: '3px solid var(--mn-blue-dim)',
            borderTopColor: 'var(--mn-blue)',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ fontWeight: 600, color: 'var(--mn-ink)', marginBottom: '4px' }}>
            {phase === 'uploading' ? '上传中…' : 'AI 分析中…'}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--mn-ink-3)' }}>
            {phase === 'polling' ? '通常需要 15–30 秒' : ''}
          </div>
        </div>
      )}

      {phase === 'failed' && (
        <div className="mn-card" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠</div>
          <div style={{ fontWeight: 600, color: 'var(--mn-ink)', marginBottom: '6px' }}>处理失败</div>
          <div style={{ fontSize: '13px', color: 'var(--mn-ink-3)', marginBottom: '20px' }}>{error}</div>
          <button type="button" className="mn-btn-secondary" onClick={reset}>重新上传</button>
        </div>
      )}

      {phase === 'done' && result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* 共同断点 */}
          {result.common_breakpoint?.has_breakpoint && (
            <div className="mn-card" style={{ padding: '16px 18px', borderLeft: '4px solid var(--mn-amber)', borderRadius: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mn-amber)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                共同断点
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--mn-ink)' }}>
                {result.common_breakpoint.description}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--mn-ink-3)', marginTop: '4px' }}>
                从第 {result.common_breakpoint.entry_question_no} 题开始出现
              </div>
            </div>
          )}

          {/* 错题 */}
          {result.wrong_questions && result.wrong_questions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--mn-ink-2)' }}>
                错题 ({result.wrong_questions.length})
              </div>
              {result.wrong_questions.map((q) => (
                <div
                  key={q.question_no}
                  className="mn-card"
                  style={{ padding: '12px 14px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}
                >
                  <span style={{
                    flexShrink: 0, width: '26px', height: '26px',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--mn-red)', color: 'white', fontWeight: 700, fontSize: '12px',
                  }}>
                    {q.question_no}
                  </span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--mn-ink)' }}>
                      {q.kc_name ?? '未知考点'}
                    </div>
                    {q.description && (
                      <div style={{ fontSize: '12px', color: 'var(--mn-ink-3)', marginTop: '2px' }}>{q.description}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button type="button" className="mn-btn-secondary" onClick={reset} style={{ width: '100%' }}>
            再上传一份
          </button>
        </div>
      )}
    </div>
  );
}
