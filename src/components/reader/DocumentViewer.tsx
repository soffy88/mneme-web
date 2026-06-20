'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { fetchTextbookFileBlob, type HighlightItem } from '@/lib/reader-api';

const PdfReader  = dynamic(() => import('./PdfReader').then(m => ({ default: m.PdfReader })),  { ssr: false });
const EpubReader = dynamic(() => import('./EpubReader').then(m => ({ default: m.EpubReader })), { ssr: false });

const MB = 1024 * 1024;

interface Props {
  fileId: string;
  fileType: 'pdf' | 'epub';
  filename: string;
  fileSize?: number | null;
  onHighlightsChange?: (highlights: HighlightItem[]) => void;
}

export function DocumentViewer({ fileId, fileType, filename, fileSize, onHighlightsChange }: Props) {
  const [blobUrl, setBlobUrl]   = useState<string | null>(null);
  const [buffer, setBuffer]     = useState<ArrayBuffer | null>(null);
  const [loading, setLoading]   = useState(true);
  const [pct, setPct]           = useState(0);
  const [error, setError]       = useState<string | null>(null);

  const tooLarge = (fileSize ?? 0) > 200 * MB;

  useEffect(() => {
    if (tooLarge) { setLoading(false); return; }
    let url: string | null = null;
    let cancelled = false;
    setLoading(true); setError(null); setPct(0);

    (async () => {
      try {
        // Stream download with progress
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE ?? process.env.NEXT_PUBLIC_MNEME_API_BASE ?? 'http://localhost:8001'}/v1/textbook-files/${fileId}/content`, {
          headers: { Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('mneme_token') ?? '' : ''}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const total = Number(res.headers.get('content-length') ?? 0);
        const reader = res.body!.getReader();
        const chunks: Uint8Array<ArrayBuffer>[] = [];
        let received = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value as Uint8Array<ArrayBuffer>);
          received += value.length;
          if (total > 0) setPct(Math.round((received / total) * 100));
        }

        if (cancelled) return;
        const blob = new Blob(chunks);
        if (fileType === 'epub') {
          setBuffer(await blob.arrayBuffer());
        } else {
          url = URL.createObjectURL(blob);
          setBlobUrl(url);
        }
        setLoading(false);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : '加载失败');
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [fileId, fileType, tooLarge]);

  if (tooLarge) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--mn-ink-3)' }}>
        <p style={{ marginBottom: '12px' }}>
          文件较大（{Math.round((fileSize ?? 0) / MB)}MB），建议下载查看
        </p>
      </div>
    );
  }

  if (loading) {
    const big = (fileSize ?? 0) > 50 * MB;
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--mn-ink-3)' }}>
        <div style={{ marginBottom: '12px' }}>
          {big ? '正在加载大文件' : '加载中'}{pct > 0 ? ` ${pct}%` : '…'}
        </div>
        {pct > 0 && (
          <div style={{ maxWidth: '240px', margin: '0 auto', height: '3px', background: 'var(--mn-border)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'var(--mn-blue)', transition: 'width 200ms ease' }} />
          </div>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--mn-ink-3)' }}>
        无法加载文件：{error}
      </div>
    );
  }

  if (fileType === 'pdf' && blobUrl) {
    return <PdfReader blobUrl={blobUrl} fileId={fileId} onHighlightsChange={onHighlightsChange} />;
  }
  if (fileType === 'epub' && buffer) {
    return <EpubReader buffer={buffer} fileId={fileId} title={filename} onHighlightsChange={onHighlightsChange} />;
  }

  return (
    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--mn-ink-3)' }}>
      暂不支持此格式预览
    </div>
  );
}
