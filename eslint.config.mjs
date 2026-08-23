import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

// Next 16 + ESLint 9 官方 flat config（next lint 已在 Next 16 移除）。
//
// 基线约定：lint 必须零 error 可退出。React Hooks v6 / React Compiler 系列新规则
// 会把本项目「挂载即拉取」(useEffect → setState) 的标准数据模式报为 error——
// 这类规则对存量代码降为 warn（新代码里仍可见、可渐进治理），
// 只有确定性的正确性问题保留 error 级别。
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'vendor/**',
    '**/*.min.js',
  ]),
  {
    rules: {
      // React Hooks v6 新规则：本项目标准模式是 effect 内发起异步 load，
      // 首帧 setLoading/setError 属预期行为，不按 error 卡。
      'react-hooks/set-state-in-effect': 'warn',
      // React Compiler 系列诊断：信息性建议，不阻塞。
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
      // 中文文案中的直引号/省略号等实体：CJK 项目常见误报。
      'react/no-unescaped-entities': 'warn',
      // 存量接口类型中的 any：可见但不阻塞（新代码请优先给具体类型）。
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
]);

export default eslintConfig;
