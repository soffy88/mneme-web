'use client';

import { useEffect, useState } from 'react';
import * as api from '@/lib/api-client';
import { getUser } from '@/lib/auth-store';
import type { EssayGuideRes } from '@/types/api';

const ESSAY_TYPES = ['议论文', '记叙文', '说明文', '散文'] as const;
const GRADES      = ['初一', '初二', '初三', '高一', '高二', '高三'] as const;

export default function EssayPage() {
  const [essayText,  setEssayText]  = useState('');
  const [grade,      setGrade]      = useState('高三');
  const [essayType,  setEssayType]  = useState('议论文');
  const [loading,    setLoading]    = useState(false);
  const [result,     setResult]     = useState<EssayGuideRes | null>(null);
  const [error,      setError]      = useState('');

  // 年级默认值取登录用户档案（useEffect 读 localStorage，避免 hydration 不一致）
  useEffect(() => {
    const g = getUser()?.grade;
    if (g && (GRADES as readonly string[]).includes(g)) setGrade(g);
  }, []);

  const submit = async () => {
    if (!essayText.trim()) return;
    setLoading(true);
    setError('');
    const res = await api.postEssayGuide({ essay_text: essayText, grade, essay_type: essayType });
    setLoading(false);
    if (res.ok) setResult(res.data);
    else setError(res.error);
  };

  const rubricLabels: Record<string, string> = {
    structure: '结构',
    argument:  '论证',
    expression:'表达',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--mn-ink)', lineHeight: 1.2 }}>
          作文引导
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--mn-ink-3)', marginTop: '2px' }}>
          写下你的作文，获得引导性反馈
        </p>
      </div>

      {/* 表单 */}
      <div className="mn-card" style={{ padding: '18px' }}>
        {/* 年级 + 类型 */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mn-ink-2)', display: 'block', marginBottom: '6px' }}>
              年级
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              style={{
                width: '100%', padding: '9px 12px', borderRadius: '10px',
                border: '1.5px solid var(--mn-border)', background: 'var(--mn-surface)',
                fontSize: '14px', color: 'var(--mn-ink)', appearance: 'none',
              }}
            >
              {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mn-ink-2)', display: 'block', marginBottom: '6px' }}>
              文体
            </label>
            <select
              value={essayType}
              onChange={(e) => setEssayType(e.target.value)}
              style={{
                width: '100%', padding: '9px 12px', borderRadius: '10px',
                border: '1.5px solid var(--mn-border)', background: 'var(--mn-surface)',
                fontSize: '14px', color: 'var(--mn-ink)', appearance: 'none',
              }}
            >
              {ESSAY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* 正文 */}
        <div>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--mn-ink-2)', display: 'block', marginBottom: '6px' }}>
            正文
          </label>
          <textarea
            value={essayText}
            onChange={(e) => setEssayText(e.target.value)}
            placeholder="在此输入你的作文内容…"
            rows={10}
            style={{
              width: '100%', padding: '12px', borderRadius: '10px',
              border: `1.5px solid ${essayText.trim() ? 'var(--mn-border-2)' : 'var(--mn-border)'}`,
              background: 'var(--mn-surface)', fontSize: '15px', color: 'var(--mn-ink)',
              lineHeight: 1.7, resize: 'vertical', fontFamily: 'inherit',
              transition: 'border-color var(--mn-duration)',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ fontSize: '12px', color: 'var(--mn-ink-3)', marginTop: '4px', textAlign: 'right' }}>
            {essayText.length} 字
          </div>
        </div>

        <button
          type="button"
          className="mn-btn-primary"
          disabled={loading || !essayText.trim()}
          onClick={() => void submit()}
          style={{ width: '100%', marginTop: '12px', opacity: essayText.trim() ? 1 : 0.5 }}
        >
          {loading ? '分析中…' : '获取引导反馈'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', borderRadius: '10px', background: '#fff1f0', border: '1px solid #fca5a5', fontSize: '13px', color: 'var(--mn-red)' }}>
          {error}
        </div>
      )}

      {/* 反馈结果 */}
      {result && (
        <>
          {/* 三维度反馈卡片 */}
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--mn-ink)', marginBottom: '10px' }}>
              三维度反馈
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(result.rubric_scores).map(([key, val]) => {
                const v = val as { comment?: string };
                const comment = typeof v === 'string' ? v : (v.comment ?? JSON.stringify(v));
                return (
                  <div key={key} className="mn-card" style={{ padding: '14px 16px' }}>
                    <div style={{
                      fontSize: '12px', fontWeight: 700, color: 'var(--mn-blue)',
                      letterSpacing: '0.05em', marginBottom: '6px',
                    }}>
                      {rubricLabels[key] ?? key}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--mn-ink)', lineHeight: 1.6 }}>
                      {comment}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 引导性问题 */}
          {result.guidance_questions.length > 0 && (
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--mn-ink)', marginBottom: '10px' }}>
                思考问题
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {result.guidance_questions.map((q, i) => (
                  <div key={i} style={{
                    padding: '14px 16px', borderRadius: '12px',
                    background: 'var(--mn-surface)', border: '1px solid var(--mn-border)',
                    display: 'flex', gap: '10px', alignItems: 'flex-start',
                  }}>
                    <span style={{
                      fontSize: '16px', color: 'var(--mn-ink-3)', flexShrink: 0, lineHeight: 1.5,
                    }}>?</span>
                    <span style={{ fontSize: '14px', color: 'var(--mn-ink)', lineHeight: 1.6 }}>
                      {q}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
