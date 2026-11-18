import React, { useMemo } from 'react';
import { Article, SeriesInfo, TopicId, TopicInfo } from '../types';
import { ArticleRow } from './ArticleRow';
import { toPersianDigits } from '../utils/persian';
import { buildFeedEntries } from '../utils/series';
import { ArrowRight } from 'lucide-react';

interface TopicPageProps {
  topic: TopicInfo;
  allTopics: TopicInfo[];
  articles: Article[];
  seriesList: SeriesInfo[];
  onSelectTopic: (topicId: TopicId) => void;
  onSelectArticle: (article: Article) => void;
  onSelectSeries?: (seriesId: string) => void;
  onBackToArticles: () => void;
}

export const TopicPage: React.FC<TopicPageProps> = ({
  topic,
  allTopics,
  articles,
  seriesList,
  onSelectTopic,
  onSelectArticle,
  onSelectSeries,
  onBackToArticles,
}) => {
  const topicEntries = useMemo(() => {
    const entries = buildFeedEntries(articles, seriesList);
    if (topic.id === 'all') return entries;
    return entries.filter((entry) => entry.topics.some((t) => t.id === topic.id));
  }, [articles, seriesList, topic.id]);

  return (
    <div className="py-10 sm:py-14">
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

        {/* Curatorial Topic Intro Card (Archival & Minimalist) */}
        <div className="border border-[var(--border-divider)] bg-[var(--bg-surface)]/60 rounded-xl p-6 sm:p-8 mb-10 text-right">
          <div className="flex items-center justify-between gap-4 mb-3">
            <span className="font-mono text-xs uppercase tracking-wider text-[var(--accent)] font-semibold">
              موضوع تخصصی
            </span>
            <span className="font-mono text-xs text-[var(--text-muted)]">
              {toPersianDigits(topicEntries.length)} عنوان
            </span>
          </div>

          <h1 className="font-serif-persian text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--text-primary)] mb-3">
            {topic.label}
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl font-body-persian mb-6">
            {topic.description}
          </p>

          {/* Quick switcher to other topics */}
          <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center gap-2">
            <span className="text-xs text-[var(--text-muted)] ml-2">سایر موضوعات:</span>
            {allTopics
              .filter((t) => t.id !== topic.id)
              .map((other) => (
                <button
                  key={other.id}
                  onClick={() => onSelectTopic(other.id)}
                  className="px-2.5 py-1 text-xs rounded border border-[var(--border-subtle)] bg-[var(--bg-page)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors cursor-pointer"
                >
                  {other.label}
                </button>
              ))}
          </div>
        </div>

        {/* Numbered Entries List */}
        <div className="space-y-1">
          {topicEntries.map((entry) => (
            <ArticleRow
              key={entry.id}
              article={entry.article}
              feedEntry={entry}
              onSelect={onSelectArticle}
              onSelectTopic={onSelectTopic}
              onSelectSeries={onSelectSeries}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
