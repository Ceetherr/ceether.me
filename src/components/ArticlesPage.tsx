import React, { useState, useMemo } from 'react';
import { Article, SeriesInfo, TopicId, TopicInfo } from '../types';
import { ArticleRow } from './ArticleRow';
import { TopicChips } from './TopicChips';
import { toPersianDigits } from '../utils/persian';
import { searchArticles } from '../utils/search';
import { buildFeedEntries } from '../utils/series';
import { useDebounce } from '../hooks/useDebounce';
import { Search, X, Loader2 } from 'lucide-react';

interface ArticlesPageProps {
  articles: Article[];
  seriesList: SeriesInfo[];
  topics: TopicInfo[];
  selectedTopic: TopicId;
  onSelectTopic: (topicId: TopicId) => void;
  onSelectArticle: (article: Article) => void;
  onSelectSeries?: (seriesId: string) => void;
  topicCounts: Record<TopicId, number>;
}

export const ArticlesPage: React.FC<ArticlesPageProps> = ({
  articles,
  seriesList,
  topics,
  selectedTopic,
  onSelectTopic,
  onSelectArticle,
  onSelectSeries,
  topicCounts,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'readingTime'>('newest');

  // Debounced search query (250ms) to prevent unnecessary re-computations on each keystroke
  const debouncedQuery = useDebounce(searchInput, 250);
  const isDebouncing = searchInput !== debouncedQuery;
  const isSearching = debouncedQuery.trim().length > 0;

  const collapsedFeedEntries = useMemo(() => {
    const allEntries = buildFeedEntries(articles, seriesList);
    const filtered =
      selectedTopic === 'all'
        ? allEntries
        : allEntries.filter((entry) => entry.topics.some((t) => t.id === selectedTopic));

    return [...filtered].sort((a, b) => {
      if (sortBy === 'newest') return b.sortOrder - a.sortOrder;
      if (sortBy === 'oldest') return a.sortOrder - b.sortOrder;
      if (sortBy === 'readingTime') {
        return b.totalReadingTimeMinutes - a.totalReadingTimeMinutes;
      }
      return 0;
    });
  }, [articles, seriesList, selectedTopic, sortBy]);

  const filteredMatches = useMemo(() => {
    if (!isSearching) return [];
    const matches = searchArticles(articles, debouncedQuery, selectedTopic);

    return [...matches].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (sortBy === 'newest') return b.article.number - a.article.number;
      if (sortBy === 'oldest') return a.article.number - b.article.number;
      if (sortBy === 'readingTime') {
        return b.article.readingTimeMinutes - a.article.readingTimeMinutes;
      }
      return 0;
    });
  }, [articles, isSearching, selectedTopic, debouncedQuery, sortBy]);

  const totalFeedCount = useMemo(
    () => buildFeedEntries(articles, seriesList).length,
    [articles, seriesList]
  );

  const visibleCount = isSearching ? filteredMatches.length : collapsedFeedEntries.length;

  return (
    <div className="py-10 sm:py-14">
      <div className="max-w-4xl mx-auto px-5 sm:px-8">
        {/* Page Header */}
        <div className="border-b border-[var(--border-divider)] pb-6 mb-8 text-right">
          <span className="font-mono text-xs uppercase tracking-wider text-[var(--accent)] font-semibold">
            آرشیو کامل
          </span>
          <h1 className="font-serif-persian text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mt-1.5 mb-2">
            دفتر جستارها و مقاله‌ها
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            مجموعه کامل اندیشه‌ها، نقدهای فلسفی، کاوش‌های علمی و تاملات زیسته به ترتیب زمانی معکوس.
          </p>
        </div>

        {/* Search & Filter Controls */}
        <div className="space-y-4 mb-8">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="جستجوی تمام‌متن در عنوان، چکیده و متن کامل جستارها (مثلاً: فلسفه، شمن، دین)..."
              className="w-full pl-10 pr-11 py-2.5 text-sm bg-[var(--bg-surface)] border border-[var(--border-divider)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors text-right"
            />
            {isDebouncing ? (
              <Loader2 className="absolute right-3.5 top-3 w-4 h-4 text-[var(--accent)] animate-spin" />
            ) : (
              <Search className="absolute right-3.5 top-3 w-4 h-4 text-[var(--text-muted)]" />
            )}
            {searchInput && (
              <button
                onClick={() => setSearchInput('')}
                className="absolute left-3 top-2.5 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                title="پاک کردن جستجو"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Topic Filter Chips */}
          <TopicChips
            topics={topics}
            selectedTopic={selectedTopic}
            onSelectTopic={onSelectTopic}
            topicCounts={topicCounts}
          />

          {/* Result Count and Sort Selector */}
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border-divider)]">
            <div className="flex items-center gap-2">
              <span>نمایش </span>
              <strong className="font-mono text-[var(--text-primary)]">
                {toPersianDigits(visibleCount)}
              </strong>
              {isSearching ? (
                <>
                  <span> نتیجه از مجموع </span>
                  <span className="font-mono">{toPersianDigits(articles.length)}</span>
                  <span> بخش</span>
                  <span className="text-[var(--accent)] text-[11px] mr-1">
                    (برای عبارت «{debouncedQuery}»)
                  </span>
                </>
              ) : (
                <>
                  <span> عنوان از مجموع </span>
                  <span className="font-mono">{toPersianDigits(totalFeedCount)}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px]">مرتب‌سازی:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'readingTime')}
                className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded px-2 py-1 text-xs cursor-pointer focus:outline-none focus:border-[var(--accent)]"
              >
                <option value="newest">جدیدترین (شماره معکوس)</option>
                <option value="oldest">قدیمی‌ترین</option>
                <option value="readingTime">طولانی‌ترین زمان مطالعه</option>
              </select>
            </div>
          </div>
        </div>

        {/* Articles / Unified Series List */}
        {isSearching ? (
          filteredMatches.length > 0 ? (
            <div className="divide-y divide-[var(--border-divider)]">
              {filteredMatches.map(({ article, snippet }) => (
                <ArticleRow
                  key={article.id}
                  article={article}
                  onSelect={onSelectArticle}
                  onSelectTopic={onSelectTopic}
                  onSelectSeries={onSelectSeries}
                  searchQuery={debouncedQuery}
                  matchSnippet={snippet}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-[var(--bg-surface)]/40 rounded-xl border border-[var(--border-divider)] my-8">
              <p className="font-serif-persian text-lg text-[var(--text-primary)] mb-2">
                جستاری با مشخصات مورد نظر یافت نشد
              </p>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                هیچ جستاری شامل عبارت «{debouncedQuery}» در عنوان، چکیده یا متن کامل یافت نشد.
              </p>
              <button
                onClick={() => {
                  setSearchInput('');
                  onSelectTopic('all');
                }}
                className="px-4 py-2 text-xs font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-md transition-colors cursor-pointer"
              >
                پاک کردن فیلترها و مشاهده همه
              </button>
            </div>
          )
        ) : collapsedFeedEntries.length > 0 ? (
          <div className="divide-y divide-[var(--border-divider)]">
            {collapsedFeedEntries.map((entry) => (
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
        ) : (
          <div className="text-center py-16 px-4 bg-[var(--bg-surface)]/40 rounded-xl border border-[var(--border-divider)] my-8">
            <p className="font-serif-persian text-lg text-[var(--text-primary)] mb-2">
              جستاری در این موضوع یافت نشد
            </p>
            <button
              onClick={() => onSelectTopic('all')}
              className="px-4 py-2 text-xs font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-md transition-colors cursor-pointer"
            >
              مشاهده همه‌ی موضوعات
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
