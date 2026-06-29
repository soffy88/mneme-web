// 数学公式数据（来源：KnowledgeHierarchy markdown 抽取+清洗，公式为公共领域事实）
export interface MathFormula { stage: string; chapter: string; section: string; name: string; latex: string }
export const MATH_FORMULAS: MathFormula[] = [
{
"stage": "高中",
"chapter": "基础/常识",
"section": "一元二次方程",
"name": "一元二次方程",
"latex": "$y=ax^2+bx+c$"
},
{
"stage": "高中",
"chapter": "基础/常识",
"section": "一元二次方程",
"name": "判别式",
"latex": "$△=b^2-4ac$"
},
{
"stage": "高中",
"chapter": "基础/常识",
"section": "一元二次方程",
"name": "对称轴",
"latex": "$x=-\\frac b{2a}$"
},
{
"stage": "高中",
"chapter": "基础/常识",
"section": "一元二次方程",
"name": "顶点坐标",
"latex": "$(-\\frac{b}{2a}, \\frac{4ac-b^2}{4a})$"
},
{
"stage": "高中",
"chapter": "基础/常识",
"section": "一元二次方程",
"name": "韦达定理",
"latex": "$x_1+x_2=-\\frac b a,\\ x_1x_2=\\frac c a$"
},
{
"stage": "高中",
"chapter": "基础/常识",
"section": "一元二次方程",
"name": "顶点式",
"latex": "$y=a(x-h)²+k$"
},
{
"stage": "高中",
"chapter": "基础/常识",
"section": "直线",
"name": "直线",
"latex": "$S=\\frac 1 2ab$"
},
{
"stage": "高中",
"chapter": "函数",
"section": "函数的值域",
"name": "* 换元法",
"latex": "$y=ax+b±\\sqrt{cx+d}(a≠0,c≠0)$"
},
{
"stage": "高中",
"chapter": "函数",
"section": "函数的值域",
"name": "* 分离常数法",
"latex": "$y=\\frac{cx+d}{ax+b}(a≠0)$ $y|y≠\\frac c a，y∈R$"
},
{
"stage": "高中",
"chapter": "函数基本性质",
"section": "单调性",
"name": "单调性",
"latex": "$x_1<x_2$ $f(x_1)<f(x_2)$"
},
{
"stage": "高中",
"chapter": "函数基本性质",
"section": "单调性",
"name": "单调性",
"latex": "$x_1<x_2$ $f(x_1)>f(x_2)$"
},
{
"stage": "高中",
"chapter": "函数基本性质",
"section": "单调性",
"name": "单调区间",
"latex": "$y=f(x)$ $y=f(x)$"
},
{
"stage": "高中",
"chapter": "单调性",
"section": "判断函数单调性：",
"name": "判断函数单调性",
"latex": "$x_1,x_2$ $x_1<x2$"
},
{
"stage": "高中",
"chapter": "函数基本性质",
"section": "函数最大/小值",
"name": "函数最大/小值",
"latex": "$x_0∈I$ $f(x_0)=M$"
},
{
"stage": "高中",
"chapter": "函数基本性质",
"section": "函数奇偶性",
"name": "偶函数",
"latex": "$f(x)$ $f(-x)=f(x)$"
},
{
"stage": "高中",
"chapter": "函数基本性质",
"section": "函数奇偶性",
"name": "奇函数",
"latex": "$f(x)$ $f(-x)=-f(x)$"
},
{
"stage": "高中",
"chapter": "函数基本性质",
"section": "函数奇偶性",
"name": "函数奇偶性",
"latex": "$f(0)=0$"
},
{
"stage": "高中",
"chapter": "函数基本性质",
"section": "函数奇偶性",
"name": "函数奇偶性",
"latex": "$y=f(x)$ $f(0)=0$"
},
{
"stage": "高中",
"chapter": "函数基本性质",
"section": "函数奇偶性",
"name": "函数奇偶性",
"latex": "$y=ax^2+bx+c(a ≠ 0)$"
},
{
"stage": "高中",
"chapter": "函数图像性质",
"section": "函数图像平移",
"name": "函数图像平移",
"latex": "$y=x^2$"
},
{
"stage": "高中",
"chapter": "函数图像性质",
"section": "函数图像平移",
"name": "函数图像平移",
"latex": "$(y-b)=(x-a)^2$"
},
{
"stage": "高中",
"chapter": "函数图像性质",
"section": "函数图像平移",
"name": "函数图像平移",
"latex": "$y=(x-a)^2+b$"
},
{
"stage": "高中",
"chapter": "函数图像性质",
"section": "函数图像翻折",
"name": "函数图像翻折",
"latex": "$y=x^2-|x|+a$"
},
{
"stage": "高中",
"chapter": "函数图像性质",
"section": "函数图像翻折",
"name": "函数图像翻折",
"latex": "$x^2-|x|=a$"
},
{
"stage": "高中",
"chapter": "函数图像性质",
"section": "函数图像翻折",
"name": "函数图像翻折",
"latex": "$g(x)=x^2-|x|, h(x)=a$"
},
{
"stage": "高中",
"chapter": "函数",
"section": "对勾函数",
"name": "对勾函数",
"latex": "$y=ax+\\frac b x$"
},
{
"stage": "高中",
"chapter": "函数",
"section": "对勾函数",
"name": "* 转折点坐标",
"latex": "$(\\sqrt{\\frac b a}, 2\\sqrt{ab})$ $(-\\sqrt{\\frac b a}, -2\\sqrt{ab})$"
},
{
"stage": "高中",
"chapter": "函数",
"section": "对勾函数",
"name": "对勾函数",
"latex": "$k=\\sqrt{\\frac b a}$"
},
{
"stage": "高中",
"chapter": "函数",
"section": "对勾函数",
"name": "对勾函数",
"latex": "$y=x+\\frac b x(b>0)$"
},
{
"stage": "高中",
"chapter": "函数",
"section": "对勾函数",
"name": "增区间",
"latex": "$(-∞,-\\sqrt b], [\\sqrt b, +∞)$"
},
{
"stage": "高中",
"chapter": "函数",
"section": "对勾函数",
"name": "减区间",
"latex": "$[-\\sqrt b， 0)，(0,\\sqrt b]$"
},
{
"stage": "高中",
"chapter": "函数",
"section": "周期函数",
"name": "周期函数",
"latex": "$f(x+a)=±\\frac{1}{f(x)}$"
},
{
"stage": "高中",
"chapter": "函数",
"section": "中心对称",
"name": "中心对称",
"latex": "$\\frac{a+b}{2}$"
},
{
"stage": "高中",
"chapter": "指数函数",
"section": "根式",
"name": "根式",
"latex": "$x^n=a$ $n \\in N^*$"
},
{
"stage": "高中",
"chapter": "指数函数",
"section": "根式",
"name": "根式",
"latex": "$(\\sqrt[n]{a})^n=a(n \\in N^*, 且 n > 1)$"
},
{
"stage": "高中",
"chapter": "指数函数",
"section": "根式",
"name": "根式",
"latex": "$\\sqrt[n]{a^n}=a$"
},
{
"stage": "高中",
"chapter": "指数函数",
"section": "分数指数幂",
"name": "正数的正分数指数幂",
"latex": "$a^{\\frac{m}{n}}=\\sqrt[n]{a^m}(a > 0, m,n \\in N^*, 且 n > 1)$"
},
{
"stage": "高中",
"chapter": "指数函数",
"section": "分数指数幂",
"name": "负数的负分数指数幂",
"latex": "$a^{- \\frac{m}{n}}=\\frac{1}{a^\\frac{m}{n}}(a > 0, m,n \\in N^*, 且 n > 1)$"
},
{
"stage": "高中",
"chapter": "指数函数",
"section": "有理数指数幂的运算性质",
"name": "有理数指数幂的运算性质",
"latex": "$a^ra^s=a^{r+s}(a>0,r,s \\in Q);$"
},
{
"stage": "高中",
"chapter": "指数函数",
"section": "有理数指数幂的运算性质",
"name": "有理数指数幂的运算性质",
"latex": "$a^m÷a^n=a^{m-n}$"
},
{
"stage": "高中",
"chapter": "指数函数",
"section": "有理数指数幂的运算性质",
"name": "有理数指数幂的运算性质",
"latex": "$(a^r)^s=a^{rs}(a>0,r,s \\in Q);$"
},
{
"stage": "高中",
"chapter": "指数函数",
"section": "有理数指数幂的运算性质",
"name": "有理数指数幂的运算性质",
"latex": "$(ab)^r=a^rb^r(a>0,b>0,r \\in Q)$"
},
{
"stage": "高中",
"chapter": "指数函数",
"section": "有理数指数幂的运算性质",
"name": "有理数指数幂的运算性质",
"latex": "$a^{-n}=\\frac{1}{a^n}$"
},
{
"stage": "高中",
"chapter": "指数函数",
"section": "指数函数的概念",
"name": "指数函数的概念",
"latex": "$y=a^x$"
},
{
"stage": "高中",
"chapter": "指数函数",
"section": "指数函数恒过点问题",
"name": "指数函数恒过点问题",
"latex": "$f(x)=a^{x+1}-2$"
},
{
"stage": "高中",
"chapter": "对数函数",
"section": "对数",
"name": "对数",
"latex": "$a^x=N(a > 0, 且 a \\neq 1)$ $x=log_aN$"
},
{
"stage": "高中",
"chapter": "对数函数",
"section": "对数",
"name": "对数",
"latex": "$a^x=N \\leftrightarrow x=log_aN$"
},
{
"stage": "高中",
"chapter": "对数函数",
"section": "对数",
"name": "对数恒等式",
"latex": "$a^{log_aN}=N(a>0,a \\neq 1, N > 0)$"
},
{
"stage": "高中",
"chapter": "对数函数",
"section": "对数",
"name": "对数",
"latex": "$log_a1=0,log_aa=1$"
},
{
"stage": "高中",
"chapter": "对数函数",
"section": "对数的运算",
"name": "对数的运算",
"latex": "$log_a(M*N)=log_aM+log_aN$"
},
{
"stage": "高中",
"chapter": "对数函数",
"section": "对数的运算",
"name": "对数的运算",
"latex": "$log_a \\frac{M}{N}=log_aM-log_aN$"
},
{
"stage": "高中",
"chapter": "对数函数",
"section": "对数的运算",
"name": "对数的运算",
"latex": "$log_aM^n=nlog_aM(n \\in R)$"
},
{
"stage": "高中",
"chapter": "对数的运算",
"section": "换底公式",
"name": "换底公式",
"latex": "$log_ab=\\frac{log_cb}{log_ca}(a>0,a \\neq 1;c>0,c \\neq 1;b>0)$"
},
{
"stage": "高中",
"chapter": "对数函数",
"section": "对数函数",
"name": "对数函数",
"latex": "$y=log_ax(a>0,a \\neq 1)$"
},
{
"stage": "高中",
"chapter": "对数函数",
"section": "对数函数求解",
"name": "对数函数求解",
"latex": "$log_af(x)=c$ $a^c=f(x)$"
},
{
"stage": "高中",
"chapter": "对数函数",
"section": "对数函数求解",
"name": "对数函数求解",
"latex": "$log_af(x)=log_ag(x)(a>0,a≠1，f(x)>0, g(x)>0)$"
},
{
"stage": "高中",
"chapter": "对数函数",
"section": "对数函数求解",
"name": "对数函数求解",
"latex": "$f(log_ax)=0$ $t=log_ax$"
},
{
"stage": "高中",
"chapter": "对数函数",
"section": "对数函数求解",
"name": "对数函数求解",
"latex": "$x^{lg x+2}=1000$"
},
{
"stage": "高中",
"chapter": "对数函数",
"section": "对数不等式",
"name": "对数不等式",
"latex": "$log_af(x)>log_ag(x)$"
},
{
"stage": "高中",
"chapter": "对数函数",
"section": "对数不等式",
"name": "对数不等式",
"latex": "$log_2(2+x)>log_2(2x-3)$"
},
{
"stage": "高中",
"chapter": "对数函数",
"section": "对数不等式",
"name": "对数不等式",
"latex": "$log_x(x+1)>1$"
},
{
"stage": "高中",
"chapter": "对数函数",
"section": "对数不等式",
"name": "对数不等式",
"latex": "$log_a(1+x)<0$"
},
{
"stage": "高中",
"chapter": "对数函数",
"section": "反函数",
"name": "反函数",
"latex": "$y=f(x)$ $y=f^{-1}(x)$"
},
{
"stage": "高中",
"chapter": "对数函数",
"section": "反函数",
"name": "反函数",
"latex": "$y=log_2(x+2)-2$ $y^{-1}=2^{x+2}-2(x∈[-1,0])$"
},
{
"stage": "高中",
"chapter": "基本初等函数",
"section": "幂函数",
"name": "幂函数",
"latex": "$y=x^a$"
},
{
"stage": "高中",
"chapter": "幂函数",
"section": "常见幂函数性质",
"name": "常见幂函数性质",
"latex": "$y=x^0,y=x,y=x^2,y=x^3,y=x^{\\frac 1 2},y=x^{-1}$"
},
{
"stage": "高中",
"chapter": "幂函数",
"section": "常见幂函数性质",
"name": "常见幂函数性质",
"latex": "$y=x^a, y=x^{\\frac 1 a}$"
},
{
"stage": "高中",
"chapter": "幂函数",
"section": "常见幂函数性质",
"name": "常见幂函数性质",
"latex": "$y=x^\\frac n m=\\sqrt[m]{x^n}$"
},
{
"stage": "高中",
"chapter": "幂函数",
"section": "常见幂函数性质",
"name": "常见幂函数性质",
"latex": "$y=x^a(a∈Z)$"
},
{
"stage": "高中",
"chapter": "空间几何体的结构",
"section": "圆锥",
"name": "圆锥",
"latex": "$\\frac 1 2 lr=\\frac 1 2αr^2$"
},
{
"stage": "高中",
"chapter": "空间几何体的结构",
"section": "球的结构特征",
"name": "球的结构特征",
"latex": "$r=\\sqrt{R^2-d^2}$"
},
{
"stage": "高中",
"chapter": "空间几何体的表面积和体积",
"section": "柱体、椎体、台体的表面积",
"name": "柱体、椎体、台体的表面积",
"latex": "$πr^2$ $S_{圆柱表}=2πr^2+2πrl=2πr(r+l)$"
},
{
"stage": "高中",
"chapter": "空间几何体的表面积和体积",
"section": "柱体、椎体、台体的表面积",
"name": "柱体、椎体、台体的表面积",
"latex": "$S_{圆锥侧}=πrl$ $S_{圆锥表}=πr^2+πrl=πr(r+l)$"
},
{
"stage": "高中",
"chapter": "空间几何体的表面积和体积",
"section": "柱体、椎体、台体的表面积",
"name": "柱体、椎体、台体的表面积",
"latex": "$S_{圆台侧}=π(r+r')l$ $S_{圆台表}=π(r'^2+r^2+r'l+rl)$"
},
{
"stage": "高中",
"chapter": "空间几何体的表面积和体积",
"section": "柱体、椎体、台体的表面积",
"name": "柱体、椎体、台体的表面积",
"latex": "$S_{圆柱侧}=2πrl \\xleftarrow{r'=r}S_{圆台侧}=π(r+r')l \\xrightarrow{r'=0}S_{圆锥侧}=πrl$"
},
{
"stage": "高中",
"chapter": "空间几何体的表面积和体积",
"section": "柱体、椎体、台体的体积",
"name": "柱体、椎体、台体的体积",
"latex": "$V_{柱体}=Sh(S为底面积，h为柱体的高)$"
},
{
"stage": "高中",
"chapter": "空间几何体的表面积和体积",
"section": "柱体、椎体、台体的体积",
"name": "柱体、椎体、台体的体积",
"latex": "$V_{椎体}=\\frac{1}{3}Sh$"
},
{
"stage": "高中",
"chapter": "空间几何体的表面积和体积",
"section": "柱体、椎体、台体的体积",
"name": "柱体、椎体、台体的体积",
"latex": "$V_{台体}=\\frac{1}{3}(S'+\\sqrt{S'S}+S)h(S',S分别为上，下底面面积，h为台体的高)$"
},
{
"stage": "高中",
"chapter": "空间几何体的表面积和体积",
"section": "柱体、椎体、台体的体积",
"name": "柱体、椎体、台体的体积",
"latex": "$V_{柱体}=Sh \\xleftarrow{S'=S}V_{台体}=\\frac{1}{3}(S'+\\sqrt{S'S}+S)h \\xrightarrow{S'=0}V_{椎体}=\\frac{1}{3}Sh$"
},
{
"stage": "高中",
"chapter": "空间几何体的表面积和体积",
"section": "球体体积和表面积",
"name": "球体体积和表面积",
"latex": "$S_球=4πR^2$"
},
{
"stage": "高中",
"chapter": "空间几何体的表面积和体积",
"section": "球体体积和表面积",
"name": "球体体积和表面积",
"latex": "$V_球=\\frac{4}{3}πR^3$"
},
{
"stage": "高中",
"chapter": "空间几何体",
"section": "长方体的外接球",
"name": "长方体的外接球",
"latex": "$r=\\frac{\\sqrt{a^2+b^2+c^2}}{2}$"
},
{
"stage": "高中",
"chapter": "空间几何体",
"section": "长方体的外接球",
"name": "长方体的外接球",
"latex": "$r=\\frac{\\sqrt 3}{2}a$"
},
{
"stage": "高中",
"chapter": "空间几何体",
"section": "长方体的外接球",
"name": "长方体的外接球",
"latex": "$r=\\frac a 2$"
},
{
"stage": "高中",
"chapter": "空间几何体",
"section": "长方体的外接球",
"name": "长方体的外接球",
"latex": "$r=\\frac{\\sqrt 2}{2}a$"
},
{
"stage": "高中",
"chapter": "空间点、直线、平面之间的位置关系",
"section": "平面和平面之间的位置关系",
"name": "平面和平面之间的位置关系",
"latex": "$\\alpha \\cap \\beta=a$"
},
{
"stage": "高中",
"chapter": "斜率",
"section": "斜率公式",
"name": "斜率公式",
"latex": "$P_1(x_1,y_1),P_2(x_2,y_2)(x_1 \\neq x_2)$ $k=\\frac{y_2-y_1}{x_2-x_1}$"
},
{
"stage": "高中",
"chapter": "直线的倾斜角和斜率",
"section": "两条直线平行与垂直的判定",
"name": "两条直线平行与垂直的判定",
"latex": "$l_1//l_2 \\leftrightarrow k_1=k_2或l_1,l_2斜率都不存在$"
},
{
"stage": "高中",
"chapter": "直线的倾斜角和斜率",
"section": "两条直线平行与垂直的判定",
"name": "两条直线平行与垂直的判定",
"latex": "$l_1⊥l_2 \\leftrightarrow k_1k_2=-1$"
},
{
"stage": "高中",
"chapter": "直线的方程",
"section": "直线方程的几种形式",
"name": "直线方程的几种形式",
"latex": "$P_0(x_0,y_0)$ $y-y_0=k(x-x_0)$"
},
{
"stage": "高中",
"chapter": "直线的方程",
"section": "直线方程的几种形式",
"name": "直线方程的几种形式",
"latex": "$\\frac{x}{a}+\\frac{y}{b}=1$"
},
{
"stage": "高中",
"chapter": "直线的交点坐标与距离公式",
"section": "两条直线的位置关系",
"name": "两条直线的位置关系",
"latex": "$k_1=k_2且b_1 \\neq b_2$ $\\frac{A_1}{A_2}=\\frac{B_1}{B_2}\\neq \\frac{C_1}{C_2}(A_2B_2C_2\\neq 0)$"
},
{
"stage": "高中",
"chapter": "直线的交点坐标与距离公式",
"section": "两条直线的位置关系",
"name": "两条直线的位置关系",
"latex": "$k_1=k_2且b_1 = b_2$ $\\frac{A_1}{A_2}=\\frac{B_1}{B_2}= \\frac{C_1}{C_2}(A_2B_2C_2\\neq 0)$"
},
{
"stage": "高中",
"chapter": "直线的交点坐标与距离公式",
"section": "两条直线的位置关系",
"name": "两条直线的位置关系",
"latex": "$k_1 \\neq k_2$ $\\frac{A_1}{A_2}\\neq \\frac{B_1}{B_2}(A_2B_2\\neq 0)$"
},
{
"stage": "高中",
"chapter": "直线的交点坐标与距离公式",
"section": "两条直线的位置关系",
"name": "两条直线的位置关系",
"latex": "$k_1k_2=-1$ $A_1A_2+B_1B_2=0$"
},
{
"stage": "高中",
"chapter": "距离公式",
"section": "两点间的距离公式",
"name": "两点间的距离公式",
"latex": "$P_1(x_1,y_1),P_2(x_2,y_2)$ $|P_1P_2|=\\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}$"
},
{
"stage": "高中",
"chapter": "距离公式",
"section": "两点间的距离公式",
"name": "两点间的距离公式",
"latex": "$|P_1P_2|=\\sqrt{1+k^2}|x_1-x_2|$"
},
{
"stage": "高中",
"chapter": "距离公式",
"section": "两点间的距离公式",
"name": "两点间的距离公式",
"latex": "$|P_1P_2|=\\sqrt{1+\\frac 1{k^2}}|y_1-y_2|$"
},
{
"stage": "高中",
"chapter": "圆与方程",
"section": "圆的标准方程",
"name": "圆心在坐标原点，方程为",
"latex": "$x^2+y^2=r^2$"
},
{
"stage": "高中",
"chapter": "圆的标准方程",
"section": "点与圆的位置关系",
"name": "点与圆的位置关系",
"latex": "$(x_0-a)^2+(y_0-b)^2<r^2$"
},
{
"stage": "高中",
"chapter": "圆的标准方程",
"section": "点与圆的位置关系",
"name": "点与圆的位置关系",
"latex": "$(x_0-a)^2+(y_0-b)^2 = r^2$"
},
{
"stage": "高中",
"chapter": "圆的标准方程",
"section": "点与圆的位置关系",
"name": "点与圆的位置关系",
"latex": "$(x_0-a)^2+(y_0-b)^2>r^2$"
},
{
"stage": "高中",
"chapter": "圆与方程",
"section": "圆的一般方程",
"name": "圆的一般方程",
"latex": "$x^2+y^2+Dx+Ey+F=0$ $(x+\\frac{D}{2})^2+(y+\\frac{E}{2})^2=\\frac{D^2+E^2-4F}{4}$"
},
{
"stage": "高中",
"chapter": "圆与方程",
"section": "圆的一般方程",
"name": "* 等于0",
"latex": "$x=-\\frac{D}{2},y=-\\frac{E}{2}$"
},
{
"stage": "高中",
"chapter": "圆的切线",
"section": "求过圆外的一点$(x_0,y_0)$的圆的切线方程",
"name": "* 几何方法",
"latex": "$kx-y+y_0-kx_0=0$"
},
{
"stage": "高中",
"chapter": "圆的切线",
"section": "求过圆外的一点$(x_0,y_0)$的圆的切线方程",
"name": "* 代数方法",
"latex": "$y=kx-kx_0+y_0$"
},
{
"stage": "高中",
"chapter": "直线，圆的位置关系",
"section": "直线与圆相交的弦长问题",
"name": "直线与圆相交的弦长问题",
"latex": "$|AB|=\\sqrt{1+k^2}|x_1-x_2|=\\sqrt{1+k^2}\\sqrt{(x_1+x_2)^2-4x_1x_2}$"
},
{
"stage": "高中",
"chapter": "直线，圆的位置关系",
"section": "直线与圆相交的弦长问题",
"name": "直线与圆相交的弦长问题",
"latex": "$|AB|=2\\sqrt{r^2-d^2}$"
},
{
"stage": "高中",
"chapter": "圆和圆的位置关系",
"section": "判断两圆的位置关系",
"name": "判断两圆的位置关系",
"latex": "$C_1:(x-a_1)^2 +(y-b_1)^2 =r_1^2；C_2:(x-a_2)^2 +(y-b_2)^2 =r_2^2 $"
},
{
"stage": "高中",
"chapter": "圆和圆的位置关系",
"section": "判断两圆的位置关系",
"name": "判断两圆的位置关系",
"latex": "$d=\\sqrt{(a_2-a_1)^2+(b_2-b_1)^2}$"
},
{
"stage": "高中",
"chapter": "圆和圆的位置关系",
"section": "判断两圆的位置关系",
"name": "判断两圆的位置关系",
"latex": "$d>r_1+r_2$"
},
{
"stage": "高中",
"chapter": "圆和圆的位置关系",
"section": "判断两圆的位置关系",
"name": "判断两圆的位置关系",
"latex": "$d=r_1+r_2$"
},
{
"stage": "高中",
"chapter": "圆和圆的位置关系",
"section": "判断两圆的位置关系",
"name": "判断两圆的位置关系",
"latex": "$r_1-r_2<d<r_1+r_2$"
},
{
"stage": "高中",
"chapter": "圆和圆的位置关系",
"section": "判断两圆的位置关系",
"name": "判断两圆的位置关系",
"latex": "$d=|r_1-r_2|$"
},
{
"stage": "高中",
"chapter": "圆和圆的位置关系",
"section": "判断两圆的位置关系",
"name": "判断两圆的位置关系",
"latex": "$d<|r_1-r_2|$"
},
{
"stage": "高中",
"chapter": "直线，圆的位置关系",
"section": "两圆相交的公共弦长问题",
"name": "两圆相交的公共弦长问题",
"latex": "$C_1: x^2+y^2+D_1x+E_1y+F_1=0$"
},
{
"stage": "高中",
"chapter": "直线，圆的位置关系",
"section": "两圆相交的公共弦长问题",
"name": "两圆相交的公共弦长问题",
"latex": "$C_2: x^2+y^2+D_2x+E_2y+F_2=0$"
},
{
"stage": "高中",
"chapter": "直线，圆的位置关系",
"section": "两圆相交的公共弦长问题",
"name": "两圆相交的公共弦长问题",
"latex": "$x^2,y^2$ $(D_1-D_2)x+(E_1-E_2)y+F_1-F_2=0$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "半圆方程",
"name": "形如",
"latex": "$y=\\sqrt{4-x^2}$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "阿波罗尼斯圆",
"name": "形如",
"latex": "$y=-1-\\sqrt{3+2x-x^2}$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "已知圆的一般方程，求最值",
"name": "已知圆的一般方程，求最值",
"latex": "$x^2+y^2=(x-0)^2+(y-0)^2$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "已知圆的一般方程，求最值",
"name": "已知圆的一般方程，求最值",
"latex": "$z=\\frac{y-m}{x-n}$"
},
{
"stage": "高中",
"chapter": "空间直角坐标系",
"section": "空间两点间的距离公式",
"name": "空间两点间的距离公式",
"latex": "$P_1(x_1,y_1,z_1),P_2(x_2,y_2,z_2)$ $|P_1P_2|=\\sqrt{(x_1-x_2)^2+(y_1-y_2)^2+(z_1-z_2)^2}$"
},
{
"stage": "高中",
"chapter": "空间直角坐标系",
"section": "空间两点间的距离公式",
"name": "空间两点间的距离公式",
"latex": "$OP=\\sqrt{x^2+y^2+z^2}$"
},
{
"stage": "高中",
"chapter": "统计",
"section": "样本数字特征",
"name": "标准差",
"latex": "$s=\\sqrt{\\frac{1}{n}[(x_1-\\bar x)^2+...+(x_n-\\bar x)^2]}$"
},
{
"stage": "高中",
"chapter": "统计",
"section": "样本数字特征",
"name": "方差",
"latex": "$s^2=\\frac{1}{n}[(x_1-\\bar x)^2+...+(x_n-\\bar x)^2]$"
},
{
"stage": "高中",
"chapter": "统计",
"section": "样本数字特征",
"name": "样本数字特征",
"latex": "$s^2=\\frac 1 n \\sum\\limits_{i=1}^{n}x_i^2-\\overline x^2$"
},
{
"stage": "高中",
"chapter": "样本数字特征",
"section": "平均数方差的性质",
"name": "平均数方差的性质",
"latex": "$\\overline{ax+b}=a \\bar x+b$"
},
{
"stage": "高中",
"chapter": "样本数字特征",
"section": "平均数方差的性质",
"name": "平均数方差的性质",
"latex": "$s^2(ax+b)=a^2s^2(x)$"
},
{
"stage": "高中",
"chapter": "变量间的相关关系",
"section": "回归直线方程",
"name": "回归直线方程",
"latex": "$r=\\frac{\\sum\\limits_{i=1}^{n}(x_i-\\overline x)(y_i-\\overline y)}{\\sqrt{\\sum\\limits_{i=1}^{n}({x_i-\\overline x)^2}}\\sqrt{\\sum\\limits_{i=1}^{n}(y_i-\\overline y)^2}}=\\frac{\\sum\\limits_{i=1}^{n}x_iy_i-n \\overline x \\overline y}{\\sqrt{\\sum\\limits_{i=1}^{n}x_i^2-n\\overline x ^2 }\\sqrt{\\sum\\limits_{i=1}^{n}y_i^2-n\\overline y ^2}}$"
},
{
"stage": "高中",
"chapter": "变量间的相关关系",
"section": "回归直线方程",
"name": "回归直线方程",
"latex": "$\\hat y=\\hat bx+ \\hat a$"
},
{
"stage": "高中",
"chapter": "变量间的相关关系",
"section": "回归直线方程",
"name": "回归直线方程",
"latex": "$\\hat b=\\frac{\\sum\\limits_{i=1}^{n}(x_i-\\overline x)(y_i-\\overline y)}{\\sum\\limits_{i=1}^{n}(x_i-\\overline x)^2}=\\frac{\\sum\\limits_{i=1}^{n}x_iy_i-n \\overline x \\overline y}{\\sum\\limits_{i=1}^{n}x_i^2-n\\overline x ^2}$"
},
{
"stage": "高中",
"chapter": "变量间的相关关系",
"section": "回归直线方程",
"name": "回归直线方程",
"latex": "$\\hat a=\\overline y-\\hat b\\overline x$"
},
{
"stage": "高中",
"chapter": "变量间的相关关系",
"section": "拟合效果判断",
"name": "残差平方和",
"latex": "$\\sum\\limits_{i=1}^{n}(y_i-\\hat y_i)^2$"
},
{
"stage": "高中",
"chapter": "变量间的相关关系",
"section": "拟合效果判断",
"name": "拟合效果判断",
"latex": "$R^2=1-\\frac{\\sum\\limits_{i=1}^{n}(y_i-\\hat y_i)^2}{\\sum\\limits_{i=1}^{n}(y_i-\\overline y)^2}$"
},
{
"stage": "高中",
"chapter": "统计",
"section": "独立性检验",
"name": "独立性检验",
"latex": "$K^2=\\frac{n(ad-bc)^2}{(a+b)(c+d)(a+c){b+d}}$"
},
{
"stage": "高中",
"chapter": "统计",
"section": "独立性检验",
"name": "独立性检验",
"latex": "$P(K^2≥k_0)$ $K^2>K_0$"
},
{
"stage": "高中",
"chapter": "概率",
"section": "随机事件的概率",
"name": "* 频率",
"latex": "$f_n=\\frac{n_A}{n}$"
},
{
"stage": "高中",
"chapter": "概率的模型",
"section": "古典概型",
"name": "计算",
"latex": "$P(A)=\\frac{A包含的基本事件数m}{总基本事件数n}=\\frac m n$"
},
{
"stage": "高中",
"chapter": "概率的模型",
"section": "几何概型",
"name": "公式",
"latex": "$P(A)=\\frac{构成事件A的区域长度（面积或体积）}{试验的全部结果构成的区域长度（面积或体积）}$"
},
{
"stage": "高中",
"chapter": "概率",
"section": "离散型随机变量",
"name": "离散型随机变量",
"latex": "$D(x)=\\sum\\limits_{i=1}^{n}(x_i-E(x))^2p_i$"
},
{
"stage": "高中",
"chapter": "概率",
"section": "离散型随机变量",
"name": "期望（均值或数学期望）",
"latex": "$E(x)=x_1p_1+x_2p_2+...+x_np_n$"
},
{
"stage": "高中",
"chapter": "概率",
"section": "离散型随机变量",
"name": "离散型随机变量",
"latex": "$D(x)=\\sum\\limits_{i=1}^{n}[x_i-E(x)]^2p_i$"
},
{
"stage": "高中",
"chapter": "概率",
"section": "离散型随机变量",
"name": "离散型随机变量",
"latex": "$D(x)=E(x^2)-[E(x)]^2$"
},
{
"stage": "高中",
"chapter": "概率",
"section": "离散型随机变量",
"name": "离散型随机变量",
"latex": "$D(ax+b)=a^2D(x)$"
},
{
"stage": "高中",
"chapter": "概率",
"section": "离散型随机变量",
"name": "离散型随机变量",
"latex": "$D(aX+b)=a^2D(x)$"
},
{
"stage": "高中",
"chapter": "典型分布",
"section": "几何分布",
"name": "几何分布",
"latex": "$E(x)=\\frac 1 p$"
},
{
"stage": "高中",
"chapter": "典型分布",
"section": "几何分布",
"name": "几何分布",
"latex": "$D(x)=\\frac{1-p}{p^2}$"
},
{
"stage": "高中",
"chapter": "二项分布及其应用",
"section": "条件概率",
"name": "条件概率",
"latex": "$P(B|A)=\\frac{P(AB)}{P(A)}$"
},
{
"stage": "高中",
"chapter": "二项分布及其应用",
"section": "条件概率",
"name": "条件概率",
"latex": "$P(B|A)=P(B)$"
},
{
"stage": "高中",
"chapter": "二项分布及其应用",
"section": "条件概率",
"name": "条件概率",
"latex": "$P(A∩B)=P(A)·P(B)$"
},
{
"stage": "高中",
"chapter": "二项分布及其应用",
"section": "求概率问题的步骤",
"name": "古典概型",
"latex": "$P(A)=\\frac m n$"
},
{
"stage": "高中",
"chapter": "概率",
"section": "正态分布",
"name": "正态分布",
"latex": "$f(x)=\\frac{1}{\\sqrt{2π}·σ}e$"
},
{
"stage": "高中",
"chapter": "概率",
"section": "正态分布",
"name": "正态曲线",
"latex": "$φ_{μ, σ}=\\frac{1}{\\sqrt{2π}·σ}e^{-\\frac{(x-μ)^2}{2σ^2}}$"
},
{
"stage": "高中",
"chapter": "概率",
"section": "正态分布",
"name": "正态分布",
"latex": "$\\frac{1}{σ\\sqrt{2π}}$"
},
{
"stage": "高中",
"chapter": "正态分布",
"section": "3σ原则",
"name": "σ原则",
"latex": "$P(μ-a<X≤μ+a)=∫^{μ+a}_{μ-a}φ_{μ, σ}(x)dx$"
},
{
"stage": "高中",
"chapter": "正态分布",
"section": "3σ原则",
"name": "σ原则",
"latex": "$P(μ-σ<X≤μ+σ)=0.6826$"
},
{
"stage": "高中",
"chapter": "正态分布",
"section": "3σ原则",
"name": "σ原则",
"latex": "$P(μ-2σ<X≤μ+2σ)=0.9544$"
},
{
"stage": "高中",
"chapter": "正态分布",
"section": "3σ原则",
"name": "σ原则",
"latex": "$P(μ-3σ<X≤μ+3σ)=0.9974$"
},
{
"stage": "高中",
"chapter": "象限角",
"section": "弧长公式和面积公式",
"name": "弧长公式和面积公式",
"latex": "$l=\\frac{nπr}{180°}=αr$"
},
{
"stage": "高中",
"chapter": "象限角",
"section": "弧长公式和面积公式",
"name": "扇形面积公式",
"latex": "$S=\\frac{nπr^2}{360°}=\\frac 1 2 lr=\\frac 1 2 αr^2$"
},
{
"stage": "高中",
"chapter": "三角函数",
"section": "同角三角函数的基本公式",
"name": "同角三角函数的基本公式",
"latex": "$sin^2α+cos^2α=1$"
},
{
"stage": "高中",
"chapter": "三角函数",
"section": "同角三角函数的基本公式",
"name": "同角三角函数的基本公式",
"latex": "$tanα=\\frac{sin α}{cos α}(α\\neq \\frac{\\pi}{2}+k\\pi , k \\in Z)$"
},
{
"stage": "高中",
"chapter": "三角函数",
"section": "同角三角函数的基本公式",
"name": "同角三角函数的基本公式",
"latex": "$tanα·cotα=1(α≠\\frac{kπ}2)$"
},
{
"stage": "高中",
"chapter": "三角函数",
"section": "诱导公式",
"name": "诱导公式",
"latex": "$sin(\\frac{π}{2}+α)=cos α$"
},
{
"stage": "高中",
"chapter": "三角函数",
"section": "诱导公式",
"name": "诱导公式",
"latex": "$cos(\\frac{π}{2}+α)=-sin α$"
},
{
"stage": "高中",
"chapter": "三角函数",
"section": "诱导公式",
"name": "诱导公式",
"latex": "$tan(\\frac π 2+α)=-cotα$"
},
{
"stage": "高中",
"chapter": "三角函数",
"section": "诱导公式",
"name": "诱导公式",
"latex": "$sin(\\frac{π}{2}-α)=cos α$"
},
{
"stage": "高中",
"chapter": "三角函数",
"section": "诱导公式",
"name": "诱导公式",
"latex": "$cos(\\frac{π}{2}-α)=sin α$"
},
{
"stage": "高中",
"chapter": "三角函数",
"section": "诱导公式",
"name": "诱导公式",
"latex": "$tan(\\frac π 2-α)=cotα$"
},
{
"stage": "高中",
"chapter": "三角函数",
"section": "诱导公式",
"name": "诱导公式",
"latex": "$\\frac{kπ}{2}±α$"
},
{
"stage": "高中",
"chapter": "三角函数",
"section": "诱导公式",
"name": "诱导公式",
"latex": "$\\frac{kπ}{2}+α$"
},
{
"stage": "高中",
"chapter": "两角和与差的正弦，余弦和正切公式",
"section": "两角和与差的公式",
"name": "两角和与差的公式",
"latex": "$tan(α+β)=\\frac{tanα+tanβ}{1-tanα\\ tanβ}$"
},
{
"stage": "高中",
"chapter": "两角和与差的正弦，余弦和正切公式",
"section": "两角和与差的公式",
"name": "两角和与差的公式",
"latex": "$tan(α-β)=\\frac{tanα-tanβ}{1+tan\\ tanβ}$"
},
{
"stage": "高中",
"chapter": "两角和与差的正弦，余弦和正切公式",
"section": "倍角公式",
"name": "倍角公式",
"latex": "$cos2α=cos^2α-sin^2α=2cos^2α-1=1-2sin^2α$"
},
{
"stage": "高中",
"chapter": "两角和与差的正弦，余弦和正切公式",
"section": "倍角公式",
"name": "倍角公式",
"latex": "$tan2α=\\frac{2tanα}{1-tan^2α}$"
},
{
"stage": "高中",
"chapter": "两角和与差的正弦，余弦和正切公式",
"section": "半角公式",
"name": "半角公式",
"latex": "$sin a=±\\sqrt{\\frac{1-cos 2a}{2}}$"
},
{
"stage": "高中",
"chapter": "两角和与差的正弦，余弦和正切公式",
"section": "半角公式",
"name": "半角公式",
"latex": "$cos a=±\\sqrt{\\frac{1+cos 2a}{2}}$"
},
{
"stage": "高中",
"chapter": "两角和与差的正弦，余弦和正切公式",
"section": "半角公式",
"name": "半角公式",
"latex": "$tan a=±\\sqrt{\\frac{1-cos 2α}{1+cos2α}}=\\frac{sin 2α}{1+cos 2α}=\\frac{1-cos 2α}{sin2α}$"
},
{
"stage": "高中",
"chapter": "两角和与差的正弦，余弦和正切公式",
"section": "万能公式",
"name": "万能公式",
"latex": "$sin2α=\\frac{2tana}{1+tan^2 a}$"
},
{
"stage": "高中",
"chapter": "两角和与差的正弦，余弦和正切公式",
"section": "万能公式",
"name": "万能公式",
"latex": "$cos2α=\\frac{1-tan^2 a}{1+tan^2 a}$"
},
{
"stage": "高中",
"chapter": "两角和与差的正弦，余弦和正切公式",
"section": "万能公式",
"name": "万能公式",
"latex": "$tan2α=\\frac{2tan a}{1-tan^2 a}$"
},
{
"stage": "高中",
"chapter": "两角和与差的正弦，余弦和正切公式",
"section": "积化和差",
"name": "积化和差",
"latex": "$sinαcosβ=\\frac{sin(α+β)+sin(α-β)}2$"
},
{
"stage": "高中",
"chapter": "两角和与差的正弦，余弦和正切公式",
"section": "积化和差",
"name": "积化和差",
"latex": "$cosαsinβ=\\frac{sin(α+β)-sin(α-β)}2$"
},
{
"stage": "高中",
"chapter": "两角和与差的正弦，余弦和正切公式",
"section": "积化和差",
"name": "积化和差",
"latex": "$cosαcosβ=\\frac{cos(α+β)+cos(α-β)}2$"
},
{
"stage": "高中",
"chapter": "两角和与差的正弦，余弦和正切公式",
"section": "积化和差",
"name": "积化和差",
"latex": "$sinαsinβ=-\\frac{cos(α+β)-cos(α-β)}2$"
},
{
"stage": "高中",
"chapter": "两角和与差的正弦，余弦和正切公式",
"section": "和差化积",
"name": "和差化积",
"latex": "$sinα+sinβ=2sin\\frac{α+β}2cos\\frac{α-β}2$"
},
{
"stage": "高中",
"chapter": "两角和与差的正弦，余弦和正切公式",
"section": "和差化积",
"name": "和差化积",
"latex": "$sinα-sinβ=2cos\\frac{α+β}2sin\\frac{α-β}2$"
},
{
"stage": "高中",
"chapter": "两角和与差的正弦，余弦和正切公式",
"section": "和差化积",
"name": "和差化积",
"latex": "$cosα+cosβ=2cos\\frac{α+β}2cos\\frac{α-β}2$"
},
{
"stage": "高中",
"chapter": "两角和与差的正弦，余弦和正切公式",
"section": "和差化积",
"name": "和差化积",
"latex": "$cosα-cosβ=-2sin\\frac{α+β}2sin\\frac{α-β}2$"
},
{
"stage": "高中",
"chapter": "两角和与差的正弦，余弦和正切公式",
"section": "升幂处理",
"name": "升幂处理",
"latex": "$\\sqrt{1±sin 2a}=|sin a±cos a|$"
},
{
"stage": "高中",
"chapter": "两角和与差的正弦，余弦和正切公式",
"section": "升幂处理",
"name": "升幂处理",
"latex": "$\\sqrt{1+cos2a}=\\sqrt{1+2cos^2 a - 1}=\\sqrt{2cos^2a}=\\sqrt{2}|cosa|$"
},
{
"stage": "高中",
"chapter": "两角和与差的正弦，余弦和正切公式",
"section": "升幂处理",
"name": "升幂处理",
"latex": "$\\sqrt{1-cos2a}=\\sqrt{1-(1-2sin^2 a) }=\\sqrt{2sin^2a}=\\sqrt{2}|sina|$"
},
{
"stage": "高中",
"chapter": "两角和与差的正弦，余弦和正切公式",
"section": "sin的和差",
"name": "sin的和差",
"latex": "$sin(A+B)sin(A-B)=sin^2A-sin^2B$"
},
{
"stage": "高中",
"chapter": "两角和与差的正弦，余弦和正切公式",
"section": "常用的特殊角转化",
"name": "常用的特殊角转化",
"latex": "$α=2·\\frac{α}{2}$"
},
{
"stage": "高中",
"chapter": "两角和与差的正弦，余弦和正切公式",
"section": "常用的特殊角转化",
"name": "常用的特殊角转化",
"latex": "$α=(α+β)-β=β-(β-α)$"
},
{
"stage": "高中",
"chapter": "两角和与差的正弦，余弦和正切公式",
"section": "常用的特殊角转化",
"name": "常用的特殊角转化",
"latex": "$α=\\frac{1}{2}[(α+β)+(α-β)]$"
},
{
"stage": "高中",
"chapter": "两角和与差的正弦，余弦和正切公式",
"section": "常用的特殊角转化",
"name": "常用的特殊角转化",
"latex": "$β=\\frac{1}{2}[(α+β)-(α-β)]$"
},
{
"stage": "高中",
"chapter": "两角和与差的正弦，余弦和正切公式",
"section": "常用的特殊角转化",
"name": "常用的特殊角转化",
"latex": "$\\frac{π}{4}+α=\\frac{π}{2}-(\\frac{π}{4}-α)$"
},
{
"stage": "高中",
"chapter": "两角和与差的正弦，余弦和正切公式",
"section": "常用的特殊角转化",
"name": "常用的特殊角转化",
"latex": "$15°=45°-30°=60°-45°=\\frac{30°}{2}$"
},
{
"stage": "高中",
"chapter": "简单的三角恒等变换",
"section": "辅助角公式",
"name": "辅助角公式",
"latex": "$asinα+bcosα=\\sqrt{a^2+b^2}sin(α+φ)(ab≠0)$"
},
{
"stage": "高中",
"chapter": "简单的三角恒等变换",
"section": "辅助角公式",
"name": "辅助角公式",
"latex": "$tanφ=\\frac{b}{a}$"
},
{
"stage": "高中",
"chapter": "简单的三角恒等变换",
"section": "辅助角公式",
"name": "辅助角公式",
"latex": "$cosφ=\\frac{a}{\\sqrt{a^2+b^2}}$"
},
{
"stage": "高中",
"chapter": "简单的三角恒等变换",
"section": "辅助角公式",
"name": "辅助角公式",
"latex": "$sinφ=\\frac{b}{\\sqrt{a^2+b^2}}$"
},
{
"stage": "高中",
"chapter": "简单的三角恒等变换",
"section": "辅助角公式",
"name": "最值",
"latex": "$±\\sqrt{a^2+b^2}$"
},
{
"stage": "高中",
"chapter": "简单的三角恒等变换",
"section": "辅助角公式",
"name": "> 用法",
"latex": "$x=\\sqrt{a^2+b^2}$"
},
{
"stage": "高中",
"chapter": "三角函数的图像和性质",
"section": "三角函数性质",
"name": "三角函数性质",
"latex": "$x=kπ+\\frac{π}{2},(k∈Z)$"
},
{
"stage": "高中",
"chapter": "三角函数的图像和性质",
"section": "三角函数性质",
"name": "三角函数性质",
"latex": "$(kπ+\\frac{π}{2},0),(k∈Z)$"
},
{
"stage": "高中",
"chapter": "三角函数的图像和性质",
"section": "三角函数性质",
"name": "定义域",
"latex": "$x|x\\neq \\frac{\\pi}{2}+k\\pi , k \\in Z$"
},
{
"stage": "高中",
"chapter": "三角函数的图像和性质",
"section": "三角函数性质",
"name": "单调性",
"latex": "$(kπ-\\frac{π}{2},kπ+\\frac{π}{2})(k \\in Z)$"
},
{
"stage": "高中",
"chapter": "三角函数的图像和性质",
"section": "三角函数性质",
"name": "对称中心",
"latex": "$(\\frac{kπ}{2},0)(k \\in Z)$"
},
{
"stage": "高中",
"chapter": "三角函数",
"section": "函数y=Asin(ωx+φ)",
"name": "函数y=Asin(ωx+φ)",
"latex": "$y=sinωx→$"
},
{
"stage": "高中",
"chapter": "三角函数",
"section": "函数y=Asin(ωx+φ)",
"name": "函数y=Asin(ωx+φ)",
"latex": "$T=\\frac{2π}{|ω|}$"
},
{
"stage": "高中",
"chapter": "三角函数",
"section": "函数y=Asin(ωx+φ)",
"name": "对称轴",
"latex": "$x=\\frac π 2+kπ(k∈z)$"
},
{
"stage": "高中",
"chapter": "三角函数",
"section": "函数y=Asin(ωx+φ)",
"name": "函数y=Asin(ωx+φ)",
"latex": "$y=Asin(ωx+φ)+B→$"
},
{
"stage": "高中",
"chapter": "三角函数",
"section": "函数y=Asin(ωx+φ)",
"name": "对称轴",
"latex": "$ωx+φ=\\frac π 2+kπ$"
},
{
"stage": "高中",
"chapter": "三角函数",
"section": "函数y=Asin(ωx+φ)",
"name": "如果是偶函数",
"latex": "$y=\\frac π 2+kπ,k∈Z$"
},
{
"stage": "高中",
"chapter": "三角函数",
"section": "函数y=Asin(ωx+φ)",
"name": "增区间",
"latex": "$x|-\\frac π 2+2kπ≤ωx+φ≤\\frac π 2+2kπ$"
},
{
"stage": "高中",
"chapter": "三角函数",
"section": "函数y=Asin(ωx+φ)",
"name": "减区间",
"latex": "$x|\\frac π 2+2kπ≤ωx+φ≤\\frac {3π} 2+2kπ$"
},
{
"stage": "高中",
"chapter": "函数y=Asin(ωx+φ)",
"section": "图像变换",
"name": "> 如果步骤1 2调换",
"latex": "$|\\frac φ ω |$"
},
{
"stage": "高中",
"chapter": "三角函数",
"section": "带绝对值的三角函数周期",
"name": "带绝对值的三角函数周期",
"latex": "$T=\\fracπ{|ω|}$"
},
{
"stage": "高中",
"chapter": "三角函数",
"section": "带绝对值的三角函数周期",
"name": "带绝对值的三角函数周期",
"latex": "$T=\\frac{2π}{|ω|}$"
},
{
"stage": "高中",
"chapter": "正弦定理和余弦定理",
"section": "正弦定理",
"name": "正弦定理",
"latex": "$\\frac{a}{b}=\\frac{sinA}{sinB},\\ \\frac{b}{c}=\\frac{sinB}{sinC}, \\ \\frac{a}{c}=\\frac{sinA}{sinC}$"
},
{
"stage": "高中",
"chapter": "正弦定理和余弦定理",
"section": "正弦定理",
"name": "正弦定理",
"latex": "$a:b:c=sinA:sinB:sinC$"
},
{
"stage": "高中",
"chapter": "正弦定理和余弦定理",
"section": "正弦定理",
"name": "正弦定理",
"latex": "$a=2RsinA, b=2RsinB, c=2RsinC$"
},
{
"stage": "高中",
"chapter": "正弦定理和余弦定理",
"section": "余弦定理",
"name": "余弦定理",
"latex": "$a^2=b^2+c^2-2bccosA$"
},
{
"stage": "高中",
"chapter": "正弦定理和余弦定理",
"section": "余弦定理",
"name": "余弦定理",
"latex": "$b^2=a^2+c^2-2accosB$"
},
{
"stage": "高中",
"chapter": "正弦定理和余弦定理",
"section": "余弦定理",
"name": "余弦定理",
"latex": "$c^2=a^2+b^2-2abcosC$"
},
{
"stage": "高中",
"chapter": "正弦定理和余弦定理",
"section": "余弦定理",
"name": "余弦定理",
"latex": "$cosA=\\frac{b^2+c^2-a^2}{2bc}$"
},
{
"stage": "高中",
"chapter": "正弦定理和余弦定理",
"section": "余弦定理",
"name": "余弦定理",
"latex": "$cosB=\\frac{a^2+c^2-b^2}{2ac}$"
},
{
"stage": "高中",
"chapter": "正弦定理和余弦定理",
"section": "余弦定理",
"name": "余弦定理",
"latex": "$cosC=\\frac{a^2+b^2-c^2}{2ab}$"
},
{
"stage": "高中",
"chapter": "正余弦定理的综合应用",
"section": "判断三角形的形状",
"name": "判断三角形的形状",
"latex": "$a^2+b^2=c^2 \\Leftrightarrow cosC=0 \\Leftrightarrow C=90°$"
},
{
"stage": "高中",
"chapter": "正余弦定理的综合应用",
"section": "判断三角形的形状",
"name": "判断三角形的形状",
"latex": "$a^2+b^2>c^2 \\Leftrightarrow cosC>0 \\Leftrightarrow 0°<C<90°$"
},
{
"stage": "高中",
"chapter": "正余弦定理的综合应用",
"section": "判断三角形的形状",
"name": "判断三角形的形状",
"latex": "$a^2+b^2<c^2 \\Leftrightarrow cosC<0 \\Leftrightarrow 90°<C<180°$"
},
{
"stage": "高中",
"chapter": "正余弦定理的综合应用",
"section": "判断三角形的形状",
"name": "判断三角形的形状",
"latex": "$A+B=\\frac{π}{2}$"
},
{
"stage": "高中",
"chapter": "正弦定理和余弦定理",
"section": "三角形面积公式",
"name": "三角形面积公式",
"latex": "$S_{△ABC}=\\frac{1}{2}bcsinA=\\frac{1}{2}acsinB=\\frac{1}{2}absinC(A,B,C是△ABC三边a,b,c的对角)$"
},
{
"stage": "高中",
"chapter": "正弦定理和余弦定理",
"section": "三角形面积公式",
"name": "三角形面积公式",
"latex": "$S_{△ABC}=\\sqrt{p(p-a)(p-b)(p-c)}(p=\\frac{a+b+c}{2})$"
},
{
"stage": "高中",
"chapter": "正弦定理和余弦定理",
"section": "三角形面积公式",
"name": "三角形面积公式",
"latex": "$S_{△ABC}=\\frac{1}{2}r(a+b+c)(r为三角形内切圆半径)$"
},
{
"stage": "高中",
"chapter": "正弦定理和余弦定理",
"section": "三角形面积公式",
"name": "三角形面积公式",
"latex": "$S=\\frac{abc}{4R}=\\frac 1 2 Cr$"
},
{
"stage": "高中",
"chapter": "解三角形",
"section": "解题",
"name": "解题",
"latex": "$sin^2A-sin^2B-sin^2C=sinBsinC$"
},
{
"stage": "高中",
"chapter": "解三角形",
"section": "解题",
"name": "解题",
"latex": "$\\frac{BC}{sinA}=2\\sqrt{3}$"
},
{
"stage": "高中",
"chapter": "解三角形",
"section": "解题",
"name": "解题",
"latex": "$AC=2\\sqrt 3 sinB, AB=2\\sqrt{3}(π-A-B)=3cosB-\\sqrt 3sinB$"
},
{
"stage": "高中",
"chapter": "解三角形",
"section": "解题",
"name": "解题",
"latex": "$BC+AC+AB=3+\\sqrt 3 sinB+3cosB=3+2\\sqrt 3sin(B+\\frac π 3)$"
},
{
"stage": "高中",
"chapter": "解题",
"section": "中线定理",
"name": "中线定理",
"latex": "$\\vec{BD}=\\frac 1 2(\\vec{BA}+\\vec{BC})$"
},
{
"stage": "高中",
"chapter": "解题",
"section": "中线定理",
"name": "中线定理",
"latex": "$\\vec{BD}^2=\\frac 1 4(\\vec{BA}^2+\\vec{BC}^2+2\\vec{BA}·\\vec{BC})$"
},
{
"stage": "高中",
"chapter": "解题",
"section": "中线定理",
"name": "中线定理",
"latex": "$|BD|^2=\\frac 1 4(c^2+a^2+2accosB)$"
},
{
"stage": "高中",
"chapter": "解题",
"section": "中线定理",
"name": "中线定理",
"latex": "$ =\\frac 1 4(c^2+a^2+ac)$"
},
{
"stage": "高中",
"chapter": "平面向量",
"section": "基本概念",
"name": "单位向量",
"latex": "$|\\vec a|=1$"
},
{
"stage": "高中",
"chapter": "平面向量",
"section": "基本概念",
"name": "基本概念",
"latex": "$λ\\vec a=\\vec b$"
},
{
"stage": "高中",
"chapter": "平面向量",
"section": "基本概念",
"name": "基本概念",
"latex": "$\\vec a·\\vec b=0$"
},
{
"stage": "高中",
"chapter": "平面向量的线性运算",
"section": "减法运算及其几何意义",
"name": "几何意义",
"latex": "$\\vec{OA}=a,\\vec{OB}=b$ $\\vec{BA}=a-b$"
},
{
"stage": "高中",
"chapter": "平面向量的线性运算",
"section": "减法运算及其几何意义",
"name": "减法运算及其几何意义",
"latex": "$\\vec {AB}-\\vec{AC}=\\vec{CB}$"
},
{
"stage": "高中",
"chapter": "基本定理",
"section": "三点共线",
"name": "三点共线",
"latex": "$\\vec{OA}=λ\\vec{OB}+μ\\vec{OC}$"
},
{
"stage": "高中",
"chapter": "基本定理",
"section": "定比分点定理",
"name": "> 比如AC",
"latex": "$\\vec{OC}=\\frac 1 4 \\vec{OA}+\\frac 3 4 \\vec{OB}$"
},
{
"stage": "高中",
"chapter": "平面向量",
"section": "向量的夹角",
"name": "向量的夹角",
"latex": "$\\vec{OA}=a,\\vec{OB}=b$"
},
{
"stage": "高中",
"chapter": "平面向量",
"section": "坐标运算",
"name": "坐标运算",
"latex": "$a=(x_1,y_1), b=(x_2,y_2)$"
},
{
"stage": "高中",
"chapter": "平面向量",
"section": "坐标运算",
"name": "坐标运算",
"latex": "$a+b=(x_1+x_2,y_1+y_2), a-b=(x_1-x_2,y_1-y_2)$"
},
{
"stage": "高中",
"chapter": "平面向量",
"section": "坐标运算",
"name": "坐标运算",
"latex": "$λa=(λx_1,λy_1)$"
},
{
"stage": "高中",
"chapter": "平面向量",
"section": "坐标运算",
"name": "坐标运算",
"latex": "$A(x_1,y_1), B(x_2,y_2)$ $\\vec{AB}=(x_2-x_1,y_2-y_1)$"
},
{
"stage": "高中",
"chapter": "平面向量",
"section": "坐标运算",
"name": "坐标运算",
"latex": "$a//b \\Leftrightarrow x_1y_2-x_2y_1=0$"
},
{
"stage": "高中",
"chapter": "平面向量的数量积（或内积，点乘）（外积是叉乘）",
"section": "几何意义",
"name": "几何意义",
"latex": "$\\frac{a·b}{|a|}$"
},
{
"stage": "高中",
"chapter": "平面向量的数量积（或内积，点乘）（外积是叉乘）",
"section": "平面向量数量积的性质",
"name": "平面向量数量积的性质",
"latex": "$a⊥b \\Longleftrightarrow a·b=0$"
},
{
"stage": "高中",
"chapter": "平面向量的数量积（或内积，点乘）（外积是叉乘）",
"section": "平面向量数量积的性质",
"name": "平面向量数量积的性质",
"latex": "$cosθ=\\frac{a·b}{|a||b|}$"
},
{
"stage": "高中",
"chapter": "平面向量的数量积（或内积，点乘）（外积是叉乘）",
"section": "平面向量数量积的性质",
"name": "平面向量数量积的性质",
"latex": "$|\\vec a|^2=\\vec a·\\vec a$"
},
{
"stage": "高中",
"chapter": "平面向量数量积的坐标表示及运算",
"section": "坐标表示",
"name": "坐标表示",
"latex": "$a=(x_1,y_1), b=(x_2,y_2)$ $a·b=x_1x_2+y_1y_2$"
},
{
"stage": "高中",
"chapter": "平面向量数量积的坐标表示及运算",
"section": "向量模的坐标表示",
"name": "向量模的坐标表示",
"latex": "$|a|^2=x^2+y^2$ $|a|=\\sqrt{x^2+y^2}$"
},
{
"stage": "高中",
"chapter": "平面向量数量积的坐标表示及运算",
"section": "两向量垂直的条件",
"name": "两向量垂直的条件",
"latex": "$a=(x_1,y_1), b=(x_2,y_2)$ $a⊥b \\Leftrightarrow x_1x_2+y_1y_2=0$"
},
{
"stage": "高中",
"chapter": "平面向量数量积的坐标表示及运算",
"section": "夹角的坐标表示",
"name": "夹角的坐标表示",
"latex": "$a=(x_1,y_1),b=(x_2,y_2)$"
},
{
"stage": "高中",
"chapter": "平面向量数量积的坐标表示及运算",
"section": "夹角的坐标表示",
"name": "夹角的坐标表示",
"latex": "$cosθ=\\frac{a·b}{|a||b|}=\\frac{x_1x_2+y_1y_2}{\\sqrt{x_1^2+y_1^2}·\\sqrt{x_2^2+y_2^2}}(0≤θ≤π)$"
},
{
"stage": "高中",
"chapter": "空间向量与立体几何",
"section": "坐标运算",
"name": "向量（等号后跟坐标）",
"latex": "$\\vec a=(x,y,z)$"
},
{
"stage": "高中",
"chapter": "空间向量与立体几何",
"section": "坐标运算",
"name": "坐标运算",
"latex": "$λ\\vec a=(λx,λy,λz)$"
},
{
"stage": "高中",
"chapter": "空间向量与立体几何",
"section": "坐标运算",
"name": "坐标运算",
"latex": "$\\vec a \\vec b=x_1x_2+y_1y_2+z_1z_2$"
},
{
"stage": "高中",
"chapter": "空间向量与立体几何",
"section": "坐标运算",
"name": "垂直",
"latex": "$\\vec a ·\\vec b=0$"
},
{
"stage": "高中",
"chapter": "空间向量与立体几何",
"section": "坐标运算",
"name": "坐标运算",
"latex": "$|\\vec a|=\\sqrt{x^2+y^2+z^2}$"
},
{
"stage": "高中",
"chapter": "空间向量与立体几何",
"section": "坐标运算",
"name": "坐标运算",
"latex": "$cos<\\vec a,\\vec b>=\\frac{\\vec a·\\vec b}{|\\vec a||\\vec b|}$"
},
{
"stage": "高中",
"chapter": "共线与共面向量",
"section": "共线",
"name": "共线",
"latex": "$\\vec{AB}=α$ $\\vec{OP}=\\vec{OA}+t\\vec{AB}$"
},
{
"stage": "高中",
"chapter": "共线与共面向量",
"section": "共面",
"name": "平面向量定理",
"latex": "$p=xa+yb$"
},
{
"stage": "高中",
"chapter": "共线与共面向量",
"section": "共面",
"name": "共面",
"latex": "$\\vec{AP}=x\\vec{AB}+y\\vec{AC}$"
},
{
"stage": "高中",
"chapter": "共线与共面向量",
"section": "共面",
"name": "共面",
"latex": "$\\vec{OP}=\\vec{OA}+x\\vec{AB}+y\\vec{AC}$"
},
{
"stage": "高中",
"chapter": "空间向量与立体几何",
"section": "空间向量的数量积运算",
"name": "空间向量的数量积运算",
"latex": "$\\vec{OA}=a,\\vec{OB}=b$"
},
{
"stage": "高中",
"chapter": "空间向量与立体几何",
"section": "空间向量的数量积运算",
"name": "空间向量的数量积运算",
"latex": "$<a,b>=\\frac π 2$"
},
{
"stage": "高中",
"chapter": "空间向量的数量积运算",
"section": "空间向量数量积",
"name": "空间向量数量积",
"latex": "$a·a=|a||a|cos<a,a>=|a|^2$"
},
{
"stage": "高中",
"chapter": "空间向量的数量积运算",
"section": "正交分解及坐标表示",
"name": "空间向量分解定理",
"latex": "$\\vec a,\\vec b, \\vec c$ $\\vec p=x\\vec a+y\\vec b+z\\vec c$"
},
{
"stage": "高中",
"chapter": "空间向量的数量积运算",
"section": "运算的坐标表示",
"name": "运算的坐标表示",
"latex": "$a=(a_1,a_2,a_3)，b=(b_1,b_2,b_3)$"
},
{
"stage": "高中",
"chapter": "空间向量的数量积运算",
"section": "运算的坐标表示",
"name": "运算的坐标表示",
"latex": "$a·b=a_1b_1+a_2b_2+a_3b_3$"
},
{
"stage": "高中",
"chapter": "空间向量的数量积运算",
"section": "运算的坐标表示",
"name": "运算的坐标表示",
"latex": "$a//b<=>a=λb<=>a_1=λb_1，a_2=λb_2,a_3=λb_3(λ∈R)$"
},
{
"stage": "高中",
"chapter": "空间向量的数量积运算",
"section": "运算的坐标表示",
"name": "运算的坐标表示",
"latex": "$a⊥b<=>a·b=0<=>a_1b_1+a_2b_2+a_3b_3=0$"
},
{
"stage": "高中",
"chapter": "空间向量的数量积运算",
"section": "运算的坐标表示",
"name": "运算的坐标表示",
"latex": "$|a|=\\sqrt{a·a}=\\sqrt{a_1^2+a_2^2+a_3^2}$"
},
{
"stage": "高中",
"chapter": "空间向量的数量积运算",
"section": "运算的坐标表示",
"name": "运算的坐标表示",
"latex": "$cos<a,b>=\\frac{a·b}{|a||b|}=\\frac{a_1b_1+a_2b_2+a_3b_3}{\\sqrt{a_1^2+a_2^2+a_3^2}\\sqrt{b_1^2+b_2^2+b_3^2}}$"
},
{
"stage": "高中",
"chapter": "空间向量的数量积运算",
"section": "运算的坐标表示",
"name": "运算的坐标表示",
"latex": "$A(a_1,b_1,c_1)，B(a_2,b_2,c_2)$ $d_{AB}=|\\vec{AB}|=\\sqrt{(a_2-a_1)^2+(b_2-b_1)^2+(c_2-c_1)^2}$"
},
{
"stage": "高中",
"chapter": "立体几何中的向量方法",
"section": "向量法求角度",
"name": "异面直线所成角",
"latex": "$cosφ=|cos<\\vec{AC}, \\vec{BD}>|=\\frac{|\\vec{AC}·\\vec{BD}|}{|\\vec{AC}||\\vec{BD}|}$ $φ∈[0,\\frac π 2]$"
},
{
"stage": "高中",
"chapter": "立体几何中的向量方法",
"section": "向量法求角度",
"name": "向量法求角度",
"latex": "$sinθ=|cosφ|=\\frac{|直线方向向量·平面法向量|}{|直线方向向量|·|平面法向量|}$"
},
{
"stage": "高中",
"chapter": "数列",
"section": "等差数列",
"name": "等差中项",
"latex": "$A=\\frac{a+b}{2}$"
},
{
"stage": "高中",
"chapter": "等差数列",
"section": "判断数列是等差数列的方法",
"name": "* 定义法",
"latex": "$a_{n+1}-a_n=d(常数)$"
},
{
"stage": "高中",
"chapter": "等差数列",
"section": "判断数列是等差数列的方法",
"name": "* 递推法（等差中项法）",
"latex": "$2a_{n+1}=a_n+a_{n+2}$"
},
{
"stage": "高中",
"chapter": "等差数列",
"section": "判断数列是等差数列的方法",
"name": "* 通项法",
"latex": "$a_n=pn+q(q,q为常数)$"
},
{
"stage": "高中",
"chapter": "等差数列",
"section": "判断数列是等差数列的方法",
"name": "* 前n项和公式法",
"latex": "$S_n=An^2+Bn(A,B为常数)$"
},
{
"stage": "高中",
"chapter": "数列",
"section": "等差数列的前n项和",
"name": "等差数列的前n项和",
"latex": "$S_n=\\frac{n(a_1+a_n)}{2}=na_1+\\frac{n(n-1)}{2}d$"
},
{
"stage": "高中",
"chapter": "数列",
"section": "等差数列的前n项和",
"name": "等差数列的前n项和",
"latex": "$=\\frac d 2n^2+(a-\\frac d 2)n$"
},
{
"stage": "高中",
"chapter": "等差数列的前n项和",
"section": "等差数列前n项和公式的性质",
"name": "等差数列前n项和公式的性质",
"latex": "$S_k,S_{2k-k},S_{3k-2k}$ $=k^2d$"
},
{
"stage": "高中",
"chapter": "等差数列的前n项和",
"section": "等差数列前n项和公式的性质",
"name": "* 下标奇数可化简",
"latex": "$S_{2n-1}=(2n-1)a_n$"
},
{
"stage": "高中",
"chapter": "等差数列的前n项和",
"section": "等差数列前n项和公式的性质",
"name": "* 项数2n",
"latex": "$\\frac{a_k}{a_{k+1}}$"
},
{
"stage": "高中",
"chapter": "等差数列的前n项和",
"section": "等差数列前n项和公式的性质",
"name": "等差数列前n项和公式的性质",
"latex": "$a_1>0，d<0，S_n$"
},
{
"stage": "高中",
"chapter": "等差数列的前n项和",
"section": "等差数列前n项和公式的性质",
"name": "等差数列前n项和公式的性质",
"latex": "$a_1<0，d>0，S_n$"
},
{
"stage": "高中",
"chapter": "数列",
"section": "等比数列",
"name": "等比数列",
"latex": "$b^2=ac$"
},
{
"stage": "高中",
"chapter": "等比数列",
"section": "等比中项",
"name": "等比中项",
"latex": "$G^2=ab$"
},
{
"stage": "高中",
"chapter": "等比数列",
"section": "判断数列是等比数列的方法",
"name": "* 定义法",
"latex": "$\\frac{a_{n+1}}{a_n}=q$"
},
{
"stage": "高中",
"chapter": "等比数列",
"section": "判断数列是等比数列的方法",
"name": "* 递推法（等比中项法）",
"latex": "$a_{n+1}^2=a_n·a_{n+2}（a_n·a_{n+1}·a_{n+2}≠0，n∈N^*）$"
},
{
"stage": "高中",
"chapter": "等比数列",
"section": "判断数列是等比数列的方法",
"name": "* 通项法",
"latex": "$a_n=cq^n$"
},
{
"stage": "高中",
"chapter": "等比数列",
"section": "等比数列的前n项和",
"name": "等比数列的前n项和",
"latex": "$S_n=na_1(q=1)$"
},
{
"stage": "高中",
"chapter": "等比数列",
"section": "等比数列的前n项和",
"name": "等比数列的前n项和",
"latex": "$S_n=\\frac{a_1(1-q^n)}{1-q}(q≠1)$"
},
{
"stage": "高中",
"chapter": "等比数列",
"section": "等比数列的前n项和",
"name": "等比数列的前n项和",
"latex": "$S_n=a_1(1+q+q^2+…+q^{n-1})$"
},
{
"stage": "高中",
"chapter": "等比数列",
"section": "等比数列的前n项和",
"name": "等比数列的前n项和",
"latex": "$qS_n=a_1(q+q^2+…+q^{n-1}+q^n)$"
},
{
"stage": "高中",
"chapter": "等比数列",
"section": "等比数列的前n项和",
"name": "等比数列的前n项和",
"latex": "$(1-q)S_n=a_1(1-q^n)$"
},
{
"stage": "高中",
"chapter": "等比数列",
"section": "等比数列的前n项和",
"name": "等比数列的前n项和",
"latex": "$S_n=a_1\\frac{(1-q^n)}{1-q}$"
},
{
"stage": "高中",
"chapter": "等比数列",
"section": "等比数列的前n项和",
"name": "等比数列的前n项和",
"latex": "$S_n=na_1$"
},
{
"stage": "高中",
"chapter": "等比数列",
"section": "公式性质",
"name": "公式性质",
"latex": "$S_n=a^n-1(a≠0,a≠1),则{a_n}$"
},
{
"stage": "高中",
"chapter": "等比数列",
"section": "公式性质",
"name": "公式性质",
"latex": "$a_n$ $S_{n+m}=S_n+q^n·S_m$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "递推数列",
"name": "递推数列",
"latex": "$S_n=f(a_n)$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "递推数列",
"name": "递推数列",
"latex": "$S_{n-1}=f(a_{n-1})$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "递推数列",
"name": "递推数列",
"latex": "$a_n=f(a_n)-f(a_{n-1})$"
},
{
"stage": "高中",
"chapter": "递推数列",
"section": "$a_{n+1}=λa_n+f(n)$",
"name": "* 待定系数法",
"latex": "$a_{n+1}+t=λ(a_n+t)=a_{n+1}+λa_n+tλ)$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "由前n项和求通项",
"name": "由前n项和求通项",
"latex": "$S_n-S_{n-1}=a_n$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "错位相减法",
"name": "错位相减法",
"latex": "$a_n=n*2^n$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "裂项相消法",
"name": "裂项相消法",
"latex": "$\\frac{1}{n(n+1)}=\\frac 1 n-\\frac{1}{n+1}$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "裂项相消法",
"name": "裂项相消法",
"latex": "$\\frac{1}{n(n+2)}=\\frac 1 2(\\frac 1 n-\\frac{1}{n+2})$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "裂项相消法",
"name": "裂项相消法",
"latex": "$a_{n+1}=a_n+d$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "裂项相消法",
"name": "裂项相消法",
"latex": "$\\frac{1}{a_n*a_{n+1}}=\\frac 1 d(\\frac {1}{a_n}-\\frac{1}{a_{n+1}})$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "裂项相消法",
"name": "裂项相消法",
"latex": "$\\frac{a_{n+1}}{S_nS_{n+1}}=\\frac{1}{S_n}-\\frac{1}{S_{n+1}}$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "裂项相消法",
"name": "裂项相消法",
"latex": "$\\frac{1}{\\sqrt{n}+\\sqrt{n+p}}=\\frac 1 p(\\sqrt{n+p}-\\sqrt n)$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "裂项相消法",
"name": "裂项相消法",
"latex": "$\\frac{2^n}{(2^n-1)(2^{n+1}-1)}=\\frac{1}{2^n-1}-\\frac{1}{2^{n+1}-1}$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "裂项相消法",
"name": "裂项相消法",
"latex": "$\\frac{n+2}{n(n+1)2^{n+1}}=\\frac{1}{n*2^n}-\\frac{1}{(n+1)2^{n+1}}$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "裂项相消法",
"name": "裂项相消法",
"latex": "$a_n=\\frac{(2n)^2}{(2n-1)(2n+1)}=\\frac{4n^2-1+1}{4n^2-1}=1+\\frac{1}{(2n-1)(2n+1)}$"
},
{
"stage": "高中",
"chapter": "题型",
"section": "裂项相消法",
"name": "裂项相消法",
"latex": "$a_n=\\frac{n^2+2n+2}{n(n+1)2^{n+1}}=\\frac{n^2+n+n+2}{(n^2+n)2^{n+1}}=\\frac{1}{2^{n+1}}+\\frac{1}{n*2^n}-\\frac{1}{(n+1)2^{n+1}}$"
},
{
"stage": "高中",
"chapter": "不等关系与不等式",
"section": "实数大小比较",
"name": "实数大小比较",
"latex": "$\\frac a {b}>1 \\Rightarrow a>b$"
},
{
"stage": "高中",
"chapter": "不等关系与不等式",
"section": "实数大小比较",
"name": "实数大小比较",
"latex": "$\\frac a b = 1 \\Rightarrow a=b$"
},
{
"stage": "高中",
"chapter": "不等关系与不等式",
"section": "实数大小比较",
"name": "实数大小比较",
"latex": "$\\frac a b < 1 \\Rightarrow a<b$"
},
{
"stage": "高中",
"chapter": "不等关系与不等式",
"section": "不等式的性质",
"name": "不等式的性质",
"latex": "$a>b \\Leftrightarrow b<a$"
},
{
"stage": "高中",
"chapter": "不等关系与不等式",
"section": "不等式的性质",
"name": "不等式的性质",
"latex": "$a>b,b>c \\Leftrightarrow a>c$"
},
{
"stage": "高中",
"chapter": "不等关系与不等式",
"section": "不等式的性质",
"name": "不等式的性质",
"latex": "$a^n>b^n(n ∈ N, n≥1)$"
},
{
"stage": "高中",
"chapter": "不等关系与不等式",
"section": "不等式的性质",
"name": "不等式的性质",
"latex": "$\\sqrt[n]{a}>\\sqrt[n]{b}(n \\in N, n ≥ 2)$"
},
{
"stage": "高中",
"chapter": "不等关系与不等式",
"section": "不等式的性质",
"name": "* 同号变号",
"latex": "$\\frac 1 a<\\frac 1 b$"
},
{
"stage": "高中",
"chapter": "不等关系与不等式",
"section": "不等式的性质",
"name": "* 异号不变号",
"latex": "$\\frac 1 a>\\frac 1 b$"
},
{
"stage": "高中",
"chapter": "一元二次不等式及其解法",
"section": "解法",
"name": "解法",
"latex": "$△=b^2-4ac$"
},
{
"stage": "高中",
"chapter": "一元二次不等式及其解法",
"section": "解法",
"name": "解法",
"latex": "$ax^2+bx+c=0(a>0)$"
},
{
"stage": "高中",
"chapter": "一元二次不等式及其解法",
"section": "解法",
"name": "解法",
"latex": "$ax^2+bx+c<0(a>0)$ $\\{x_1<x<x_2\\}(x_1<x_2)$"
},
{
"stage": "高中",
"chapter": "一元二次不等式及其解法",
"section": "解法",
"name": "解法",
"latex": "$∀x∈[m,n]，有a≥f(x)恒成立↔a≥f(x)_{max}$"
},
{
"stage": "高中",
"chapter": "一元二次不等式及其解法",
"section": "解法",
"name": "解法",
"latex": "$∀x∈[m,n]，有a≤f(x)恒成立↔a≤f(x)_{min}$"
},
{
"stage": "高中",
"chapter": "一元二次不等式的应用",
"section": "分式不等式",
"name": "分式不等式",
"latex": "$\\frac{f(x)}{g(x)}≥0<=>f(x)·g(x)≥0，且g(x)≠0 $"
},
{
"stage": "高中",
"chapter": "一元二次不等式的应用",
"section": "高次不等式（一元n次不等式）解法",
"name": "> 题目",
"latex": "$x(x+1)(x-2)(x^3-1)>0$"
},
{
"stage": "高中",
"chapter": "一元二次不等式的应用",
"section": "高次不等式（一元n次不等式）解法",
"name": "> 正确处理",
"latex": "$x^2+x+1>0$"
},
{
"stage": "高中",
"chapter": "二元一次不等式与简单的线性规划问题",
"section": "求解非线性目标函数问题",
"name": "求解非线性目标函数问题",
"latex": "$z=\\sqrt{x^2+y^2}$"
},
{
"stage": "高中",
"chapter": "二元一次不等式与简单的线性规划问题",
"section": "求解非线性目标函数问题",
"name": "求解非线性目标函数问题",
"latex": "$z=\\sqrt{(x-a)^2+(y-b)^2}$"
},
{
"stage": "高中",
"chapter": "二元一次不等式与简单的线性规划问题",
"section": "求解非线性目标函数问题",
"name": "求解非线性目标函数问题",
"latex": "$z=\\frac y x$"
},
{
"stage": "高中",
"chapter": "二元一次不等式与简单的线性规划问题",
"section": "求解非线性目标函数问题",
"name": "求解非线性目标函数问题",
"latex": "$z=\\frac{y-b}{x-a}$"
},
{
"stage": "高中",
"chapter": "二元一次不等式与简单的线性规划问题",
"section": "求解非线性目标函数问题",
"name": "求解非线性目标函数问题",
"latex": "$z=(x-a)^2+(y-b)^2$"
},
{
"stage": "高中",
"chapter": "基本/均值不等式",
"section": "基本不等式的变形",
"name": "基本不等式的变形",
"latex": "$\\frac{2}{\\frac 1 a+\\frac 1 b}≤\\sqrt{ab}≤\\frac{a+b}2≤\\sqrt{\\frac{a^2+b^2}2}(a>0,b>0)$"
},
{
"stage": "高中",
"chapter": "基本/均值不等式",
"section": "基本不等式的变形",
"name": "基本不等式的变形",
"latex": "$4ab≤(a+b)^2≤2(a^2+b^2)，即ab≤(\\frac{a+b}2)^2≤\\frac{a^2+b^2}2$"
},
{
"stage": "高中",
"chapter": "基本/均值不等式",
"section": "基本不等式的变形",
"name": "基本不等式的变形",
"latex": "$\\frac b a+\\frac a b≥2(ab>0)$"
},
{
"stage": "高中",
"chapter": "基本/均值不等式",
"section": "基本不等式的变形",
"name": "基本不等式的变形",
"latex": "$a^3+b^3+c^3≥3abc$"
},
{
"stage": "高中",
"chapter": "基本/均值不等式",
"section": "基本不等式的变形",
"name": "基本不等式的变形",
"latex": "$a+b+c≥3\\sqrt[3]{abc}$"
},
{
"stage": "高中",
"chapter": "不等关系与不等式",
"section": "绝对值不等式",
"name": "绝对值不等式",
"latex": "$|f(x)|<|g(x)|→f(x)^2<g(x)^2$"
},
{
"stage": "高中",
"chapter": "不等关系与不等式",
"section": "无理不等式：有理化",
"name": "无理不等式：有理化",
"latex": "$\\sqrt{f(x)}>\\sqrt{g(x)}↔f(x)>g(x);g(x)≥0;g(x)≥0$"
},
{
"stage": "高中",
"chapter": "不等关系与不等式",
"section": "无理不等式：有理化",
"name": "无理不等式：有理化",
"latex": "$\\sqrt{f(x)}>g(x)$"
},
{
"stage": "高中",
"chapter": "不等关系与不等式",
"section": "无理不等式：有理化",
"name": "无理不等式：有理化",
"latex": "$f(x)>g(x)^2$"
},
{
"stage": "高中",
"chapter": "不等关系与不等式",
"section": "无理不等式：有理化",
"name": "无理不等式：有理化",
"latex": "$\\sqrt{f(x)}<g(x)$"
},
{
"stage": "高中",
"chapter": "不等关系与不等式",
"section": "无理不等式：有理化",
"name": "无理不等式：有理化",
"latex": "$f(x)<g(x)^2$"
},
{
"stage": "高中",
"chapter": "充分条件与必要条件",
"section": "充要条件的证明",
"name": "充要条件的证明",
"latex": "$m∈{\\frac 1 2, -\\frac 1 3}$"
},
{
"stage": "高中",
"chapter": "充分条件与必要条件",
"section": "充要条件的证明",
"name": "充要条件的证明",
"latex": "$m∈{-\\frac 1 2, 0, \\frac 1 3}$"
},
{
"stage": "高中",
"chapter": "充分条件与必要条件",
"section": "充要条件的证明",
"name": "充要条件的证明",
"latex": "$m∈{0, \\frac 1 3}$"
},
{
"stage": "高中",
"chapter": "充分条件与必要条件",
"section": "充要条件的证明",
"name": "充要条件的证明",
"latex": "$x=-\\frac 1 m$"
},
{
"stage": "高中",
"chapter": "圆锥曲线与方程",
"section": "椭圆",
"name": "椭圆",
"latex": "$|MF_1|+|MF_2|=2a(2a>|F_1F_2|)$"
},
{
"stage": "高中",
"chapter": "椭圆",
"section": "椭圆的标准方程及求法",
"name": "椭圆的标准方程及求法",
"latex": "$a^2=b^2+c^2$"
},
{
"stage": "高中",
"chapter": "椭圆",
"section": "椭圆的标准方程及求法",
"name": "椭圆的标准方程及求法",
"latex": "$\\frac{x^2}{a^2}+\\frac{y^2}{b^2}=1(a>b>0)$ $F_1(-c,0), F_2(c,0)$"
},
{
"stage": "高中",
"chapter": "椭圆",
"section": "椭圆的标准方程及求法",
"name": "椭圆的标准方程及求法",
"latex": "$\\frac{y^2}{a^2}+\\frac{x^2}{b^2}=1(a>b>0)$ $F_1(0,-c), F_2(0,c)$"
},
{
"stage": "高中",
"chapter": "椭圆的标准方程及求法",
"section": "椭圆标准方程的求法",
"name": "椭圆标准方程的求法",
"latex": "$Ax^2+By^2=1(A,B>0,A \\neq B)$ $\\frac{x^2}{m^2}+\\frac{y^2}{n^2}=1(m^2 \\neq n^2)$"
},
{
"stage": "高中",
"chapter": "椭圆",
"section": "椭圆的简单几何性质",
"name": "椭圆的简单几何性质",
"latex": "$\\frac{x^2}{a^2}+\\frac{y^2}{b^2}=1(a>b>0)$ $\\frac{y^2}{a^2}+\\frac{x^2}{b^2}=1(a>b>0)$"
},
{
"stage": "高中",
"chapter": "椭圆",
"section": "椭圆的简单几何性质",
"name": "椭圆的简单几何性质",
"latex": "$c^2=a^2-b^2$"
},
{
"stage": "高中",
"chapter": "椭圆",
"section": "椭圆的简单几何性质",
"name": "椭圆的简单几何性质",
"latex": "$e=\\frac c a=\\sqrt{1-\\frac{b^2}{a^2}}$"
},
{
"stage": "高中",
"chapter": "椭圆",
"section": "椭圆的简单几何性质",
"name": "> 准线",
"latex": "$x=±\\frac{a^2}c$"
},
{
"stage": "高中",
"chapter": "椭圆",
"section": "焦点三角形的相关结论",
"name": "焦点三角形的相关结论",
"latex": "$|PF_1|+|PF_2|=2a$"
},
{
"stage": "高中",
"chapter": "椭圆",
"section": "焦点三角形的相关结论",
"name": "焦点三角形的相关结论",
"latex": "$4c^2=|PF_1|^2+|PF_2|^2-2|PF_1||PF_2|·cosθ$"
},
{
"stage": "高中",
"chapter": "椭圆",
"section": "焦点三角形的相关结论",
"name": "焦点三角形的相关结论",
"latex": "$S_{△PF_1F_2}=\\frac 1 2 |PF_1|·|PF_2|·sinθ=b^2tan\\frac θ 2$"
},
{
"stage": "高中",
"chapter": "椭圆",
"section": "焦点三角形的相关结论",
"name": "* 三角形面积海伦公式",
"latex": "$\\sqrt{p(p-a)(p-b)(p-c)}$"
},
{
"stage": "高中",
"chapter": "椭圆",
"section": "椭圆常见最值范围",
"name": "椭圆常见最值范围",
"latex": "$cos∠F_1PF_2$ $1-\\frac{2c^2}{a^2}$"
},
{
"stage": "高中",
"chapter": "椭圆",
"section": "椭圆常见最值范围",
"name": "椭圆常见最值范围",
"latex": "$\\frac{x^2}{9}+\\frac{y^2}{4}$ $(x_0,y_0)$"
},
{
"stage": "高中",
"chapter": "椭圆",
"section": "椭圆常见最值范围",
"name": "椭圆常见最值范围",
"latex": "$d=\\frac{|x_0+2y_0-6|}{\\sqrt{5}}$"
},
{
"stage": "高中",
"chapter": "椭圆",
"section": "椭圆常见最值范围",
"name": "椭圆常见最值范围",
"latex": "$d=\\frac{|3cosθ+4sinθ-6|}{\\sqrt{5}}$"
},
{
"stage": "高中",
"chapter": "圆锥曲线与方程",
"section": "双曲线",
"name": "双曲线",
"latex": "$|MF_1|-|MF_2|=2a(2a<|F_1F_2|)$"
},
{
"stage": "高中",
"chapter": "双曲线",
"section": "双曲线的标准方程",
"name": "双曲线的标准方程",
"latex": "$c^2=a^2+b^2$"
},
{
"stage": "高中",
"chapter": "双曲线",
"section": "双曲线的标准方程",
"name": "双曲线的标准方程",
"latex": "$\\frac{x^2}{a^2}-\\frac{y^2}{b^2}=1(a>0,b>0)$ $F_1(-c,0), F_2(c,0)$"
},
{
"stage": "高中",
"chapter": "双曲线",
"section": "双曲线的标准方程",
"name": "双曲线的标准方程",
"latex": "$\\frac{y^2}{a^2}-\\frac{x^2}{b^2}=1(a>0,b>0)$ $F_1(0,-c), F_2(0,c)$"
},
{
"stage": "高中",
"chapter": "双曲线",
"section": "双曲线的简单几何性质",
"name": "双曲线的简单几何性质",
"latex": "$\\frac{x^2}{a^2}-\\frac{y^2}{b^2}=1(a>0,b>0)$ $\\frac{y^2}{a^2}-\\frac{x^2}{b^2}=1(a>0,b>0)$"
},
{
"stage": "高中",
"chapter": "双曲线",
"section": "双曲线的简单几何性质",
"name": "双曲线的简单几何性质",
"latex": "$y=±\\frac b a x$ $y=±\\frac a b x$"
},
{
"stage": "高中",
"chapter": "双曲线",
"section": "双曲线的简单几何性质",
"name": "离心率",
"latex": "$e=\\frac c a$"
},
{
"stage": "高中",
"chapter": "双曲线",
"section": "双曲线的简单几何性质",
"name": "双曲线的简单几何性质",
"latex": "$c^2=a^2+b^2$"
},
{
"stage": "高中",
"chapter": "双曲线",
"section": "等轴双曲线",
"name": "等轴双曲线",
"latex": "$x^2-y^2=a^2，或y^2-x^2=a^2$ $e=\\sqrt 2$"
},
{
"stage": "高中",
"chapter": "双曲线",
"section": "渐近线斜率与e的关系",
"name": "渐近线斜率与e的关系",
"latex": "$k=±\\frac b a=±\\frac{\\sqrt{c^2-a^2}}{a}=±\\sqrt{\\frac{c^2}{a^2}-1}=±\\sqrt{e^2}-1$"
},
{
"stage": "高中",
"chapter": "双曲线",
"section": "渐近线斜率与e的关系",
"name": "x轴",
"latex": "$e^2=1+k^2$"
},
{
"stage": "高中",
"chapter": "双曲线",
"section": "渐近线斜率与e的关系",
"name": "y轴",
"latex": "$e^2=1+\\frac{1}{k^2}$"
},
{
"stage": "高中",
"chapter": "抛物线",
"section": "抛物线焦点弦的性质",
"name": "抛物线焦点弦的性质",
"latex": "$y^2=2px(p>0)$ $A(x_1,y_2),B(x_2,y_2)$"
},
{
"stage": "高中",
"chapter": "抛物线",
"section": "抛物线焦点弦的性质",
"name": "抛物线焦点弦的性质",
"latex": "$x_1x_2=\\frac{p^2}4, y_1y_2=-p^2$"
},
{
"stage": "高中",
"chapter": "抛物线",
"section": "抛物线焦点弦的性质",
"name": "抛物线焦点弦的性质",
"latex": "$|AB|=x_1+x_2+p=\\frac{2p}{sin^2α}(α为直线AB与抛物线对称轴的夹角)$"
},
{
"stage": "高中",
"chapter": "抛物线",
"section": "抛物线焦点弦的性质",
"name": "抛物线焦点弦的性质",
"latex": "$\\frac{1}{|FA|}+\\frac{1}{|FB|}=\\frac 2 p$"
},
{
"stage": "高中",
"chapter": "二级结论",
"section": "椭圆/双曲线通径长度",
"name": "椭圆/双曲线通径长度",
"latex": "$l=\\frac{2b^2}{a}$"
},
{
"stage": "高中",
"chapter": "二级结论",
"section": "过焦点的弦长",
"name": "过焦点的弦长",
"latex": "$|P_1P_2|=\\sqrt{1+k^2}|x_1-x_2|=\\sqrt{1+k^2}\\sqrt{(x_1+x_2)^2-4x_1x_2}$"
},
{
"stage": "高中",
"chapter": "二级结论",
"section": "过焦点的弦长",
"name": "过焦点的弦长",
"latex": "$|P_1P_2|=\\sqrt{1+\\frac{1}{k^2}}|y_1-y_2|=\\sqrt{1+\\frac{1}{k^2}}\\sqrt{(y_1+y_2)^2-4y_1y_2}$"
},
{
"stage": "高中",
"chapter": "二级结论",
"section": "过焦点的弦长",
"name": "切线斜率",
"latex": "$k=\\frac{b^2}{a^2}\\frac{x_0}{y_0}$"
},
{
"stage": "高中",
"chapter": "焦半径",
"section": "椭圆",
"name": "椭圆",
"latex": "$r1=a+ex_0$"
},
{
"stage": "高中",
"chapter": "焦半径",
"section": "椭圆",
"name": "椭圆",
"latex": "$r2=a-ex_0$"
},
{
"stage": "高中",
"chapter": "焦半径",
"section": "双曲线",
"name": "双曲线",
"latex": "$r1=|a+ex_0|$"
},
{
"stage": "高中",
"chapter": "焦半径",
"section": "双曲线",
"name": "双曲线",
"latex": "$r2=|a-ex_0|$"
},
{
"stage": "高中",
"chapter": "焦半径",
"section": "抛物线",
"name": "焦半径",
"latex": "$MF=x_0+\\frac p 2$"
},
{
"stage": "高中",
"chapter": "二级结论",
"section": "椭圆/双曲线中点弦",
"name": "椭圆/双曲线中点弦",
"latex": "$k_{AB}k_{OM}=-\\frac{b^2}{a^2}$"
},
{
"stage": "高中",
"chapter": "二级结论",
"section": "椭圆/双曲线中点弦",
"name": "双曲线时",
"latex": "$k=\\frac{b^2}{a^2}$"
},
{
"stage": "高中",
"chapter": "二级结论",
"section": "椭圆/双曲线硬解定理",
"name": "椭圆/双曲线硬解定理",
"latex": "$\\frac{x^2}{m}+\\frac{y^2}{n}=1$"
},
{
"stage": "高中",
"chapter": "二级结论",
"section": "椭圆/双曲线硬解定理",
"name": "椭圆/双曲线硬解定理",
"latex": "$x_1+x_2=\\frac{-2ACm}{A^2m+B^2n}$"
},
{
"stage": "高中",
"chapter": "二级结论",
"section": "椭圆/双曲线硬解定理",
"name": "椭圆/双曲线硬解定理",
"latex": "$x_1x_2=\\frac{m(C^2-B^2n)}{A^2m+B^2n}$"
},
{
"stage": "高中",
"chapter": "二级结论",
"section": "椭圆/双曲线硬解定理",
"name": "椭圆/双曲线硬解定理",
"latex": "$\\frac{2\\sqrt{mn(A^2+B^2)(A^2m+B^2n-C^2)}}{|A^2m+B^2n|}$"
},
{
"stage": "高中",
"chapter": "二级结论",
"section": "通用",
"name": "通用",
"latex": "$\\frac{1}{|AF|}+\\frac{1}{|BF|}=\\frac 4 L$"
},
{
"stage": "高中",
"chapter": "二级结论",
"section": "通用",
"name": "* 椭圆/双曲线",
"latex": "$\\frac{2b^2}{a}$"
},
{
"stage": "高中",
"chapter": "二级结论",
"section": "通用",
"name": "通用",
"latex": "$\\frac{|AF|}{|BF|}=λ$"
},
{
"stage": "高中",
"chapter": "二级结论",
"section": "通用",
"name": "* 焦点在x轴上",
"latex": "$|ecosθ|=|\\frac{λ-1}{λ+1}|，e=\\sqrt{1+k^2}|\\frac{λ-1}{λ+1}|$"
},
{
"stage": "高中",
"chapter": "二级结论",
"section": "通用",
"name": "* 焦点在y轴上",
"latex": "$esinθ=|\\frac{λ-1}{λ+1}|，e=\\sqrt{1+\\frac{1}{k^2}}|\\frac{λ-1}{λ+1}|$"
},
{
"stage": "高中",
"chapter": "二级结论",
"section": "通用",
"name": "* 焦点在x轴上",
"latex": "$|ecosθ|=|\\frac{λ+1}{λ-1}|，e=\\sqrt{1+k^2}|\\frac{λ+1}{λ-1}|$"
},
{
"stage": "高中",
"chapter": "二级结论",
"section": "通用",
"name": "* 焦点在y轴上",
"latex": "$esinθ=|\\frac{λ+1}{λ-1}|，e=\\sqrt{1+\\frac{1}{k^2}}|\\frac{λ+1}{λ-1}|$"
},
{
"stage": "高中",
"chapter": "二级结论",
"section": "通用",
"name": "* 椭圆",
"latex": "$\\frac{x_0x}{a^2}+\\frac{y_0y}{b^2}=1$"
},
{
"stage": "高中",
"chapter": "二级结论",
"section": "通用",
"name": "* 双曲线",
"latex": "$\\frac{x_0x}{a^2}-\\frac{y_0y}{b^2}=1$"
},
{
"stage": "高中",
"chapter": "二级结论",
"section": "通用",
"name": "* 抛物线",
"latex": "$y_0y=p(x_0+x)$ $x_0x=p(y_0+y)$"
},
{
"stage": "高中",
"chapter": "二级结论",
"section": "通用",
"name": "* 椭圆",
"latex": "$S=b^2tan\\frac θ 2$"
},
{
"stage": "高中",
"chapter": "二级结论",
"section": "通用",
"name": "* 双曲线",
"latex": "$S=\\frac{b^2}{tan \\frac θ 2}$"
},
{
"stage": "高中",
"chapter": "二级结论",
"section": "抛物线",
"name": "抛物线特殊定点/直角点",
"latex": "$y^2=2px$"
},
{
"stage": "高中",
"chapter": "圆锥曲线与方程",
"section": "圆锥曲线解题",
"name": "圆锥曲线解题",
"latex": "$x^2-4x+3+y^2+(1-x)x_0-[y_0+\\frac{3(1-x_0)}{y_0}]y=0$"
},
{
"stage": "高中",
"chapter": "圆锥曲线与方程",
"section": "圆锥曲线解题",
"name": "圆锥曲线解题",
"latex": "$x^2-4x+3+y^2=0$"
},
{
"stage": "高中",
"chapter": "圆锥曲线与方程",
"section": "圆锥曲线解题",
"name": "圆锥曲线解题",
"latex": "$m(x_0, y_0)$ $\\frac{xx_0}{a^2}+\\frac{yy_0}{b^2}=1$"
},
{
"stage": "高中",
"chapter": "圆锥曲线与方程",
"section": "圆锥曲线解题",
"name": "圆锥曲线解题",
"latex": "$A(x_1,y_1), B(x_2, y_2)$ $(x-x_1)(x-x_2)+(y-y_1)(y-y_2)=0$"
},
{
"stage": "高中",
"chapter": "圆锥曲线与方程",
"section": "圆锥曲线解题",
"name": "圆锥曲线解题",
"latex": "$\\frac{At+B}{Ct+D}$ $\\frac A C=\\frac B D$"
},
{
"stage": "高中",
"chapter": "圆锥曲线解题",
"section": "渐近线",
"name": "渐近线",
"latex": "$\\frac{x^2}{2}-y^2=1$"
},
{
"stage": "高中",
"chapter": "圆锥曲线解题",
"section": "渐近线",
"name": "渐近线",
"latex": "$\\frac{x^2}{2}-y^2=λ(λ≠1)$"
},
{
"stage": "高中",
"chapter": "圆锥曲线解题",
"section": "渐近线",
"name": "渐近线",
"latex": "$\\frac 4 2 - 9 =λ$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "函数的导数",
"name": "函数的导数",
"latex": "$f(x)=x^n$ $f'(x)=nx^{n-1}$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "函数的导数",
"name": "函数的导数",
"latex": "$f(x)=a^x$ $f'(x)=a^xlna$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "函数的导数",
"name": "函数的导数",
"latex": "$f(x)=e^x$ $f'(x)=e^x$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "函数的导数",
"name": "函数的导数",
"latex": "$f(x)=log_ax$ $f'(x)=\\frac{1}{xlna}$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "函数的导数",
"name": "函数的导数",
"latex": "$f'(x)=\\frac 1 x$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "复合函数求导",
"name": "复合函数求导",
"latex": "$y_x'=y_u'·u_x'$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "复合函数求导",
"name": "复合函数求导",
"latex": "$f(x)=x^x(x>0)$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "复合函数求导",
"name": "复合函数求导",
"latex": "$y'_x=x^x(1+lnx)$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "复合函数求导",
"name": "复合函数求导",
"latex": "$y=(2x+1)^6$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "复合函数求导",
"name": "复合函数求导",
"latex": "$y=u^6, u=2x+1$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "复合函数求导",
"name": "复合函数求导",
"latex": "$y'_x=6u^5·2$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "复合函数求导",
"name": "复合函数求导",
"latex": "$=12(2x+1)^5$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "导数运算",
"name": "导数运算",
"latex": "$[\\frac{f(x)}{g(x)}]'=\\frac{f'(x)g(x)-f(x)g'(x)}{[g(x)]^2}(g(x)≠0)$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "导数运算",
"name": "导数运算",
"latex": "$[\\frac{f(x)}{g(x)}]'=[f(x)·\\frac{1}{g(x)}]$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "导数运算",
"name": "导数运算",
"latex": "$=f'(x)·\\frac{1}{g(x)}+f(x)·[\\frac{1}{g(x)}]'$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "导数运算",
"name": "导数运算",
"latex": "$\\frac{f'(x)}{g(x)}+f(x)[-\\frac{1}{g^2(x)}]·g'(x)$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "导数运算",
"name": "导数运算",
"latex": "$t=\\frac 1 t, t=g(x)$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "导数运算",
"name": "导数运算",
"latex": "$=\\frac{f'(x)g(x)-f(x)g'(x)}{[g(x)]^2}(g(x)≠0)$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "导数分析函数的单调性、极值、最值",
"name": "> 验证a=2,b=12",
"latex": "$f'(x)=3x^2-12x+12=3(x-2)^2$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "函数的极值与倒数",
"name": "函数的极值与倒数",
"latex": "$f(x)=x^3，f'(x)=0$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "函数的极值与倒数",
"name": "求函数y=f(x)极值的方法",
"latex": "$f'(x_0)=0$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "函数的极值与倒数",
"name": "函数的极值与倒数",
"latex": "$f(x)=\\frac{e^x}{x-a}$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "函数的极值与倒数",
"name": "函数的极值与倒数",
"latex": "$\\frac{(x-a)·e^x-e^x·1}{(x-a)^2}=\\frac{e^x[x-(a+1)]}{(x-a)^2}$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "函数的极值与倒数",
"name": "函数的极值与倒数",
"latex": "$f(x)=ax^3-ax2+[\\frac{f'(1)}{2}-1]x$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "函数的极值与倒数",
"name": "函数的极值与倒数",
"latex": "$f‘(x)=3ax^2-2ax+\\frac{f'(1)}{2}-1$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "函数的极值与倒数",
"name": "函数的极值与倒数",
"latex": "$f'(1)=a-1+\\frac{f'(1)}{2}$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "函数的极值与倒数",
"name": "函数的极值与倒数",
"latex": "$f(x)=ax^3-ax2+(a-2)x$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "函数的极值与倒数",
"name": "函数的极值与倒数",
"latex": "$f'(x)=3ax^2-2ax+(a-2)$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "函数的极值与倒数",
"name": "函数的极值与倒数",
"latex": "$4a^2=4·3a(a-2)>0$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "导数逆向应用",
"name": "导数逆向应用",
"latex": "$f(x)>e^{2-x}$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "导数逆向应用",
"name": "导数逆向应用",
"latex": "$g(x)=e^xf(x)$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "导数逆向应用",
"name": "导数逆向应用",
"latex": "$g'(x)=e^x[f(x)+f'(x)]>0$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "导数逆向应用",
"name": "导数逆向应用",
"latex": "$e^x·f(x)>e^{2-x}e^x$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "导数逆向应用",
"name": "导数逆向应用",
"latex": "$g(x)>e^x$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "导数逆向应用",
"name": "导数逆向应用",
"latex": "$g(2)=e^2·f(2)=e^2·1$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "导数逆向应用",
"name": "导数逆向应用",
"latex": "$g'(x)=e^x[f(x)+f'(x)]$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "导数逆向应用",
"name": "导数逆向应用",
"latex": "$g(x)=e^{-x}f(x)$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "导数逆向应用",
"name": "导数逆向应用",
"latex": "$g'(x)=e^{-x}[f(x)-f'(x)]$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "导数逆向应用",
"name": "导数逆向应用",
"latex": "$g(x)=xf(x)$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "导数逆向应用",
"name": "导数逆向应用",
"latex": "$g'(x)=xf'(x)+f(x)$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "导数逆向应用",
"name": "导数逆向应用",
"latex": "$g(x)=x^{-1}f(x)$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "导数逆向应用",
"name": "导数逆向应用",
"latex": "$g'(x)=x^{-2}[xf'(x)-f(x)$"
},
{
"stage": "高中",
"chapter": "导数优化问题",
"section": "定积分",
"name": "定积分",
"latex": "$∫_a^b f(x)dx=\\lim\\limits_{n→∞}\\sum\\limits_{i=1}^{n}\\frac{b-a}{n}f(\\xi_i)$"
},
{
"stage": "高中",
"chapter": "导数优化问题",
"section": "定积分",
"name": "* 求和",
"latex": "$\\sum\\limits_{i=1}^{n}f(\\xi_i)·\\frac{b-a}{n}$"
},
{
"stage": "高中",
"chapter": "导数优化问题",
"section": "定积分",
"name": "* 取极限",
"latex": "$∫_a^b f(x)dx=\\lim\\limits_{n→∞}\\sum\\limits_{i=1}^{n}f(\\xi_i)\\frac{b-a}{n}$"
},
{
"stage": "高中",
"chapter": "导数优化问题",
"section": "定积分",
"name": "定积分",
"latex": "$∫_a^b kf(x)dx$"
},
{
"stage": "高中",
"chapter": "导数优化问题",
"section": "定积分",
"name": "定积分",
"latex": "$∫_{-b}^b kf(x)dx$"
},
{
"stage": "高中",
"chapter": "导数优化问题",
"section": "定积分",
"name": "定积分",
"latex": "$∫_a^b kf(x)dx=k∫_a^bf(x)dx$"
},
{
"stage": "高中",
"chapter": "导数优化问题",
"section": "定积分",
"name": "定积分",
"latex": "$∫_a^b [f_1(x)±f_2(x)]dx=∫_a^b f_1(x)dx±∫_a^b f_2(x)dx$"
},
{
"stage": "高中",
"chapter": "导数优化问题",
"section": "定积分",
"name": "定积分",
"latex": "$∫_a^b f(x)dx=∫_a^c f(x)dx+∫_c^b f(x)dx$"
},
{
"stage": "高中",
"chapter": "导数优化问题",
"section": "定积分",
"name": "定积分的几何意义",
"latex": "$∫_a^b f(x)dx$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "微积分基本定理",
"name": "微积分基本定理",
"latex": "$∫_a^b f(x)dx=F(x)|_a^b=F(b)=F(a)$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "微积分基本定理",
"name": "微积分基本定理",
"latex": "$(cx)'=c→∫_a^b cdx=cx|_a^b$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "微积分基本定理",
"name": "微积分基本定理",
"latex": "$(x^n)'=nx^{n-1}→∫_a^b x^ndx=\\frac{1}{n+1}x^{n+1}|_a^b$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "微积分基本定理",
"name": "微积分基本定理",
"latex": "$(sinx)'=cosx→∫_a^b cosxdx=sinx |_a^b$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "微积分基本定理",
"name": "微积分基本定理",
"latex": "$(cosx)'=-sinx→∫_a^b sinxdx=-cosx|_a^b$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "微积分基本定理",
"name": "微积分基本定理",
"latex": "$(lnx)=\\frac 1 x→∫_a^b \\frac 1 xdx=ln|x||_a^b$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "微积分基本定理",
"name": "微积分基本定理",
"latex": "$(e^x)'=e^x→∫_a^b e^xdx=e^x|_a^b$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "微积分基本定理",
"name": "微积分基本定理",
"latex": "$(a^x)'=a^xlna→∫_a^b a^xdx=\\frac{a^x}{lna}|_a^b$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "定积分的简单应用",
"name": "定积分的简单应用",
"latex": "$s=∫_a^bv(t)dt$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "定积分的简单应用",
"name": "求变力做功",
"latex": "$W=∫_a^bF(x)dx$"
},
{
"stage": "高中",
"chapter": "导数",
"section": "导数解题",
"name": "导数解题",
"latex": "$f(x)=2f(2-x)-x^2+8x-8$"
},
{
"stage": "高中",
"chapter": "导数解题",
"section": "$f(x)=x^2$,f'(x)=?",
"name": "> 左边",
"latex": "$=\\frac 1 t f'(x)$"
},
{
"stage": "高中",
"chapter": "导数解题",
"section": "切线方程",
"name": "切线方程",
"latex": "$k=f'(x_0)$"
},
{
"stage": "高中",
"chapter": "导数解题",
"section": "切线方程",
"name": "带入切线方程",
"latex": "$y-f(x_0)=k(x-x_0)$"
},
{
"stage": "高中",
"chapter": "导数解题",
"section": "切线方程",
"name": "切线方程",
"latex": "$y-f(x_0)=f'(x_0)(x-x_0)$ $x_0$"
},
{
"stage": "高中",
"chapter": "导数解题",
"section": "切线方程",
"name": "切线方程",
"latex": "$y'=3x^2$"
},
{
"stage": "高中",
"chapter": "导数解题",
"section": "切线方程",
"name": "切线方程",
"latex": "$k=3x_0^2$"
},
{
"stage": "高中",
"chapter": "导数解题",
"section": "切线方程",
"name": "> > 切线",
"latex": "$y-x_0^3=3x_0^2(x-x_0)$"
},
{
"stage": "高中",
"chapter": "导数解题",
"section": "切线方程",
"name": "切线方程",
"latex": "$2x_0^3-2x_0^2-(x_0^2-1)=0$"
},
{
"stage": "高中",
"chapter": "导数解题",
"section": "切线方程",
"name": "切线方程",
"latex": "$2x_0^2(x_0-1)-(x_0+1)(x_0-1)=0$"
},
{
"stage": "高中",
"chapter": "导数解题",
"section": "切线方程",
"name": "切线方程",
"latex": "$(x_0-1)(2x_0+1)(x_0-1)=0$"
},
{
"stage": "高中",
"chapter": "导数解题",
"section": "公切线问题",
"name": "公切线问题",
"latex": "$f(x_0)=g(x_0)$"
},
{
"stage": "高中",
"chapter": "导数解题",
"section": "公切线问题",
"name": "公切线问题",
"latex": "$f'(x_0)=g'(x_0)$"
},
{
"stage": "高中",
"chapter": "导数解题",
"section": "公切线问题",
"name": "公切线问题",
"latex": "$f'(x_1)=g'(x_2)=k$"
},
{
"stage": "高中",
"chapter": "导数解题",
"section": "公切线问题",
"name": "公切线问题",
"latex": "$f(x_1)=kx_1+m$"
},
{
"stage": "高中",
"chapter": "导数解题",
"section": "公切线问题",
"name": "公切线问题",
"latex": "$g(x_2)=kx_2+m$"
},
{
"stage": "高中",
"chapter": "导数解题",
"section": "一元具体函数不等式的证明",
"name": "一元具体函数不等式的证明",
"latex": "$h_{max}(x)<0$"
},
{
"stage": "高中",
"chapter": "一元具体函数不等式的证明",
"section": "经典不等式/放缩：",
"name": "经典不等式/放缩",
"latex": "$e^{ln(1+x)}≤e^x$"
},
{
"stage": "高中",
"chapter": "一元具体函数不等式的证明",
"section": "经典不等式/放缩：",
"name": "经典不等式/放缩",
"latex": "$ln(1+\\frac 1 x)≤\\frac 1 x$"
},
{
"stage": "高中",
"chapter": "导数解题",
"section": "级数不等式证明",
"name": "级数不等式证明",
"latex": "$a_1+a_2+...+a_n<f(1)+[f(2)-f(1)]+...+[f(n)-f(n-1)]$"
},
{
"stage": "高中",
"chapter": "推理与证明",
"section": "数学归纳法",
"name": "数学归纳法",
"latex": "$n=k(k≥n_0，n∈N^*)$"
},
{
"stage": "高中",
"chapter": "复数",
"section": "复数",
"name": "复数",
"latex": "$i^2=-1$"
},
{
"stage": "高中",
"chapter": "复数",
"section": "复数的模",
"name": "复数的模",
"latex": "$|z|=|a+bi|=r=\\sqrt{a^2+b^2}(r≥0,r∈R)$"
},
{
"stage": "高中",
"chapter": "复数",
"section": "复数代数形式的四则运算",
"name": "复数代数形式的四则运算",
"latex": "$z_1=a+bi,z_2=c+di(a,b,c,d∈R)$"
},
{
"stage": "高中",
"chapter": "复数代数形式的四则运算",
"section": "减法",
"name": "减法",
"latex": "$z_1-z_2=(a+bi)-(c+di)=(a-c)+(b-d)i$"
},
{
"stage": "高中",
"chapter": "复数代数形式的四则运算",
"section": "乘法",
"name": "乘法",
"latex": "$(a+bi)(c+di)=ac+bci+adi+bdi^2=(ac-bd)+(ad+bc)i$ $i^2=-1$"
},
{
"stage": "高中",
"chapter": "乘法",
"section": "共轭复数",
"name": "共轭复数",
"latex": "$z·\\bar z=(a+bi)(a-bi)=a^2+b^2=|z|^2$"
},
{
"stage": "高中",
"chapter": "乘法",
"section": "共轭复数",
"name": "共轭复数",
"latex": "$z+\\bar z=2a,\\quad z-\\bar z=2bi$"
},
{
"stage": "高中",
"chapter": "乘法",
"section": "共轭复数",
"name": "共轭复数",
"latex": "$z·\\overline z=a^2+b^2=|z|^2$"
},
{
"stage": "高中",
"chapter": "复数代数形式的四则运算",
"section": "除法",
"name": "除法",
"latex": "$(a+bi)÷(c+di)=\\frac{ac+bd}{c^2+d^2}+\\frac{bc-ad}{c^2+d^2}i(c+di≠0)$"
},
{
"stage": "高中",
"chapter": "复数代数形式的四则运算",
"section": "除法",
"name": "除法",
"latex": "$\\frac 1 i=-i$"
},
{
"stage": "高中",
"chapter": "复数代数形式的四则运算",
"section": "复数运算中的常用结论",
"name": "复数运算中的常用结论",
"latex": "$(1±i)^2=±2i;\\ (1+i)(1-i)=2;\\ \\frac 1 i=-i;\\ \\frac{1}{1+i}=\\frac{1-i}{2};\\ \\frac{1+i}{1-i}=i;\\ \\frac{1-i}{1+i}=-i;$"
},
{
"stage": "高中",
"chapter": "复数代数形式的四则运算",
"section": "复数运算中的常用结论",
"name": "复数运算中的常用结论",
"latex": "$i^n+i^{n+1}+i^{n+2}+i^{n+3}=0(n∈N^*)$"
},
{
"stage": "高中",
"chapter": "复数代数形式的四则运算",
"section": "复数运算中的常用结论",
"name": "复数运算中的常用结论",
"latex": "$i^{4n}=1,i^{4n+1}=i,i^{4n+2}=-1,i^{4n+3}=-i(n∈N^*)$"
},
{
"stage": "高中",
"chapter": "排列数与排列数公式",
"section": "排列数公式",
"name": "排列数公式",
"latex": "$A_n^m=n(n-1)(n-2)...(n-m+1),(n,m∈N^*，并且m≤n)$ $A_n^m=\\frac{n!}{(n-m)!}$"
},
{
"stage": "高中",
"chapter": "排列数与排列数公式",
"section": "排列数公式",
"name": "n个元素的全排列",
"latex": "$A_n^n=n!$"
},
{
"stage": "高中",
"chapter": "排列数与排列数公式",
"section": "排列数公式",
"name": "全排列数公式",
"latex": "$A_n^n=n!，规定0!=1$"
},
{
"stage": "高中",
"chapter": "排列数与排列数公式",
"section": "排列数公式",
"name": "排列数公式",
"latex": "$A_n^m=nA_{n-1}^{m-1}$"
},
{
"stage": "高中",
"chapter": "排列数与排列数公式",
"section": "排列数公式",
"name": "排列数公式",
"latex": "$A_n^m=mA_{n-1}^{m-1}+A_{n-1}^m$"
},
{
"stage": "高中",
"chapter": "排列与组合",
"section": "组合数与组合数公式",
"name": "> 例",
"latex": "$C_6^2=\\frac{A_6^2}{A_2^2}$"
},
{
"stage": "高中",
"chapter": "排列与组合",
"section": "组合数与组合数公式",
"name": "组合数与组合数公式",
"latex": "$C_n^m=\\frac{n(n-1)(n-2)...(n-m+1)}{m!}， n,m∈N^*，且m≤n$ $C_n^m=\\frac{n!}{m!(n-m)!}$"
},
{
"stage": "高中",
"chapter": "排列与组合",
"section": "组合数与组合数公式",
"name": "组合数与组合数公式",
"latex": "$C_n^0=1$"
},
{
"stage": "高中",
"chapter": "排列与组合",
"section": "组合数与组合数公式",
"name": "组合数与组合数公式",
"latex": "$C_n^n=1$"
},
{
"stage": "高中",
"chapter": "排列与组合",
"section": "组合数与组合数公式",
"name": "组合数与组合数公式",
"latex": "$C_n^m=C_n^{n-m}$"
},
{
"stage": "高中",
"chapter": "排列与组合",
"section": "组合数与组合数公式",
"name": "组合数与组合数公式",
"latex": "$C_n^1=C_n^{n-1}=n$"
},
{
"stage": "高中",
"chapter": "排列与组合",
"section": "组合数与组合数公式",
"name": "组合数与组合数公式",
"latex": "$C_{n+1}^m=C_n^m+C_n^{m-1}$"
},
{
"stage": "高中",
"chapter": "排列与组合",
"section": "组合数与组合数公式",
"name": "组合数与组合数公式",
"latex": "$A_n^m=C_n^m·A_m^m$"
},
{
"stage": "高中",
"chapter": "排列与组合",
"section": "组合数与组合数公式",
"name": "组合数与组合数公式",
"latex": "$C_n^m=\\frac{A_n^m}{A_m^m}$"
},
{
"stage": "高中",
"chapter": "排列与组合",
"section": "组合数与组合数公式",
"name": "组合数与组合数公式",
"latex": "$mC_n^m=nC_{n-1}^{m-1}$"
},
{
"stage": "高中",
"chapter": "排列与组合",
"section": "组合数与组合数公式",
"name": "组合数与组合数公式",
"latex": "$C_m^1C_n^m=C_n^1C_{n-1}^{m-1}$"
},
{
"stage": "高中",
"chapter": "排列与组合",
"section": "组合数与组合数公式",
"name": "组合数与组合数公式",
"latex": "$C_n^{奇}有=C_n^{偶}无$"
},
{
"stage": "高中",
"chapter": "排列与组合",
"section": "组合数与组合数公式",
"name": "组合数与组合数公式",
"latex": "$C_n^{偶}有=C_n^{奇}无$"
},
{
"stage": "高中",
"chapter": "计数原理",
"section": "排列组合规则/做法",
"name": "n中取出m个排",
"latex": "$\\frac 1 n A_n^m$"
},
{
"stage": "高中",
"chapter": "排列组合规则/做法",
"section": "捆绑法",
"name": "捆绑法",
"latex": "$A_5^5A_2^2A_2^2= 480$"
},
{
"stage": "高中",
"chapter": "排列组合规则/做法",
"section": "定序问题倍缩空位插入策略",
"name": "定序问题倍缩空位插入策略",
"latex": "$\\frac{A_7^7}{A_3^3}$"
},
{
"stage": "高中",
"chapter": "排列组合规则/做法",
"section": "分组",
"name": "> 3本书分3组，每组1本",
"latex": "$C_3^1C_2^1C_1^1=6$"
},
{
"stage": "高中",
"chapter": "二项式定理",
"section": "二项式定理",
"name": "公式",
"latex": "$(a+b)^n=C_n^0a^n+C_n^1a^{n-1}b^1+...+C_n^ka^{n-k}b^k+...+C_n^nb^n(n∈N^*)$"
},
{
"stage": "高中",
"chapter": "二项式定理",
"section": "二项展开式的通项",
"name": "通项",
"latex": "$T_{k+1}=C_n^ka^{n-k}b^k(0≤k≤n,k∈N)$"
},
{
"stage": "高中",
"chapter": "二项式定理",
"section": "二项式系数的性质",
"name": "* 对称性",
"latex": "$C_n^k=C_n^{n-k}$"
},
{
"stage": "高中",
"chapter": "二项式定理",
"section": "二项式系数的性质",
"name": "二项式系数的性质",
"latex": "$k<\\frac{n+1}{2}$"
},
{
"stage": "高中",
"chapter": "二项式定理",
"section": "二项式系数的性质",
"name": "二项式系数的性质",
"latex": "$C_n^{\\frac{n}{2}}$"
},
{
"stage": "高中",
"chapter": "二项式定理",
"section": "二项式系数的性质",
"name": "二项式系数的性质",
"latex": "$C_n^{\\frac{n-1}{2}},C_n^{\\frac{n+1}{2}}$"
},
{
"stage": "高中",
"chapter": "二项式定理",
"section": "二项式系数的性质",
"name": "计算各项系数中的最大值",
"latex": "$\\frac{a_{k+1}}{a_k}≥1$"
},
{
"stage": "高中",
"chapter": "二项式定理",
"section": "二项式系数的性质",
"name": "二项式系数的性质",
"latex": "$(1-2x)^7=a_0+a_1x+a_2x^2+...+a_7x^7$"
},
{
"stage": "高中",
"chapter": "二项式定理",
"section": "二项式系数的性质",
"name": "二项式系数的性质",
"latex": "$-1=a_0+a_1+...+a_7$"
},
{
"stage": "高中",
"chapter": "二项式定理",
"section": "二项式系数的性质",
"name": "二项式系数的性质",
"latex": "$1=a_0$"
},
{
"stage": "高中",
"chapter": "二项式定理",
"section": "二项式系数的性质",
"name": "二项式系数的性质",
"latex": "$-14(1-2x)^6=a_1+2a_2x+3a_3x^2+...+7a_7x^6$"
},
{
"stage": "高中",
"chapter": "极坐标系",
"section": "极坐标系",
"name": "极坐标系",
"latex": "$p^2=x^2+y^2$"
},
{
"stage": "高中",
"chapter": "极坐标系",
"section": "极坐标系",
"name": "极坐标系",
"latex": "$tanθ=\\frac y x(x≠0)$"
},
{
"stage": "高中",
"chapter": "极坐标系",
"section": "极坐标系",
"name": "极坐标系",
"latex": "$(b, \\frac π 2)$"
},
{
"stage": "高中",
"chapter": "极坐标系",
"section": "极坐标系",
"name": "极坐标系",
"latex": "$(r, \\frac π 2)$"
},
{
"stage": "高中",
"chapter": "极坐标系",
"section": "参数方程",
"name": "参数方程",
"latex": "$x=x_0+tcosα$"
},
{
"stage": "高中",
"chapter": "极坐标系",
"section": "参数方程",
"name": "参数方程",
"latex": "$y=y_0+tsinα$"
},
{
"stage": "高中",
"chapter": "极坐标系",
"section": "参数方程",
"name": "参数方程",
"latex": "$x=x_0+Rcosθ$"
},
{
"stage": "高中",
"chapter": "极坐标系",
"section": "参数方程",
"name": "参数方程",
"latex": "$y=y_0+Rsinθ$"
},
{
"stage": "高中",
"chapter": "极坐标系",
"section": "参数方程",
"name": "参数方程",
"latex": "$\\frac{x^2}{a^2}+\\frac{y^2}{b^2}=1(a>b>0)$"
},
{
"stage": "高中",
"chapter": "绝对值不等式",
"section": "绝对值不等式",
"name": "绝对值不等式",
"latex": "$|a_1|+|a_2|+...+|a_n|≥|a_1+a_2+...+a_n|$"
},
{
"stage": "高中",
"chapter": "绝对值不等式",
"section": "绝对值不等式",
"name": "绝对值不等式",
"latex": "$|a|+|b|≥|a+b|≥||a|-|b||$"
},
{
"stage": "高中",
"chapter": "绝对值不等式",
"section": "绝对值不等式",
"name": "绝对值不等式",
"latex": "$|a|+|b|≥|a-b|≥||a|-|b||$"
},
{
"stage": "高中",
"chapter": "绝对值不等式",
"section": "绝对值不等式",
"name": "柯西不等式",
"latex": "$(a^2+b^2)(c^2+d^2)≥(ac+bd)^2$"
},
{
"stage": "高中",
"chapter": "绝对值不等式",
"section": "绝对值不等式",
"name": "绝对值不等式",
"latex": "${x|-\\frac 1 3<x<1}，a=？$"
},
{
"stage": "高中",
"chapter": "绝对值不等式",
"section": "绝对值不等式",
"name": "绝对值不等式",
"latex": "$x_1=a$ $x_2=b$"
},
{
"stage": "高中",
"chapter": "绝对值不等式",
"section": "绝对值不等式",
"name": "绝对值不等式",
"latex": "$y_1=|x-a|+|x-b|$ $y_2=c$"
},
{
"stage": "初中",
"chapter": "代数式",
"section": "整式运算法则",
"name": "整式的乘法",
"latex": "$a^{m} a^{n} = a^{m + n}(m,n)$"
},
{
"stage": "初中",
"chapter": "代数式",
"section": "整式运算法则",
"name": "整式运算法则",
"latex": "$(a^{m})^{n} = a^{\\text{mn}}(m,n)$"
},
{
"stage": "初中",
"chapter": "代数式",
"section": "整式运算法则",
"name": "整式运算法则",
"latex": "$(ab)^{n} = a^{n}b^{n}(n)$"
},
{
"stage": "初中",
"chapter": "代数式",
"section": "整式运算法则",
"name": "整式运算法则",
"latex": "$(a + b)(a - b) = a^{2} - b^{2}$"
},
{
"stage": "初中",
"chapter": "代数式",
"section": "整式运算法则",
"name": "整式运算法则",
"latex": "$(a + b)^{2} = a^{2} + 2ab + b^{2}$"
},
{
"stage": "初中",
"chapter": "代数式",
"section": "整式运算法则",
"name": "整式运算法则",
"latex": "$(a - b)^{2} = a^{2} - 2ab + b^{2}$"
},
{
"stage": "初中",
"chapter": "代数式",
"section": "整式运算法则",
"name": "整式的除法",
"latex": "$a^{m} \\div a^{n} = a^{m - n}(m,n,a \\neq 0)$"
},
{
"stage": "初中",
"chapter": "代数式",
"section": "整式运算法则",
"name": "整式运算法则",
"latex": "$a^{0} = 1(a \\neq 0);a^{- p} = \\frac{1}{a^{p}}(a \\neq 0,p)$"
},
{
"stage": "初中",
"chapter": "因式分解",
"section": "常用方法",
"name": "提公因式法",
"latex": "$ab + ac = a(b + c)$"
},
{
"stage": "初中",
"chapter": "因式分解",
"section": "常用方法",
"name": "运用公式法",
"latex": "$a^{2} - b^{2} = (a + b)(a - b)$"
},
{
"stage": "初中",
"chapter": "因式分解",
"section": "常用方法",
"name": "常用方法",
"latex": "$a^{2} + 2ab + b^{2} = (a + b)^{2}$"
},
{
"stage": "初中",
"chapter": "因式分解",
"section": "常用方法",
"name": "常用方法",
"latex": "$a^{2} - 2ab + b^{2} = (a - b)^{2}$"
},
{
"stage": "初中",
"chapter": "因式分解",
"section": "常用方法",
"name": "分组分解法",
"latex": "$ac + ad + bc + bd = a(c + d) + b(c + d) = (a + b)(c + d)$"
},
{
"stage": "初中",
"chapter": "因式分解",
"section": "常用方法",
"name": "十字相乘法",
"latex": "$a^{2} + (p + q)a + pq = (a + p)(a + q)$"
},
{
"stage": "初中",
"chapter": "代数式",
"section": "二次根式",
"name": "二次根式",
"latex": "$(\\sqrt{a})^{2} = a(a \\geq 0)$"
},
{
"stage": "初中",
"chapter": "代数式",
"section": "二次根式",
"name": "二次根式",
"latex": "$\\sqrt{a^{2}} = \\left| a \\right| =$"
},
{
"stage": "初中",
"chapter": "代数式",
"section": "二次根式",
"name": "二次根式",
"latex": "$- a(a < 0)$"
},
{
"stage": "初中",
"chapter": "代数式",
"section": "二次根式",
"name": "二次根式",
"latex": "$\\sqrt{\\text{ab}} = \\sqrt{a} \\sqrt{b}(a \\geq 0,b \\geq 0)$"
},
{
"stage": "初中",
"chapter": "代数式",
"section": "二次根式",
"name": "二次根式",
"latex": "$\\sqrt{\\frac{a}{b}} = \\frac{\\sqrt{a}}{\\sqrt{b}}(a \\geq 0,b \\geq 0)$"
},
{
"stage": "初中",
"chapter": "方程",
"section": "三、一元二次方程的解法",
"name": "三、一元二次方程的解法",
"latex": "$ax^{2} + bx + c = 0(a \\neq 0)$"
},
{
"stage": "初中",
"chapter": "方程",
"section": "四、一元二次方程根的判别式",
"name": "四、一元二次方程根的判别式",
"latex": "$ax^{2} + bx + c = 0(a \\neq 0)$ $中，$"
},
{
"stage": "初中",
"chapter": "第六章 一次函数与反比例函数",
"section": "二、不同位置的点的坐标的特征",
"name": "二、不同位置的点的坐标的特征",
"latex": "$\\Leftrightarrow x > 0,y > 0$"
},
{
"stage": "初中",
"chapter": "第六章 一次函数与反比例函数",
"section": "二、不同位置的点的坐标的特征",
"name": "二、不同位置的点的坐标的特征",
"latex": "$\\Leftrightarrow x < 0,y > 0$"
},
{
"stage": "初中",
"chapter": "第六章 一次函数与反比例函数",
"section": "二、不同位置的点的坐标的特征",
"name": "二、不同位置的点的坐标的特征",
"latex": "$\\Leftrightarrow x < 0,y < 0$"
},
{
"stage": "初中",
"chapter": "第六章 一次函数与反比例函数",
"section": "二、不同位置的点的坐标的特征",
"name": "二、不同位置的点的坐标的特征",
"latex": "$\\Leftrightarrow x > 0,y < 0$"
},
{
"stage": "初中",
"chapter": "第六章 一次函数与反比例函数",
"section": "二、不同位置的点的坐标的特征",
"name": "二、不同位置的点的坐标的特征",
"latex": "$\\Leftrightarrow y = 0$"
},
{
"stage": "初中",
"chapter": "第六章 一次函数与反比例函数",
"section": "二、不同位置的点的坐标的特征",
"name": "二、不同位置的点的坐标的特征",
"latex": "$\\Leftrightarrow x = 0$"
},
{
"stage": "初中",
"chapter": "第六章 一次函数与反比例函数",
"section": "二、不同位置的点的坐标的特征",
"name": "二、不同位置的点的坐标的特征",
"latex": "$\\sqrt{x^{2} + y^{2}}$"
},
{
"stage": "初中",
"chapter": "第六章 一次函数与反比例函数",
"section": "四、正比例函数和一次函数",
"name": "四、正比例函数和一次函数",
"latex": "$y = kx + b$ $中的b为0时，$"
},
{
"stage": "初中",
"chapter": "第六章 一次函数与反比例函数",
"section": "四、正比例函数和一次函数",
"name": "四、正比例函数和一次函数",
"latex": "$y = kx$"
},
{
"stage": "初中",
"chapter": "第六章 一次函数与反比例函数",
"section": "四、正比例函数和一次函数",
"name": "四、正比例函数和一次函数",
"latex": "$y = kx + b$"
},
{
"stage": "初中",
"chapter": "第六章 一次函数与反比例函数",
"section": "五、反比例函数",
"name": "五、反比例函数",
"latex": "$图像上任一点P作x轴、y轴的垂线PM，PN，则所得的矩形PMON的面积S=PM*PN=$"
},
{
"stage": "初中",
"chapter": "第六章 一次函数与反比例函数",
"section": "五、反比例函数",
"name": "五、反比例函数",
"latex": "$\\because y = \\frac{k}{x},\\therefore xy = k,S = \\left| k \\right|$"
},
{
"stage": "初中",
"chapter": "第七章 二次函数",
"section": "一、二次函数的概念和图像",
"name": "一、二次函数的概念和图像",
"latex": "$y = ax^{2} + bx + c(a,b,c,a \\neq 0)$"
},
{
"stage": "初中",
"chapter": "第七章 二次函数",
"section": "一、二次函数的概念和图像",
"name": "一、二次函数的概念和图像",
"latex": "$x = - \\frac{b}{2a}$"
},
{
"stage": "初中",
"chapter": "第七章 二次函数",
"section": "一、二次函数的概念和图像",
"name": "一、二次函数的概念和图像",
"latex": "$y = ax^{2} + bx + c$"
},
{
"stage": "初中",
"chapter": "第七章 二次函数",
"section": "二、二次函数的解析式",
"name": "一般式",
"latex": "$y = ax^{2} + bx + c(a,b,c是常数,a \\neq 0)$"
},
{
"stage": "初中",
"chapter": "第七章 二次函数",
"section": "二、二次函数的解析式",
"name": "顶点式",
"latex": "$y = a(x - h)^{2} + k(a,h,k是常数,a \\neq 0)$"
},
{
"stage": "初中",
"chapter": "第七章 二次函数",
"section": "二、二次函数的解析式",
"name": "二、二次函数的解析式",
"latex": "$可转化为两根式$ $y = a(x - x_{1})(x - x_{2})$"
},
{
"stage": "初中",
"chapter": "第七章 二次函数",
"section": "三、二次函数的最值",
"name": "三、二次函数的最值",
"latex": "$时，$ $y_{} = \\frac{4ac - b^{2}}{4a}$"
},
{
"stage": "初中",
"chapter": "第九章 三角形",
"section": "一、三角形",
"name": "一、三角形",
"latex": "$\\frac{1}{2}$"
},
{
"stage": "初中",
"chapter": "第九章 三角形",
"section": "三、等腰三角形",
"name": "③等腰三角形的三边关系",
"latex": "$\\frac{b}{2}$"
},
{
"stage": "初中",
"chapter": "第九章 三角形",
"section": "三、等腰三角形",
"name": "④等腰三角形的三角关系",
"latex": "$\\frac{180-\\angle A}{2}$"
},
{
"stage": "初中",
"chapter": "第十章 四边形",
"section": "一、四边形的相关概念",
"name": "一、四边形的相关概念",
"latex": "$\\frac{n(n - 3)}{2}$"
},
{
"stage": "初中",
"chapter": "第十章 四边形",
"section": "五、正方形",
"name": "五、正方形",
"latex": "$a^{2} = \\frac{b^{2}}{2}$"
},
{
"stage": "初中",
"chapter": "第十章 四边形",
"section": "六、梯形",
"name": "六、梯形",
"latex": "$S_{\\text{ABCD}} = \\frac{1}{2}(CD + AB) \\text{DE}$"
},
{
"stage": "初中",
"chapter": "第十章 四边形",
"section": "六、梯形",
"name": "六、梯形",
"latex": "$S_{\\Delta\\text{ABD}} = S_{\\Delta\\text{BAC}}$"
},
{
"stage": "初中",
"chapter": "第十章 四边形",
"section": "六、梯形",
"name": "六、梯形",
"latex": "$S_{\\Delta\\text{AOD}} = S_{\\Delta\\text{BOC}}$"
},
{
"stage": "初中",
"chapter": "第十章 四边形",
"section": "六、梯形",
"name": "六、梯形",
"latex": "$S_{\\Delta\\text{ADC}} = S_{\\Delta\\text{BCD}}$"
},
{
"stage": "初中",
"chapter": "第十一章 解直角三角形",
"section": "一、直角三角形的性质",
"name": "一、直角三角形的性质",
"latex": "$a^{2} + b^{2} = c^{2}$"
},
{
"stage": "初中",
"chapter": "第十一章 解直角三角形",
"section": "一、直角三角形的性质",
"name": "一、直角三角形的性质",
"latex": "$CD^{2} = AD \\text{BD}$"
},
{
"stage": "初中",
"chapter": "第十一章 解直角三角形",
"section": "一、直角三角形的性质",
"name": "一、直角三角形的性质",
"latex": "$BC^{2} = BD \\text{AB}$"
},
{
"stage": "初中",
"chapter": "第十一章 解直角三角形",
"section": "三、锐角三角函数的概念",
"name": "三、锐角三角函数的概念",
"latex": "$\\frac{\\sqrt{3}}{3}$ $\\sqrt{3}$"
},
{
"stage": "初中",
"chapter": "第十一章 解直角三角形",
"section": "三、锐角三角函数的概念",
"name": "三、锐角三角函数的概念",
"latex": "$\\sqrt{3}$ $\\frac{\\sqrt{3}}{3}$"
},
{
"stage": "初中",
"chapter": "第十一章 解直角三角形",
"section": "三、锐角三角函数的概念",
"name": "三、锐角三角函数的概念",
"latex": "$sin^2A+cos^2A=1$"
},
{
"stage": "初中",
"chapter": "第十一章 解直角三角形",
"section": "三、锐角三角函数的概念",
"name": "三、锐角三角函数的概念",
"latex": "$tanA=\\frac{\\sin A}{\\cos A}$"
},
{
"stage": "初中",
"chapter": "第十一章 解直角三角形",
"section": "四、解直角三角形",
"name": "三边之间的关系",
"latex": "$a^{2} + b^{2} = c^{2}$"
},
{
"stage": "初中",
"chapter": "第十二章 圆",
"section": "十八、弧长和扇形面积",
"name": "十八、弧长和扇形面积",
"latex": "$l = \\frac{\\text{nπr}}{180}$"
},
{
"stage": "初中",
"chapter": "第十二章 圆",
"section": "十八、弧长和扇形面积",
"name": "十八、弧长和扇形面积",
"latex": "$PA^{2} = PB *{PC}$"
}
];
