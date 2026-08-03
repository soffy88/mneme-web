/** 康奈尔笔记类型（契约对齐 mneme Master 附录 Phase B）。 */

export interface CornellCue {
  id: string;
  mod: string;
  text: string;
  hint?: string;
}

export interface CornellTable {
  headers: string[];
  rows: string[][];
}

export interface CornellModule {
  id: string;
  title: string;
  body: string;
  tags?: string[];
  table?: CornellTable;
  svg?: string;
}

export interface CornellContent {
  topicId: string;
  version: number;
  subject: string;
  subjectLabel?: string;
  grade?: string;
  title: string;
  subtitle?: string;
  dateLabel?: string;
  kuIds?: string[];
  kcIds?: string[];
  cues: CornellCue[];
  modules: CornellModule[];
  summary: string;
  oneLiner: string;
}

export interface CornellState {
  topicId: string;
  version: number;
  mastered: Record<string, boolean>;
  collapsed: Record<string, boolean>;
  selfTest: boolean;
  showAnswers: boolean;
  updatedAt: string;
}

export function emptyState(topicId: string, version: number): CornellState {
  return {
    topicId,
    version,
    mastered: {},
    collapsed: {},
    selfTest: false,
    showAnswers: false,
    updatedAt: new Date(0).toISOString(),
  };
}

export function storageKey(topicId: string, version: number): string {
  return `cornell_${topicId}_v${version}`;
}
