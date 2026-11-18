import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Article, TopicId } from '../types';
import { TOPICS } from '../data/articles';
import { useDebounce } from '../hooks/useDebounce';
import { toPersianDigits, formatArticleNumber, formatReadingTime } from '../utils/persian';
import { searchArticles } from '../utils/search';
import { getArticleTopics } from '../utils/topics';
import { HighlightedText } from './HighlightedText';
import { Search, X, Loader2, CornerDownLeft } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  onSelectArticle: (article: Article) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  articles,
  onSelectArticle,
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<TopicId>('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search query
  const debouncedQuery = useDebounce(searchInput, 220);
  const isDebouncing = searchInput !== debouncedQuery;

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setSearchInput('');
      setSelectedTopic('all');
      setActiveIndex(0);
    }
  }, [isOpen]);

  // Full-text filtered results across titles, excerpts, topics, body sections, and footnotes
  const results = useMemo(
    () => searchArticles(articles, debouncedQuery, selectedTopic),
    [articles, debouncedQuery, selectedTopic]
  );

  // Reset keyboard selection when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery, selectedTopic, results.length]);

  // Keyboard navigation: Escape, ArrowDown, ArrowUp, Enter
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        if (results.length > 0) {
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % results.length);
        }
      } else if (e.key === 'ArrowUp') {
        if (results.length > 0) {
          e.preventDefault();
          setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
        }
      } else if (e.key === 'Enter' && results.length > 0) {
        const chosen = results[activeIndex]?.article;
        if (chosen) {
          e.preventDefault();
          onSelectArticle(chosen);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, results, activeIndex, onSelectArticle]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-modal-title"
      className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-4 bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[var(--bg-page)] border border-[var(--border-subtle)] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative border-b border-[var(--border-divider)] p-4 sm:p-5 flex items-center gap-3 bg-[var(--bg-surface)]/70">
          <div className="shrink-0 text-[var(--text-muted)]">
            {isDebouncing ? (
              <Loader2 className="w-5 h-5 text-[var(--accent)] animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-[var(--text-secondary)]" />
            )}
          </div>

          <input
            id="search-modal-title"
            ref={inputRef}
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="جستجو در عنوان، چکیده و متن کامل جستارها..."
            className="flex-1 bg-transparent border-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-base sm:text-lg focus:outline-none font-body-persian text-right"
          />

          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              title="پاک کردن"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onClose}
            className="p-1.5 rounded-md border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            title="بستن (Esc)"
          >
            <span className="font-mono text-[11px]">Esc</span>
          </button>
        </div>

        {/* Quick Topic Filters Strip (Dynamic from active TOPICS) */}
        <div className="px-4 py-2 border-b border-[var(--border-divider)] bg-[var(--bg-surface)]/30 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[11px] text-[var(--text-muted)] ml-2 whitespace-nowrap shrink-0">
            موضوع:
          </span>
          {TOPICS.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTopic(t.id)}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedTopic === t.id
                  ? 'bg-[var(--accent)] text-white font-medium'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
              }`}
            >
              {t.id === 'all' ? 'همه' : t.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-divider)] p-2">
          {results.length > 0 ? (
            results.map(({ article: art, snippet }, idx) => {
              const topicsLabel = getArticleTopics(art)
                .map((t) => t.label)
                .join('، ');
              const isHighlightedRow = idx === activeIndex;

              return (
                <div
                  key={art.id}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => {
                    onSelectArticle(art);
                    onClose();
                  }}
                  className={`group p-3.5 sm:p-4 rounded-lg transition-colors cursor-pointer flex items-start gap-4 ${
                    isHighlightedRow ? 'bg-[var(--bg-surface)]' : 'hover:bg-[var(--bg-surface)]'
                  }`}
                >
                  <span className="font-mono text-xs font-semibold text-[var(--text-muted)] group-hover:text-[var(--accent)] mt-1 shrink-0">
                    #{formatArticleNumber(art.number)}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--text-muted)] mb-1">
                      <span className="text-[var(--accent)] font-medium">{topicsLabel}</span>
                      <span>·</span>
                      <span className="font-mono">{art.shamsiDate}</span>
                      <span>·</span>
                      <span className="font-mono">{formatReadingTime(art.readingTimeMinutes)}</span>
                    </div>

                    <h3 className="font-serif-persian font-bold text-base sm:text-lg text-[var(--text-primary)] group-hover:text-[var(--accent)] leading-snug mb-1">
                      <HighlightedText text={art.title} query={debouncedQuery} />
                    </h3>

                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      <HighlightedText text={art.excerpt} query={debouncedQuery} />
                    </p>

                    {snippet && debouncedQuery.trim() && (
                      <p className="mt-2 text-[11px] text-[var(--text-muted)] leading-relaxed bg-[var(--bg-page)]/80 border-r-2 border-[var(--accent)]/60 pr-2 py-1 rounded-l line-clamp-2">
                        <HighlightedText text={snippet} query={debouncedQuery} />
                      </p>
                    )}
                  </div>

                  <div
                    className={`shrink-0 self-center transition-opacity text-[var(--accent)] ${
                      isHighlightedRow ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  >
                    <CornerDownLeft className="w-4 h-4" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-sm text-[var(--text-muted)]">
              <p className="font-serif-persian text-base text-[var(--text-primary)] mb-1">
                جستاری یافت نشد
              </p>
              <p className="text-xs">
                عبارت «{debouncedQuery}» در عنوان، چکیده یا متن جستارها موجود نیست.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer with Stats & Shortcut tips */}
        <div className="p-3 border-t border-[var(--border-divider)] bg-[var(--bg-surface)]/50 flex items-center justify-between text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <span>یافته‌ها:</span>
            <strong className="font-mono text-[var(--text-primary)]">
              {toPersianDigits(results.length)}
            </strong>
            <span>جستار</span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px]">
            <span>برای انتخاب: کلیک یا بازگشت</span>
            <span>·</span>
            <span>
              بستن:{' '}
              <kbd className="font-mono bg-[var(--bg-page)] border border-[var(--border-subtle)] px-1 rounded">
                Esc
              </kbd>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
