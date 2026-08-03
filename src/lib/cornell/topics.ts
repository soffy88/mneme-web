/**
 * 课题注册表。
 * 内容源与 mneme `data/cornell_topics/{id}/content.json` 保持同步（Phase B 前端内嵌）。
 */

import type { CornellContent } from './types';
import pythagorasJson from './content/pythagoras.json';

const pythagoras = pythagorasJson as CornellContent;

const REGISTRY: Record<string, CornellContent> = {
  [pythagoras.topicId]: pythagoras,
};

export function listTopics(): CornellContent[] {
  return Object.values(REGISTRY);
}

export function getTopic(topicId: string): CornellContent | null {
  return REGISTRY[topicId] ?? null;
}

export function listTopicSummaries() {
  return listTopics().map((t) => ({
    topicId: t.topicId,
    title: t.title,
    subtitle: t.subtitle,
    grade: t.grade,
    subject: t.subject,
    cueCount: t.cues.length,
    moduleCount: t.modules.length,
  }));
}
