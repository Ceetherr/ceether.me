import { Article, TopicId } from '../types';
import { normalizePersian } from './persian';
import { articleHasTopic, getArticleTopics } from './topics';
import { getPartLabel } from './series';

export interface ArticleSearchMatch {
  article: Article;
  score: number;
  snippet: string | null;
  matchedIn: 'title' | 'excerpt' | 'topic' | 'body' | 'footnote' | null;
}

/**
 * Removes inline markdown emphasis and footnote markers for clean plain-text search & snippets.
 */
function stripInlineMarkup(text: string): string {
  return text
    .replace(/\[\^?[0-9۰-۹]+\]/g, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Builds a concise context snippet centered around the first matching query term.
 */
function buildContextSnippet(rawText: string, queryTerms: string[], maxLength = 155): string {
  const clean = stripInlineMarkup(rawText);
  if (!clean) return '';

  // Find the earliest match position in the original clean text using flexible matching
  let bestIndex = -1;
  for (const term of queryTerms) {
    const idx = findNormalizedSubstringIndex(clean, term);
    if (idx !== -1 && (bestIndex === -1 || idx < bestIndex)) {
      bestIndex = idx;
    }
  }

  if (bestIndex === -1 || clean.length <= maxLength) {
    return clean.length > maxLength ? `${clean.slice(0, maxLength).trimEnd()}…` : clean;
  }

  const half = Math.floor(maxLength / 2);
  let start = Math.max(0, bestIndex - Math.floor(half * 0.65));
  let end = Math.min(clean.length, start + maxLength);

  if (end - start < maxLength && start > 0) {
    start = Math.max(0, end - maxLength);
  }

  // Snap start & end to word boundaries when possible
  if (start > 0) {
    const nextSpace = clean.indexOf(' ', start);
    if (nextSpace !== -1 && nextSpace - start < 15) {
      start = nextSpace + 1;
    }
  }
  if (end < clean.length) {
    const prevSpace = clean.lastIndexOf(' ', end);
    if (prevSpace !== -1 && end - prevSpace < 15) {
      end = prevSpace;
    }
  }

  const prefix = start > 0 ? '…' : '';
  const suffix = end < clean.length ? '…' : '';
  return `${prefix}${clean.slice(start, end).trim()}${suffix}`;
}

/**
 * Finds the character index in `originalText` where a normalized term matches.
 */
function findNormalizedSubstringIndex(originalText: string, normalizedTerm: string): number {
  if (!normalizedTerm) return -1;

  // Build regex allowing optional Arabic/Persian variants and ZWNJ/diacritics between characters
  const charPattern = Array.from(normalizedTerm)
    .map((ch) => {
      if (ch === 'ی') return '[یيى]';
      if (ch === 'ک') return '[کك]';
      if (ch === ' ') return '[\\s\\u200c]+';
      return ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('[\\u200B-\\u200D\\uFEFF\\u064B-\\u065F\\u0670]*');

  try {
    const regex = new RegExp(charPattern, 'i');
    const match = regex.exec(originalText);
    return match ? match.index : -1;
  } catch {
    return originalText.toLowerCase().indexOf(normalizedTerm);
  }
}

/**
 * Performs full-text Persian-aware search across titles, topics, excerpts, body sections, and footnotes.
 */
export function searchArticles(
  articles: Article[],
  rawQuery: string,
  topicFilter: TopicId = 'all'
): ArticleSearchMatch[] {
  const normalizedQuery = normalizePersian(rawQuery);
  const queryTerms = normalizedQuery ? normalizedQuery.split(/\s+/).filter(Boolean) : [];

  const matches: ArticleSearchMatch[] = [];

  for (const article of articles) {
    if (!articleHasTopic(article, topicFilter)) {
      continue;
    }

    if (queryTerms.length === 0) {
      matches.push({
        article,
        score: 0,
        snippet: null,
        matchedIn: null,
      });
      continue;
    }

    const normTitle = normalizePersian(article.title);
    const normExcerpt = normalizePersian(article.excerpt);
    const normTopics = normalizePersian(
      getArticleTopics(article)
        .map((t) => t.label)
        .join(' ')
    );
    const normSeries = article.series
      ? normalizePersian(
          [
            article.series.title,
            getPartLabel(article.series.part, article.series.partLabel),
            article.series.partQuestion,
          ]
            .filter(Boolean)
            .join(' ')
        )
      : '';

    const sectionEntries = article.sections.map((sec) => {
      const combined = [sec.text, sec.cite, sec.caption]
        .filter(Boolean)
        .map((s) => stripInlineMarkup(s || ''))
        .join(' ');
      return {
        type: sec.type,
        raw: combined,
        norm: normalizePersian(combined),
      };
    });

    const footnoteEntries = (article.footnotes || []).map((fn) => {
      const combined = [fn.term, fn.content].filter(Boolean).join(': ');
      return {
        raw: combined,
        norm: normalizePersian(combined),
      };
    });

    const fullNormalizedText = [
      normTitle,
      normTopics,
      normSeries,
      normExcerpt,
      article.featuredImageCaption ? normalizePersian(article.featuredImageCaption) : '',
      ...sectionEntries.map((s) => s.norm),
      ...footnoteEntries.map((f) => f.norm),
    ]
      .filter(Boolean)
      .join(' ');

    // Every query word must exist somewhere in the article
    const allTermsMatch = queryTerms.every((term) => fullNormalizedText.includes(term));
    if (!allTermsMatch) {
      continue;
    }

    // Score relevance
    let score = 0;
    if (normTitle.includes(normalizedQuery)) score += 30;
    if (normExcerpt.includes(normalizedQuery)) score += 15;

    let titleHits = 0;
    let excerptHits = 0;
    let topicHits = 0;
    let bodyHits = 0;
    let footnoteHits = 0;

    for (const term of queryTerms) {
      if (normTitle.includes(term)) {
        score += 12;
        titleHits++;
      }
      if (normTopics.includes(term)) {
        score += 7;
        topicHits++;
      }
      if (normExcerpt.includes(term)) {
        score += 6;
        excerptHits++;
      }

      for (const sec of sectionEntries) {
        if (sec.norm.includes(term)) {
          score += sec.type === 'heading' || sec.type === 'subheading' ? 5 : 2;
          bodyHits++;
        }
      }

      for (const fn of footnoteEntries) {
        if (fn.norm.includes(term)) {
          score += 2;
          footnoteHits++;
        }
      }
    }

    // Pick the best body/footnote snippet if the match includes body or footnote content
    let snippet: string | null = null;
    let matchedIn: ArticleSearchMatch['matchedIn'] = null;

    if (titleHits > 0) matchedIn = 'title';
    else if (excerptHits > 0) matchedIn = 'excerpt';
    else if (topicHits > 0) matchedIn = 'topic';

    const bestSection =
      sectionEntries.find((s) => s.norm.includes(normalizedQuery)) ||
      sectionEntries.find((s) => queryTerms.some((t) => s.norm.includes(t)));

    if (bestSection) {
      snippet = buildContextSnippet(bestSection.raw, queryTerms);
      if (!matchedIn) matchedIn = 'body';
    } else if (footnoteHits > 0) {
      const bestFn =
        footnoteEntries.find((f) => f.norm.includes(normalizedQuery)) ||
        footnoteEntries.find((f) => queryTerms.some((t) => f.norm.includes(t)));
      if (bestFn) {
        snippet = buildContextSnippet(bestFn.raw, queryTerms);
        if (!matchedIn) matchedIn = 'footnote';
      }
    }

    matches.push({
      article,
      score,
      snippet,
      matchedIn,
    });
  }

  if (queryTerms.length > 0) {
    matches.sort((a, b) => b.score - a.score || b.article.number - a.article.number);
  }

  return matches;
}
