/**
 * Mneme API client。
 *
 * 所有接口(除 /v1/auth/*)需要 JWT。
 * 401 → clearToken() + redirect to /login(由各 hook/page 处理)。
 * SSE 流式接口单独暴露(socraticStream)。
 */
import { MNEME_API_BASE, USE_MOCK } from './env';
import { authHeader, clearToken } from './auth-store';
import type {
  ApiResult,
  SendCodeReq, LoginReq, LoginRes, RegisterStudentReq, RegisterParentReq, UserProfile,
  PaperUploadRes, PaperResult,
  InteractionReq, InteractionRes, MasteryRes, MasteryCurveRes,
  SocraticStartRes, EscapeRes,
  MissionRes, CompleteMissionRes,
  PracticeRes, LessonRes,
  ParentOverviewRes, ParentAlertsRes, ChildInfo,
  ErrorJournalRes, ReviewDueItem,
  EssayGuideReq, EssayGuideRes,
  SpeakingPracticeReq, SpeakingPracticeRes, SpeakingHistoryItem,
} from '@/types/api';
import * as mock from './mock-data';

// ── 底层 fetch ─────────────────────────────────────────────
async function req<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
): Promise<ApiResult<T>> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15_000);
  try {
    const res = await fetch(`${MNEME_API_BASE}${path}`, {
      signal: ctrl.signal,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? authHeader() : {}),
        ...options.headers,
      },
    });
    if (res.status === 401) { clearToken(); return { ok: false, error: 'UNAUTHORIZED' }; }
    if (!res.ok) {
      const body = await res.json().catch(() => ({ detail: res.statusText }));
      return { ok: false, error: (body as { detail?: string }).detail ?? res.statusText };
    }
    const data = await res.json();
    return { ok: true, data: data as T };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  } finally {
    clearTimeout(timer);
  }
}

function post<T>(path: string, body: unknown, auth = true) {
  return req<T>(path, { method: 'POST', body: JSON.stringify(body) }, auth);
}

// ── 认证(无需 auth header) ──────────────────────────────────
export const sendCode  = (r: SendCodeReq)         => USE_MOCK ? mock.mockSendCode()     : post<void>('/v1/auth/send-code', r, false);
export const login     = (r: LoginReq)            => USE_MOCK ? mock.mockLogin(r)        : post<LoginRes>('/v1/auth/login', r, false);
export const registerStudent = (r: RegisterStudentReq) => USE_MOCK ? mock.mockRegisterStudent() : post<LoginRes>('/v1/auth/register/student', r, false);
export const registerParent  = (r: RegisterParentReq)  => USE_MOCK ? mock.mockRegisterParent()  : post<LoginRes>('/v1/auth/register/parent', r, false);
export const getMe     = ()                       => USE_MOCK ? mock.mockMe()            : req<UserProfile>('/v1/auth/me');

// ── 试卷 ────────────────────────────────────────────────────
export async function uploadPaper(
  images: File[], examName?: string, grade?: string
): Promise<ApiResult<PaperUploadRes>> {
  if (USE_MOCK) return mock.mockUploadPaper();
  const form = new FormData();
  images.forEach((f) => form.append('images[]', f));
  if (examName) form.append('exam_name', examName);
  if (grade)    form.append('grade', grade);
  return req<PaperUploadRes>('/v1/papers/upload', {
    method: 'POST',
    body: form,
    headers: { ...authHeader() }, // 不设 Content-Type,让浏览器设 multipart boundary
  });
}
export const getPaper      = (id: string)       => USE_MOCK ? mock.mockGetPaper(id)     : req<PaperResult>(`/v1/papers/${id}`);
export const listPapers    = ()                  => USE_MOCK ? mock.mockListPapers()     : req<PaperResult[]>('/v1/papers');

// ── 认知状态 ────────────────────────────────────────────────
export const postInteraction = (r: InteractionReq)         => USE_MOCK ? mock.mockInteraction(r) : post<InteractionRes>('/v1/interaction', r);
export const getMastery      = (sid: string)               => USE_MOCK ? mock.mockMastery()      : req<MasteryRes>(`/v1/mastery/${sid}`);
export const getMasteryCurve = (sid: string, kcId: string) => USE_MOCK ? mock.mockCurve()        : req<MasteryCurveRes>(`/v1/mastery/curve/${sid}/${kcId}`);
export const getReviewQueue  = (sid: string)               => USE_MOCK ? mock.mockReviewQueue()  : req(`/v1/review-queue/${sid}`);

// ── 苏格拉底 ─────────────────────────────────────────────────
export const startSocratic = (questionId: string) =>
  USE_MOCK ? mock.mockStartSocratic() : post<SocraticStartRes>('/v1/socratic/start', { question_id: questionId });

/**
 * socraticStream — SSE 流式消息。
 * 移交文档推荐用 fetch + ReadableStream(支持自定义 Authorization header)。
 * @param onDelta  每次收到文字片段时调用
 * @param onDone   收到 done 事件时调用
 */
export async function socraticStream(
  sessionId: string,
  text: string,
  onDelta: (d: string) => void,
  onDone: (emotion: string | null, outcome: string | null) => void,
): Promise<void> {
  if (USE_MOCK) {
    return mock.mockSocraticStream(onDelta, onDone);
  }
  const res = await fetch(`${MNEME_API_BASE}/v1/socratic/${sessionId}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ text }),
  });
  if (!res.ok || !res.body) throw new Error(`SSE error: ${res.status}`);
  const reader  = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const parts = buf.split('\n');
    buf = parts.pop() ?? '';
    for (const line of parts) {
      if (!line.startsWith('data: ')) continue;
      const json = JSON.parse(line.slice(6));
      if ('delta'  in json) onDelta(json.delta as string);
      if ('done'   in json) onDone(json.emotion, json.outcome);
    }
  }
}

export const escapeSocratic = (sid: string) =>
  USE_MOCK ? mock.mockEscape() : post<EscapeRes>(`/v1/socratic/${sid}/escape`, {});
export const endSocratic    = (sid: string) =>
  USE_MOCK ? mock.mockEndSocratic() : post<void>(`/v1/socratic/${sid}/end`, {});

// ── 今日目标 ─────────────────────────────────────────────────
export const getMission      = (sid: string)       => USE_MOCK ? mock.mockMission()          : req<MissionRes>(`/v1/missions/today/${sid}`);
export const completeMission = (mid: string)       => USE_MOCK ? mock.mockCompleteMission()  : post<CompleteMissionRes>(`/v1/missions/${mid}/complete`, {});

// ── 变式题 ───────────────────────────────────────────────────
export const generatePractice = (kcId: string, count = 3, difficulty = 0.5) =>
  USE_MOCK ? mock.mockPractice() : post<PracticeRes>('/v1/practice/generate', { kc_id: kcId, count, difficulty });

// ── 讲解页 ───────────────────────────────────────────────────
export const getLesson = (qid: string) =>
  USE_MOCK ? mock.mockLesson() : req<LessonRes>(`/v1/lesson/${qid}`);

// ── 家长端 ───────────────────────────────────────────────────
export const getChildren      = ()          => USE_MOCK ? mock.mockChildren()  : req<ChildInfo[]>('/v1/parent/children');
export const getParentOverview = (sid: string) => USE_MOCK ? mock.mockParentOverview() : req<ParentOverviewRes>(`/v1/parent/overview/${sid}`);
export const getParentAlerts   = (sid: string) => USE_MOCK ? mock.mockParentAlerts()   : req<ParentAlertsRes>(`/v1/parent/alerts/${sid}`);

// ── 错题本 ───────────────────────────────────────────────────
export const getErrorJournal = (
  sid: string,
  filters?: { kc_id?: string; error_type?: string; limit?: number; offset?: number },
) => {
  if (USE_MOCK) return mock.mockErrorJournal();
  const p = new URLSearchParams();
  if (filters?.kc_id)     p.set('kc_id',     filters.kc_id);
  if (filters?.error_type) p.set('error_type', filters.error_type);
  if (filters?.limit)     p.set('limit',     String(filters.limit));
  if (filters?.offset)    p.set('offset',    String(filters.offset));
  const qs = p.toString();
  return req<ErrorJournalRes>(`/v1/error-journal/${sid}${qs ? `?${qs}` : ''}`);
};

// ── 待复习 ────────────────────────────────────────────────────
export const getReviewDue = (sid: string) =>
  USE_MOCK ? mock.mockReviewDue() : req<ReviewDueItem[]>(`/v1/review/due/${sid}`);

// ── 作文引导 ──────────────────────────────────────────────────
export const postEssayGuide = (r: EssayGuideReq) =>
  USE_MOCK ? mock.mockEssayGuide() : post<EssayGuideRes>('/v1/essay/guide', r);

// ── 英语口语 ──────────────────────────────────────────────────
export const postSpeakingPractice = (r: SpeakingPracticeReq) =>
  USE_MOCK ? mock.mockSpeakingPractice() : post<SpeakingPracticeRes>('/v1/speaking/practice', r);
export const getSpeakingHistory = (sid: string) =>
  USE_MOCK ? mock.mockSpeakingHistory() : req<SpeakingHistoryItem[]>(`/v1/speaking/history/${sid}`);
