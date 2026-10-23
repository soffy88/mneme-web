'use client';

/**
 * 陪学伙伴头像：原创 SVG（圆脸小星人），嘴型随播放音量开合；表情 happy / thinking / encouraging。
 * 无第三方形象资产、无 Live2D。
 */
export type Expression = 'happy' | 'thinking' | 'encouraging';

export default function CompanionAvatar({ level, expression, name, size = 180 }: {
  level: number; expression: Expression; name: string; size?: number;
}) {
  const open = Math.max(0, Math.min(1, level));
  const mouthRy = 2 + open * 12;
  const eyeY = expression === 'thinking' ? 84 : 90;
  const pupilDx = expression === 'thinking' ? 4 : 0;
  const pupilDy = expression === 'thinking' ? -4 : 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <svg width={size} height={size} viewBox="0 0 200 200" role="img" aria-label={`${name}（${expression}）`}>
        <style>{`
          @keyframes mnBlink { 0%,92%,100% { transform: scaleY(1) } 95% { transform: scaleY(0.1) } }
          @keyframes mnBob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
          @keyframes mnTwinkle { 0%,100% { opacity: .2 } 50% { opacity: 1 } }
          .mn-eye { animation: mnBlink 4s infinite; transform-origin: center; transform-box: fill-box; }
          .mn-body { animation: mnBob 3s ease-in-out infinite; }
          .mn-spark { animation: mnTwinkle 1.2s ease-in-out infinite; }
        `}</style>
        <g className="mn-body">
          <line x1="100" y1="30" x2="100" y2="12" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
          <polygon points="100,2 104,10 112,11 106,16 108,24 100,20 92,24 94,16 88,11 96,10" fill="#fbbf24" />
          <circle cx="100" cy="105" r="72" fill="#7dd3fc" stroke="#0284c7" strokeWidth="4" />
          <ellipse cx="100" cy="122" rx="48" ry="36" fill="#e0f2fe" />
          <circle cx="58" cy="118" r="9" fill="#fda4af" opacity={expression === 'thinking' ? 0.3 : 0.7} />
          <circle cx="142" cy="118" r="9" fill="#fda4af" opacity={expression === 'thinking' ? 0.3 : 0.7} />
          {[70, 130].map((x) => (
            <g key={x} className="mn-eye">
              <ellipse cx={x} cy={eyeY} rx="11" ry="13" fill="#fff" stroke="#0c4a6e" strokeWidth="2" />
              <circle cx={x + pupilDx} cy={eyeY + 2 + pupilDy} r="5.5" fill="#0c4a6e" />
            </g>
          ))}
          {expression === 'encouraging' ? (
            <>
              <path d="M56 70 Q70 62 84 70" stroke="#0c4a6e" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M116 70 Q130 62 144 70" stroke="#0c4a6e" strokeWidth="3" fill="none" strokeLinecap="round" />
            </>
          ) : expression === 'thinking' ? (
            <path d="M118 64 L142 70" stroke="#0c4a6e" strokeWidth="3" strokeLinecap="round" />
          ) : null}
          <ellipse cx="100" cy="134" rx={expression === 'thinking' ? 8 : 16} ry={mouthRy} fill="#be123c" />
          {open < 0.05 && expression !== 'thinking' && (
            <path d="M84 132 Q100 146 116 132" stroke="#be123c" strokeWidth="4" fill="none" strokeLinecap="round" />
          )}
        </g>
        {expression === 'thinking' && (
          <g fill="#94a3b8"><circle cx="160" cy="44" r="5" /><circle cx="172" cy="30" r="7" /><circle cx="188" cy="14" r="9" /></g>
        )}
        {expression === 'encouraging' && (
          <g fill="#fbbf24">
            <polygon className="mn-spark" points="24,40 28,50 38,52 30,58 32,68 24,62 16,68 18,58 10,52 20,50" />
            <polygon className="mn-spark" points="176,150 179,157 186,158 181,162 182,169 176,165 170,169 171,162 166,158 173,157" style={{ animationDelay: '.6s' }} />
          </g>
        )}
      </svg>
      <span style={{ fontWeight: 700, color: 'var(--mn-ink)' }}>{name}</span>
    </div>
  );
}
