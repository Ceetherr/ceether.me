import { Article, SeriesInfo, TopicId, TopicInfo } from '../types';
import { getArticleTopics, ArticleTopicBadge } from './topics';

const ORDINAL_PARTS = [
  'اول',
  'دوم',
  'سوم',
  'چهارم',
  'پنجم',
  'ششم',
  'هفتم',
  'هشتم',
  'نهم',
  'دهم',
];

const CARDINAL_COUNT_WORDS = [
  'صفر',
  'یک',
  'دو',
  'سه',
  'چهار',
  'پنج',
  'شش',
  'هفت',
  'هشت',
  'نه',
  'ده',
];

/**
 * Returns a Persian ordinal part label without bare digits (e.g., 1 -> "بخش اول").
 */
export function getPartLabel(part: number, customLabel?: string): string {
  if (customLabel && customLabel.trim()) {
    return customLabel.trim();
  }
  const ordinal = ORDINAL_PARTS[part - 1];
  if (ordinal) {
    return `بخش ${ordinal}`;
  }
  return `بخش ${part}`;
}

/**
 * Returns a Persian word count label for series parts without bare digits (e.g., 3 -> "سه بخش").
 */
export function getPartCountLabel(count: number): string {
  const word = CARDINAL_COUNT_WORDS[count];
  if (word) {
    return `${word} بخش`;
  }
  return `${count} بخش`;
}

/**
 * Returns all published articles belonging to a series, sorted by part number ascending.
 */
export function getSeriesArticles(articles: Article[], seriesId: string): Article[] {
  return articles
    .filter((art) => art.series?.id === seriesId)
    .sort((a, b) => (a.series?.part || 0) - (b.series?.part || 0));
}

/**
 * Returns adjacent parts (previous/next) within the same series for an article.
 */
export function getAdjacentSeriesParts(articles: Article[], current: Article): {
  allParts: Article[];
  prevPart: Article | null;
  nextPart: Article | null;
} {
  if (!current.series) {
    return { allParts: [], prevPart: null, nextPart: null };
  }

  const allParts = getSeriesArticles(articles, current.series.id);
  const idx = allParts.findIndex((a) => a.id === current.id);
  if (idx === -1) {
    return { allParts, prevPart: null, nextPart: null };
  }

  return {
    allParts,
    prevPart: idx > 0 ? allParts[idx - 1] : null,
    nextPart: idx < allParts.length - 1 ? allParts[idx + 1] : null,
  };
}

/**
 * Resolves metadata for a series from the catalog or falls back to the first matching article.
 */
export function resolveSeriesInfo(
  seriesId: string,
  articles: Article[],
  seriesCatalog: SeriesInfo[]
): SeriesInfo | null {
  const catalogMatch = seriesCatalog.find((s) => s.id === seriesId);
  if (catalogMatch) return catalogMatch;

  const firstArticle = getSeriesArticles(articles, seriesId)[0];
  if (!firstArticle?.series) return null;

  return {
    id: firstArticle.series.id,
    title: firstArticle.series.title,
    description: `تمامی بخش‌های منتشرشده‌ی مجموعه «${firstArticle.series.title}» به ترتیب مطالعه.`,
  };
}

export interface FeedEntry {
  kind: 'article' | 'series';
  id: string;
  displayNumber: number;
  sortOrder: number;
  article: Article;
  seriesInfo?: SeriesInfo;
  parts?: Article[];
  topics: ArticleTopicBadge[];
  totalReadingTimeMinutes: number;
  latestShamsiDate: string;
}

/**
 * Collapses multi-part series into single unified FeedEntry items while keeping standalone articles intact.
 */
export function buildFeedEntries(
  articles: Article[],
  seriesCatalog: SeriesInfo[]
): FeedEntry[] {
  const entries: Array<Omit<FeedEntry, 'displayNumber'>> = [];
  const seenSeries = new Set<string>();

  for (const art of articles) {
    if (art.series) {
      const seriesId = art.series.id;
      if (seenSeries.has(seriesId)) continue;
      seenSeries.add(seriesId);

      const parts = getSeriesArticles(articles, seriesId);
      const info = resolveSeriesInfo(seriesId, articles, seriesCatalog) || {
        id: seriesId,
        title: art.series.title,
        description: art.excerpt,
      };

      const topicMap = new Map<TopicId, ArticleTopicBadge>();
      let totalReadingTimeMinutes = 0;
      let latestPart = parts[0] || art;
      let maxNumber = art.number;

      for (const part of parts) {
        totalReadingTimeMinutes += part.readingTimeMinutes;
        if (part.number >= maxNumber) {
          maxNumber = part.number;
          latestPart = part;
        }
        for (const t of getArticleTopics(part)) {
          if (!topicMap.has(t.id)) {
            topicMap.set(t.id, t);
          }
        }
      }

      entries.push({
        kind: 'series',
        id: seriesId,
        sortOrder: maxNumber,
        article: parts[0] || art,
        seriesInfo: info,
        parts,
        topics: Array.from(topicMap.values()),
        totalReadingTimeMinutes,
        latestShamsiDate: latestPart.shamsiDate,
      });
    } else {
      entries.push({
        kind: 'article',
        id: art.id,
        sortOrder: art.number,
        article: art,
        topics: getArticleTopics(art),
        totalReadingTimeMinutes: art.readingTimeMinutes,
        latestShamsiDate: art.shamsiDate,
      });
    }
  }

  // Sort newest first by sortOrder and assign clean sequential display numbers (#04, #03, ...)
  entries.sort((a, b) => b.sortOrder - a.sortOrder);
  const total = entries.length;

  return entries.map((entry, idx) => ({
    ...entry,
    displayNumber: total - idx,
  }));
}

/**
 * Computes topic counts across collapsed feed entries (so counts match visible feed items).
 */
export function computeCollapsedTopicCounts(
  articles: Article[],
  topics: TopicInfo[],
  seriesCatalog: SeriesInfo[]
): Record<TopicId, number> {
  const entries = buildFeedEntries(articles, seriesCatalog);
  const counts: Record<TopicId, number> = {
    all: entries.length,
    philosophy: 0,
    science: 0,
    technology: 0,
    reflections: 0,
  };

  for (const topic of topics) {
    if (topic.id !== 'all' && counts[topic.id] === undefined) {
      counts[topic.id] = 0;
    }
  }

  for (const entry of entries) {
    for (const t of entry.topics) {
      if (counts[t.id] !== undefined) {
        counts[t.id]++;
      }
    }
  }

  return counts;
}

const READ_STORAGE_KEY = 'persian_journal_read_articles';

export function getReadArticleIds(): string[] {
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function markArticleAsRead(articleId: string): string[] {
  const current = getReadArticleIds();
  if (current.includes(articleId)) return current;
  const updated = [...current, articleId];
  try {
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors
  }
  return updated;
}
