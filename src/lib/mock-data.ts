/**
 * Mneme mock 数据 — NEXT_PUBLIC_USE_MOCK=true 时用。
 *
 * 模拟真实数据结构,让前端在后端没起时可以跑和看 UI。
 * dev 验证码固定 123456。
 */
import type {
  ApiResult,
  LoginReq, LoginRes, UserProfile,
  PaperUploadRes, PaperResult,
  InteractionReq, InteractionRes, MasteryRes, MasteryCurveRes,
  SocraticStartRes, EscapeRes,
  MissionRes, CompleteMissionRes,
  PracticeRes, LessonRes, PlotTrace,
  ParentOverviewRes, ParentAlertsRes, ChildInfo,
  ErrorJournalRes, ReviewDueItem, EssayGuideRes, SpeakingPracticeRes, SpeakingHistoryItem,
  DailyPlanRes,
} from '@/types/api';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const ok  = <T>(data: T): ApiResult<T> => ({ ok: true, data });
const err = (e: string): ApiResult<never> => ({ ok: false, error: e });

export const mockSendCode        = async (): Promise<ApiResult<void>>  => { await delay(400); return ok(undefined); };
export const mockRegisterStudent = async (): Promise<ApiResult<LoginRes>> => { await delay(600); return ok(MOCK_LOGIN_RES); };
export const mockRegisterParent  = async (): Promise<ApiResult<LoginRes>> => { await delay(600); return ok(MOCK_LOGIN_RES); };
export const mockMe              = async (): Promise<ApiResult<UserProfile>> => ok(MOCK_USER);

export const mockLogin = async (r: LoginReq): Promise<ApiResult<LoginRes>> => {
  await delay(500);
  if (r.code !== '123456') return err('验证码错误');
  return ok(MOCK_LOGIN_RES);
};

const MOCK_USER: UserProfile = {
  id: 'stu-001', name: '小明', role: 'student', grade: '高三', phone: '13800138000',
};
const MOCK_LOGIN_RES: LoginRes = { token: 'mock-jwt-token-abc', user: MOCK_USER };

export const mockUploadPaper = async (): Promise<ApiResult<PaperUploadRes>> => {
  await delay(800);
  return ok({ paper_id: 'paper-mock-001', status: 'processing' });
};

export const mockGetPaper = async (id: string): Promise<ApiResult<PaperResult>> => {
  await delay(1200);
  return ok({
    paper_id: id,
    status: 'done',
    wrong_questions: [
      { question_no: '3', kc_id: 'GDMATH-CONIC-01', kc_name: '椭圆', description: '焦距计算错误' },
      { question_no: '7', kc_id: 'GDMATH-CONIC-04', kc_name: '圆锥曲线综合', description: '抛物线焦点距离公式混淆' },
    ],
    common_breakpoint: {
      has_breakpoint: true,
      description: '列方程时反复漏掉隐含条件',
      entry_question_no: '3',
    },
  });
};

export const mockListPapers = async (): Promise<ApiResult<PaperResult[]>> => ok([]);

export const mockInteraction = async (_r: InteractionReq): Promise<ApiResult<InteractionRes>> => {
  await delay(300);
  return ok({
    p_mastery: 0.68, long_term_mastery: 0.61, effective_mastery: 0.58,
    error_type: null, rating: 'Good',
    next_review_due: new Date(Date.now() + 86400 * 3 * 1000).toISOString(),
    n_attempts: 6,
    feedback: { text: '这个考点基本拿下了 💪', type: 'milestone' },
    step_verified: null, step_feedback: null,
  });
};

export const mockMastery = async (): Promise<ApiResult<MasteryRes>> => {
  await delay(400);
  return ok({
    student_id: 'stu-001',
    count: 4,
    knowledge_points: [
      { kc_id: 'GDMATH-CONIC-04', kc_name: '圆锥曲线综合（压轴）', long_term_mastery: 0.12, effective_mastery: 0.09, n_attempts: 2, peer_percentile: 0.34 },
      { kc_id: 'GDMATH-CONIC-01', kc_name: '椭圆',                  long_term_mastery: 0.41, effective_mastery: 0.35, n_attempts: 8, peer_percentile: 0.52 },
      { kc_id: 'GDMATH-SEQ-01',   kc_name: '等差数列与等比数列',     long_term_mastery: 0.73, effective_mastery: 0.68, n_attempts: 15, peer_percentile: 0.81 },
      { kc_id: 'GDMATH-PROB-01',  kc_name: '概率与统计',             long_term_mastery: 0.85, effective_mastery: 0.82, n_attempts: 20, peer_percentile: 0.91 },
    ],
  });
};

export const mockCurve = async (): Promise<ApiResult<MasteryCurveRes>> => {
  await delay(300);
  return ok({
    kc_id: 'GDMATH-CONIC-01', kc_name: '椭圆',
    points: [
      { month: '2026-01', mastery: 0.10 },
      { month: '2026-02', mastery: 0.18 },
      { month: '2026-03', mastery: 0.25 },
      { month: '2026-04', mastery: 0.33 },
      { month: '2026-05', mastery: 0.41 },
      { month: '2026-06', mastery: 0.35 },
    ],
  });
};

export const mockReviewQueue = async () => ok([]);

export const mockStartSocratic = async (): Promise<ApiResult<SocraticStartRes>> => {
  await delay(500);
  return ok({
    session_id: 'soc-mock-001',
    mode: 'deep',
    first_question: '这道椭圆题在问什么？用自己的话说说你对这道题的理解。',
  });
};

export const mockSocraticStream = async (
  onDelta: (d: string) => void,
  onDone: (e: string | null, o: string | null) => void,
): Promise<void> => {
  const chunks = ['嗯，你的思路', '有一点对——', '但你有没有注意到', '题目里提到的隐含条件？', '再仔细看看第二行。'];
  for (const c of chunks) {
    await delay(150);
    onDelta(c);
  }
  await delay(200);
  onDone(null, null);
};

export const mockEscape = async (): Promise<ApiResult<EscapeRes>> => {
  await delay(300);
  return ok({ answer_outline: '思路提示：先用定义求焦距 c = √(a²−b²)，再代入题目已知条件。', used_escape_hatch: true });
};

export const mockEndSocratic = async (): Promise<ApiResult<void>> => { await delay(200); return ok(undefined); };

export const mockMission = async (): Promise<ApiResult<MissionRes>> => {
  await delay(400);
  const hour = new Date().getHours();
  if (hour >= 23) {
    return ok({
      mission: {
        id: 'miss-rest', mission_type: 'rest',
        content: { description: '今天做得够多了，休息吧' },
        estimated_minutes: 0, completed: false, interleaved: false, requires_active_recall: false,
      },
      streak: { current_streak: 12, longest_streak: 23 },
    });
  }
  return ok({
    mission: {
      id: 'miss-001', mission_type: 'review',
      content: { description: '回顾上周错的 2 道椭圆题', kc_id: 'GDMATH-CONIC-01', kc_name: '椭圆' },
      estimated_minutes: 10, completed: false, interleaved: false, requires_active_recall: true,
    },
    streak: { current_streak: 12, longest_streak: 23 },
  });
};

export const mockCompleteMission = async (): Promise<ApiResult<CompleteMissionRes>> => {
  await delay(300);
  return ok({ streak: { current_streak: 13, longest_streak: 23 }, next_preview: '明天：解析几何专项练习' });
};

export const mockPractice = async (): Promise<ApiResult<PracticeRes>> => {
  await delay(800);
  return ok({
    kc_name: '椭圆',
    all_kernel_verified: true,
    items: [
      {
        question_latex: '已知椭圆 \\dfrac{x^2}{16}+\\dfrac{y^2}{9}=1，求焦距。',
        answer: '2\\sqrt{7}',
        solution_steps: [
          { step_no: 1, latex: 'a^2=16,\\;b^2=9', description: '读题' },
          { step_no: 2, latex: 'c=\\sqrt{a^2-b^2}=\\sqrt{7}', description: '焦距公式' },
          { step_no: 3, latex: '2c=2\\sqrt{7}', description: '焦距' },
        ],
        kernel_verified: true, plot_data: null, difficulty: 0.4,
      },
    ],
  });
};

export const mockLesson = async (): Promise<ApiResult<LessonRes>> => {
  await delay(500);
  return ok({
    question_id: 'q-mock-001',
    question_text: '已知椭圆 x²/16 + y²/9 = 1，求焦距。',
    answer: '2\\sqrt{7}',
    solution_steps: [
      { step_no: 1, latex: 'a^2=16,\\;b^2=9', description: '读题确定参数' },
      { step_no: 2, latex: 'c=\\sqrt{a^2-b^2}=\\sqrt{7}', description: '焦距公式' },
      { step_no: 3, latex: '2c=2\\sqrt{7}', description: '最终焦距' },
    ],
    plot_data: {
      kc_type: 'conic',
      traces: [
        { type: 'ellipse', params: { a: 4, b: 3, cx: 0, cy: 0 } },
        { type: 'point',   params: { x: 2.646, y: 0, label: 'F₁' } },
        { type: 'point',   params: { x: -2.646, y: 0, label: 'F₂' } },
      ] as PlotTrace[],
      annotations: [
        { type: 'label', x: 4.2, y: 0, text: 'a=4' },
        { type: 'label', x: 0, y: 3.2, text: 'b=3' },
      ],
      x_range: [-6, 6], y_range: [-5, 5],
    },
    self_check_passed: true,
    kc_id: 'GDMATH-CONIC-01',
  });
};

export const mockChildren      = async (): Promise<ApiResult<ChildInfo[]>>         => ok([{ student_id: 'stu-001', name: '小明', grade: '高三' }]);
export const mockParentOverview = async (): Promise<ApiResult<ParentOverviewRes>>  => ok({ weak_kc_count: 4, weak_kc_trend: -2, streak: 12, emotion: 'stable', top_improved_kc: '等差数列与等比数列', study_minutes_today: 40 });
export const mockParentAlerts   = async (): Promise<ApiResult<ParentAlertsRes>>    => ok({ alerts: [{ id: 'a-001', alert_type: 'task_missing', alert_level: 'notice', content: '小明本周有 3 天未完成今日目标', is_read: false, created_at: new Date().toISOString() }] });

export const mockErrorJournal = async (): Promise<ApiResult<ErrorJournalRes>> => {
  await delay(400);
  return ok({
    distribution: [
      { kc_id: 'GDMATH-CONIC-01', error_count: 3, error_types: { careless: 1, dontknow: 2 } as Record<string, number> },
      { kc_id: 'GDMATH-CONIC-04', error_count: 2, error_types: { careless: 2 } as Record<string, number> },
    ],
    items: [
      { question_id: 'q-001', kc_id: 'GDMATH-CONIC-01', error_tag: 'dontknow', wrong_at: new Date(Date.now() - 86400000).toISOString(),     can_practice_variant: true  },
      { question_id: 'q-002', kc_id: 'GDMATH-CONIC-04', error_tag: 'careless', wrong_at: new Date(Date.now() - 2 * 86400000).toISOString(), can_practice_variant: true  },
      { question_id: 'q-003', kc_id: 'GDMATH-CONIC-01', error_tag: 'dontknow', wrong_at: new Date(Date.now() - 3 * 86400000).toISOString(), can_practice_variant: false },
    ],
  });
};

export const mockReviewDue = async (): Promise<ApiResult<ReviewDueItem[]>> => {
  await delay(300);
  return ok([
    { kc_id: 'GDMATH-CONIC-01', variant_question: '已知椭圆 \\dfrac{x^2}{9}+\\dfrac{y^2}{4}=1，求焦距和离心率。', due_since: new Date(Date.now() - 86400000).toISOString(), fsrs_interval: 3 },
    { kc_id: 'GDMATH-SEQ-01',   variant_question: '设等差数列 {a_n} 满足 a_3=5，a_7=13，求公差 d。',               due_since: new Date(Date.now() - 2 * 86400000).toISOString(), fsrs_interval: 7 },
  ]);
};

export const mockEssayGuide = async (): Promise<ApiResult<EssayGuideRes>> => {
  await delay(1000);
  return ok({
    rubric_scores: {
      structure: { comment: '文章整体结构清晰，有引言、主体和结尾，但段落之间的过渡略显生硬。' },
      argument: { comment: '论点明确，但部分论据缺乏具体事例支撑，说服力有待加强。' },
      expression: { comment: '语言表达流畅，用词准确，但可以尝试使用更多修辞手法增强文采。' },
    },
    guidance_questions: [
      '你的第二段提到了"社会进步"，能否举一个具体的历史或现实例子来支持这个观点？',
      '从第三段到第四段的过渡，读者是否能清楚地跟上你的思路？你觉得需要添加什么连接词？',
      '你的结论段是否回应了开头提出的问题？有没有留给读者思考的空间？',
    ],
    is_completed: true,
  });
};

export const mockSpeakingPractice = async (): Promise<ApiResult<SpeakingPracticeRes>> => {
  await delay(1200);
  return ok({
    session_id: 'sp-mock-001',
    turns: [
      { role: 'ai',   text: 'Let\'s practice! Please read the first sentence.' },
      { role: 'user', text: 'I enjoy learning English every day.' },
      { role: 'ai',   text: 'Great job! Your pronunciation is improving.' },
    ],
    pronunciation_scores: [
      { overall_score: 0.78, fluency_score: 0.80, accuracy_score: 0.76, word_scores: [] },
    ],
    overall_progress: 0.78,
  });
};

export const mockDailyPlan = async (subject: string): Promise<ApiResult<DailyPlanRes>> => {
  await delay(350);
  const names: Record<string, string> = { math: '数学', physics: '物理', english: '英语', chinese: '语文' };
  return ok({
    date: new Date().toISOString().slice(0, 10),
    subject,
    exam_countdown_days: 350,
    tasks: [
      { type: 'review',        title: '复习3个到期知识点',          ku_ids: [], estimated_minutes: 15, priority: 1, reason: 'FSRS到期' },
      { type: 'weak_practice', title: `薄弱专题：${names[subject] ?? subject}核心考点`, ku_ids: [], estimated_minutes: 20, priority: 2, reason: '掌握度低于60%' },
      { type: 'error_review',  title: '重做2道错题',                ku_ids: [], estimated_minutes: 10, priority: 3, reason: '错题本待巩固' },
    ],
  });
};

export const mockSpeakingHistory = async (): Promise<ApiResult<SpeakingHistoryItem[]>> => {
  await delay(300);
  return ok([
    { session_id: 'sp-001', topic: 'Daily Routine', overall_progress: 0.72, created_at: new Date(Date.now() - 86400000).toISOString() },
    { session_id: 'sp-002', topic: 'My Hobbies',    overall_progress: 0.78, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
  ]);
};
