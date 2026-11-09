import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Article, TopicId } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { normalizePersian, toPersianDigits, formatArticleNumber, formatReadingTime } from '../utils/persian';
import { HighlightedText } from './HighlightedText';
import { Search, X, Loader2, ArrowLeft, CornerDownLeft } from 'lucide-react';

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
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search query
  const debouncedQuery = useDebounce(searchInput, 250);
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
    }
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Full-text filtered results
  const results = useMemo(() => {
    const normalizedQuery = normalizePersian(debouncedQuery).trim();

    return articles.filter((art) => {
      // Topic filter
      if (selectedTopic !== 'all' && art.topicId !== selectedTopic) {
        return false;
      }

      if (!normalizedQuery) return true;

      const normTitle = normalizePersian(art.title);
      const normExcerpt = normalizePersian(art.excerpt);
      const normTopic = normalizePersian(art.topicLabel);

      const terms = normalizedQuery.split(/\s+/).filter(Boolean);
      return terms.every(
        (term) =>
          normTitle.includes(term) ||
          normExcerpt.includes(term) ||
          normTopic.includes(term)
      );
    });
  }, [articles, debouncedQuery, selectedTopic]);

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
            ref={inputRef}
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="جستجوی سریع در عنوان و چکیده جستارها..."
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

        {/* Quick Topic Filters Strip */}
        <div className="px-4 py-2 border-b border-[var(--border-divider)] bg-[var(--bg-surface)]/30 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[11px] text-[var(--text-muted)] ml-2 whitespace-nowrap shrink-0">
            موضوع:
          </span>
          {[
            { id: 'all', label: 'همه' },
            { id: 'philosophy', label: 'فلسفه' },
            { id: 'science', label: 'علم' },
            { id: 'technology', label: 'فناوری' },
            { id: 'reflections', label: 'تاملات' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTopic(t.id as TopicId)}
              className={`px-2.5 py-1 rounded text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedTopic === t.id
                  ? 'bg-[var(--accent)] text-white font-medium'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-divider)] p-2">
          {results.length > 0 ? (
            results.map((art) => (
              <div
                key={art.id}
                onClick={() => {
                  onSelectArticle(art);
                  onClose();
                }}
                className="group p-3.5 sm:p-4 rounded-lg hover:bg-[var(--bg-surface)] transition-colors cursor-pointer flex items-start gap-4"
              >
                <span className="font-mono text-xs font-semibold text-[var(--text-muted)] group-hover:text-[var(--accent)] mt-1 shrink-0">
                  #{formatArticleNumber(art.number)}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] mb-1">
                    <span className="text-[var(--accent)] font-medium">{art.topicLabel}</span>
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
                </div>

                <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity text-[var(--accent)]">
                  <CornerDownLeft className="w-4 h-4" />
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-sm text-[var(--text-muted)]">
              <p className="font-serif-persian text-base text-[var(--text-primary)] mb-1">
                جستاری یافت نشد
              </p>
              <p className="text-xs">
                عبارت «{debouncedQuery}» در عنوان یا چکیده‌ی جستارها موجود نیست.
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
            <span>بستن: <kbd className="font-mono bg-[var(--bg-page)] border border-[var(--border-subtle)] px-1 rounded">Esc</kbd></span>
          </div>
        </div>
      </div>
    </div>
  );
};
