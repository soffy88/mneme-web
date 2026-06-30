// 初高中英语核心语法点（结构化整理，供学习参考）。
export interface GrammarExample { en: string; zh: string }
export interface GrammarPoint {
  category: string;
  point: string;
  explanation: string;
  examples: GrammarExample[];
  tip?: string;
}

export const GRAMMAR_POINTS: GrammarPoint[] = [
  // ── 时态 ──
  { category: '时态', point: '一般现在时', explanation: '表示经常性/习惯性动作或客观真理。第三人称单数动词加 -s/-es。', examples: [{ en: 'She works in a hospital.', zh: '她在医院工作。' }, { en: 'The sun rises in the east.', zh: '太阳从东方升起。' }], tip: '频率副词 always/usually/often/sometimes 常与之连用。' },
  { category: '时态', point: '一般过去时', explanation: '表示过去某时发生的动作或状态，规则动词加 -ed。', examples: [{ en: 'I visited Beijing last year.', zh: '我去年去了北京。' }, { en: 'He didn\'t come yesterday.', zh: '他昨天没来。' }], tip: '常与 yesterday、last…、ago、in + 过去年份 连用。' },
  { category: '时态', point: '一般将来时', explanation: 'will / be going to + 动词原形，表示将要发生的动作或打算。', examples: [{ en: 'I will call you tonight.', zh: '我今晚给你打电话。' }, { en: 'They are going to move house.', zh: '他们打算搬家。' }], tip: 'be going to 多表已有计划/有迹象的预测；will 多表临时决定。' },
  { category: '时态', point: '现在进行时', explanation: 'am/is/are + doing，表示此刻正在进行或当前阶段的动作。', examples: [{ en: 'She is reading now.', zh: '她正在读书。' }, { en: 'I\'m learning to drive these days.', zh: '我这几天在学开车。' }] },
  { category: '时态', point: '现在完成时', explanation: 'have/has + 过去分词，强调过去动作对现在的影响，或持续到现在的状态。', examples: [{ en: 'I have finished my homework.', zh: '我已完成作业。' }, { en: 'He has lived here for ten years.', zh: '他在这儿住了十年。' }], tip: '与 already/yet/just/ever/never/since/for 连用；不与具体过去时间点连用。' },
  { category: '时态', point: '过去完成时', explanation: 'had + 过去分词，表示"过去的过去"，即在过去某动作之前已完成。', examples: [{ en: 'When I arrived, the train had left.', zh: '我到时火车已开走。' }], tip: '常用于 by the time、before、after 句中体现先后。' },
  { category: '时态', point: '过去进行时', explanation: 'was/were + doing，表示过去某时刻正在进行的动作。', examples: [{ en: 'I was watching TV when he came in.', zh: '他进来时我正在看电视。' }], tip: '常与 when/while 引导的时间状语连用。' },

  // ── 被动语态 ──
  { category: '被动语态', point: '被动语态构成', explanation: 'be + 过去分词，表示主语是动作的承受者。时态由 be 体现。', examples: [{ en: 'The window was broken by Tom.', zh: '窗户被汤姆打破了。' }, { en: 'English is spoken all over the world.', zh: '英语在世界各地被使用。' }], tip: '不知道或不必说出施动者时常用被动；by 短语可省。' },
  { category: '被动语态', point: '情态动词的被动', explanation: '情态动词 + be + 过去分词。', examples: [{ en: 'The work must be done today.', zh: '这工作今天必须完成。' }, { en: 'Books can be borrowed here.', zh: '书可在此借阅。' }] },

  // ── 情态动词 ──
  { category: '情态动词', point: 'can / could', explanation: '表示能力、许可或可能性；could 是 can 的过去式，也表更委婉的请求。', examples: [{ en: 'Can you swim?', zh: '你会游泳吗？' }, { en: 'Could I use your pen?', zh: '我能用一下你的笔吗？' }] },
  { category: '情态动词', point: 'must / have to', explanation: 'must 表主观必须或肯定推测；have to 表客观必须。否定 mustn\'t = 禁止，don\'t have to = 不必。', examples: [{ en: 'You must finish it.', zh: '你必须完成。' }, { en: 'He must be tired.', zh: '他一定累了。' }], tip: '推测"一定是"用 must be；"不可能"用 can\'t be。' },
  { category: '情态动词', point: 'should / ought to', explanation: '表示应该、建议或责任。', examples: [{ en: 'You should see a doctor.', zh: '你应该去看医生。' }] },

  // ── 非谓语动词 ──
  { category: '非谓语动词', point: '动词不定式 (to do)', explanation: '可作主语、宾语、表语、定语、状语；表示目的或将来的动作。', examples: [{ en: 'To learn English well takes time.', zh: '学好英语需要时间。' }, { en: 'I want to go home.', zh: '我想回家。' }], tip: 'want/hope/decide/plan/agree 等后接不定式。' },
  { category: '非谓语动词', point: '动名词 (doing)', explanation: 'V-ing 作名词用，可作主语、宾语、表语。', examples: [{ en: 'Swimming is good exercise.', zh: '游泳是很好的锻炼。' }, { en: 'He enjoys playing football.', zh: '他喜欢踢足球。' }], tip: 'enjoy/finish/mind/avoid/practise/suggest 等后只接动名词。' },
  { category: '非谓语动词', point: '现在分词作状语 (doing)', explanation: '表示主动、正在进行，作时间/原因/伴随状语，逻辑主语与句子主语一致。', examples: [{ en: 'Hearing the news, she cried.', zh: '听到消息，她哭了。' }] },
  { category: '非谓语动词', point: '过去分词作状语 (done)', explanation: '表示被动、已完成。', examples: [{ en: 'Given more time, we could do better.', zh: '若给更多时间，我们能做得更好。' }] },
  { category: '非谓语动词', point: 'remember/forget/stop + to do vs doing', explanation: '接不定式指"将要做的事"，接动名词指"已做过的事"。', examples: [{ en: 'Remember to lock the door.', zh: '记得去锁门（还没锁）。' }, { en: 'I remember locking the door.', zh: '我记得锁过门了。' }], tip: '高考高频考点，注意时间先后。' },

  // ── 从句 ──
  { category: '定语从句', point: '关系代词 who/which/that', explanation: '修饰先行词。指人用 who/that，指物用 which/that；在从句中作主语或宾语。', examples: [{ en: 'The man who called is my uncle.', zh: '打电话的人是我叔叔。' }, { en: 'The book which I bought is interesting.', zh: '我买的书很有趣。' }], tip: '先行词被 the only/all/序数词修饰，或为 everything 等不定代词时多用 that。' },
  { category: '定语从句', point: '关系副词 where/when/why', explanation: '当先行词为地点/时间/原因且在从句中作状语时使用。', examples: [{ en: 'This is the house where I was born.', zh: '这是我出生的房子。' }, { en: 'I remember the day when we met.', zh: '我记得我们相遇的那天。' }], tip: 'where = in/at which；when = on/in which。' },
  { category: '名词性从句', point: '宾语从句', explanation: '作宾语，连接词 that/whether/if 或疑问词；语序用陈述语序。', examples: [{ en: 'I think (that) he is right.', zh: '我认为他是对的。' }, { en: 'I don\'t know where he lives.', zh: '我不知道他住哪儿。' }], tip: '主句一般过去时，从句时态相应后移。' },
  { category: '名词性从句', point: '主语从句', explanation: '作主语，常用 it 作形式主语置后。', examples: [{ en: 'It is important that we keep calm.', zh: '我们保持冷静很重要。' }, { en: 'Whether he comes doesn\'t matter.', zh: '他是否来都没关系。' }] },
  { category: '状语从句', point: '时间状语从句', explanation: 'when/while/as/before/after/until/as soon as 引导。主将从现：主句将来时，从句用一般现在时。', examples: [{ en: 'I will call you when I arrive.', zh: '我到了就给你打电话。' }], tip: '"主将从现"是高频失分点。' },
  { category: '状语从句', point: '条件状语从句', explanation: 'if/unless 引导。同样遵循"主将从现"。', examples: [{ en: 'If it rains, we will stay home.', zh: '如果下雨，我们就待在家。' }, { en: 'You\'ll fail unless you work hard.', zh: '除非努力否则你会失败。' }] },
  { category: '状语从句', point: '让步状语从句', explanation: 'though/although/even if/no matter how… 引导，表示"尽管/即使"。', examples: [{ en: 'Although he is poor, he is happy.', zh: '尽管贫穷，他很快乐。' }], tip: 'although/though 不与 but 连用（但可与 yet 连用）。' },

  // ── 虚拟语气 ──
  { category: '虚拟语气', point: '与现在事实相反', explanation: 'if + 主语 + 过去式 (be 用 were), 主句 would/could/might + 动词原形。', examples: [{ en: 'If I were you, I would accept it.', zh: '如果我是你，我会接受。' }] },
  { category: '虚拟语气', point: '与过去事实相反', explanation: 'if + had done, 主句 would/could have done。', examples: [{ en: 'If I had studied harder, I would have passed.', zh: '若当时更努力，我就通过了。' }], tip: '混合虚拟：条件指过去、结果指现在时，主句用 would do。' },
  { category: '虚拟语气', point: 'wish / would rather', explanation: 'wish 后从句用虚拟：对现在用过去式，对过去用 had done。', examples: [{ en: 'I wish I were taller.', zh: '但愿我更高些。' }, { en: 'I wish I had told her.', zh: '真希望我当时告诉了她。' }] },

  // ── 特殊句式 ──
  { category: '特殊句式', point: '强调句 It is … that …', explanation: 'It is/was + 被强调部分 + that/who + 其余。可强调主语、宾语、状语（不强调谓语）。', examples: [{ en: 'It was Tom that broke the window.', zh: '正是汤姆打破了窗户。' }], tip: '去掉 It is…that… 仍为完整句，可与定语从句区分。' },
  { category: '特殊句式', point: '倒装句', explanation: '否定词/only + 状语置句首时，主句部分倒装（助动词提前）。', examples: [{ en: 'Never have I seen such a scene.', zh: '我从未见过这样的景象。' }, { en: 'Only then did he realize his mistake.', zh: '直到那时他才意识到错误。' }] },
  { category: '特殊句式', point: 'so/such … that 结果状语', explanation: 'so + 形容词/副词；such + 名词，引出"如此…以至于"。', examples: [{ en: 'He is so kind that everyone likes him.', zh: '他如此善良，人人都喜欢他。' }, { en: 'It was such a cold day that we stayed in.', zh: '天气太冷，我们待在屋里。' }] },
  { category: '特殊句式', point: '反义疑问句', explanation: '前肯后否、前否后肯；陈述部分与附加问句助动词/时态一致。', examples: [{ en: 'You are a student, aren\'t you?', zh: '你是学生，对吧？' }, { en: 'He doesn\'t like tea, does he?', zh: '他不喜欢茶，是吧？' }], tip: '含 never/seldom/hardly 等否定词视为否定句。' },

  // ── 比较 ──
  { category: '比较等级', point: '比较级与最高级', explanation: '单音节加 -er/-est；多音节用 more/most。比较级 + than；the + 最高级 + 范围。', examples: [{ en: 'She is taller than me.', zh: '她比我高。' }, { en: 'This is the most interesting book.', zh: '这是最有趣的书。' }], tip: 'good/well→better/best；bad→worse/worst；much/many→more/most。' },
  { category: '比较等级', point: 'as … as 同级比较', explanation: 'as + 形容词/副词原级 + as，表示"和…一样"；否定 not as/so … as。', examples: [{ en: 'He runs as fast as you.', zh: '他跑得和你一样快。' }] },
  { category: '比较等级', point: 'the more … the more', explanation: '"越…越…"句型，比较级提前。', examples: [{ en: 'The harder you work, the luckier you get.', zh: '越努力越幸运。' }] },

  // ── 词法基础 ──
  { category: '词法基础', point: '冠词 a/an/the', explanation: 'a/an 表泛指（an 用于元音音素前）；the 表特指或独一无二。', examples: [{ en: 'an hour, a university', zh: '注意按读音而非字母选 a/an。' }, { en: 'The earth goes around the sun.', zh: '地球绕太阳转。' }] },
  { category: '词法基础', point: '主谓一致', explanation: '谓语随主语单复数变化。and 连接为复数；就近原则 (or/either…or) 随最近主语。', examples: [{ en: 'Either you or he is right.', zh: '不是你对就是他对。' }, { en: 'The number of students is large.', zh: '学生数量很大。' }], tip: 'a number of + 复数（许多）；the number of + 复数 + 单数谓语。' },
  { category: '词法基础', point: 'It 作形式主语/宾语', explanation: 'it 替代后置的不定式或从句作主语/宾语，避免头重脚轻。', examples: [{ en: 'It is hard to say.', zh: '很难说。' }, { en: 'I find it useful to keep a diary.', zh: '我觉得记日记很有用。' }] },
];
