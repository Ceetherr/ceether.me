import React, { useState, useEffect } from 'react';
import { Article, SeriesInfo } from '../types';
import { formatReadingTime } from '../utils/persian';
import { getPartLabel, getSeriesArticles } from '../utils/series';
import { ArrowRight, BookOpen, Check, Clock, Layers } from 'lucide-react';

interface SeriesPageProps {
  series: SeriesInfo;
  allSeries: SeriesInfo[];
  articles: Article[];
  readArticleIds: string[];
  onSelectSeries: (seriesId: string) => void;
  onSelectArticle: (article: Article) => void;
  onBackToArticles: () => void;
}

export const SeriesPage: React.FC<SeriesPageProps> = ({
  series,
  allSeries,
  articles,
  readArticleIds,
  onSelectSeries,
  onSelectArticle,
  onBackToArticles,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(false);
    const rafId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    });
    return () => cancelAnimationFrame(rafId);
  }, [series.id]);

  const seriesArticles = getSeriesArticles(articles, series.id);
  const totalMinutes = seriesArticles.reduce((acc, a) => acc + a.readingTimeMinutes, 0);

  const publishedParts = new Set(seriesArticles.map((a) => a.series?.part));
  const upcomingParts = (series.plannedParts || [])
    .filter((p) => !publishedParts.has(p.part))
    .sort((a, b) => a.part - b.part);

  return (
    <div
      className={`py-10 sm:py-14 transition-all duration-300 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={onBackToArticles}
            className="group inline-flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            <span>بازگشت به آرشیو مقاله‌ها</span>
          </button>
        </div>

        {/* Curatorial Series Intro Card */}
        <div className="border border-[var(--border-divider)] bg-[var(--bg-surface)]/60 rounded-xl p-6 sm:p-8 mb-10 text-right">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--accent)] font-semibold">
              <Layers className="w-3.5 h-3.5" />
              <span>سلسله جستار</span>
            </span>

            {totalMinutes > 0 && (
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--text-muted)]">
                <Clock className="w-3.5 h-3.5" />
                <span>مجموع زمان مطالعه: {formatReadingTime(totalMinutes)}</span>
              </span>
            )}
          </div>

          <h1 className="font-serif-persian text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-3">
            {series.title}
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl font-body-persian">
            {series.description}
          </p>

          {/* Other series switcher if multiple series exist */}
          {allSeries.length > 1 && (
            <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center gap-2">
              <span className="text-xs text-[var(--text-muted)] ml-2">سایر مجموعه‌ها:</span>
              {allSeries
                .filter((s) => s.id !== series.id)
                .map((other) => (
                  <button
                    key={other.id}
                    onClick={() => onSelectSeries(other.id)}
                    className="px-2.5 py-1 text-xs rounded border border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors cursor-pointer"
                  >
                    {other.title}
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Ordered Parts List (پارت اول + question, no bare 1 2 3 digits) */}
        <div className="space-y-4">
          {seriesArticles.map((article) => {
            const partLabel = getPartLabel(
              article.series?.part || 1,
              article.series?.partLabel
            );
            const questionOrPrompt = article.series?.partQuestion || article.title;
            const isRead = readArticleIds.includes(article.id);

            return (
              <article
                key={article.id}
                onClick={() => onSelectArticle(article)}
                className="group border border-[var(--border-divider)] hover:border-[var(--accent)]/60 bg-[var(--bg-surface)]/30 hover:bg-[var(--bg-surface)]/70 rounded-xl p-5 sm:p-6 transition-all cursor-pointer text-right"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2.5 py-0.5 rounded-md bg-[var(--accent-surface)] text-[var(--accent)] font-semibold border border-[var(--accent-subtle)]">
                      {partLabel}
                    </span>

                    {isRead && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                        <Check className="w-3 h-3" />
                        <span>خوانده‌شده</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--text-muted)]">
                    <span>{article.shamsiDate}</span>
                    <span>·</span>
                    <span>{formatReadingTime(article.readingTimeMinutes)}</span>
                  </div>
                </div>

                {/* Part Question / Prompt */}
                <h2 className="font-serif-persian text-xl sm:text-2xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-snug mb-2">
                  {questionOrPrompt}
                </h2>

                {article.series?.partQuestion && article.series.partQuestion !== article.title && (
                  <div className="text-xs font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[var(--accent)]/80 shrink-0" />
                    <span>{article.title}</span>
                  </div>
                )}

                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2 font-body-persian mb-3">
                  {article.excerpt}
                </p>

                <div className="text-xs font-medium text-[var(--accent)] inline-flex items-center gap-1.5 group-hover:gap-2 transition-all">
                  <span>خوندن {partLabel}</span>
                  <span>←</span>
                </div>
              </article>
            );
          })}

          {/* Optional upcoming parts */}
          {upcomingParts.map((upcoming) => {
            const partLabel = getPartLabel(upcoming.part, upcoming.partLabel);
            return (
              <div
                key={`upcoming-${upcoming.part}`}
                className="border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface)]/15 rounded-xl p-5 sm:p-6 text-right opacity-75"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[var(--bg-surface)] text-[var(--text-muted)] text-xs font-semibold border border-[var(--border-subtle)]">
                    {partLabel}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] font-body-persian">
                    در دست نگارش
                  </span>
                </div>
                <p className="font-serif-persian text-lg sm:text-xl font-bold text-[var(--text-secondary)] leading-snug">
                  {upcoming.partQuestion}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
