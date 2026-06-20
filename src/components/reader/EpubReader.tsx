'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ReactReader } from 'react-reader';
import type { Rendition } from 'epubjs';
import {
  listHighlights,
  createHighlight,
  type HighlightItem,
  type EpubLocation,
} from '@/lib/reader-api';

const COLORS: { key: string; bg: string; label: string }[] = [
  { key: 'yellow', bg: '#facc15', label: '黄' },
  { key: 'green',  bg: '#22c55e', label: '绿' },
  { key: 'blue',   bg: '#60a5fa', label: '蓝' },
  { key: 'red',    bg: '#f87171', label: '红' },
];

interface Props {
  buffer: ArrayBuffer;
  fileId: string;
  title: string;
  onHighlightsChange?: (highlights: HighlightItem[]) => void;
}

export function EpubReader({ buffer, fileId, title, onHighlightsChange }: Props) {
  const [location, setLocation] = useState<string | number>(0);
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);
  const [color, setColor] = useState('yellow');
  const renditionRef = useRef<Rendition | null>(null);

  const reload = useCallback(async () => {
    const hs = await listHighlights(fileId);
    setHighlights(hs);
    onHighlightsChange?.(hs);
  }, [fileId, onHighlightsChange]);

  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    const r = renditionRef.current;
    if (!r) return;
    highlights.forEach(h => {
      const loc = h.location_json as EpubLocation | undefined;
      if (loc?.cfi) {
        try {
          r.annotations.highlight(loc.cfi, {}, () => {}, '', { fill: h.color });
        } catch { /* 无效 CFI 跳过 */ }
      }
    });
  }, [highlights]);

  const onRendition = (rendition: Rendition) => {
    renditionRef.current = rendition;
    rendition.on('selected', async (cfiRange: string) => {
      let text = '';
      try { text = rendition.getRange(cfiRange).toString(); } catch { /* ignore */ }
      await createHighlight({
        file_id: fileId, color, text,
        location_json: { cfi: cfiRange } as EpubLocation,
      });
      rendition.annotations.highlight(cfiRange, {}, () => {}, '', { fill: color });
      reload();
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '8px 12px',
        borderBottom: '1px solid var(--mn-border)',
        background: 'var(--mn-surface)',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '12px', color: 'var(--mn-ink-3)' }}>高亮颜色:</span>
        {COLORS.map(c => (
          <button
            key={c.key}
            onClick={() => setColor(c.key)}
            title={c.label}
            style={{
              width: '20px', height: '20px', borderRadius: '50%',
              background: c.bg, cursor: 'pointer',
              border: `2px solid ${color === c.key ? 'var(--mn-ink)' : 'transparent'}`,
            }}
          />
        ))}
      </div>
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <ReactReader
          url={buffer}
          location={location}
          locationChanged={(loc: string) => setLocation(loc)}
          getRendition={onRendition}
          title={title}
        />
      </div>
    </div>
  );
}
