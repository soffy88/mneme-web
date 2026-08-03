'use client';

/** 轻量思考动画：纯 CSS keyframes（无额外 npm 依赖）。 */
export type OrbState = 'listening' | 'composing' | 'working';

const KEYFRAMES = `
@keyframes aria-orb-pulse {
  0%, 100% { transform: scale(0.88); opacity: 0.7; }
  50% { transform: scale(1.08); opacity: 1; }
}
@keyframes aria-orb-spin {
  to { transform: rotate(360deg); }
}
`;

export function ThinkingOrb({
  state = 'composing',
  size = 32,
}: {
  state?: OrbState;
  size?: number;
}) {
  const label =
    state === 'listening' ? 'Listening' : state === 'working' ? 'Working' : 'Composing';

  const anim =
    state === 'listening'
      ? 'aria-orb-pulse 1.2s ease-in-out infinite'
      : state === 'working'
        ? 'aria-orb-pulse 0.7s ease-in-out infinite'
        : 'aria-orb-spin 2.4s linear infinite';

  return (
    <span
      role="status"
      aria-label={label}
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <style>{KEYFRAMES}</style>
      <span
        style={{
          width: size * 0.72,
          height: size * 0.72,
          borderRadius: '50%',
          border: `2px ${state === 'composing' ? 'dashed' : 'solid'} ${
            state === 'working' ? 'rgba(160,200,255,0.65)' : 'rgba(245,200,120,0.55)'
          }`,
          boxShadow: '0 0 12px rgba(245,180,80,0.35)',
          background:
            'radial-gradient(circle at 35% 30%, rgba(255,230,180,0.35), transparent 55%), rgba(20,14,10,0.6)',
          animation: anim,
        }}
      />
    </span>
  );
}
