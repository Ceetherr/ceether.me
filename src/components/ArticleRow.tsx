import React from 'react';
import { Article } from '../types';
import { formatArticleNumber, formatReadingTime, toPersianDigits } from '../utils/persian';
import { HighlightedText } from './HighlightedText';

interface ArticleRowProps {
  article: Article;
  onSelect: (article: Article) => void;
  onSelectTopic?: (topicId: Article['topicId']) => void;
  searchQuery?: string;
}

export const ArticleRow: React.FC<ArticleRowProps> = ({
  article,
  onSelect,
  onSelectTopic,
  searchQuery,
}) => {
  return (
    <article className="group relative border-b border-[var(--border-divider)] py-6 sm:py-7 transition-colors hover:bg-[var(--bg-surface)]/50 px-2 sm:px-4 rounded-lg -mx-2 sm:-mx-4 cursor-pointer">
      <div className="flex items-start gap-4 sm:gap-6">
        {/* Article Number in reverse order (#۰۸, #۰۷, ...) */}
        <div className="shrink-0 pt-1">
          <span className="font-mono text-xs sm:text-sm tracking-wider text-[var(--text-muted)] group-hover:text-[var(--accent)] font-semibold select-none">
            #{formatArticleNumber(article.number)}
          </span>
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          {/* Metadata line above title (Clean unboxed typography) */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)] mb-1.5 font-body-persian">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onSelectTopic) onSelectTopic(article.topicId);
              }}
              className="text-[var(--accent)] hover:underline cursor-pointer font-medium"
            >
              {article.topicLabel}
            </button>
            <span aria-hidden="true" className="text-[var(--border-subtle)]">·</span>
            <time className="font-mono text-[11px] text-[var(--text-secondary)]">
              {article.shamsiDate}
            </time>
            <span aria-hidden="true" className="text-[var(--border-subtle)]">·</span>
            <span className="font-mono text-[11px] text-[var(--text-secondary)]">
              {formatReadingTime(article.readingTimeMinutes)}
            </span>
          </div>

          {/* Article Title with search match highlighting */}
          <h2
            onClick={() => onSelect(article)}
            className="font-serif-persian text-lg sm:text-xl md:text-2xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-snug mb-2"
          >
            <HighlightedText text={article.title} query={searchQuery || ''} />
          </h2>

          {/* 1-2 line Excerpt with search match highlighting */}
          <p
            onClick={() => onSelect(article)}
            className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2 font-body-persian"
          >
            <HighlightedText text={article.excerpt} query={searchQuery || ''} />
          </p>
        </div>

        {/* Subtle arrow indicator on desktop hover */}
        <div className="hidden sm:flex shrink-0 self-center text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:-translate-x-1 transition-all">
          <span className="text-base">←</span>
        </div>
      </div>
    </article>
  );
};
