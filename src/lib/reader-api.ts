/**
 * 教材阅读器 API — 文件/高亮/笔记。
 * 对接后端 P.1 的 9 个接口:
 *   textbook-files: upload / list / content
 *   highlights: CRUD
 *   reading-notes: CRUD (软删除)
 */
import { MNEME_API_BASE } from './env';
import { authHeader } from './auth-store';

// ── 类型 ─────────────────────────────────────────────────────

export interface TextbookFile {
  file_id: string;
  filename: string;
  file_type: 'pdf' | 'epub';
  file_size: number | null;
  uploaded_at: string;
  textbook_id: string | null;
  owner_student_id: string | null;
}

export interface PdfLocation {
  page?: number;
  rects?: { top: number; left: number; width: number; height: number; pageIndex: number }[];
}
export interface EpubLocation {
  cfi: string;
}
export type HighlightLocation = PdfLocation | EpubLocation;

export interface HighlightItem {
  id: string;
  file_id: string;
  student_id: string;
  color: string;
  text: string;
  note: string | null;
  location_json: HighlightLocation;
  created_at: string;
  updated_at: string;
}

export interface ReadingNoteItem {
  id: string;
  file_id: string | null;
  student_id: string;
  title: string | null;
  content: string | null;
  highlight_id: string | null;
  created_at: string;
  updated_at: string;
}

// ── 底层 fetch ────────────────────────────────────────────────

async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${MNEME_API_BASE}${path}`, {
    ...init,
    headers: { ...authHeader(), ...init.headers },
  });
  return res;
}

// ── 文件 ─────────────────────────────────────────────────────

export async function uploadTextbookFile(
  file: File,
  textbookId?: string,
): Promise<TextbookFile> {
  const form = new FormData();
  form.append('file', file);
  if (textbookId) form.append('textbook_id', textbookId);
  const res = await apiFetch('/v1/textbook-files/upload', { method: 'POST', body: form });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listTextbookFiles(textbookId?: string): Promise<TextbookFile[]> {
  const qs = textbookId ? `?textbook_id=${encodeURIComponent(textbookId)}` : '';
  const res = await apiFetch(`/v1/textbook-files${qs}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchTextbookFileBlob(fileId: string): Promise<Blob> {
  const res = await apiFetch(`/v1/textbook-files/${fileId}/content`);
  if (!res.ok) throw new Error(`文件加载失败 (${res.status})`);
  return res.blob();
}

// ── 高亮 ─────────────────────────────────────────────────────

export async function listHighlights(fileId: string): Promise<HighlightItem[]> {
  const res = await apiFetch(`/v1/highlights?file_id=${encodeURIComponent(fileId)}`);
  if (!res.ok) return [];
  return res.json();
}

export async function createHighlight(body: {
  file_id: string;
  color: string;
  text: string;
  note?: string;
  location_json: HighlightLocation;
}): Promise<HighlightItem> {
  const res = await apiFetch('/v1/highlights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function patchHighlight(
  id: string,
  body: { color?: string; note?: string },
): Promise<HighlightItem> {
  const res = await apiFetch(`/v1/highlights/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteHighlight(id: string): Promise<void> {
  await apiFetch(`/v1/highlights/${id}`, { method: 'DELETE' });
}

// ── 笔记 ─────────────────────────────────────────────────────

export async function listReadingNotes(fileId: string): Promise<ReadingNoteItem[]> {
  const res = await apiFetch(`/v1/reading-notes?file_id=${encodeURIComponent(fileId)}`);
  if (!res.ok) return [];
  return res.json();
}

export async function createReadingNote(body: {
  file_id?: string;
  title?: string;
  content?: string;
  highlight_id?: string;
}): Promise<ReadingNoteItem> {
  const res = await apiFetch('/v1/reading-notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function patchReadingNote(
  id: string,
  body: { title?: string; content?: string },
): Promise<ReadingNoteItem> {
  const res = await apiFetch(`/v1/reading-notes/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteReadingNote(id: string): Promise<void> {
  await apiFetch(`/v1/reading-notes/${id}`, { method: 'DELETE' });
}
