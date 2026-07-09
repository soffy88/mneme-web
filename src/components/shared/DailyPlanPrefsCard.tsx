'use client';

import { useEffect, useState } from 'react';
import * as api from '@/lib/api-client';
import type { DailyPlanPrefs } from '@/types/api';

/**
 * 每日计划参数可见+可配置（V.2）。学生能看到、能调：每日学习时长预算、晚间截止
 * 时间、薄弱/新知识点每日条数上限。数据来自 GET/POST /v1/users/{sid}/daily-plan-prefs。
 * GATE(掌握度阈值)不在此列——单源常量，见后端 daily_plan_prefs_service.py 注释。
 */
export function DailyPlanPrefsCard({ studentId }: { studentId: string }) {
  const [prefs,   setPrefs]   = useState<DailyPlanPrefs | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState('');

  // 表单本地态（字符串，方便绑定 input；提交前解析）
  const [unlimited,   setUnlimited]   = useState(true);
  const [budget,      setBudget]      = useState('30');
  const [lateNight,   setLateNight]   = useState('22:30');
  const [weakMax,     setWeakMax]     = useState('3');
  const [newMax,       setNewMax]     = useState('2');

  useEffect(() => {
    let alive = true;
    api.getDailyPlanPrefs(studentId).then((r) => {
      if (!alive || !r.ok) return;
      setPrefs(r.data);
      setUnlimited(r.data.budget_minutes === null);
      setBudget(String(r.data.budget_minutes ?? 30));
      setLateNight(
        `${String(r.data.late_night_hour).padStart(2, '0')}:${String(r.data.late_night_minute).padStart(2, '0')}`
      );
      setWeakMax(String(r.data.weak_max_items));
      setNewMax(String(r.data.new_max_items));
    }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [studentId]);

  if (loading || !prefs) return null;

  const save = async () => {
    setSaving(true);
    setError('');
    const [hStr, mStr] = lateNight.split(':');
    const hour = Number(hStr), minute = Number(mStr);
    const weak = Number(weakMax), newN = Number(newMax);
    const budgetMinutes = unlimited ? null : Number(budget);
    if (!unlimited && (!Number.isFinite(budgetMinutes) || (budgetMinutes as number) <= 0)) {
      setSaving(false); setError('时长预算需为正整数'); return;
    }
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
      setSaving(false); setError('晚间截止时间格式不对'); return;
    }
    if (!Number.isFinite(weak) || weak < 0 || !Number.isFinite(newN) || newN < 0) {
      setSaving(false); setError('每日条数上限需为非负整数'); return;
    }
    const res = await api.setDailyPlanPrefs(studentId, {
      budget_minutes: budgetMinutes, late_night_hour: hour, late_night_minute: minute,
      weak_max_items: weak, new_max_items: newN,
    });
    setSaving(false);
    if (res.ok) { setPrefs(res.data); setSaved(true); setTimeout(() => setSaved(false), 2000); }
    else setError(res.error);
  };

  const inputStyle: React.CSSProperties = {
    padding: '7px 10px', borderRadius: 8, border: '1px solid var(--mn-border)',
    fontSize: 13, color: 'var(--mn-ink)', background: 'var(--mn-surface)', width: 80,
  };

  return (
    <div className="mn-card" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '18px' }}>⚙️</span>
        <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--mn-ink)' }}>每日计划设置</div>
      </div>
      <div style={{ fontSize: '12px', color: 'var(--mn-ink-3)', lineHeight: 1.5, marginTop: '-6px' }}>
        每天给你推多少任务由这几个参数决定，按自己的节奏调（掌握度判定标准不受影响）。
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ fontSize: '13px', color: 'var(--mn-ink-2)' }}>每天学习时长预算</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '12px', color: 'var(--mn-ink-3)' }}>
            <input type="checkbox" checked={unlimited} onChange={(e) => setUnlimited(e.target.checked)} />
            不限
          </label>
          {!unlimited && (
            <>
              <input type="number" min={1} value={budget} onChange={(e) => setBudget(e.target.value)} style={inputStyle} />
              <span style={{ fontSize: '12px', color: 'var(--mn-ink-3)' }}>分钟</span>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ fontSize: '13px', color: 'var(--mn-ink-2)' }}>多晚之后不再推新知识点</span>
        <input type="time" value={lateNight} onChange={(e) => setLateNight(e.target.value)} style={inputStyle} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ fontSize: '13px', color: 'var(--mn-ink-2)' }}>每天最多推几个薄弱知识点</span>
        <input type="number" min={0} value={weakMax} onChange={(e) => setWeakMax(e.target.value)} style={inputStyle} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ fontSize: '13px', color: 'var(--mn-ink-2)' }}>每天最多推几个新知识点</span>
        <input type="number" min={0} value={newMax} onChange={(e) => setNewMax(e.target.value)} style={inputStyle} />
      </div>

      {error && <div style={{ fontSize: '12px', color: 'var(--mn-red)' }}>{error}</div>}

      <button
        type="button"
        onClick={() => void save()}
        disabled={saving}
        className="mn-btn-primary"
        style={{ alignSelf: 'flex-end', padding: '7px 16px', fontSize: '13px', opacity: saving ? 0.6 : 1 }}
      >
        {saving ? '保存中…' : saved ? '已保存 ✓' : '保存'}
      </button>
    </div>
  );
}
