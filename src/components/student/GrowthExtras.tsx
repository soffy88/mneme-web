'use client';

import { useEffect, useState } from 'react';
import * as api from '@/lib/api-client';
import { getUserId } from '@/lib/auth-store';
import type { LeagueRes, AffectRes } from '@/types/api';

const AFFECT_HINT: Record<string, { emoji: string; text: string }> = {
  frustrated: { emoji: '🫧', text: '这几题有点难——降下难度、深呼吸，稳一稳再来。' },
  disengaged: { emoji: '🎯', text: '换个题型提提神？别看答案，先自己回忆一下。' },
  flow:       { emoji: '🔥', text: '状态正好！要不要挑战难一点的？' },
};

export function GrowthExtras() {
  const [league, setLeague] = useState<LeagueRes | null>(null);
  const [affect, setAffect] = useState<AffectRes | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [examInput, setExamInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const sid = getUserId();
    if (!sid) return;
    api.getLeague(sid).then(r => { if (r.ok) setLeague(r.data); }).catch(() => {});
    api.getAffect(sid).then(r => { if (r.ok) setAffect(r.data); }).catch(() => {});
  }, []);

  async function saveExam() {
    const sid = getUserId();
    if (!sid || !examInput) return;
    setSaving(true);
    const r = await api.setExamDate(sid, examInput);
    setSaving(false);
    if (r.ok) setCountdown(r.data.exam_countdown_days);
  }

  const hint = affect && affect.n >= 3 ? AFFECT_HINT[affect.state] : undefined;

  return (
    <div style={{ display: 'grid', gap: '12px' }}>
      {/* 情感自适应轻提示（教育理念08）：仅在有明确态且有足够样本时出现 */}
      {hint && (
        <div className="mn-card" style={{ padding: '12px 16px', display: 'flex', gap: '10px', alignItems: 'center', borderLeft: '3px solid var(--mn-blue)' }}>
          <span style={{ fontSize: '20px' }}>{hint.emoji}</span>
          <span style={{ fontSize: '13px', color: 'var(--mn-ink-2)' }}>{hint.text}</span>
        </div>
      )}

      {/* 匿名同年级联赛（教育理念02·SDT 归属） */}
      {league && league.percentile != null && (
        <div className="mn-card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🏅</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--mn-ink)' }}>{league.tier} 段位</div>
            <div style={{ fontSize: '12px', color: 'var(--mn-ink-3)' }}>
              同年级前 {Math.max(1, Math.round(100 - (league.percentile ?? 0)))}% · 已掌握 {league.my_mastered} 个知识点
            </div>
          </div>
        </div>
      )}

      {/* 考期感知设置（教育理念06） */}
      <div className="mn-card" style={{ padding: '14px 16px' }}>
        {countdown != null ? (
          <div style={{ fontSize: '14px', color: 'var(--mn-ink)' }}>
            📅 距考试还有 <b style={{ color: 'var(--mn-blue)' }}>{countdown}</b> 天{countdown <= 14 ? '——已进入冲刺，计划自动转向复习巩固' : ''}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', color: 'var(--mn-ink-3)' }}>📅 设置考试日期</span>
            <input type="date" value={examInput} onChange={e => setExamInput(e.target.value)}
              style={{ padding: '5px 8px', borderRadius: '8px', border: '1px solid var(--mn-border)', fontSize: '13px' }} />
            <button onClick={saveExam} disabled={saving || !examInput}
              style={{ padding: '5px 12px', borderRadius: '8px', border: 'none', background: 'var(--mn-blue)', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: (saving || !examInput) ? 0.5 : 1 }}>
              设为考期
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
