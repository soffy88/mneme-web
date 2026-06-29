// 物理公式补充数据（来源：公开教辅 markdown 抽取+清洗，公式为公共领域事实）
export interface ExtraFormula { stage: string; chapter: string; section: string; name: string; latex: string }
export const PHYSICS_EXTRA_FORMULAS: ExtraFormula[] = [
{
"stage": "高中",
"chapter": "运动的描述",
"section": "时间和位移",
"name": "> 平均速度",
"latex": "$\\overline v=\\frac{△x}{△t}$"
},
{
"stage": "高中",
"chapter": "运动的描述",
"section": "时间和位移",
"name": "> 平均速率",
"latex": "$\\overline v_{速率}=\\frac s{△t}$"
},
{
"stage": "高中",
"chapter": "运动的描述",
"section": "速度",
"name": "速度",
"latex": "$v = \\frac{\\Delta x}{\\Delta t}$"
},
{
"stage": "高中",
"chapter": "匀变速直线运动",
"section": "匀变速直线运动",
"name": "匀变速直线运动",
"latex": "$v=v_0+at$"
},
{
"stage": "高中",
"chapter": "匀变速直线运动",
"section": "匀变速直线运动",
"name": "匀变速直线运动",
"latex": "$x=vt-\\frac 1 2at^2$ $v_0$"
},
{
"stage": "高中",
"chapter": "匀变速直线运动",
"section": "匀变速直线运动",
"name": "匀变速直线运动",
"latex": "$x=v_0t+\\frac 1 2at^2$ $v_t$"
},
{
"stage": "高中",
"chapter": "匀变速直线运动",
"section": "匀变速直线运动",
"name": "匀变速直线运动",
"latex": "$x=\\frac{v_0+v}{2}t$"
},
{
"stage": "高中",
"chapter": "匀变速直线运动",
"section": "匀变速直线运动",
"name": "匀变速直线运动",
"latex": "$x=\\frac{v^2-v_0^2}{2a}$"
},
{
"stage": "高中",
"chapter": "中点速度",
"section": "时间中点速度",
"name": "时间中点速度",
"latex": "$v_{\\frac t 2}=\\overline v = \\frac{v_0+v_t}2=\\frac x t$"
},
{
"stage": "高中",
"chapter": "匀变速直线运动",
"section": "匀变速直线运动的推论",
"name": "连续相等时间的位移之差",
"latex": "$x_{i+1}-x_i=△x=aT^2$"
},
{
"stage": "高中",
"chapter": "匀变速直线运动",
"section": "匀变速直线运动速度和时间的关系",
"name": "匀变速直线运动速度和时间的关系",
"latex": "$v=v_0+at$ $v_0$"
},
{
"stage": "高中",
"chapter": "匀变速直线运动位移和时间的关系",
"section": "匀变速直线运动的位移",
"name": "匀变速直线运动的位移",
"latex": "$x=v_0t+\\frac{1}{2}at^2$"
},
{
"stage": "高中",
"chapter": "匀变速直线运动位移和时间的关系",
"section": "匀变速直线运动的位移",
"name": "匀变速直线运动的位移",
"latex": "$v_0=0$"
},
{
"stage": "高中",
"chapter": "匀变速直线运动",
"section": "匀变速直线运动速度和位移的关系",
"name": "匀变速直线运动速度和位移的关系",
"latex": "$v^2 - v_0^2 = 2ax$"
},
{
"stage": "高中",
"chapter": "匀变速直线运动",
"section": "自由落体运动",
"name": "条件",
"latex": "$g=10m/s^2$"
},
{
"stage": "高中",
"chapter": "匀变速直线运动",
"section": "自由落体运动",
"name": "位移",
"latex": "$h = \\frac{1}{2}gt^2$"
},
{
"stage": "高中",
"chapter": "匀变速直线运动",
"section": "自由落体运动",
"name": "位移与速度的关系",
"latex": "$v^2 = 2gh$"
},
{
"stage": "高中",
"chapter": "匀变速直线运动",
"section": "自由落体运动",
"name": "平均速度",
"latex": "$\\bar{v}=\\frac{v}{2}=\\frac{1}{2}gh$"
},
{
"stage": "高中",
"chapter": "竖直上抛运动",
"section": "竖直上抛运动分段处理法",
"name": "速度",
"latex": "$v=v_0-gt$"
},
{
"stage": "高中",
"chapter": "竖直上抛运动",
"section": "竖直上抛运动分段处理法",
"name": "位移",
"latex": "$h = v_0t-\\frac{1}{2}gt^2$"
},
{
"stage": "高中",
"chapter": "竖直上抛运动",
"section": "竖直上抛运动分段处理法",
"name": "竖直上抛运动分段处理法",
"latex": "$-2gh=v^2-v_0^2$"
},
{
"stage": "高中",
"chapter": "竖直上抛运动",
"section": "竖直上抛运动分段处理法",
"name": "竖直上抛运动分段处理法",
"latex": "$h = \\frac{v_0+v}{2}t$"
},
{
"stage": "高中",
"chapter": "竖直上抛运动",
"section": "竖直上抛运动分段处理法",
"name": "竖直上抛运动分段处理法",
"latex": "$t=\\frac{v_0}{g}$"
},
{
"stage": "高中",
"chapter": "匀变速直线运动",
"section": "平抛",
"name": "平抛",
"latex": "$x=v_0t=v_0 \\sqrt{\\frac{2h}{g}}$"
},
{
"stage": "高中",
"chapter": "匀变速直线运动",
"section": "平抛",
"name": "平抛",
"latex": "$y=\\frac 1 2 gt^2$"
},
{
"stage": "高中",
"chapter": "匀变速直线运动",
"section": "平抛",
"name": "抛物线曲线方程",
"latex": "$y=\\frac{g}{2v_0}x^2$"
},
{
"stage": "高中",
"chapter": "匀变速直线运动",
"section": "平抛",
"name": "平抛",
"latex": "$t=\\sqrt{\\frac{2h}g}$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "纸带/打点计时器问题",
"name": "端点瞬时速度",
"latex": "$V_A=\\frac{3s_1-s_2}{2T}$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "纸带/打点计时器问题",
"name": "中间某点速度=相邻两段平均速度",
"latex": "$v=\\frac{x_1+x_2}{2t}$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "纸带/打点计时器问题",
"name": "计算加速度",
"latex": "$△x=naT^2$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "两段运动的0-v-0模型",
"name": "两段运动的0-v-0模型",
"latex": "$\\frac{a1}{a2}=\\frac{t2}{t1}=\\frac{x2}{x1}$"
},
{
"stage": "高中",
"chapter": "胡克定律",
"section": "题型：弹簧串联并联",
"name": "题型：弹簧串联并联",
"latex": "$k_并x=k_1x+k_2x$"
},
{
"stage": "高中",
"chapter": "胡克定律",
"section": "题型：弹簧串联并联",
"name": "题型：弹簧串联并联",
"latex": "$k_并=k_1+k_2$"
},
{
"stage": "高中",
"chapter": "胡克定律",
"section": "题型：弹簧串联并联",
"name": "题型：弹簧串联并联",
"latex": "$ x_1+x_2=x$"
},
{
"stage": "高中",
"chapter": "胡克定律",
"section": "题型：弹簧串联并联",
"name": "题型：弹簧串联并联",
"latex": "$\\frac{F}{k_1}+\\frac{F}{k_2}=\\frac{F}{k_串}$"
},
{
"stage": "高中",
"chapter": "摩擦力",
"section": "滑动摩擦力",
"name": "大小",
"latex": "$F=μF_N(μ：动摩擦因数 F_N接触面间正压力)$"
},
{
"stage": "高中",
"chapter": "力的合成",
"section": "合力大小",
"name": "合力大小",
"latex": "$F=\\sqrt{F_1^2+F_2^2+2F_1F_2cos \\alpha}$"
},
{
"stage": "高中",
"chapter": "受力分析",
"section": "三力平衡",
"name": "三力平衡",
"latex": "$\\frac N R=\\frac{F}{h+R}=\\frac T L$"
},
{
"stage": "高中",
"chapter": "受力分析",
"section": "三力平衡",
"name": "三力平衡",
"latex": "$T=mg\\frac{L}{h+R}$"
},
{
"stage": "高中",
"chapter": "受力分析",
"section": "三力平衡",
"name": "三力平衡",
"latex": "$N=mg\\frac{R}{h+R}$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "滑轮晾衣服模型/等腰三角形",
"name": "滑轮晾衣服模型/等腰三角形",
"latex": "$F=\\frac{G}{2cosθ}$"
},
{
"stage": "高中",
"chapter": "牛顿运动定律",
"section": "牛顿第二定律",
"name": "牛顿第二定律",
"latex": "$F=m\\frac{△v}{△t}=ma$"
},
{
"stage": "高中",
"chapter": "牛顿运动定律",
"section": "牛顿第二定律",
"name": "力的单位",
"latex": "$1m/s^2$ $1N=1kg·m/s^2$"
},
{
"stage": "高中",
"chapter": "牛顿第二定律",
"section": "两类典型问题",
"name": "两类典型问题",
"latex": "$Fn-mg=m_{ay}$"
},
{
"stage": "高中",
"chapter": "牛顿第二定律",
"section": "两类典型问题",
"name": "两类典型问题",
"latex": "$f=m_{ax}$"
},
{
"stage": "高中",
"chapter": "牛顿运动定律",
"section": "牛顿第三定律",
"name": "公式",
"latex": "$F=-F^{'}$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "已知车内绳子倾角求加速度",
"name": "已知车内绳子倾角求加速度",
"latex": "$T=\\frac{mg}{cosθ}$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "已知车内绳子倾角求加速度",
"name": "> 两个式子平方再相加消去θ",
"latex": "$T=\\sqrt{m^2a^2+m^2g^2}$"
},
{
"stage": "高中",
"chapter": "连接体",
"section": "绳子直的",
"name": "绳子直的",
"latex": "$a=\\frac{F}{m_A+m_B}$"
},
{
"stage": "高中",
"chapter": "连接体",
"section": "绳子直的",
"name": "绳子直的",
"latex": "$a=\\frac{F}{m_A+m_B}-μg$"
},
{
"stage": "高中",
"chapter": "连接体",
"section": "绳子直的",
"name": "绳子直的",
"latex": "$a=\\frac{F}{m_A+m_B}-gsinθ-μgcosθ$"
},
{
"stage": "高中",
"chapter": "连接体",
"section": "绳子直的",
"name": "绳子直的",
"latex": "$T=\\frac{m_A}{m_A+m_B}F$"
},
{
"stage": "高中",
"chapter": "平抛运动",
"section": "速度规律",
"name": "竖直",
"latex": "$v_y=gt$"
},
{
"stage": "高中",
"chapter": "平抛运动",
"section": "速度规律",
"name": "合速度",
"latex": "$v=\\sqrt{v_0^2+(gt)^2}$"
},
{
"stage": "高中",
"chapter": "平抛运动",
"section": "速度规律",
"name": "方向",
"latex": "$tan \\theta=\\frac{v_y}{v_x}=\\frac{gt}{v_0}$"
},
{
"stage": "高中",
"chapter": "平抛运动",
"section": "速度规律",
"name": "速度规律",
"latex": "$v_0=vcosθ$"
},
{
"stage": "高中",
"chapter": "平抛运动",
"section": "速度规律",
"name": "速度规律",
"latex": "$v_y=vsinθ=v_0tanθ$"
},
{
"stage": "高中",
"chapter": "平抛运动",
"section": "位移规律",
"name": "水平",
"latex": "$x=v_0t$"
},
{
"stage": "高中",
"chapter": "平抛运动",
"section": "位移规律",
"name": "竖直",
"latex": "$y=\\frac{1}{2}gt^2$"
},
{
"stage": "高中",
"chapter": "平抛运动",
"section": "位移规律",
"name": "合位移",
"latex": "$s=\\sqrt{x^2+y^2}$"
},
{
"stage": "高中",
"chapter": "平抛运动",
"section": "扩展：斜抛",
"name": "扩展：斜抛",
"latex": "$v_x=v_0cosθ$"
},
{
"stage": "高中",
"chapter": "平抛运动",
"section": "扩展：斜抛",
"name": "扩展：斜抛",
"latex": "$v_y=v_0sinθ$"
},
{
"stage": "高中",
"chapter": "平抛运动",
"section": "扩展：斜抛",
"name": "扩展：斜抛",
"latex": "$v_y=0$ $v_{min}=v_x$"
},
{
"stage": "高中",
"chapter": "平抛运动",
"section": "扩展：斜抛",
"name": "上抛→下落到相同高度的位移",
"latex": "$x=v_x·2\\sqrt{\\frac{2h}g}$"
},
{
"stage": "高中",
"chapter": "曲线运动",
"section": "匀速圆周运动",
"name": "线速度",
"latex": "$v=\\frac s t=\\frac{2πr}T=ωr$"
},
{
"stage": "高中",
"chapter": "曲线运动",
"section": "匀速圆周运动",
"name": "角速度",
"latex": "$ω=\\frac{△θ}{△t}=\\frac{2π}T$"
},
{
"stage": "高中",
"chapter": "曲线运动",
"section": "匀速圆周运动",
"name": "周期（转一周t）",
"latex": "$T=\\frac{2π}{ω}$"
},
{
"stage": "高中",
"chapter": "曲线运动",
"section": "匀速圆周运动",
"name": "频率（1s内圈数）",
"latex": "$f=\\frac 1 T$"
},
{
"stage": "高中",
"chapter": "曲线运动",
"section": "匀速圆周运动",
"name": "转速",
"latex": "$n=\\frac 1 T$"
},
{
"stage": "高中",
"chapter": "曲线运动",
"section": "匀速圆周运动",
"name": "匀速圆周运动",
"latex": "$a_向=\\frac{v^2}r=ω^2r=\\frac{4π^2r}{T^2}=4π^2f^2r=ωv$"
},
{
"stage": "高中",
"chapter": "曲线运动",
"section": "匀速圆周运动",
"name": "匀速圆周运动",
"latex": "$F_向=m\\frac{v^2}r=mω^2r=m\\frac{4π^2}{T^2}r=4mπ^2f^2r$"
},
{
"stage": "高中",
"chapter": "匀速圆周运动",
"section": "线速度",
"name": "公式",
"latex": "$v=\\frac{\\Delta s}{\\Delta t}(\\Delta s：通过的弧长，\\Delta t:用时)$"
},
{
"stage": "高中",
"chapter": "匀速圆周运动",
"section": "角速度",
"name": "公式",
"latex": "$ω=\\frac{△θ}{△t}=\\frac{2π}T$"
},
{
"stage": "高中",
"chapter": "匀速圆周运动",
"section": "周期",
"name": "公式",
"latex": "$T=\\frac{2 \\pi}{\\omega}$"
},
{
"stage": "高中",
"chapter": "匀速圆周运动",
"section": "频率",
"name": "公式",
"latex": "$f=\\frac{1}{T}$"
},
{
"stage": "高中",
"chapter": "曲线运动",
"section": "向心加速度",
"name": "向心加速度",
"latex": "$a_n=\\frac{v^2}r=ω^2r=ωv=\\frac{4π^2r}{T^2}=4π^2f^2r$"
},
{
"stage": "高中",
"chapter": "曲线运动",
"section": "向心力",
"name": "向心力的大小",
"latex": "$F_n=ma_n=m\\frac{v^2}{r}=m\\omega ^2r=m\\frac{4 \\pi^2}{T^2}r=m(2\\pi f)^2r=m\\omega v$"
},
{
"stage": "高中",
"chapter": "向心力",
"section": "离心运动",
"name": "方向",
"latex": "$=m\\frac{V^2}R$"
},
{
"stage": "高中",
"chapter": "匀速圆周运动模型",
"section": "圆盘",
"name": "圆盘",
"latex": "$f=mω^2r$"
},
{
"stage": "高中",
"chapter": "匀速圆周运动模型",
"section": "圆盘",
"name": "圆盘",
"latex": "$ω=\\sqrt{\\frac{μg}{r}}$"
},
{
"stage": "高中",
"chapter": "圆盘",
"section": "多物体同侧绳连",
"name": "绳子出现拉力",
"latex": "$ω=\\sqrt{\\frac{μg}{r_A+r_B}}$"
},
{
"stage": "高中",
"chapter": "圆盘",
"section": "多物体同侧绳连",
"name": "发生相对滑动",
"latex": "$ω=\\sqrt{\\frac{2μg}{r_A+r_B}}$"
},
{
"stage": "高中",
"chapter": "圆盘",
"section": "不同侧绳连",
"name": "绳子出现拉力",
"latex": "$ω=\\sqrt{\\frac{μg}{r_A-r_B}}$"
},
{
"stage": "高中",
"chapter": "圆盘",
"section": "不同侧绳连",
"name": "发生相对滑动",
"latex": "$ω=\\sqrt{\\frac{2μg}{r_A-r_B}}$"
},
{
"stage": "高中",
"chapter": "曲线运动",
"section": "非匀速圆周运动（竖直方向）",
"name": "细绳最高点最小v",
"latex": "$v=\\sqrt{gr}$"
},
{
"stage": "高中",
"chapter": "曲线运动",
"section": "生活中的圆周运动",
"name": "生活中的圆周运动",
"latex": "$F_合=F_向$"
},
{
"stage": "高中",
"chapter": "生活中的圆周运动",
"section": "铁路的弯道/倾斜的高速公路",
"name": "铁路的弯道/倾斜的高速公路",
"latex": "$F_向=m\\frac{v_0^2}{r}$"
},
{
"stage": "高中",
"chapter": "生活中的圆周运动",
"section": "铁路的弯道/倾斜的高速公路",
"name": "铁路的弯道/倾斜的高速公路",
"latex": "$F_合=mgtan\\theta$"
},
{
"stage": "高中",
"chapter": "生活中的圆周运动",
"section": "铁路的弯道/倾斜的高速公路",
"name": "铁路的弯道/倾斜的高速公路",
"latex": "$F_合=F_向→v_0=\\sqrt{grtan\\theta}$"
},
{
"stage": "高中",
"chapter": "生活中的圆周运动",
"section": "铁路的弯道/倾斜的高速公路",
"name": "铁路的弯道/倾斜的高速公路",
"latex": "$v=v_0$"
},
{
"stage": "高中",
"chapter": "汽车过拱桥问题",
"section": "过凸形桥",
"name": "过凸形桥",
"latex": "$F_合=F_向→$"
},
{
"stage": "高中",
"chapter": "汽车过拱桥问题",
"section": "过凸形桥",
"name": "过凸形桥",
"latex": "$G-F_N=m\\frac{v^2}{r}→$"
},
{
"stage": "高中",
"chapter": "汽车过拱桥问题",
"section": "过凸形桥",
"name": "过凸形桥",
"latex": "$F_N=G-m\\frac{v^2}{r}→$"
},
{
"stage": "高中",
"chapter": "汽车过拱桥问题",
"section": "过凹形桥",
"name": "过凹形桥",
"latex": "$F_合=F_向→$"
},
{
"stage": "高中",
"chapter": "汽车过拱桥问题",
"section": "过凹形桥",
"name": "过凹形桥",
"latex": "$F_N-G=m\\frac{v^2}{r}→$"
},
{
"stage": "高中",
"chapter": "汽车过拱桥问题",
"section": "过凹形桥",
"name": "过凹形桥",
"latex": "$F_N=G+m\\frac{v^2}{r}→$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "小船靠岸：匀速拉绳子，船速多少？",
"name": "小船靠岸：匀速拉绳子，船速多少？",
"latex": "$v_船=\\frac{v}{cosθ}$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "车拉定滑轮物体",
"name": "车拉定滑轮物体",
"latex": "$v=v_0cosθ$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "雨滴类下落问题",
"name": "雨滴类下落问题",
"latex": "$f=kv^2$"
},
{
"stage": "高中",
"chapter": "万有引力与航天",
"section": "万有引力与航天",
"name": "向心力来源",
"latex": "$F=\\frac{GMm}{R^2}$"
},
{
"stage": "高中",
"chapter": "万有引力与航天",
"section": "开普勒三定律",
"name": "开普勒三定律",
"latex": "$k=\\frac{a^3}{T^2}$"
},
{
"stage": "高中",
"chapter": "万有引力与航天",
"section": "天上公式",
"name": "天上公式",
"latex": "$\\frac{mv^2}{R}=mω^2R=m\\frac{4π^2}{T^2}R$"
},
{
"stage": "高中",
"chapter": "万有引力与航天",
"section": "天上公式",
"name": "天上公式",
"latex": "$v=\\sqrt{\\frac{GM}{R}}$"
},
{
"stage": "高中",
"chapter": "万有引力与航天",
"section": "天上公式",
"name": "天上公式",
"latex": "$ω=\\sqrt{\\frac{GM}{R^3}}$"
},
{
"stage": "高中",
"chapter": "万有引力与航天",
"section": "天上公式",
"name": "天上公式",
"latex": "$a=\\frac{GM}{R^2}$"
},
{
"stage": "高中",
"chapter": "万有引力与航天",
"section": "天上公式",
"name": "天上公式",
"latex": "$T=2π\\sqrt{\\frac{R^3}{GM}}$ $T^2MG=4π^2r^3$"
},
{
"stage": "高中",
"chapter": "万有引力与航天",
"section": "人间公式",
"name": "人间公式",
"latex": "$mg=\\frac{GMm}{R^2}$"
},
{
"stage": "高中",
"chapter": "万有引力与航天",
"section": "人间公式",
"name": "人间公式",
"latex": "$gR^2=GM$"
},
{
"stage": "高中",
"chapter": "万有引力与航天",
"section": "太阳与行星间的引力",
"name": "太阳与行星间的引力",
"latex": "$F=\\frac{mv^2}{r}$"
},
{
"stage": "高中",
"chapter": "万有引力与航天",
"section": "太阳与行星间的引力",
"name": "太阳与行星间的引力",
"latex": "$v=\\frac{2\\pi r}{T}$"
},
{
"stage": "高中",
"chapter": "万有引力与航天",
"section": "太阳与行星间的引力",
"name": "太阳与行星间的引力",
"latex": "$F=\\frac{4\\pi^2mr}{T^2}$"
},
{
"stage": "高中",
"chapter": "万有引力与航天",
"section": "太阳与行星间的引力",
"name": "太阳与行星间的引力",
"latex": "$\\frac{r^3}{T^2}=k$"
},
{
"stage": "高中",
"chapter": "万有引力与航天",
"section": "太阳与行星间的引力",
"name": "太阳与行星间的引力",
"latex": "$F=\\frac{4\\pi^2km}{r^2}$"
},
{
"stage": "高中",
"chapter": "太阳与行星间的引力",
"section": "太阳与行星间的引力",
"name": "太阳与行星间的引力",
"latex": "$F=\\frac{GMm}{r^2}$"
},
{
"stage": "高中",
"chapter": "万有引力与航天",
"section": "万有引力定律",
"name": "公式",
"latex": "$F=G\\frac{m_1m_2}{r^2}$"
},
{
"stage": "高中",
"chapter": "万有引力定律",
"section": "引力常量",
"name": "引力常量",
"latex": "$G=6.67×10^{-11}N·m^2/kg^2$"
},
{
"stage": "高中",
"chapter": "第一宇宙速度的推导",
"section": "地表附近，重力近似等于万有引力",
"name": "地表附近，重力近似等于万有引力",
"latex": "$G\\frac{Mm}{R^2}=mg=>GM=gR^2$"
},
{
"stage": "高中",
"chapter": "第一宇宙速度的推导",
"section": "地表附近，重力近似等于万有引力",
"name": "地表附近，重力近似等于万有引力",
"latex": "$G\\frac{Mm}{R^2}=m\\frac{v^2}{R} => v=\\sqrt{gR}=\\sqrt{9.8×6.4×10^6}m/s=7.9km/s$"
},
{
"stage": "高中",
"chapter": "计算天体的质量和密度",
"section": "已知卫星绕天体做匀速圆周运动的周期T及轨道半径r",
"name": "天体表面",
"latex": "$gR^2=GM$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "月——地模型",
"name": "月——地模型",
"latex": "$r=R_地+h$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "月——地模型",
"name": "月——地模型",
"latex": "$G\\frac{Mm}{(R+h)^2}=m\\frac{4π^2}{T^2}(R+h)$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "地球同步卫星",
"name": "地球同步卫星",
"latex": "$G\\frac{Mm}{r^2}=m\\frac{4π^2}{T^2}r$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "地球同步卫星",
"name": "地球同步卫星",
"latex": "$r=\\sqrt[3]{\\frac{GMT^2}{4π^2}}=R_地+h$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "地球同步卫星",
"name": "地球同步卫星",
"latex": "$v=\\frac{2πr}{T}$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "双星系统",
"name": "双星系统",
"latex": "$L=r_1+r_2$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "双星系统",
"name": "双星系统",
"latex": "$G\\frac{m_1m_2}{L^2}=m_1ω^2r_1$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "双星系统",
"name": "双星系统",
"latex": "$G\\frac{m_1m_2}{L^2}=m_2ω^2r_2$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "双星系统",
"name": "双星系统",
"latex": "$GM_总=ω^2L^3$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "双星系统",
"name": "双星系统",
"latex": "$m_1r_1=m_2r_2$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "三星系统",
"name": "三星系统",
"latex": "$\\sqrt{3}G\\frac{m^2}{r^2}=mω^2\\frac{r}{\\sqrt 3}$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "三星系统",
"name": "三星系统",
"latex": "$ω=\\sqrt{\\frac{3Gm}{r^3}}$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "三星系统",
"name": "三星系统",
"latex": "$T=2π\\sqrt{\\frac{r^3}{3Gm}}$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "追及相遇",
"name": "追及相遇",
"latex": "$t=\\frac{相对θ}{相对ω}=\\frac{2π-θ}{ω_大-ω_小}$"
},
{
"stage": "高中",
"chapter": "机械能守恒定律",
"section": "功",
"name": "公式",
"latex": "$W=Fxcosα(α：力的方向与位移的方向的夹角)$"
},
{
"stage": "高中",
"chapter": "机械能守恒定律",
"section": "功",
"name": "> 弹簧做功",
"latex": "$W=\\frac 1 2 kx^2$"
},
{
"stage": "高中",
"chapter": "功",
"section": "正功和负功",
"name": "正功和负功",
"latex": "$Q=f_滑s$"
},
{
"stage": "高中",
"chapter": "功",
"section": "正功和负功",
"name": "正功和负功",
"latex": "$W_f=-f_滑x_m$"
},
{
"stage": "高中",
"chapter": "功",
"section": "正功和负功",
"name": "正功和负功",
"latex": "$W_{f'}=f_滑x_M$"
},
{
"stage": "高中",
"chapter": "功",
"section": "正功和负功",
"name": "正功和负功",
"latex": "$W_f+W_{f'}≤0=-f_滑(x_m-x_M)$"
},
{
"stage": "高中",
"chapter": "功",
"section": "功的计算方法",
"name": "恒力的功",
"latex": "$W=Fxcosα$"
},
{
"stage": "高中",
"chapter": "功",
"section": "功的计算方法",
"name": "利用动能定理",
"latex": "$W_合=E_{k2}-E_{k1}$"
},
{
"stage": "高中",
"chapter": "功",
"section": "功的计算方法",
"name": "功的计算方法",
"latex": "$W=-μmgcosθ\\frac s{cosθ}=-μmgs$"
},
{
"stage": "高中",
"chapter": "机械能守恒定律",
"section": "功率",
"name": "公式",
"latex": "$P=\\frac{W}{t}$"
},
{
"stage": "高中",
"chapter": "功率、力和速度的关系",
"section": "瞬时功率P=Fv的推导",
"name": "瞬时功率P=Fv的推导",
"latex": "$P=\\frac{Fx}{t},\\frac{x}{t}=v$"
},
{
"stage": "高中",
"chapter": "重力势能",
"section": "重力做功",
"name": "公式",
"latex": "$W_G=mgh=mgh_1-mgh_2$"
},
{
"stage": "高中",
"chapter": "重力势能",
"section": "重力势能",
"name": "公式",
"latex": "$E_P=mgh$"
},
{
"stage": "高中",
"chapter": "重力势能",
"section": "重力做功和重力势能变化关系",
"name": "重力做功和重力势能变化关系",
"latex": "$W_G=-\\Delta E_p$"
},
{
"stage": "高中",
"chapter": "机械能守恒定律",
"section": "弹性势能",
"name": "弹力做功与弹性势能变化的关系",
"latex": "$W_弹=-\\Delta E_p$"
},
{
"stage": "高中",
"chapter": "弹性势能",
"section": "弹性势能的表达式",
"name": "弹性势能的表达式",
"latex": "$W_弹=-\\frac{1}{2}kx^2$"
},
{
"stage": "高中",
"chapter": "弹性势能",
"section": "弹性势能的表达式",
"name": "弹性势能的表达式",
"latex": "$E_p=\\frac{1}{2}kx^2$"
},
{
"stage": "高中",
"chapter": "机械能守恒定律",
"section": "机械能",
"name": "表达式",
"latex": "$E=E_k+E_p$"
},
{
"stage": "高中",
"chapter": "机械能守恒定律",
"section": "机械能守恒定律的三种表达式",
"name": "机械能守恒定律的三种表达式",
"latex": "$E_k+E_p=E_k'+E_p'$"
},
{
"stage": "高中",
"chapter": "机械能守恒定律",
"section": "机械能守恒定律的三种表达式",
"name": "机械能守恒定律的三种表达式",
"latex": "$\\Delta E_k=\\Delta E_p$"
},
{
"stage": "高中",
"chapter": "机械能守恒定律",
"section": "机械能守恒定律的三种表达式",
"name": "机械能守恒定律的三种表达式",
"latex": "$\\Delta E_增=\\Delta E_减$"
},
{
"stage": "高中",
"chapter": "机械能守恒定律",
"section": "应用/解题",
"name": "地面固定一弹簧，向上3点",
"latex": "$W_N-W_G=△E_k$"
},
{
"stage": "高中",
"chapter": "机车启动",
"section": "额定功率",
"name": "加速阶段",
"latex": "$F=\\frac{P_额}{v}$"
},
{
"stage": "高中",
"chapter": "机车启动",
"section": "恒定a",
"name": "恒定a",
"latex": "$F=\\frac{P_额}{v}$"
},
{
"stage": "高中",
"chapter": "动能定理",
"section": "动能定理",
"name": "公式",
"latex": "$W=△E_{k}=\\frac{1}{2}mv^2-\\frac{1}{2}mv^2_0$"
},
{
"stage": "高中",
"chapter": "动能定理",
"section": "动能定理",
"name": "动能定理",
"latex": "$E_k=\\frac{1}{2}mv^2$"
},
{
"stage": "高中",
"chapter": "动能定理",
"section": "动能定理",
"name": "动能定理",
"latex": "$v^2-v_0^2=2ax$"
},
{
"stage": "高中",
"chapter": "动能定理",
"section": "动能定理",
"name": "动能定理",
"latex": "$Fx=\\frac 1 2mv^2-\\frac 1 2mv_0^2$"
},
{
"stage": "高中",
"chapter": "动能定理",
"section": "动能定理",
"name": "动能定理",
"latex": "$E_k=\\frac 1 2mv^2$"
},
{
"stage": "高中",
"chapter": "动能定理",
"section": "动能定理",
"name": "力在时间积累",
"latex": "$I=Ft=mat=m(v_t-v_0)$"
},
{
"stage": "高中",
"chapter": "动能定理",
"section": "动量的计算",
"name": "动量的计算",
"latex": "$E_k=\\frac 1 2 mv^2$ $2mE_k=p^2$"
},
{
"stage": "高中",
"chapter": "动能定理",
"section": "冲量",
"name": "> 曲线运动",
"latex": "$△p=F_合t$"
},
{
"stage": "高中",
"chapter": "动能定理",
"section": "冲量",
"name": "> 某一瞬间冲量作用",
"latex": "$I=mv_0-0，v_0=\\frac I m$"
},
{
"stage": "高中",
"chapter": "动能定理",
"section": "动量定理",
"name": "表达式",
"latex": "$Ft=m△v或I=△p$"
},
{
"stage": "高中",
"chapter": "动能定理",
"section": "动量定理",
"name": "动量定理",
"latex": "$F=\\frac{△p}{t}$"
},
{
"stage": "高中",
"chapter": "动能定理",
"section": "动量定理",
"name": "动量定理",
"latex": "$△p=mv-mv_0$ $v=\\sqrt{2gh}$"
},
{
"stage": "高中",
"chapter": "动能定理",
"section": "动量定理",
"name": "动量定理",
"latex": "$△p=F_恒t$"
},
{
"stage": "高中",
"chapter": "动能定理",
"section": "动量守恒定律",
"name": "动量守恒定律",
"latex": "$m_1v_1+m_2v_2=m_1v_1'+m_2v_2'$"
},
{
"stage": "高中",
"chapter": "动能定理",
"section": "动量守恒定律",
"name": "动量守恒定律",
"latex": "$△p_1=△p_2$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "反冲",
"name": "反冲",
"latex": "$Mv_0=(M-m)v_2-mv_1$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "反冲",
"name": "火箭上升",
"latex": "$(M-m)v=mv_0$"
},
{
"stage": "高中",
"chapter": "反冲",
"section": "人船反冲模型",
"name": "人船反冲模型",
"latex": "$0=m_1v_1-m_2v_2$"
},
{
"stage": "高中",
"chapter": "反冲",
"section": "人船反冲模型",
"name": "人船反冲模型",
"latex": "$m_1\\overline v_1=m_2 \\overline v_2$"
},
{
"stage": "高中",
"chapter": "反冲",
"section": "人船反冲模型",
"name": "人船反冲模型",
"latex": "$m_1x_1=m_2x_2$"
},
{
"stage": "高中",
"chapter": "反冲",
"section": "人船反冲模型",
"name": "人船反冲模型",
"latex": "$x_1+x_2=x$"
},
{
"stage": "高中",
"chapter": "反冲",
"section": "人船反冲模型",
"name": "人船反冲模型",
"latex": "$x_1=\\frac{m_2x}{m_1+m_2}$"
},
{
"stage": "高中",
"chapter": "反冲",
"section": "人船反冲模型",
"name": "人船反冲模型",
"latex": "$x_2=\\frac{m_1x}{m_1+m_2}$"
},
{
"stage": "高中",
"chapter": "反冲",
"section": "人船反冲模型",
"name": "人船反冲模型",
"latex": "$x_M+x_m=L$"
},
{
"stage": "高中",
"chapter": "反冲",
"section": "人船反冲模型",
"name": "人船反冲模型",
"latex": "$x_M=\\frac{m}{m+M}L$"
},
{
"stage": "高中",
"chapter": "反冲",
"section": "人船反冲模型",
"name": "人船反冲模型",
"latex": "$x_m=\\frac{M}{m+M}L$"
},
{
"stage": "高中",
"chapter": "碰撞",
"section": "弹性碰撞",
"name": "弹性碰撞",
"latex": "$m_1v_1+m_2v_2=m_1v_1'+m_2v_2'$"
},
{
"stage": "高中",
"chapter": "碰撞",
"section": "弹性碰撞",
"name": "弹性碰撞",
"latex": "$\\frac 1 2m_1v_1^2+\\frac 1 2m_2v_2^2=\\frac 1 2m_1v_1'^2+\\frac 1 2m_2v_2'^2$"
},
{
"stage": "高中",
"chapter": "碰撞",
"section": "弹性碰撞",
"name": "弹性碰撞",
"latex": "$v_1+v_1'=v_2+v_2'$"
},
{
"stage": "高中",
"chapter": "碰撞",
"section": "弹性碰撞",
"name": "弹性碰撞",
"latex": "$v_1'=\\frac{(m_1-m_2)v_1+2m_2v_2}{m_1+m_2}$"
},
{
"stage": "高中",
"chapter": "碰撞",
"section": "弹性碰撞",
"name": "弹性碰撞",
"latex": "$v_2'=\\frac{2m_1v_1-(m_1-m_2)v_2}{m_1+m_2}$"
},
{
"stage": "高中",
"chapter": "碰撞",
"section": "弹性碰撞",
"name": "弹性碰撞",
"latex": "$v_2=0$"
},
{
"stage": "高中",
"chapter": "碰撞",
"section": "弹性碰撞",
"name": "弹性碰撞",
"latex": "$v_1'=\\frac{m_1-m_2}{m_1+m_2}v_1'$"
},
{
"stage": "高中",
"chapter": "碰撞",
"section": "弹性碰撞",
"name": "弹性碰撞",
"latex": "$v_2'=\\frac{2m_1}{m_1+m_2}v_1>0$"
},
{
"stage": "高中",
"chapter": "碰撞",
"section": "弹性碰撞",
"name": "弹性碰撞",
"latex": "$k_v=\\frac{v_2'}{v_1}=\\frac{2m_1}{m_1+m_2}$"
},
{
"stage": "高中",
"chapter": "碰撞",
"section": "弹性碰撞",
"name": "弹性碰撞",
"latex": "$k_p=\\frac{m_2v_2'}{m_1v_1'}=\\frac{2m_2}{m_1+m_2}$"
},
{
"stage": "高中",
"chapter": "碰撞",
"section": "弹性碰撞",
"name": "弹性碰撞",
"latex": "$K_{E_k}=\\frac{E_{k_2'}}{E_{k_1}}=\\frac{1/2m_2v_2'^2}{1/2m_1v_1^2}=k_vk_p=\\frac{4m_1m_2}{(m_1+m_2)^2}$"
},
{
"stage": "高中",
"chapter": "碰撞",
"section": "弹性碰撞",
"name": "弹性碰撞",
"latex": "$v_1'=2V_共-v_1$"
},
{
"stage": "高中",
"chapter": "碰撞",
"section": "弹性碰撞",
"name": "弹性碰撞",
"latex": "$v_2'=2V_共-v_2$"
},
{
"stage": "高中",
"chapter": "碰撞",
"section": "弹性碰撞",
"name": "非弹性碰撞",
"latex": "$\\frac 1 2mv_0^2-\\frac 1 2m_1v_1^2-\\frac 1 2m_2v_2^2=△E_K=Q$"
},
{
"stage": "高中",
"chapter": "碰撞",
"section": "弹性碰撞",
"name": "完全非弹性碰撞",
"latex": "$v_1=v_2$"
},
{
"stage": "高中",
"chapter": "子弹打木块",
"section": "未穿出：共速的情况",
"name": "未穿出：共速的情况",
"latex": "$Q=△E_K$"
},
{
"stage": "高中",
"chapter": "子弹打木块",
"section": "子弹穿出",
"name": "子弹穿出",
"latex": "$mv_0=mv_1+mv_2$"
},
{
"stage": "高中",
"chapter": "子弹打木块",
"section": "子弹穿出",
"name": "子弹穿出",
"latex": "$\\frac 1 2mv_0^2-(\\frac 1 2mv_1^2+\\frac 1 2mv_2^2)=Q=fL$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "木块在木板上滑动",
"name": "木块在木板上滑动",
"latex": "$mv_0=(m+M)v_共$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "木块在木板上滑动",
"name": "木块在木板上滑动",
"latex": "$f(x_1-x_2)=\\frac 1 2Mv_0^2-(\\frac 1 2 mv_1^2+\\frac 1 2mv_0^2)$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "木块在木板上滑动",
"name": "木块在木板上滑动",
"latex": "$→fl=△E_K=Q$"
},
{
"stage": "高中",
"chapter": "电荷及其守恒定律",
"section": "元电荷",
"name": "元电荷e",
"latex": "$e=1.6×10^{-19}C$"
},
{
"stage": "高中",
"chapter": "电荷及其守恒定律",
"section": "元电荷",
"name": "电子的比荷",
"latex": "$m_e$ $\\frac{e}{m_e}=1.76×10^{11}C/kg$"
},
{
"stage": "高中",
"chapter": "库仑定律",
"section": "库伦定律",
"name": "表达式",
"latex": "$F=k\\frac{q_1q_2}{r^2}$"
},
{
"stage": "高中",
"chapter": "库仑定律",
"section": "库伦定律",
"name": "国际单位制中",
"latex": "$k=9.0×10^9N*m^2/C^2$"
},
{
"stage": "高中",
"chapter": "电场强度",
"section": "场强/电场强度",
"name": "矢量式",
"latex": "$E=\\frac{F}{q}$"
},
{
"stage": "高中",
"chapter": "电场强度",
"section": "场强/电场强度",
"name": "场强/电场强度",
"latex": "$F=\\frac{kQq}{r^2}$"
},
{
"stage": "高中",
"chapter": "电场强度",
"section": "场强/电场强度",
"name": "场强/电场强度",
"latex": "$E=\\frac{kQ}{r^2}$"
},
{
"stage": "高中",
"chapter": "电场强度",
"section": "场强/电场强度",
"name": "场强/电场强度",
"latex": "$E=\\frac{F}{q}$"
},
{
"stage": "高中",
"chapter": "电场强度",
"section": "场强/电场强度",
"name": "场强/电场强度",
"latex": "$E=k\\frac{Q}{r^2}$"
},
{
"stage": "高中",
"chapter": "电场强度",
"section": "场强/电场强度",
"name": "场强/电场强度",
"latex": "$E=\\frac U d$"
},
{
"stage": "高中",
"chapter": "电场强度",
"section": "场强/电场强度",
"name": "场强/电场强度",
"latex": "$E=\\frac{4πkQ}S → E∝\\frac Q S$"
},
{
"stage": "高中",
"chapter": "电场强度",
"section": "场强/电场强度",
"name": "场强/电场强度",
"latex": "$U_{AC}:U_{CB}=l_{AC}:l_{CB}$"
},
{
"stage": "高中",
"chapter": "电场强度",
"section": "场强/电场强度",
"name": "场强/电场强度",
"latex": "$U=\\frac W q= \\frac{Fdcosθ}{q}=Edcosθ$"
},
{
"stage": "高中",
"chapter": "电势能和电势",
"section": "静电力做功的特点",
"name": "公式",
"latex": "$W_{AB}=qU_{AB}$"
},
{
"stage": "高中",
"chapter": "电势能和电势",
"section": "电势能",
"name": "电荷在某点的电势能",
"latex": "$E_p=φq$"
},
{
"stage": "高中",
"chapter": "电势能和电势",
"section": "电势能",
"name": "电势能",
"latex": "$W_{A0}=E_{pA}-E_{p0}=E_{pA}$"
},
{
"stage": "高中",
"chapter": "电势能和电势",
"section": "电势",
"name": "公式",
"latex": "$φ=\\frac{E_p}{q}$"
},
{
"stage": "高中",
"chapter": "电势能和电势",
"section": "电势",
"name": "> 点电荷电势",
"latex": "$φ=\\frac{kQ}{r}$"
},
{
"stage": "高中",
"chapter": "电势能和电势",
"section": "电势",
"name": "电势差",
"latex": "$U_{AB}=φ _A-φ _B$ $U_{AB}=-U_{BA}$"
},
{
"stage": "高中",
"chapter": "电势能和电势",
"section": "电势",
"name": "电势",
"latex": "$W=-△E_p$"
},
{
"stage": "高中",
"chapter": "电势能和电势",
"section": "电势",
"name": "公式",
"latex": "$U_{AB}=Ed$"
},
{
"stage": "高中",
"chapter": "电容器的电容",
"section": "电容",
"name": "定义式",
"latex": "$C=\\frac{Q}{U}$"
},
{
"stage": "高中",
"chapter": "电容器的电容",
"section": "电容",
"name": "单位",
"latex": "$1F=10^{6}μF=10^{12}pF$"
},
{
"stage": "高中",
"chapter": "电容器的电容",
"section": "平行板电容器的电容",
"name": "平行板电容器的电容",
"latex": "$E=\\frac{Q}{Cd}=\\frac{Q}{d\\frac{\\epsilon S}{4πkd}}$ $=\\frac{4πkQ}{\\epsilon S}$"
},
{
"stage": "高中",
"chapter": "静电场",
"section": "带电粒子在电场中的运动",
"name": "动力学",
"latex": "$a=\\frac{qE}m=\\frac{qU}{md}$"
},
{
"stage": "高中",
"chapter": "静电场",
"section": "带电粒子在电场中的运动",
"name": "能量",
"latex": "$W=qU=△E_k$"
},
{
"stage": "高中",
"chapter": "静电场",
"section": "带电粒子在电场中的运动",
"name": "加速",
"latex": "$qU_1=\\frac 1 2mv^2$"
},
{
"stage": "高中",
"chapter": "静电场",
"section": "带电粒子在电场中的运动",
"name": "带电粒子在电场中的运动",
"latex": "$y_1=\\frac 1 2at^2=\\frac 1 2\\frac{qU_2}{md}（\\frac{l_1}{v_0}）^2$"
},
{
"stage": "高中",
"chapter": "静电场",
"section": "带电粒子在电场中的运动",
"name": "带电粒子在电场中的运动",
"latex": "$tanθ=\\frac{at}{v_0}=\\frac{qU_2}{md}\\frac{l_1}{v_0^2}$"
},
{
"stage": "高中",
"chapter": "静电场",
"section": "带电粒子在电场中的运动",
"name": "带电粒子在电场中的运动",
"latex": "$y_2=l_2tanθ$"
},
{
"stage": "高中",
"chapter": "静电场",
"section": "带电粒子在电场中的运动",
"name": "带电粒子在电场中的运动",
"latex": "$△E_k=0-\\frac 1 2mv_0^2$"
},
{
"stage": "高中",
"chapter": "静电场",
"section": "带电粒子在电场中的运动",
"name": "带电粒子在电场中的运动",
"latex": "$=△E_p=qE(d-l)$"
},
{
"stage": "高中",
"chapter": "静电场",
"section": "带电粒子在电场中的运动",
"name": "带电粒子在电场中的运动",
"latex": "$=q\\frac U d(d-l)$"
},
{
"stage": "高中",
"chapter": "静电场",
"section": "带电粒子在电场中的运动",
"name": "带电粒子在电场中的运动",
"latex": "$\\frac 1 2 mv_0^2=q\\frac U d(d-l)$"
},
{
"stage": "高中",
"chapter": "带电粒子在电场中的运动",
"section": "偏转",
"name": "受力分析",
"latex": "$v_0$ $a=\\frac{qE}m={\\frac{qU}{md}}$"
},
{
"stage": "高中",
"chapter": "带电粒子在电场中的运动",
"section": "偏转",
"name": "偏转",
"latex": "$v_0$ $x_0=v_0, l=v_0t$"
},
{
"stage": "高中",
"chapter": "带电粒子在电场中的运动",
"section": "偏转",
"name": "偏转",
"latex": "$v_y=at,y=\\frac 1 2at^2$"
},
{
"stage": "高中",
"chapter": "带电粒子在电场中的运动",
"section": "偏转",
"name": "偏转",
"latex": "$qU=\\frac 1 2mv^2-\\frac 1 2 mv_0^2$"
},
{
"stage": "高中",
"chapter": "带电粒子在电场中的运动",
"section": "如何判断带电粒子能否通过偏转电场",
"name": "要使粒子飞出电场，则应满足",
"latex": "$t=\\frac l{v_0}$ $y≤\\frac d 2$"
},
{
"stage": "高中",
"chapter": "带电粒子在电场中的运动",
"section": "如何判断带电粒子能否通过偏转电场",
"name": "如何判断带电粒子能否通过偏转电场",
"latex": "$t=\\frac l{v_0}$ $y>\\frac d 2$"
},
{
"stage": "高中",
"chapter": "带电粒子在电场中的运动",
"section": "示波器+sin电压",
"name": "恰好从极板边缘射出的临界电压",
"latex": "$U_临=\\frac{2d^2U_1}{l_1^2}$"
},
{
"stage": "高中",
"chapter": "带电粒子在电场中的运动",
"section": "示波器+sin电压",
"name": "示波器+sin电压",
"latex": "$\\frac d 2=\\frac{l_1^2U_临}{4dU_1}$"
},
{
"stage": "高中",
"chapter": "带电粒子在电场中的运动",
"section": "示波器+sin电压",
"name": "示波器+sin电压",
"latex": "$U_临=\\frac{2d^2U_1}{l_1^2}$"
},
{
"stage": "高中",
"chapter": "带电粒子在电场中的运动",
"section": "示波器+sin电压",
"name": "示波器+sin电压",
"latex": "$U_临≥U_m$ $L=2D=2(\\frac{l_1^2U_2}{4dU_1}+\\frac{l_1l_2U_2}{2dU_1})$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "点电荷",
"name": "点电荷",
"latex": "$q_Aφ_A=q_Bφ_B$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "同一直线三小球$q_1,q_2,q_3$,距离为$r_1,r_2$，平衡",
"name": "> 电荷量之比",
"latex": "$q_1:q_2:q_3=\\frac{(r_1+r_2)^2}{r_2^2}:1:\\frac{(r_1+r_2)^2}{r_1^2}$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "同一直线三小球$q_1,q_2,q_3$,距离为$r_1,r_2$，平衡",
"name": "> 电量关系",
"latex": "$\\frac{1}{\\sqrt{q_1}}+\\frac{1}{\\sqrt{q_3}}=\\frac{1}{\\sqrt{q_2}}$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "同一直线三小球$q_1,q_2,q_3$,距离为$r_1,r_2$，平衡",
"name": "> 距离关系",
"latex": "$\\frac{\\sqrt{q_1}}{\\sqrt{q_3}}=\\frac{r_1}{r_2}$"
},
{
"stage": "高中",
"chapter": "恒定电流",
"section": "恒定电流/稳恒电流/直流电路",
"name": "电流大小公式",
"latex": "$I=\\frac Q t$"
},
{
"stage": "高中",
"chapter": "恒定电流",
"section": "恒定电流/稳恒电流/直流电路",
"name": "单位",
"latex": "$1A=10^3mA=10^6 μA$"
},
{
"stage": "高中",
"chapter": "恒定电流",
"section": "恒定电流/稳恒电流/直流电路",
"name": "恒定电流/稳恒电流/直流电路",
"latex": "$I=\\frac{ne}{t}$"
},
{
"stage": "高中",
"chapter": "恒定电流",
"section": "恒定电流/稳恒电流/直流电路",
"name": "恒定电流/稳恒电流/直流电路",
"latex": "$I=\\frac{|-q|+|+q|}{t}$"
},
{
"stage": "高中",
"chapter": "恒定电流",
"section": "电动势",
"name": "公式",
"latex": "$E=\\frac W q$"
},
{
"stage": "高中",
"chapter": "电动势",
"section": "电动势与电动差的对比",
"name": "电动势与电动差的对比",
"latex": "$E=\\frac W q$ $U=\\frac W q$"
},
{
"stage": "高中",
"chapter": "电动势",
"section": "电动势与电动差的对比",
"name": "联系",
"latex": "$E=U_内+U_外$"
},
{
"stage": "高中",
"chapter": "恒定电流",
"section": "欧姆定律",
"name": "公式",
"latex": "$I=\\frac U R$"
},
{
"stage": "高中",
"chapter": "欧姆定律",
"section": "两公式对比",
"name": "两公式对比",
"latex": "$I=\\frac U R$"
},
{
"stage": "高中",
"chapter": "欧姆定律",
"section": "两公式对比",
"name": "两公式对比",
"latex": "$I=\\frac q t $"
},
{
"stage": "高中",
"chapter": "欧姆定律",
"section": "两公式对比",
"name": "公式",
"latex": "$R=\\frac U I$"
},
{
"stage": "高中",
"chapter": "欧姆定律",
"section": "导体的伏安特性曲线",
"name": "导体的伏安特性曲线",
"latex": "$R_n=\\frac{U_n}{I_n}$"
},
{
"stage": "高中",
"chapter": "恒定电流",
"section": "串联电路和并联电路",
"name": "串联电路和并联电路",
"latex": "$I_1R_1=I_nR_n$"
},
{
"stage": "高中",
"chapter": "恒定电流",
"section": "串联电路和并联电路",
"name": "串联电路和并联电路",
"latex": "$U=U_1+...+U_n,\\ \\frac{U_1}{R_1}=\\frac{U_n}{R_n}=I$"
},
{
"stage": "高中",
"chapter": "恒定电流",
"section": "串联电路和并联电路",
"name": "串联电路和并联电路",
"latex": "$R_总=R_1+...+R_n$ $\\frac{1}{R_总}=\\frac{1}{R_1}+...+\\frac{1}{R_n}$"
},
{
"stage": "高中",
"chapter": "恒定电流",
"section": "串联电路和并联电路",
"name": "串联电路和并联电路",
"latex": "$\\frac{P_1}{R_1}=\\frac{P_n}{R_n}=I^2$ $P_1R_1=P_nR_n=U^2$"
},
{
"stage": "高中",
"chapter": "恒定电流",
"section": "串联电路和并联电路",
"name": "串联电路和并联电路",
"latex": "$R_总=\\frac{1}{n}R$"
},
{
"stage": "高中",
"chapter": "恒定电流",
"section": "串联电路和并联电路",
"name": "串联电路和并联电路",
"latex": "$R=\\frac{R_1R_2}{R_1+R_2}$"
},
{
"stage": "高中",
"chapter": "电功和电功率",
"section": "电功率",
"name": "定义式",
"latex": "$P=\\frac W t=UI$"
},
{
"stage": "高中",
"chapter": "焦耳定律",
"section": "焦耳定律",
"name": "表达式",
"latex": "$Q=I^2Rt$"
},
{
"stage": "高中",
"chapter": "焦耳定律",
"section": "热功率",
"name": "公式",
"latex": "$P=\\frac Q t=I^2R$"
},
{
"stage": "高中",
"chapter": "焦耳定律",
"section": "纯电阻电路和非纯电阻电路",
"name": "纯电阻电路和非纯电阻电路",
"latex": "$UIt=I^2Rt$"
},
{
"stage": "高中",
"chapter": "导体的电阻",
"section": "导体的电阻",
"name": "公式",
"latex": "$R=ρ\\frac l S$"
},
{
"stage": "高中",
"chapter": "恒定电流",
"section": "闭合电路的欧姆定律",
"name": "闭合电路的欧姆定律",
"latex": "$E=U_外+Ir_内$"
},
{
"stage": "高中",
"chapter": "恒定电流",
"section": "闭合电路的欧姆定律",
"name": "路端电压与电流的关系",
"latex": "$U_路=E-Ir$"
},
{
"stage": "高中",
"chapter": "恒定电流",
"section": "闭合电路的欧姆定律",
"name": "闭合电路的欧姆定律",
"latex": "$P=U_外I$"
},
{
"stage": "高中",
"chapter": "闭合电路的欧姆定律",
"section": "闭合电路的欧姆定律",
"name": "公式",
"latex": "$I=\\frac E{R+r}$"
},
{
"stage": "高中",
"chapter": "闭合电路的欧姆定律",
"section": "闭合电路中的能量转化关系",
"name": "闭合电路中的能量转化关系",
"latex": "$P_总=EI$"
},
{
"stage": "高中",
"chapter": "闭合电路的欧姆定律",
"section": "闭合电路中的能量转化关系",
"name": "电源内阻消耗功率（热功率",
"latex": "$P_内=I^2r_内$"
},
{
"stage": "高中",
"chapter": "闭合电路的欧姆定律",
"section": "闭合电路中的能量转化关系",
"name": "电源的效率",
"latex": "$η=\\frac{P_出}{P_总}=\\frac{UI}{EI}=\\frac U E$ $η=\\frac{R}{R+r}=\\frac{1}{1+\\frac{r}{R}}$"
},
{
"stage": "高中",
"chapter": "闭合电路的欧姆定律",
"section": "闭合电路中的能量转化关系",
"name": "闭合电路中的能量转化关系",
"latex": "$P_出=\\frac{E^2}{4r}$"
},
{
"stage": "高中",
"chapter": "闭合电路的欧姆定律",
"section": "闭合电路中的能量转化关系",
"name": "功率守恒",
"latex": "$P_{输入}=P_{输出}+P_内$"
},
{
"stage": "高中",
"chapter": "闭合电路的欧姆定律",
"section": "闭合电路中的能量转化关系",
"name": "电路系统",
"latex": "$EI=UI+R_内(I^2r)$"
},
{
"stage": "高中",
"chapter": "磁场",
"section": "磁感应强度",
"name": "定义式",
"latex": "$B=\\frac{F}{IL}$"
},
{
"stage": "高中",
"chapter": "磁感应强度",
"section": "磁感应强度B与电场强度E的比较",
"name": "磁感应强度B与电场强度E的比较",
"latex": "$E=\\frac F q$ $B= \\frac F{IL}$"
},
{
"stage": "高中",
"chapter": "磁场",
"section": "带电粒子在匀强磁场中的运动",
"name": "带电粒子在匀强磁场中的运动",
"latex": "$t=\\frac{θm}{qB}$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "复合场与组合场",
"name": "复合场与组合场",
"latex": "$F_E=f_洛$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "复合场与组合场",
"name": "复合场与组合场",
"latex": "$qE=qBv_0$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "复合场与组合场",
"name": "复合场与组合场",
"latex": "$v_0=\\frac E B$"
},
{
"stage": "高中",
"chapter": "电磁感应",
"section": "磁通量",
"name": "单位",
"latex": "$1Wb=1T·m^2$"
},
{
"stage": "高中",
"chapter": "电磁感应",
"section": "磁通量",
"name": "> * 转90°和场强平行",
"latex": "$△φ=φ_2-φ_1=BS-0$"
},
{
"stage": "高中",
"chapter": "电磁感应",
"section": "磁通量",
"name": ">   * 大小",
"latex": "$E=n\\frac{△y}{△t}$"
},
{
"stage": "高中",
"chapter": "电磁感应",
"section": "磁通量",
"name": "磁通量",
"latex": "$E=n\\frac{△B}{△t}S$"
},
{
"stage": "高中",
"chapter": "电磁感应",
"section": "磁通量",
"name": "磁通量",
"latex": "$E=n\\frac{△S}{△t}B$"
},
{
"stage": "高中",
"chapter": "电磁感应",
"section": "磁通量",
"name": "磁通量",
"latex": "$F_电=BIL$"
},
{
"stage": "高中",
"chapter": "电磁感应",
"section": "磁通量",
"name": "> * 电磁感应",
"latex": "$Q=n\\frac{△y}{R_总}$"
},
{
"stage": "高中",
"chapter": "电磁感应",
"section": "磁通量",
"name": "> * 安培力冲量",
"latex": "$Q=\\frac{△P}{BL}$"
},
{
"stage": "高中",
"chapter": "电磁感应",
"section": "法拉第电磁感应定律",
"name": "公式",
"latex": "$E=n\\frac{△Φ}{△t}$"
},
{
"stage": "高中",
"chapter": "电磁感应",
"section": "法拉第电磁感应定律",
"name": "感生电动势，B变化",
"latex": "$E=nS\\frac{△B}{△t}$"
},
{
"stage": "高中",
"chapter": "电磁感应",
"section": "法拉第电磁感应定律",
"name": "法拉第电磁感应定律",
"latex": "$\\overline E=n\\frac{△Φ}{△t}$"
},
{
"stage": "高中",
"chapter": "电磁感应",
"section": "法拉第电磁感应定律",
"name": "法拉第电磁感应定律",
"latex": "$\\overline I =\\frac{\\overline E}{R+r}$"
},
{
"stage": "高中",
"chapter": "电磁感应",
"section": "法拉第电磁感应定律",
"name": "法拉第电磁感应定律",
"latex": "$q=\\overline I △t$"
},
{
"stage": "高中",
"chapter": "电磁感应",
"section": "法拉第电磁感应定律",
"name": "> **推导出电荷量可用公式**",
"latex": "$Q=n\\frac{△Φ}{R+r}$"
},
{
"stage": "高中",
"chapter": "电磁感应",
"section": "法拉第电磁感应定律",
"name": "法拉第电磁感应定律",
"latex": "$E=B\\frac{△S}{△t}$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "导体切割磁感线",
"name": "电源",
"latex": "$E=BLv_0，r_内=r$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "导体切割磁感线",
"name": "导体切割磁感线",
"latex": "$I=\\frac{E}{R+r}$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "导体切割磁感线",
"name": "导体切割磁感线",
"latex": "$U_ab=RI=\\frac{R}{R+r}BLV_0$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "导体切割磁感线",
"name": "导体切割磁感线",
"latex": "$F_安=BIL=\\frac{BLE}{R+r}=\\frac{B^2L^2v_0}{R+r}$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "导体切割磁感线",
"name": "导体切割磁感线",
"latex": "$F_合=F_安$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "导体切割磁感线",
"name": "动能定理（能量转化的过程）",
"latex": "$W_{F_安}=△E_k=Q$"
},
{
"stage": "高中",
"chapter": "导体切割磁感线",
"section": "双金属棒切割磁感线",
"name": "双金属棒切割磁感线",
"latex": "$E_总=BL(v_1-v_2)$"
},
{
"stage": "高中",
"chapter": "导体切割磁感线",
"section": "双金属棒切割磁感线",
"name": "双金属棒切割磁感线",
"latex": "$E_总=BL(v_1+v_2)$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "磁感应综合",
"name": "磁感应综合",
"latex": "$P=I^2R$ $Q=I^2Rt，P_总=EI$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "磁感应综合",
"name": "磁感应综合",
"latex": "$I=\\frac{E}{R+r}=\\frac{BLv}{R+r}$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "磁感应综合",
"name": "磁感应综合",
"latex": "$F_安=BIL=\\frac{B^2L^2v}{R+r}$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "感生电动势图像问题",
"name": "感生电动势图像问题",
"latex": "$E=n\\frac{△φ}{△t}=n\\frac{△BS}{△t}=nSk$"
},
{
"stage": "高中",
"chapter": "交变电流",
"section": "交变电流",
"name": "交变电流",
"latex": "$Z_L=ωL$"
},
{
"stage": "高中",
"chapter": "交变电流",
"section": "交变电流",
"name": "交变电流",
"latex": "$Z_C=\\frac{1}{ωC}$"
},
{
"stage": "高中",
"chapter": "交变电流的变化规律",
"section": "正弦式交变电流",
"name": "正弦式交变电流",
"latex": "$r=\\frac L 2；θ=ωt$"
},
{
"stage": "高中",
"chapter": "交变电流的变化规律",
"section": "正弦式交变电流",
"name": "> * 电流",
"latex": "$i=\\frac{e}{R+r}=\\frac{nBSω}{R+r}·sinωt$ $I_m=\\frac{E_m}{R+r}→i=I_m·sinωt$"
},
{
"stage": "高中",
"chapter": "交变电流的变化规律",
"section": "正弦式交变电流",
"name": "正弦式交变电流",
"latex": "$E_m=nBsω$"
},
{
"stage": "高中",
"chapter": "交变电流的变化规律",
"section": "正弦式交变电流",
"name": "正弦式交变电流",
"latex": "$I_m=\\frac{e}{R+r}=\\frac{nBSω}{R+r}$"
},
{
"stage": "高中",
"chapter": "交变电流的变化规律",
"section": "正弦式交变电流",
"name": "正弦式交变电流",
"latex": "$U_m=I_mR$"
},
{
"stage": "高中",
"chapter": "描述交变电流的物理量",
"section": "周期和频率",
"name": "周期和频率的关系",
"latex": "$T=\\frac 1 f$"
},
{
"stage": "高中",
"chapter": "描述交变电流的物理量",
"section": "周期和频率",
"name": "周期和频率",
"latex": "$ω=\\frac{2π}{T}=2πf=2πn$"
},
{
"stage": "高中",
"chapter": "描述交变电流的物理量",
"section": "交变电流的“四值”",
"name": "| 瞬时值",
"latex": "$e=E_msin ωt$ $i=I_msin ωt$"
},
{
"stage": "高中",
"chapter": "描述交变电流的物理量",
"section": "交变电流的“四值”",
"name": "| 有效值",
"latex": "$E=\\frac{E_m}{\\sqrt 2}$ $I=\\frac{I_m}{\\sqrt 2}$"
},
{
"stage": "高中",
"chapter": "描述交变电流的物理量",
"section": "交变电流的“四值”",
"name": "交变电流的“四值”",
"latex": "$I_有^2RT=I_1^2R\\frac{T_1}{T} +I_2^2R\\frac{T_2}{T}$"
},
{
"stage": "高中",
"chapter": "描述交变电流的物理量",
"section": "交变电流的“四值”",
"name": "交变电流的“四值”",
"latex": "$I_有^2RT=I_1^2RT_1+I_2^2RT_2$"
},
{
"stage": "高中",
"chapter": "描述交变电流的物理量",
"section": "交变电流的“四值”",
"name": "交变电流的“四值”",
"latex": "$Q=I_有^2RT=I_0R\\frac 1 2 T$"
},
{
"stage": "高中",
"chapter": "对交变电流的影响",
"section": "电感器对交变电流的阻碍",
"name": "自感电动势",
"latex": "$E=L\\frac{△I}{△t}$"
},
{
"stage": "高中",
"chapter": "理想变压器的规律",
"section": "电压与匝数的关系",
"name": "电压与匝数的关系",
"latex": "$E_1=n_1\\frac{△Φ}{△t}$ $E_2=n_2\\frac{△Φ}{△t}$"
},
{
"stage": "高中",
"chapter": "理想变压器的规律",
"section": "电压与匝数的关系",
"name": "电压与匝数的关系",
"latex": "$E_1=U_1,\\ E_2=U_2,\\ \\frac{E_1}{E_2}=\\frac{n_1}{n_2}$"
},
{
"stage": "高中",
"chapter": "理想变压器的规律",
"section": "电压与匝数的关系",
"name": "电压与匝数的关系",
"latex": "$\\frac{U_1}{U_2}=\\frac{n_1}{n_2}$"
},
{
"stage": "高中",
"chapter": "理想变压器的规律",
"section": "电压与匝数的关系",
"name": "电压与匝数的关系",
"latex": "$\\frac{U_1}{n_1}=\\frac{U_2}{n_2}$"
},
{
"stage": "高中",
"chapter": "理想变压器的规律",
"section": "电流关系：反比",
"name": "多个副线圈",
"latex": "$n_1I_1=n_2I_2+n_3I_3$"
},
{
"stage": "高中",
"chapter": "变压器",
"section": "原线圈含电阻",
"name": "原线圈含电阻",
"latex": "$P_等=P_原=P_副$ $P=\\frac{U^2}{R}$"
},
{
"stage": "高中",
"chapter": "变压器",
"section": "原线圈含电阻",
"name": "原线圈含电阻",
"latex": "$R_原=R_等=(\\frac{U_1}{U_2})^2R_副=(\\frac{n_1}{n_2})^2R_副$"
},
{
"stage": "高中",
"chapter": "电能的输送",
"section": "降低输电损耗的两个途径",
"name": "输电线上功率损失原因",
"latex": "$△P=I^2R=(\\frac P U)^2·ρ\\frac L S$"
},
{
"stage": "高中",
"chapter": "降低输电损耗的两个途径",
"section": "远距离高压输电的基本关系",
"name": "远距离高压输电的基本关系",
"latex": "$P_1=P_2, P_3=P_4, P_2=P_3+P_损$"
},
{
"stage": "高中",
"chapter": "降低输电损耗的两个途径",
"section": "远距离高压输电的基本关系",
"name": "远距离高压输电的基本关系",
"latex": "$\\frac{U_1}{U_2}=\\frac{n_1}{n_2}=\\frac{I_2}{I_1}$"
},
{
"stage": "高中",
"chapter": "降低输电损耗的两个途径",
"section": "远距离高压输电的基本关系",
"name": "远距离高压输电的基本关系",
"latex": "$U_3:U_4=n_3:n_4=I_4:I_3$"
},
{
"stage": "高中",
"chapter": "降低输电损耗的两个途径",
"section": "远距离高压输电的基本关系",
"name": "远距离高压输电的基本关系",
"latex": "$U_2=U_3+U_损$"
},
{
"stage": "高中",
"chapter": "降低输电损耗的两个途径",
"section": "远距离高压输电的基本关系",
"name": "远距离高压输电的基本关系",
"latex": "$I_2=I_3$"
},
{
"stage": "高中",
"chapter": "降低输电损耗的两个途径",
"section": "远距离高压输电的基本关系",
"name": "远距离高压输电的基本关系",
"latex": "$P_损=I_2R=(\\frac{P_2}{U_2})^2R$"
},
{
"stage": "高中",
"chapter": "半偏法：只用于电流表A，电压表V内阻",
"section": "电压表",
"name": "电压表",
"latex": "$\\frac{R_x}{R_0}=\\frac{U_1}{U_2}, R_x=\\frac{U_1}{U_2}R_0$"
},
{
"stage": "高中",
"chapter": "半偏法：只用于电流表A，电压表V内阻",
"section": "电压表",
"name": "电压表",
"latex": "$\\frac{R_x}{R_0}=\\frac{I_2}{I_1}, R_x=\\frac{U_1}{U_2}R_0$"
},
{
"stage": "高中",
"chapter": "电学实验",
"section": "导线电阻率ρ",
"name": "导线电阻率ρ",
"latex": "$R=ρ\\frac L s$"
},
{
"stage": "高中",
"chapter": "电学实验",
"section": "导线电阻率ρ",
"name": "原理式",
"latex": "$ρ=\\frac{SR}{L}$"
},
{
"stage": "高中",
"chapter": "电学实验",
"section": "导线电阻率ρ",
"name": "导线电阻率ρ",
"latex": "$S=πr^2=\\frac 1 4πd^2$"
},
{
"stage": "高中",
"chapter": "电学实验",
"section": "导线电阻率ρ",
"name": "导线电阻率ρ",
"latex": "$R=\\frac U I$"
},
{
"stage": "高中",
"chapter": "电学实验",
"section": "导线电阻率ρ",
"name": "导线电阻率ρ",
"latex": "$ρ=\\frac{\\frac 1 4πd^2·\\frac U I}{L}=\\frac{πd^2U}{4IL}$"
},
{
"stage": "高中",
"chapter": "电学实验",
"section": "导线电阻率ρ",
"name": "导线电阻率ρ",
"latex": "$R_x$ $R=\\frac U I$"
},
{
"stage": "高中",
"chapter": "电学实验",
"section": "电表的改装",
"name": "G→V",
"latex": "$R_x=V_m-V_g$"
},
{
"stage": "高中",
"chapter": "电学实验",
"section": "电表的改装",
"name": "电表的改装",
"latex": "$\\frac{U_g}{R_g}=\\frac{U_m-U_g}{R_x}$"
},
{
"stage": "高中",
"chapter": "电学实验",
"section": "电表的改装",
"name": "电表的改装",
"latex": "$R_x=\\frac{U_m-U_g}{U_g}·R_g$"
},
{
"stage": "高中",
"chapter": "电学实验",
"section": "电表的改装",
"name": "电表的改装",
"latex": "$R_x=(\\frac{U_m}{U_g}-1)R_g$"
},
{
"stage": "高中",
"chapter": "电学实验",
"section": "电表的改装",
"name": "电表的改装",
"latex": "$n=\\frac{U_m}{U_g}$"
},
{
"stage": "高中",
"chapter": "电学实验",
"section": "电表的改装",
"name": "> 最简算法",
"latex": "$R_x=(n-1)R_g$ $R_g$"
},
{
"stage": "高中",
"chapter": "电学实验",
"section": "电表的改装",
"name": "电表的改装",
"latex": "$I_gR_g=(I_m-I_g)R_x$"
},
{
"stage": "高中",
"chapter": "电学实验",
"section": "电表的改装",
"name": "电表的改装",
"latex": "$R_x=\\frac{R_g}{\\frac{I_m-I_g}{I_g}}$"
},
{
"stage": "高中",
"chapter": "电学实验",
"section": "电表的改装",
"name": "电表的改装",
"latex": "$R_x=\\frac{R_g}{\\frac{I_m}{I_g}-1}$"
},
{
"stage": "高中",
"chapter": "电学实验",
"section": "电表的改装",
"name": "电表的改装",
"latex": "$n=\\frac{I_m}{I_g}$"
},
{
"stage": "高中",
"chapter": "电学实验",
"section": "电表的改装",
"name": "电表的改装",
"latex": "$R_x=\\frac{R_g}{n-1}$"
},
{
"stage": "高中",
"chapter": "电学实验",
"section": "测量电源电动势和内阻",
"name": "测量电源电动势和内阻",
"latex": "$E=I_1r+U_1$"
},
{
"stage": "高中",
"chapter": "电学实验",
"section": "测量电源电动势和内阻",
"name": "测量电源电动势和内阻",
"latex": "$E=I_2r+U_2$"
},
{
"stage": "高中",
"chapter": "电学实验",
"section": "测量电源电动势和内阻",
"name": "测量电源电动势和内阻",
"latex": "$r=\\frac{U_1-U_2}{I_2-I_1}$ $E=U_1+I_1r$"
},
{
"stage": "高中",
"chapter": "电学实验",
"section": "测量电源电动势和内阻",
"name": "测量电源电动势和内阻",
"latex": "$E=\\frac{U_1I_2-U_2I_1}{I_2-I_1}$"
},
{
"stage": "高中",
"chapter": "力学实验",
"section": "验证机械能守恒",
"name": "验证机械能守恒",
"latex": "$mgh=\\frac 1 2mv^2$"
},
{
"stage": "高中",
"chapter": "力学实验",
"section": "验证机械能守恒",
"name": "验证机械能守恒",
"latex": "$v^2=2gh$"
},
{
"stage": "高中",
"chapter": "力学实验",
"section": "验证机械能守恒",
"name": "验证机械能守恒",
"latex": "$gh>\\frac 1 2v^2$ $\\frac 1 2v^2-mgh=\\frac 1 2mv^2+fh$"
},
{
"stage": "高中",
"chapter": "力学实验",
"section": "验证动量守恒",
"name": "验证动量守恒",
"latex": "$mv_0x_0=mv_1x_1+m_2v_2x_2$"
},
{
"stage": "高中",
"chapter": "物体是由大量分子组成的",
"section": "分子模型的计算",
"name": "球体模型",
"latex": "$V=\\frac 4 3π(\\frac d 2)^3,\\ d=\\sqrt[3]{\\frac{6V}{π}}$"
},
{
"stage": "高中",
"chapter": "物体是由大量分子组成的",
"section": "分子模型的计算",
"name": "立方体模型",
"latex": "$V=d^3,\\ d=\\sqrt[3]{V}$"
},
{
"stage": "高中",
"chapter": "物体是由大量分子组成的",
"section": "分子模型的计算",
"name": "固体液体可以用",
"latex": "$m_0=\\frac{M}{N_A}, V_0=\\frac{V}{N_A}$"
},
{
"stage": "高中",
"chapter": "物体是由大量分子组成的",
"section": "分子模型的计算",
"name": "气体所占空间",
"latex": "$V_0=\\frac{V}{N_A}$"
},
{
"stage": "高中",
"chapter": "分子间的作用力",
"section": "分子势能",
"name": "分子势能",
"latex": "$r=r_0$"
},
{
"stage": "高中",
"chapter": "气体",
"section": "温度和温标",
"name": "温度和温标",
"latex": "$\\frac{PV}{T}=c$"
},
{
"stage": "高中",
"chapter": "压强：由气体热运动产生",
"section": "液面封闭气体",
"name": "列式模板",
"latex": "$P_0+h=P_A$"
},
{
"stage": "高中",
"chapter": "压强：由气体热运动产生",
"section": "连通器",
"name": "列式模板",
"latex": "$P_A=P_0+h$"
},
{
"stage": "高中",
"chapter": "压强：由气体热运动产生",
"section": "活塞（考虑质量）",
"name": "受力分析→列式模板",
"latex": "$P_AS=P_0S+mg$"
},
{
"stage": "高中",
"chapter": "气体",
"section": "理想气体的状态方程",
"name": "理想气体的状态方程",
"latex": "$\\frac{p_1V_1}{T_1}=\\frac{p_2V_2}{T_2}$ $\\frac{pV}{T}=C$"
},
{
"stage": "高中",
"chapter": "气体",
"section": "玻意耳定律",
"name": "公式",
"latex": "$pV=C或p_1V_1=p_2V_2$"
},
{
"stage": "高中",
"chapter": "气体",
"section": "查理定律",
"name": "公式",
"latex": "$\\frac p T=C,\\quad \\frac{p_1}{T_1}=\\frac{p_2}{T_2}$"
},
{
"stage": "高中",
"chapter": "气体",
"section": "盖—吕萨克定律",
"name": "公式",
"latex": "$\\frac V T=C$"
},
{
"stage": "高中",
"chapter": "气体",
"section": "盖—吕萨克定律",
"name": "盖—吕萨克定律",
"latex": "$\\frac{V_1}{T_1}=\\frac{V_2}{T_2}$"
},
{
"stage": "高中",
"chapter": "液柱移动问题",
"section": "两气挤压",
"name": "两气挤压",
"latex": "$△P_1=△T\\frac{P_1}{T_1}$"
},
{
"stage": "高中",
"chapter": "液柱移动问题",
"section": "加液/移动试管",
"name": "加液/移动试管",
"latex": "$P_A=H+P_0$"
},
{
"stage": "高中",
"chapter": "液柱移动问题",
"section": "加液/移动试管",
"name": "加液/移动试管",
"latex": "$P_A=H+P_0$ $P_0$"
},
{
"stage": "高中",
"chapter": "液柱移动问题",
"section": "充气放气问题",
"name": "充气放气问题",
"latex": "$P_0V+P_0V'=PV$"
},
{
"stage": "高中",
"chapter": "液柱移动问题",
"section": "充气放气问题",
"name": "充气放气问题",
"latex": "$V'=(\\frac{P}{P_0}-1)V$"
},
{
"stage": "高中",
"chapter": "液柱移动问题",
"section": "充气放气问题",
"name": "充气放气问题",
"latex": "$P_0V=nP_1V'+P'V$"
},
{
"stage": "高中",
"chapter": "气体热现象的微观意义",
"section": "气体温度的微观意义",
"name": "气体温度的微观意义",
"latex": "$\\bar E_k$ $T=a\\bar E_k$"
},
{
"stage": "高中",
"chapter": "固体、液体和物态变化",
"section": "空气的湿度",
"name": "公式",
"latex": "$B=\\frac{p}{p_s}×100\\%$ $p/p_s$"
},
{
"stage": "高中",
"chapter": "物态变化中的能量交换",
"section": "融化热",
"name": "公式",
"latex": "$Q=λm（m：物质的质量，Q：熔化时所需要吸收的热量，λ：物质的融化热）$"
},
{
"stage": "高中",
"chapter": "热力学定律",
"section": "功和内能",
"name": "公式",
"latex": "$△U=U_2-U_1=W$"
},
{
"stage": "高中",
"chapter": "热力学定律",
"section": "热和内能",
"name": "热与内能变化的关系",
"latex": "$△U=U_2-U_1$ $△U=Q$"
},
{
"stage": "高中",
"chapter": "热力学定律",
"section": "热力学第一定律",
"name": "公式",
"latex": "$△U=Q+W$"
},
{
"stage": "高中",
"chapter": "机械振动",
"section": "简谐运动的规律",
"name": "简谐运动的规律",
"latex": "$a=-\\frac{kx}m$"
},
{
"stage": "高中",
"chapter": "简谐运动的规律",
"section": "简谐运动的表达式",
"name": "简谐运动的表达式",
"latex": "$x=Asin(ωt+φ)$"
},
{
"stage": "高中",
"chapter": "简谐运动的规律",
"section": "简谐运动的表达式",
"name": "周期/振动步调",
"latex": "$T=2π\\sqrt{\\frac m k}$"
},
{
"stage": "高中",
"chapter": "简谐运动的规律",
"section": "简谐运动的表达式",
"name": "简谐运动的表达式",
"latex": "$x=Asinωt$"
},
{
"stage": "高中",
"chapter": "简谐运动的规律",
"section": "简谐运动的表达式",
"name": "简谐运动的表达式",
"latex": "$x=Acosωt$"
},
{
"stage": "高中",
"chapter": "单摆",
"section": "单摆的振动是简谐运动",
"name": "特征",
"latex": "$F_回=-mgsinθ≈-mg\\frac x l=-\\frac{mg}lx$"
},
{
"stage": "高中",
"chapter": "单摆",
"section": "单摆的周期",
"name": "公式",
"latex": "$T=2π\\sqrt{\\frac l g}$"
},
{
"stage": "高中",
"chapter": "单摆",
"section": "单摆的周期",
"name": "单摆的周期",
"latex": "$a=\\frac 3 4g，T_1=2T=4s$"
},
{
"stage": "高中",
"chapter": "单摆",
"section": "单摆的周期",
"name": "单摆的周期",
"latex": "$a=3g，T_2=\\frac T 2=1s$"
},
{
"stage": "高中",
"chapter": "单摆",
"section": "单摆测g",
"name": "单摆测g",
"latex": "$T^2-L$ $T^2=\\frac{4π^2}{g}L$"
},
{
"stage": "高中",
"chapter": "机械振动",
"section": "受迫振动",
"name": "受迫振动",
"latex": "$f_外=f_0$"
},
{
"stage": "高中",
"chapter": "波的图像",
"section": "多解问题",
"name": "> 比如",
"latex": "$v=\\frac x t=\\frac{3+4n}{0.5s}=6+8n(n=0,1,2...)$"
},
{
"stage": "高中",
"chapter": "振动公式",
"section": "多普勒效应",
"name": "多普勒效应",
"latex": "$f_收=γf_发（接近：γ>1；远离：γ<1)$"
},
{
"stage": "高中",
"chapter": "振动公式",
"section": "波的折射",
"name": "折射定律",
"latex": "$\\frac{sinθ_1}{sinθ_2}=\\frac{v_1}{v_2}$"
},
{
"stage": "高中",
"chapter": "光",
"section": "光的折射",
"name": "公式",
"latex": "$\\frac{sinθ_1}{sinθ_2}=n$"
},
{
"stage": "高中",
"chapter": "光",
"section": "光的折射",
"name": "光的折射",
"latex": "$n=\\frac{sini}{sinγ}→sinγ↓=\\frac{sini}{n↑}$"
},
{
"stage": "高中",
"chapter": "光",
"section": "光的折射",
"name": "光的折射",
"latex": "$sini≈tani=\\frac a h$"
},
{
"stage": "高中",
"chapter": "光",
"section": "光的折射",
"name": "光的折射",
"latex": "$sinγ≈tanγ=\\frac a H$"
},
{
"stage": "高中",
"chapter": "光",
"section": "光的折射",
"name": "光的折射",
"latex": "$n=\\frac{sini}{sinγ}=\\frac H h$"
},
{
"stage": "高中",
"chapter": "光",
"section": "光的折射",
"name": "光的折射",
"latex": "$h=\\frac H n$"
},
{
"stage": "高中",
"chapter": "光",
"section": "光的折射",
"name": "光的折射",
"latex": "$sini≈tani=\\frac a G$"
},
{
"stage": "高中",
"chapter": "光",
"section": "光的折射",
"name": "光的折射",
"latex": "$sinγ≈tanγ=\\frac a g$"
},
{
"stage": "高中",
"chapter": "光",
"section": "光的折射",
"name": "光的折射",
"latex": "$n=\\frac{sini}{sinγ}=\\frac h H$"
},
{
"stage": "高中",
"chapter": "光",
"section": "全反射",
"name": "公式",
"latex": "$sinC=\\frac 1 n$"
},
{
"stage": "高中",
"chapter": "光",
"section": "光的干涉",
"name": "杨式双缝干涉",
"latex": "$△s=s_2-s_1$"
},
{
"stage": "高中",
"chapter": "光",
"section": "光的干涉",
"name": "光的干涉",
"latex": "$△s=\\frac λ 2(2n)$"
},
{
"stage": "高中",
"chapter": "光",
"section": "光的干涉",
"name": "光的干涉",
"latex": "$△s=\\frac λ 2(2n+1)$"
},
{
"stage": "高中",
"chapter": "光电效应与光子论",
"section": "光电效应",
"name": "公式",
"latex": "$\\epsilon=hv$ $h=6.626×10^{-34}J·s$"
},
{
"stage": "高中",
"chapter": "光电效应与光子论",
"section": "光电效应",
"name": "光子的能量",
"latex": "$\\epsilon=hv$"
},
{
"stage": "高中",
"chapter": "光电效应与光子论",
"section": "光电效应",
"name": "光电效应方程",
"latex": "$E_k=hν-W_0$ $E_k$"
},
{
"stage": "高中",
"chapter": "光电效应与光子论",
"section": "光电效应",
"name": "光电效应",
"latex": "$E_k=eU_c$"
},
{
"stage": "高中",
"chapter": "光电效应与光子论",
"section": "光电效应",
"name": "光电效应",
"latex": "$eU_c=hv-W_0$"
},
{
"stage": "高中",
"chapter": "光电效应与光子论",
"section": "光电效应",
"name": "截止频率",
"latex": "$hν=W_0$"
},
{
"stage": "高中",
"chapter": "光电效应与光子论",
"section": "光电效应",
"name": "光电效应",
"latex": "$U_c=\\frac{E_k}{e}$"
},
{
"stage": "高中",
"chapter": "光电效应与光子论",
"section": "图像问题",
"name": "图像问题",
"latex": "$U_c-v$ $U=\\frac h e v-\\frac{W_0}{e}$"
},
{
"stage": "高中",
"chapter": "光电效应与光子论",
"section": "图像问题",
"name": "同光，光强不同时，最大初动能",
"latex": "$E_{km}=eU_c$"
},
{
"stage": "高中",
"chapter": "光电效应与光子论",
"section": "光子论",
"name": "光子论",
"latex": "$h=6.63×10^{-34}J·s$ $10^{14}Hz$"
},
{
"stage": "高中",
"chapter": "光电效应与光子论",
"section": "光子论",
"name": "光子动量公式",
"latex": "$P=\\frac E C=\\frac h λ$"
},
{
"stage": "高中",
"chapter": "光电效应与光子论",
"section": "光子论",
"name": "> 频率为v的光子，能量",
"latex": "$hv=h\\frac c λ$"
},
{
"stage": "高中",
"chapter": "电磁振荡",
"section": "电磁振荡的周期和频率",
"name": "电磁振荡的周期和频率",
"latex": "$T=2π\\sqrt{LC}，\\ f=\\frac{1}{2π\\sqrt{LC}}$"
},
{
"stage": "高中",
"chapter": "相对论简介",
"section": "相对论简介",
"name": "相对论简介",
"latex": "$E_m-E_n=hγ$"
},
{
"stage": "高中",
"chapter": "相对论简介",
"section": "相对论简介",
"name": "相对论简介",
"latex": "$n_1=n_2+n_3$"
},
{
"stage": "高中",
"chapter": "相对论简介",
"section": "相对论简介",
"name": "相对论简介",
"latex": "$m_1=m_2+m_3$"
},
{
"stage": "高中",
"chapter": "相对论简介",
"section": "时间和空间的相对性",
"name": "时间和空间的相对性",
"latex": "$l=l_0\\sqrt{1-(\\frac{v}{c})^2}$ $l<l_0$"
},
{
"stage": "高中",
"chapter": "相对论简介",
"section": "时间和空间的相对性",
"name": "时间和空间的相对性",
"latex": "$△t=\\frac{△T}{\\sqrt{1-(\\frac{v}{c})^2}}$"
},
{
"stage": "高中",
"chapter": "相对论简介",
"section": "相对论的其他结论",
"name": "质能方程",
"latex": "$E=mc^2$"
},
{
"stage": "高中",
"chapter": "原子结构",
"section": "电子跃迁",
"name": "其他能级",
"latex": "$E=1/n^2$"
},
{
"stage": "高中",
"chapter": "原子核",
"section": "半衰期",
"name": "半衰期",
"latex": "$N_余=N_原(\\frac 1 2)^{\\frac t T}$"
},
{
"stage": "高中",
"chapter": "原子核",
"section": "半衰期",
"name": "半衰期",
"latex": "$m_余=m_原(\\frac 1 2)^{\\frac t T}$"
},
{
"stage": "高中",
"chapter": "原子核",
"section": "质能方程",
"name": "质能方程",
"latex": "$1MeV=1.6×10^{-13}J$"
},
{
"stage": "高中",
"chapter": "传感器",
"section": "传感器及其工作原理",
"name": "霍尔元件",
"latex": "$U_H=k\\frac{IB}{d}$"
},
{
"stage": "初中",
"chapter": "初中物理知识点",
"section": "第八章 电功和电热知识归纳",
"name": "计算电功率还可用右公式",
"latex": "$P=I^2R$ $P=U^2/R$"
},
{
"stage": "初中",
"chapter": "初中物理知识点",
"section": "第八章 电功和电热知识归纳",
"name": "第八章 电功和电热知识归纳",
"latex": "$U = U_0$ $P = P_0$"
},
{
"stage": "初中",
"chapter": "初中物理知识点",
"section": "第八章 电功和电热知识归纳",
"name": "焦耳定律公式",
"latex": "$Q=I^2Rt$"
},
{
"stage": "初中",
"chapter": "初中物理知识点",
"section": "第十一章 多彩的物质世界",
"name": "质量",
"latex": "$1吨=10^3千克=10^6克=10^9毫克$"
},
{
"stage": "初中",
"chapter": "初中物理知识点",
"section": "第十三章力和机械",
"name": "杠杆平衡的条件",
"latex": "$F_1L_1=F_2L_2$"
}
];
