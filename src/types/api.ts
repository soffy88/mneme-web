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
  student_id: string; kc_id: string; is_correct: boolean;
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
  p_recognition?: number | null;
}

// ── 前置断点 / 薄弱根因（M-G 下钻）──
export interface WeakPrereq {
  ku_id: string; name: string; p_mastery: number | null; status: 'weak' | 'unpracticed';
}
export interface WeakRoot {
  ku_id: string; name: string; p_mastery: number; weak_prerequisites: WeakPrereq[];
}
export interface WeakRootsRes { roots: WeakRoot[] }
export interface MasteryRes {
  student_id: string; knowledge_points: KnowledgePoint[]; count: number;
}

export interface CurvePoint { month: string; mastery: number; dominant_error_type?: string | null }
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
export type MissionType = 'review' | 'socratic' | 'upload' | 'knowledge_focus' | 'rest' | 'cold_start';
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
  // 后端 lesson 实际返回 {svg, steps}（内核已渲染好的 SVG）；
  // traces/kc_type 等为可选的结构化图示数据（部分内核才产出）。
  svg?: string;
  steps?: unknown[];
  kc_type?: string;
  traces?: PlotTrace[];
  annotations?: PlotAnnotation[];
  x_range?: [number, number]; y_range?: [number, number];
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
export interface BindChildRes { ok: boolean; student_id: string; student_name: string }
export interface WeeklyDigestRes {
  current_streak: number; active_today: boolean;
  n_interactions_7d: number; distinct_kcs_7d: number;
  accuracy_7d: number | null; days_active_7d: number;
  effort_gains_7d: number; headline: string;
}

// ── JOL 校准 ──────────────────────────────────────────────────
export interface CalibrationRes {
  n: number; brier: number | null; mean_predicted: number | null;
  accuracy: number | null; overconfidence: number | null;
}

// ── 错题本 ────────────────────────────────────────────────────
export interface ErrorJournalDistribution {
  kc_id: string; error_count: number; error_types: Record<string, number>;
}
export interface ErrorJournalItem {
  question_id: string; kc_id: string; kc_name?: string;
  question_text?: string; student_answer?: string; correct_answer?: string;
  error_tag: string; wrong_at: string; wrong_count?: number; can_practice_variant: boolean;
}
export interface ErrorJournalRes {
  distribution: ErrorJournalDistribution[]; items: ErrorJournalItem[];
}

// ── 待复习 ────────────────────────────────────────────────────
export interface ReviewDueItem {
  kc_id: string; variant_question: string;
  requires_retrieval?: boolean;
  question_id?: string | null;
  due_since: string | null; fsrs_interval: number;
}
export interface ReviewRevealRes { kc_id: string; answer: string; recorded_again: boolean }
export interface ReviewSubmitRes { kc_id: string; verdict: 'correct' | 'wrong' | 'unsure'; answer: string }

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

// ── 知识单元 ────────────────────────────────────────────────────
export type MasteryColor = 'green' | 'yellow' | 'red' | 'unknown';

export interface KnowledgeUnitItem {
  id: string;
  name: string;
  description: string | null;
  textbook_id: string;
  textbook_file_id: string | null;
  cluster_id: string;
  cluster_name: string;
  cluster_order: number;
  subject: string;
  grade: string;
  edition: string;
  book_name: string;
  prerequisites: string[];
  related_kus: string[];
  difficulty: number;
  exam_frequency: 'low' | 'mid' | 'high';
  question_types: string[];
  ku_type: 'concept' | 'method' | 'theorem' | string;
  curriculum_standard: string | null;
  mastery_levels: unknown[];
  p_mastery: number | null;
  mastery_color: MasteryColor;
  prereq_mastery?: { ku_id: string; p_mastery: number | null; mastery_color: MasteryColor }[];
  rich_content?: Record<string, string | string[]> | null;
}

// ── 题库 ─────────────────────────────────────────────────────────
export interface QuestionBankItem {
  id: string;
  subject: string;
  question_text: string;
  correct_answer: string | null;
  knowledge_points: Record<string, string>;
  needs_image: boolean;
  explanation?: string;
}
export interface QuestionBankRes {
  total: number;
  offset: number;
  limit: number;
  items: QuestionBankItem[];
}

export interface Achievement {
  id: string; icon: string; name: string; unit: string;
  value: number; level: number; max_level: number; next_target: number | null;
}

export interface PracticeSubmitReq {
  question_id: string;
  student_id: string;
  student_answer: string;
  is_correct?: boolean | null;   // 省略=让后端自动判；判不了时二次提交带自评
  ku_id: string;
}
export interface PracticeSubmitRes {
  is_correct: boolean | null;
  auto_judged?: boolean;
  needs_self_grade?: boolean;
  correct_answer?: string | null;
  wrong_question_id: string | null;
  p_mastery: number | null;
  mastery_color: MasteryColor;
  feedback: { text: string; type: string | null } | null;
}

// ── 每日学科计划（规则引擎） ────────────────────────────────────
export type DailyPlanTaskType = 'review' | 'weak_practice' | 'error_review' | 'new_learn';
export interface DailyPlanTask {
  type: DailyPlanTaskType;
  title: string;
  subject: string;
  ku_ids: string[];
  estimated_minutes: number;
  priority: number;
  reason: string;
}
export interface DailyPlanSubjectSummary {
  subject: string;
  task_count: number;
  estimated_minutes: number;
}
export interface DailyPlanRes {
  date: string;
  exam_countdown_days: number | null;
  subjects_summary: DailyPlanSubjectSummary[];
  tasks: DailyPlanTask[];
}

// ── 努力收益看板（M-F 对抗努力错觉）──
export interface EffortGain {
  question_id: string | null;
  kc: string | null;
  struggle_score: number;
  retention_delta: number;
  effortful_gain: number;
  occurred_at: string | null;
}
export interface EffortfulGainsRes {
  top_gains: EffortGain[];
}

// ── 个人学习模式识别（招牌洞察：模式 > 知识点）──
export interface PatternItem {
  kc_id: string;
  trend: number;
  current_accuracy: number;
  is_forgetting: boolean;
  is_plateau: boolean;
}
export interface PatternsRes {
  student_id: string;
  improving_kcs: string[];
  forgetting_kcs: string[];
  plateau_kcs: string[];
  overall_trend: number;   // 正=整体进步
  patterns: PatternItem[];
}
