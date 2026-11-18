import React from 'react';
import { Article } from '../types';
import { formatArticleNumber, formatReadingTime } from '../utils/persian';
import { getArticleTopics } from '../utils/topics';
import { FeedEntry, getPartLabel, getPartCountLabel } from '../utils/series';
import { HighlightedText } from './HighlightedText';
import { Layers } from 'lucide-react';

interface ArticleRowProps {
  article: Article;
  feedEntry?: FeedEntry;
  onSelect: (article: Article) => void;
  onSelectTopic?: (topicId: Article['topicId']) => void;
  onSelectSeries?: (seriesId: string) => void;
  searchQuery?: string;
  matchSnippet?: string | null;
}

export const ArticleRow: React.FC<ArticleRowProps> = ({
  article,
  feedEntry,
  onSelect,
  onSelectTopic,
  onSelectSeries,
  searchQuery,
  matchSnippet,
}) => {
  const isSeriesGroup = feedEntry?.kind === 'series' && Boolean(feedEntry.seriesInfo);

  const topics = isSeriesGroup && feedEntry ? feedEntry.topics : getArticleTopics(article);
  const displayNumber = feedEntry ? feedEntry.displayNumber : article.number;
  const displayDate = isSeriesGroup && feedEntry ? feedEntry.latestShamsiDate : article.shamsiDate;
  const displayReadingTime =
    isSeriesGroup && feedEntry ? feedEntry.totalReadingTimeMinutes : article.readingTimeMinutes;

  const seriesPartLabel = article.series
    ? getPartLabel(article.series.part, article.series.partLabel)
    : null;

  const seriesPartsCount = isSeriesGroup && feedEntry?.parts ? feedEntry.parts.length : 0;

  const handleRowClick = () => {
    if (isSeriesGroup && feedEntry?.seriesInfo && onSelectSeries) {
      onSelectSeries(feedEntry.seriesInfo.id);
    } else {
      onSelect(article);
    }
  };

  return (
    <article
      onClick={handleRowClick}
      className="group relative border-b border-[var(--border-divider)] py-6 sm:py-7 transition-colors hover:bg-[var(--bg-surface)]/50 px-2 sm:px-4 rounded-lg -mx-2 sm:-mx-4 cursor-pointer"
    >
      <div className="flex items-start gap-4 sm:gap-6">
        {/* Entry Number in reverse order (#۰۴, #۰۳, ...) */}
        <div className="shrink-0 pt-1">
          <span className="font-mono text-xs sm:text-sm tracking-wider text-[var(--text-muted)] group-hover:text-[var(--accent)] font-semibold select-none">
            #{formatArticleNumber(displayNumber)}
          </span>
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          {/* Metadata line above title (Clean unboxed typography) */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)] mb-1.5 font-body-persian">
            <div className="inline-flex flex-wrap items-center gap-1.5">
              {topics.map((t, idx) => (
                <React.Fragment key={t.id}>
                  {idx > 0 && (
                    <span aria-hidden="true" className="text-[var(--border-subtle)]">،</span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectTopic) onSelectTopic(t.id);
                    }}
                    className="text-[var(--accent)] hover:underline cursor-pointer font-medium"
                  >
                    {t.label}
                  </button>
                </React.Fragment>
              ))}
            </div>

            {isSeriesGroup && feedEntry?.seriesInfo ? (
              <>
                <span aria-hidden="true" className="text-[var(--border-subtle)]">·</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--accent-surface)] text-[var(--accent)] text-[11px] font-medium border border-[var(--accent-subtle)]">
                  <Layers className="w-3 h-3" />
                  <span>مجموعه · {getPartCountLabel(seriesPartsCount)}</span>
                </span>
              </>
            ) : (
              article.series &&
              seriesPartLabel && (
                <>
                  <span aria-hidden="true" className="text-[var(--border-subtle)]">·</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectSeries && article.series) {
                        onSelectSeries(article.series.id);
                      }
                    }}
                    className="px-2 py-0.5 rounded bg-[var(--accent-surface)] text-[var(--accent)] hover:underline cursor-pointer text-[11px] font-medium border border-[var(--accent-subtle)]"
                    title={`مشاهده همه‌ی بخش‌های مجموعه «${article.series.title}»`}
                  >
                    {article.series.title} ({seriesPartLabel})
                  </button>
                </>
              )
            )}

            <span aria-hidden="true" className="text-[var(--border-subtle)]">·</span>
            <time className="font-mono text-[11px] text-[var(--text-secondary)]">
              {displayDate}
            </time>
            <span aria-hidden="true" className="text-[var(--border-subtle)]">·</span>
            <span className="font-mono text-[11px] text-[var(--text-secondary)]">
              {formatReadingTime(displayReadingTime)}
            </span>
          </div>

          {/* Unified Series Title OR Article Title */}
          <h2 className="font-serif-persian text-lg sm:text-xl md:text-2xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-snug mb-2">
            {isSeriesGroup && feedEntry?.seriesInfo ? (
              feedEntry.seriesInfo.title
            ) : (
              <HighlightedText text={article.title} query={searchQuery || ''} />
            )}
          </h2>

          {/* Unified Series Description OR 1-2 line Excerpt */}
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2 font-body-persian">
            {isSeriesGroup && feedEntry?.seriesInfo ? (
              feedEntry.seriesInfo.description
            ) : (
              <HighlightedText text={article.excerpt} query={searchQuery || ''} />
            )}
          </p>

          {/* Subtle ordinal parts preview on series rows (no bare digits) */}
          {isSeriesGroup && feedEntry?.parts && feedEntry.parts.length > 0 && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-body-persian">
              {feedEntry.parts.map((part, idx) => (
                <React.Fragment key={part.id}>
                  {idx > 0 && <span aria-hidden="true">·</span>}
                  <span className="text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors">
                    {getPartLabel(part.series?.part || idx + 1, part.series?.partLabel)}
                  </span>
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Optional body/footnote context snippet when searching */}
          {!isSeriesGroup && matchSnippet && searchQuery && searchQuery.trim() && (
            <p className="mt-2.5 text-xs text-[var(--text-muted)] leading-relaxed bg-[var(--bg-surface)]/70 border-r-2 border-[var(--accent)]/60 pr-2.5 py-1 rounded-l font-body-persian line-clamp-2">
              <HighlightedText text={matchSnippet} query={searchQuery} />
            </p>
          )}
        </div>

        {/* Subtle arrow indicator on desktop hover */}
        <div className="hidden sm:flex shrink-0 self-center text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:-translate-x-1 transition-all">
          <span className="text-base">←</span>
        </div>
      </div>
    </article>
  );
};
