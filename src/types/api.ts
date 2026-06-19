/**
 * Mneme API 类型(移交文档 v1.0 全量)。
 *
 * 后端 base URL: http://localhost:8001
 * JWT:  Authorization: Bearer <token>
 * dev 验证码: 123456
 */

// ── 通用 ──────────────────────────────────────────────────────
export interface ApiError { detail: string }

export type ApiResult<T> =
  | { ok: true;  data: T }
  | { ok: false; error: string };

// ── 认证 ─────────────────────────────────────────────────────
export interface SendCodeReq  { phone: string }
export interface LoginReq     { phone: string; code: string }
export interface LoginRes     { token: string; user: UserProfile }

export interface RegisterStudentReq {
  phone: string; code: string; name: string;
  birth_date: string; grade: string;
  guardian_phone?: string; guardian_consent?: boolean;
}
export interface RegisterParentReq {
  phone: string; code: string; name: string; invite_code: string;
}
export interface UserProfile {
  id: string; name: string; role: 'student' | 'parent';
  grade?: string; phone: string;
}

// ── 试卷 ─────────────────────────────────────────────────────
export interface PaperUploadRes { paper_id: string; status: 'processing' }
export type PaperStatus = 'processing' | 'done' | 'failed';

export interface WrongQuestion {
  question_no: string; description?: string; kc_id?: string; kc_name?: string;
}
export interface PaperResult {
  paper_id: string; status: PaperStatus;
  wrong_questions?: WrongQuestion[];
  common_breakpoint?: {
    has_breakpoint: boolean;
    description: string;
    entry_question_no: string;
  };
}

// ── 认知状态 ─────────────────────────────────────────────────
export type InteractionSource = 'paper' | 'quick' | 'review' | 'socratic';
export interface InteractionReq {
  kc_id: string; is_correct: boolean;
  used_answer?: boolean; struggled?: boolean; effortless?: boolean;
  source: InteractionSource; question_id?: string; is_interleaved?: boolean;
}
export interface InteractionRes {
  p_mastery: number; long_term_mastery: number; effective_mastery: number;
  error_type: 'careless' | 'dontknow' | null;
  rating: string; next_review_due: string; n_attempts: number;
  feedback?: { text: string; type: 'milestone' | 'encouragement' | 'social' | null };
  step_verified?: boolean | null; step_feedback?: string | null;
}

export interface KnowledgePoint {
  kc_id: string; kc_name: string;
  long_term_mastery: number; effective_mastery: number;
  n_attempts: number; peer_percentile: number | null;
}
export interface MasteryRes {
  student_id: string; knowledge_points: KnowledgePoint[]; count: number;
}

export interface CurvePoint { month: string; mastery: number }
export interface MasteryCurveRes {
  kc_id: string; kc_name: string; points: CurvePoint[];
}

export interface ReviewQueueItem { question_id: string; kc_id: string; kc_name: string; due: string }

// ── 苏格拉底 ─────────────────────────────────────────────────
export type SocraticMode = 'deep' | 'mixed' | 'sprint';
export type SocraticEmotion = 'anxious' | 'crisis' | 'angry' | null;
export type SocraticOutcome = 'success' | 'partial' | 'failed' | 'abandoned' | null;

export interface SocraticStartRes {
  session_id: string; mode: SocraticMode; first_question: string;
}
export interface SocraticDelta  { delta: string }
export interface SocraticDone   {
  done: true; emotion: SocraticEmotion; outcome: SocraticOutcome;
}
export type SocraticChunk = SocraticDelta | SocraticDone;

export interface EscapeRes { answer_outline: string; used_escape_hatch: boolean }

// ── 今日目标 ─────────────────────────────────────────────────
export type MissionType = 'review' | 'socratic' | 'upload' | 'knowledge_focus' | 'rest';
export interface Mission {
  id: string; mission_type: MissionType;
  content: { description: string; kc_id?: string; kc_name?: string };
  estimated_minutes: number; completed: boolean;
  interleaved: boolean; requires_active_recall: boolean;
}
export interface MissionRes {
  mission: Mission; streak: { current_streak: number; longest_streak: number };
}
export interface CompleteMissionRes {
  streak: { current_streak: number; longest_streak: number }; next_preview: string;
}

// ── 变式题 ────────────────────────────────────────────────────
export interface SolutionStep { step_no: number; latex: string; description: string }
export interface PracticeItem {
  question_latex: string; answer: string;
  solution_steps: SolutionStep[];
  kernel_verified: boolean; plot_data: PlotData | null; difficulty: number;
}
export interface PracticeRes {
  items: PracticeItem[]; all_kernel_verified: boolean; kc_name: string;
}

// ── 讲解页 ────────────────────────────────────────────────────
export type TraceType = 'ellipse' | 'point' | 'fn' | 'line' | 'circle';
export interface PlotTrace {
  type: TraceType;
  params: Record<string, number | string>;
}
export interface PlotAnnotation { type: string; x: number; y: number; text: string }
export interface PlotData {
  kc_type: string;
  traces: PlotTrace[];
  annotations: PlotAnnotation[];
  x_range: [number, number]; y_range: [number, number];
}
export interface LessonRes {
  question_id: string; question_text: string; answer: string;
  solution_steps: SolutionStep[];
  plot_data: PlotData | null; self_check_passed: boolean; kc_id: string;
}

// ── 家长端 ────────────────────────────────────────────────────
export type EmotionState = 'stable' | 'anxious' | 'low' | 'crisis';
export interface ParentOverviewRes {
  weak_kc_count: number; weak_kc_trend: number;
  streak: number; emotion: EmotionState;
  top_improved_kc: string; study_minutes_today: number;
}
export type AlertType = 'emotion' | 'score_drop' | 'task_missing' | 'time_drop' | 'late_night';
export type AlertLevel = 'notice' | 'attention' | 'important';
export interface ParentAlert {
  id: string; alert_type: AlertType; alert_level: AlertLevel;
  content: string; is_read: boolean; created_at: string;
}
export interface ParentAlertsRes { alerts: ParentAlert[] }
export interface ChildInfo { student_id: string; name: string; grade: string }

// ── 错题本 ────────────────────────────────────────────────────
export interface ErrorJournalDistribution {
  kc_id: string; error_count: number; error_types: Record<string, number>;
}
export interface ErrorJournalItem {
  question_id: string; kc_id: string; error_tag: string;
  wrong_at: string; can_practice_variant: boolean;
}
export interface ErrorJournalRes {
  distribution: ErrorJournalDistribution[]; items: ErrorJournalItem[];
}

// ── 待复习 ────────────────────────────────────────────────────
export interface ReviewDueItem {
  kc_id: string; variant_question: string;
  due_since: string | null; fsrs_interval: number;
}

// ── 作文引导 ──────────────────────────────────────────────────
export interface EssayGuideReq { essay_text: string; grade: string; essay_type: string }
export interface EssayGuideRes {
  rubric_scores: Record<string, unknown>;
  guidance_questions: string[];
  is_completed: boolean;
}

// ── 英语口语 ──────────────────────────────────────────────────
export interface SpeakingPracticeReq { topic: string; target_sentences: string; grade: string }
export interface SpeakingPracticeRes {
  session_id: string;
  turns: unknown[];
  pronunciation_scores: Array<{
    overall_score: number; fluency_score: number;
    accuracy_score: number; word_scores?: unknown[];
  }>;
  overall_progress: number;
}
export interface SpeakingHistoryItem {
  session_id: string; topic: string; overall_progress: number; created_at: string;
}
