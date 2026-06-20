'use client';

import { useState, useEffect, useCallback } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import {
  highlightPlugin,
  type RenderHighlightTargetProps,
  type RenderHighlightsProps,
  type HighlightArea,
} from '@react-pdf-viewer/highlight';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/highlight/lib/styles/index.css';
import {
  listHighlights,
  createHighlight,
  type HighlightItem,
  type PdfLocation,
} from '@/lib/reader-api';

const COLORS: { key: string; bg: string; label: string }[] = [
  { key: 'yellow', bg: '#facc15', label: '黄' },
  { key: 'green',  bg: '#22c55e', label: '绿' },
  { key: 'blue',   bg: '#60a5fa', label: '蓝' },
  { key: 'red',    bg: '#f87171', label: '红' },
];

interface Props {
  blobUrl: string;
  fileId: string;
  onHighlightsChange?: (highlights: HighlightItem[]) => void;
}

export function PdfReader({ blobUrl, fileId, onHighlightsChange }: Props) {
  const [highlights, setHighlights] = useState<HighlightItem[]>([]);

  const reload = useCallback(async () => {
    const hs = await listHighlights(fileId);
    setHighlights(hs);
    onHighlightsChange?.(hs);
  }, [fileId, onHighlightsChange]);

  useEffect(() => { reload(); }, [reload]);

  const save = async (props: RenderHighlightTargetProps, color: string) => {
    const loc: PdfLocation = {
      page: props.highlightAreas[0]?.pageIndex,
      rects: props.highlightAreas.map(a => ({
        top: a.top, left: a.left, width: a.width, height: a.height, pageIndex: a.pageIndex,
      })),
    };
    await createHighlight({ file_id: fileId, color, text: props.selectedText, location_json: loc });
    props.cancel();
    reload();
  };

  const highlightPluginInstance = highlightPlugin({
    renderHighlightTarget: (props: RenderHighlightTargetProps) => (
      <div
        style={{
          position: 'absolute',
          left: `${props.selectionRegion.left}%`,
          top: `${props.selectionRegion.top + props.selectionRegion.height}%`,
          zIndex: 10,
          display: 'flex',
          gap: '4px',
          padding: '6px 8px',
          borderRadius: '8px',
          background: 'var(--mn-surface)',
          border: '1px solid var(--mn-border)',
          boxShadow: 'var(--mn-shadow-md)',
        }}
      >
        {COLORS.map(c => (
          <button
            key={c.key}
            onClick={() => save(props, c.key)}
            title={c.label}
            style={{
              width: '22px', height: '22px', borderRadius: '50%',
              background: c.bg, border: '2px solid transparent',
              cursor: 'pointer',
            }}
          />
        ))}
      </div>
    ),
    renderHighlights: (props: RenderHighlightsProps) => (
      <>
        {highlights.flatMap(h => {
          const loc = h.location_json as PdfLocation | undefined;
          if (!loc?.rects) return [];
          const colorMap: Record<string, string> = {
            yellow: 'rgba(250,204,21,0.4)',
            green:  'rgba(34,197,94,0.35)',
            blue:   'rgba(96,165,250,0.4)',
            red:    'rgba(248,113,113,0.4)',
          };
          const bg = colorMap[h.color] ?? 'rgba(250,204,21,0.4)';
          return loc.rects
            .filter(r => r.pageIndex === props.pageIndex)
            .map((rect, i) => (
              <div
                key={`${h.id}-${i}`}
                title={h.note ?? h.text}
                style={{
                  ...props.getCssProperties(rect as HighlightArea, props.rotation),
                  background: bg,
                  cursor: 'pointer',
                }}
              />
            ));
        })}
      </>
    ),
  });

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <div style={{ height: '100%', border: '1px solid var(--mn-border)', borderRadius: '8px', overflow: 'hidden' }}>
      <Worker workerUrl="/pdf.worker.min.js">
        <Viewer
          fileUrl={blobUrl}
          plugins={[defaultLayoutPluginInstance, highlightPluginInstance]}
        />
      </Worker>
    </div>
  );
}
