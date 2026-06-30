'use client';

/**
 * KernelPlot — 渲染确定性内核产出的图示数据（item 14）。
 *
 * "内核兜图"护城河：图形数据由后端 kernel_to_plot2d 确定性产出，前端只渲染。
 * 防御式读取 params（兼容多种命名），无法构造的 trace 静默跳过，不抛错。
 */
import { Mafs, Coordinates, Plot, Point, Line, Circle } from 'mafs';
import 'mafs/core.css';
import type { PlotData, PlotTrace } from '@/types/api';

function num(p: Record<string, number | string>, ...keys: string[]): number | undefined {
  for (const k of keys) {
    const v = p[k];
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v);
  }
  return undefined;
}

function renderTrace(t: PlotTrace, i: number) {
  const p = t.params || {};
  switch (t.type) {
    case 'point': {
      const x = num(p, 'x', 'cx', 'x0');
      const y = num(p, 'y', 'cy', 'y0');
      if (x === undefined || y === undefined) return null;
      return <Point key={i} x={x} y={y} />;
    }
    case 'circle': {
      const cx = num(p, 'cx', 'center_x', 'x') ?? 0;
      const cy = num(p, 'cy', 'center_y', 'y') ?? 0;
      const r = num(p, 'r', 'radius');
      if (r === undefined) return null;
      return <Circle key={i} center={[cx, cy]} radius={r} />;
    }
    case 'ellipse': {
      const cx = num(p, 'cx', 'center_x') ?? 0;
      const cy = num(p, 'cy', 'center_y') ?? 0;
      const a = num(p, 'a', 'rx', 'semi_major');
      const b = num(p, 'b', 'ry', 'semi_minor');
      if (a === undefined || b === undefined) return null;
      return (
        <Plot.Parametric
          key={i}
          t={[0, 2 * Math.PI]}
          xy={(t) => [cx + a * Math.cos(t), cy + b * Math.sin(t)]}
        />
      );
    }
    case 'line': {
      const x1 = num(p, 'x1', 'x0');
      const y1 = num(p, 'y1', 'y0');
      const x2 = num(p, 'x2', 'x3');
      const y2 = num(p, 'y2', 'y3');
      if (x1 !== undefined && y1 !== undefined && x2 !== undefined && y2 !== undefined) {
        return <Line.Segment key={i} point1={[x1, y1]} point2={[x2, y2]} />;
      }
      // 斜截式 y = kx + b
      const k = num(p, 'k', 'slope', 'm');
      const b = num(p, 'b', 'intercept', 'c');
      if (k !== undefined && b !== undefined) {
        return <Plot.OfX key={i} y={(x) => k * x + b} />;
      }
      return null;
    }
    case 'fn': {
      // 表达式为字符串，前端不做不安全求值；若内核给了采样点则连线，否则跳过。
      return null;
    }
    default:
      return null;
  }
}

export function KernelPlot({ data }: { data: PlotData }) {
  const [xMin, xMax] = data.x_range ?? [-10, 10];
  const [yMin, yMax] = data.y_range ?? [-10, 10];
  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(30,58,95,.1)' }}>
      <Mafs height={260} viewBox={{ x: [xMin, xMax], y: [yMin, yMax] }} preserveAspectRatio={false}>
        <Coordinates.Cartesian />
        {(data.traces ?? []).map((t, i) => renderTrace(t, i))}
        {data.annotations?.map((a, i) =>
          Number.isFinite(a.x) && Number.isFinite(a.y) ? (
            <Point key={`a${i}`} x={a.x} y={a.y} color="var(--mn-orange, #e8833a)" />
          ) : null,
        )}
      </Mafs>
    </div>
  );
}
