/**
 * mcp-client —— mneme-web 的 /mcp/* 工具面客户端（收编自 mneme-studio）。
 *
 * 铁律（同 studio 原版）：前端**不含 PoseQuestion** —— 出题（携带 expected）
 * 是 tutor/agent 的服务端职责。前端只「读待答题(prompt，无 expected)」+
 * 「提交真人答案」+「读掌握度」。expected 永不进入本前端（network/DOM/console）。
 *
 * 与 mneme-web 既有 api-client 的差异：/mcp 工具返回裸 JSON（无 {ok,error} 包皮），
 * 失败抛 McpError；401 与 api-client 一致 → clearToken + 跳 /login?next=。
 */
import { MNEME_API_BASE } from './env';
import { getToken, clearToken } from './auth-store';

const API_BASE = MNEME_API_BASE.replace(/\/$/, '');

/** 跳转到登录页（同源），登录后回跳当前路径。 */
export function redirectToLogin(): void {
  if (typeof window === 'undefined') return;
  const next = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.href = `/login?next=${next}`;
}

async function call<T>(tool: string, payload: unknown): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/mcp/${tool}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    // token 缺失/过期 → 回登录（一套登录，不弹第二套）。
    if (res.status === 401) {
      clearToken();
      redirectToLogin();
    }
    const detail = await res.text();
    throw new McpError(res.status, detail);
  }
  return (await res.json()) as T;
}

export class McpError extends Error {
  constructor(public status: number, public detail: string) {
    super(`MCP ${status}: ${detail}`);
  }
}

// ── 类型（**故意不含 expected 字段**）───────────────────────────────────────
export type NextAction =
  | 'answer_pending' | 'review' | 'probe' | 'practice' | 'assess' | 'complete';

export interface PendingQuestion {
  question_id: string;
  prompt: string;
  qtype: string; // solve|fill|choice|short|open —— 无 expected
}

export interface NextStep {
  action: NextAction;
  kc_id?: string | null;
  kc_name?: string | null;
  kc_type?: string | null;
  has_pending: boolean;
  pending_question?: PendingQuestion; // 无 expected
  review_task?: { kc_id: string; due_at: number; priority: number };
}

export interface Mastery {
  kc_id: string;
  gate_type: string;
  p_learned: number;
  p_learned_lower_bound: number;
  n_obs: number;
  confident: boolean;
  is_mastered: boolean;
  fsrs_due?: number | null;
}

export interface KcInfo {
  kc_id: string;
  name: string;
  gate_type: string;
  prerequisites: string[];
  rubric?: { kc_id: string; dimensions: { name: string; criterion: string; weight: number }[] } | null;
}

export interface GradeResult {
  graded?: boolean;
  is_correct?: boolean;
  verdict_source?: string;
  needs_qualitative?: boolean;
  qualitative?: boolean; // 定性题：由真 verifier 按 rubric 裁决（非确定性判分）
  score?: number; // 定性达标维度加权分 [0,1]
  kc_id?: string;
  error?: string;
}

// 人在环出题（S3-A）：请求下一题。请求只带 kc_id、响应只回 prompt/qtype —— 无 expected。
export interface PosedQuestion {
  question_id?: string;
  prompt?: string;
  qtype?: string;
  source?: string;
  error?: string;
}

// ── Book Engine（W3 Part B B4）：教材引用三态（后端已滤 <0.60），只留两态 ──
export type CitationState = 'verified' | 'inferred_unverified';

export interface BookCitation {
  chunk_id: string;
  pdf_id: string;
  page_number: number | null;
  char_start: number | null;
  char_end: number | null;
  content: string;
  score: number;
  citation_state: CitationState;
  textbook_meta?: { subject?: string; grade?: string; book_name?: string };
}

export type BookBlockType = 'text' | 'callout' | 'figure' | 'quiz' | 'flash_cards' | 'guided';

export interface BookBlock {
  block_id: string;
  block_type: BookBlockType;
  payload: Record<string, unknown>;
  citations: BookCitation[];
  status: string;
}

export interface BookChapter {
  chapter_id: string;
  title: string;
  content_type: string;
  learning_objectives: string[];
  summary: string | null;
  blocks: BookBlock[];
}

export interface BookDetail {
  book_id: string;
  textbook_id: string;
  title: string;
  description: string | null;
  scope: string | null;
  target_level: string | null;
  status: string;
  subject?: string;
  grade?: string;
  book_name?: string;
  chapters: BookChapter[];
}

export interface BookSummary {
  book_id: string;
  textbook_id: string;
  title: string;
  description: string | null;
  status: string;
  subject?: string;
  grade?: string;
  book_name?: string;
}

// ── W4 Solve：自然语言题目 -> 内核真实求解 + LLM 讲解 ─────────────────────
export interface SolveStep {
  step_number: number;
  description: string;
  expression: string;
  result: string;
}

export interface SolveProblemResult {
  kernel: string;
  task: string;
  restated_problem: string;
  solvable: boolean;
  answer: string;
  steps: SolveStep[];
  error: string;
  narration: string;
}

// ── W4 Visualize：数学概念/数据 -> 真实渲染数据（去 Manim）─────────────────
export type VisualizeRenderType = 'svg_plot' | 'three' | 'chart' | 'mermaid' | '';

export interface VisualizeConceptResult {
  render_type: VisualizeRenderType;
  restated_concept: string;
  success: boolean;
  error?: string;
  data_source?: string;
  svg?: string;
  title?: string;
  points?: { x: number[]; y: number[]; z: number[] };
  chart_type?: 'line' | 'bar';
  labels?: string[];
  datasets?: { label: string; data: number[] }[];
  diagram_source?: string;
}

// ── 读工具 + 提交（无 PoseQuestion）─────────────────────────────────────────
export const mcp = {
  // 按学生档案拉学习路径（有内容的 KC、按章节序）。
  getPath: (studentId: string) =>
    call<{ textbook_id: string; kc_ids: string[] }>('GetPath', {
      student_id: studentId,
    }),

  nextObjective: (studentId: string, kcIds: string[]) =>
    call<NextStep>('NextObjective', { student_id: studentId, kc_ids: kcIds }),

  checkMastery: (studentId: string, kcId: string) =>
    call<Mastery>('CheckMastery', { student_id: studentId, kc_id: kcId }),

  getKcInfo: (kcId: string) => call<KcInfo>('GetKCInfo', { kc_id: kcId }),

  getReviewQueue: (studentId: string, kcIds: string[]) =>
    call<{ review_queue: { kc_id: string; due_at: number; priority: number }[] }>(
      'GetReviewQueue', { student_id: studentId, kc_ids: kcIds },
    ),

  // 人在环 poser 触发：服务端出题（题库优先/LLM 兜底），expected 只存服务端。
  requestQuestion: (studentId: string, kcId: string) =>
    call<PosedQuestion>('RequestQuestion', { student_id: studentId, kc_id: kcId }),

  submitAnswer: (studentId: string, questionId: string, answer: string) =>
    call<GradeResult>('SubmitAnswer', {
      student_id: studentId, question_id: questionId, answer,
    }),

  // 定性桩：真人自我解释 → 服务端 verifier → ReportResult。前端不判分、不碰 expected。
  reportResult: (args: {
    studentId: string; kcId: string; questionId?: string;
    isCorrect: boolean; evidence: Record<string, unknown>;
  }) =>
    call<{ recorded: boolean; passed: boolean }>('ReportResult', {
      student_id: args.studentId, kc_id: args.kcId, question_id: args.questionId,
      is_correct: args.isCorrect, verdict_source: 'llm_verified', evidence: args.evidence,
    }),

  // 活书阅读器。非学生数据，不传 student_id。
  listBooks: () => call<{ books: BookSummary[] }>('ListBooks', {}),

  getBook: (bookId: string) => call<{ book: BookDetail | null }>('GetBook', { book_id: bookId }),

  // W4 Solve：非学生数据，不传 student_id。
  solveProblem: (problemText: string) =>
    call<SolveProblemResult>('SolveProblem', { problem_text: problemText }),

  // W4 Visualize：非学生数据，不传 student_id。
  visualizeConcept: (conceptText: string) =>
    call<VisualizeConceptResult>('VisualizeConcept', { concept_text: conceptText }),
};
