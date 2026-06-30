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
  ParentOverviewRes, ParentAlertsRes, ParentAlert, ChildInfo, BindChildRes, WeeklyDigestRes,
  CalibrationRes,
  ErrorJournalRes, ReviewDueItem,
  EssayGuideReq, EssayGuideRes,
  SpeakingPracticeReq, SpeakingPracticeRes, SpeakingHistoryItem,
  DailyPlanRes,
  KnowledgeUnitItem, QuestionBankRes, PracticeSubmitReq, PracticeSubmitRes,
  EffortfulGainsRes, ReviewQueueItem, WeakRootsRes,
} from '@/types/api';
import * as mock from './mock-data';

// ── 底层 fetch ─────────────────────────────────────────────
async function req<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
  timeoutMs = 15_000,
): Promise<ApiResult<T>> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
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
      const detail = (body as { detail?: unknown }).detail ?? res.statusText;
      const errMsg = typeof detail === 'string' ? detail : JSON.stringify(detail);
      return { ok: false, error: errMsg };
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
export const getReviewQueue  = (sid: string)               => USE_MOCK ? mock.mockReviewQueue()  : req<ReviewQueueItem[]>(`/v1/review-queue/${sid}`);

// SSE 整体兜底超时：N 毫秒内无新数据则中止流，防止永久卡死。
const SSE_IDLE_TIMEOUT_MS = 120_000;

// ── 苏格拉底 ─────────────────────────────────────────────────
export const startSocratic = (questionId: string, studentId: string) =>
  USE_MOCK ? mock.mockStartSocratic()
  : req<SocraticStartRes>(`/v1/socratic/start?question_id=${encodeURIComponent(questionId)}&student_id=${encodeURIComponent(studentId)}`, { method: 'POST' }, true, 90_000);

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
  // 整体兜底：120s 无新数据则中止，避免永久卡死。
  const ctrl = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const resetTimer = () => {
    clearTimeout(timer);
    timer = setTimeout(() => ctrl.abort(), SSE_IDLE_TIMEOUT_MS);
  };
  resetTimer();
  try {
    const res = await fetch(
      `${MNEME_API_BASE}/v1/socratic/${encodeURIComponent(sessionId)}/message?student_message=${encodeURIComponent(text)}`,
      { method: 'POST', headers: { ...authHeader() }, signal: ctrl.signal },
    );
    if (!res.ok || !res.body) throw new Error(`SSE error: ${res.status}`);
    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      resetTimer();
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
  } finally {
    clearTimeout(timer);
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
export const generatePractice = (kcId: string, count = 3, difficulty = 0.5) => {
  if (USE_MOCK) return mock.mockPractice();
  const qs = new URLSearchParams({ kc_id: kcId, count: String(count), difficulty: String(difficulty) });
  return req<PracticeRes>(`/v1/practice/generate?${qs}`, { method: 'POST' });
};

// 成就/徽章（动机钩子）
export const getAchievements = (sid: string) =>
  USE_MOCK
    ? Promise.resolve({ ok: true as const, data: { achievements: [] as import('@/types/api').Achievement[] } })
    : req<{ achievements: import('@/types/api').Achievement[] }>(`/v1/achievements/${sid}`);

// 列出"有真实题库题"的练习主题（避免选题落空）
export const listPracticeTopics = (subject = 'math') =>
  USE_MOCK
    ? Promise.resolve({ ok: true as const, data: { topics: [] as { ku_id: string; count: number }[] } })
    : req<{ topics: { ku_id: string; count: number }[] }>(`/v1/practice/topics?subject=${subject}`);

// ── 讲解页 ───────────────────────────────────────────────────
export const getLesson = (qid: string) =>
  USE_MOCK ? mock.mockLesson() : req<LessonRes>(`/v1/lesson/${qid}`);

// ── 家长端 ───────────────────────────────────────────────────
export const getChildren      = ()          => USE_MOCK ? mock.mockChildren()  : req<ChildInfo[]>('/v1/parent/children');
export const getParentOverview = (sid: string) => USE_MOCK ? mock.mockParentOverview() : req<ParentOverviewRes>(`/v1/parent/overview/${sid}`);
export const getWeeklyDigest   = (sid: string) => USE_MOCK ? mock.mockWeeklyDigest()    : req<WeeklyDigestRes>(`/v1/weekly-digest/${sid}`);

// 家长绑定孩子（用孩子注册时生成的 invite_code）
export const bindChild = (inviteCode: string) =>
  USE_MOCK ? mock.mockBindChild()
           : req<BindChildRes>(`/v1/auth/bind-child?invite_code=${encodeURIComponent(inviteCode)}`, { method: 'POST' });

// 后端 /v1/parent/alerts/{student_id}?parent_id=... 返回裸数组，字段名为 type/level；此处归一化为 ParentAlertsRes。
export const getParentAlerts = async (sid: string, parentId: string): Promise<ApiResult<ParentAlertsRes>> => {
  if (USE_MOCK) return mock.mockParentAlerts();
  const res = await req<Array<{ id: string; type: ParentAlert['alert_type']; level: ParentAlert['alert_level'];
    content: string; is_read: boolean; created_at: string }>>(
    `/v1/parent/alerts/${sid}?parent_id=${encodeURIComponent(parentId)}`,
  );
  if (!res.ok) return res;
  const alerts: ParentAlert[] = res.data.map((a) => ({
    id: a.id, alert_type: a.type, alert_level: a.level,
    content: a.content, is_read: a.is_read, created_at: a.created_at,
  }));
  return { ok: true, data: { alerts } };
};

// ── JOL 自测校准 ──────────────────────────────────────────────
export const getCalibration = (sid: string) =>
  USE_MOCK ? mock.mockCalibration() : req<CalibrationRes>(`/v1/calibration/${sid}`);

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
  USE_MOCK ? mock.mockEssayGuide()
           : req<EssayGuideRes>('/v1/essay/guide', { method: 'POST', body: JSON.stringify(r) }, true, 90_000);

// ── 英语口语 ──────────────────────────────────────────────────
export const postSpeakingPractice = (r: SpeakingPracticeReq) =>
  USE_MOCK ? mock.mockSpeakingPractice()
           : req<SpeakingPracticeRes>('/v1/speaking/practice', { method: 'POST', body: JSON.stringify(r) }, true, 90_000);
export const getSpeakingHistory = (sid: string) =>
  USE_MOCK ? mock.mockSpeakingHistory() : req<SpeakingHistoryItem[]>(`/v1/speaking/history/${sid}`);

// ── 受力分析引导（物理）──────────────────────────────────────────
export const startForceAnalysis = (questionText: string) =>
  USE_MOCK
    ? Promise.resolve({ ok: true as const, data: { session_id: 'mock-fa', first_question: '这道题的物体处于什么状态？' } })
    : req<{ session_id: string; first_question: string }>(
        `/v1/physics/force-analysis/start?question_text=${encodeURIComponent(questionText)}`,
        { method: 'POST' },
        true,
        90_000,
      );

export async function forceAnalysisStream(
  sessionId: string,
  message: string,
  onDelta: (reply: string, equationReady: boolean) => void,
): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    onDelta('这个物体受哪些力的作用？你能一一列举吗？', false);
    return;
  }
  const ctrl = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const resetTimer = () => {
    clearTimeout(timer);
    timer = setTimeout(() => ctrl.abort(), SSE_IDLE_TIMEOUT_MS);
  };
  resetTimer();
  try {
    const res = await fetch(
      `${MNEME_API_BASE}/v1/physics/force-analysis/message?session_id=${encodeURIComponent(sessionId)}&message=${encodeURIComponent(message)}`,
      { method: 'POST', headers: { ...authHeader() }, signal: ctrl.signal },
    );
    if (!res.ok || !res.body) throw new Error(`SSE error: ${res.status}`);
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      resetTimer();
      buf += decoder.decode(value, { stream: true });
      const parts = buf.split('\n');
      buf = parts.pop() ?? '';
      for (const line of parts) {
        if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;
        const json = JSON.parse(line.slice(6));
        if ('reply' in json) onDelta(json.reply as string, json.equation_ready as boolean ?? false);
      }
    }
  } finally {
    clearTimeout(timer);
  }
}

// ── 阅读理解引导（英语/语文）────────────────────────────────────
export const startReadingGuide = (params: { article_text: string; question: string; subject: string }) =>
  USE_MOCK
    ? Promise.resolve({ ok: true as const, data: { session_id: 'mock-rg', first_question: '先找找哪个段落和题目最相关？', subject: params.subject } })
    : req<{ session_id: string; first_question: string; subject: string }>(
        '/v1/reading/guide/start',
        { method: 'POST', body: JSON.stringify(params) },
        true,
        90_000,
      );

export async function readingGuideStream(
  sessionId: string,
  message: string,
  onDelta: (reply: string, locatedPassage: boolean) => void,
): Promise<void> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 400));
    onDelta('你觉得答案在文章的哪个部分？', false);
    return;
  }
  const ctrl = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const resetTimer = () => {
    clearTimeout(timer);
    timer = setTimeout(() => ctrl.abort(), SSE_IDLE_TIMEOUT_MS);
  };
  resetTimer();
  try {
    const res = await fetch(
      `${MNEME_API_BASE}/v1/reading/guide/message?session_id=${encodeURIComponent(sessionId)}&message=${encodeURIComponent(message)}`,
      { method: 'POST', headers: { ...authHeader() }, signal: ctrl.signal },
    );
    if (!res.ok || !res.body) throw new Error(`SSE error: ${res.status}`);
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      resetTimer();
      buf += decoder.decode(value, { stream: true });
      const parts = buf.split('\n');
      buf = parts.pop() ?? '';
      for (const line of parts) {
        if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;
        const json = JSON.parse(line.slice(6));
        if ('reply' in json) onDelta(json.reply as string, json.located_passage as boolean ?? false);
      }
    }
  } finally {
    clearTimeout(timer);
  }
}

// ── 每日学科计划 ──────────────────────────────────────────────
// subject=undefined → 所有科目汇总（首页）; subject='math' → 单科（学科页）
export const getDailyPlan = (sid: string, subject?: string) => {
  const qs = subject ? `?subject=${encodeURIComponent(subject)}` : '';
  return USE_MOCK ? mock.mockDailyPlan(subject ?? '') : req<DailyPlanRes>(`/v1/daily-plan/${sid}${qs}`);
};

// ── 努力收益看板（M-F）──────────────────────────────────────────
export const getEffortfulGains = (sid: string, limit = 8) =>
  req<EffortfulGainsRes>(`/v1/effortful-gains/${sid}?limit=${limit}`);

// ── 前置断点 / 薄弱根因（M-G）────────────────────────────────────
export const getWeakRoots = (sid: string) =>
  req<WeakRootsRes>(`/v1/weak-roots/${sid}`);

// ── 知识单元 ──────────────────────────────────────────────────
export const listKnowledgePoints = (params: {
  subject?: string; textbook_id?: string; cluster_id?: string;
  student_id?: string; sort?: string;
}) => {
  const p = new URLSearchParams();
  if (params.subject)      p.set('subject',      params.subject);
  if (params.textbook_id)  p.set('textbook_id',  params.textbook_id);
  if (params.cluster_id)   p.set('cluster_id',   params.cluster_id);
  if (params.student_id)   p.set('student_id',   params.student_id);
  if (params.sort)         p.set('sort',          params.sort);
  return req<KnowledgeUnitItem[]>(`/v1/knowledge-points?${p.toString()}`);
};

export const getKnowledgePoint = (kuId: string, studentId?: string) => {
  const qs = studentId ? `?student_id=${encodeURIComponent(studentId)}` : '';
  return req<KnowledgeUnitItem>(`/v1/knowledge-points/${encodeURIComponent(kuId)}${qs}`);
};

// ── 题库 & 专题练习 ───────────────────────────────────────────
export const listQuestionBank = (params: {
  subject?: string; ku_id?: string; needs_image?: boolean; limit?: number; offset?: number;
}) => {
  const p = new URLSearchParams();
  if (params.subject)                    p.set('subject',      params.subject);
  if (params.ku_id)                      p.set('ku_id',        params.ku_id);
  if (params.needs_image !== undefined)  p.set('needs_image',  String(params.needs_image));
  if (params.limit !== undefined)        p.set('limit',        String(params.limit));
  if (params.offset !== undefined)       p.set('offset',       String(params.offset));
  return req<QuestionBankRes>(`/v1/question-bank?${p.toString()}`);
};

export const submitPracticeAnswer = (body: PracticeSubmitReq) =>
  req<PracticeSubmitRes>('/v1/practice/submit', { method: 'POST', body: JSON.stringify(body) });

// ── 苏格拉底（KU 入口） ───────────────────────────────────────
export const startSocraticForKu = (kuId: string, studentId: string) =>
  req<SocraticStartRes>('/v1/socratic/start-for-ku', {
    method: 'POST',
    body: JSON.stringify({ ku_id: kuId, student_id: studentId }),
  });

// ── 教材文件元数据（供阅读器初始化） ──────────────────────────
export const getTextbookFileMeta = (fileId: string) =>
  req<{ file_id: string; filename: string; file_type: 'pdf' | 'epub'; file_size: number | null;
        textbook_id: string | null; owner_student_id: string | null; has_text_layer: boolean | null;
        uploaded_at: string; }>(`/v1/textbook-files/${encodeURIComponent(fileId)}/meta`);
