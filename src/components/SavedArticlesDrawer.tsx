import React, { useEffect } from 'react';
import { Article } from '../types';
import { toPersianDigits, formatArticleNumber, formatReadingTime } from '../utils/persian';
import { Bookmark, X, Trash2, BookOpen, ArrowLeft, CornerDownLeft } from 'lucide-react';

interface SavedArticlesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  bookmarkedIds: string[];
  onSelectArticle: (article: Article) => void;
  onRemoveBookmark: (articleId: string) => void;
  onClearAll: () => void;
}

export const SavedArticlesDrawer: React.FC<SavedArticlesDrawerProps> = ({
  isOpen,
  onClose,
  articles,
  bookmarkedIds,
  onSelectArticle,
  onRemoveBookmark,
  onClearAll,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const savedArticles = articles.filter((art) => bookmarkedIds.includes(art.id));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="saved-drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      {/* Drawer Panel */}
      <div
        className="w-full max-w-md bg-[var(--bg-page)] border-s border-[var(--border-subtle)] h-full flex flex-col shadow-2xl text-right animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 sm:p-6 border-b border-[var(--border-divider)] flex items-center justify-between gap-4 bg-[var(--bg-surface)]/60">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-[var(--accent-surface)] text-[var(--accent)]">
              <Bookmark className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 id="saved-drawer-title" className="font-serif-persian font-bold text-lg text-[var(--text-primary)]">
                یادداشت‌های نشان‌شده
              </h2>
              <p className="text-[11px] text-[var(--text-muted)]">
                فهرست مطالعه‌ی شخصی برای خلوت و سر فرصت
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
            title="بستن (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Count & Clear All bar */}
        {savedArticles.length > 0 && (
          <div className="px-5 py-2.5 bg-[var(--bg-surface)]/30 border-b border-[var(--border-divider)] flex items-center justify-between text-xs text-[var(--text-muted)]">
            <div className="flex items-center gap-1.5">
              <span>ذخیره شده:</span>
              <strong className="font-mono text-[var(--text-primary)] font-semibold">
                {toPersianDigits(savedArticles.length)}
              </strong>
              <span>جستار</span>
            </div>

            <button
              onClick={onClearAll}
              className="text-[11px] text-[var(--text-muted)] hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer"
              title="پاک کردن همه نشان‌ها"
            >
              <Trash2 className="w-3 h-3" />
              <span>حذف همه</span>
            </button>
          </div>
        )}

        {/* Articles List or Empty State */}
        <div className="flex-1 overflow-y-auto divide-y divide-[var(--border-divider)] p-3">
          {savedArticles.length > 0 ? (
            savedArticles.map((article) => (
              <div
                key={article.id}
                className="group p-3.5 rounded-lg hover:bg-[var(--bg-surface)]/70 transition-colors flex items-start gap-3.5 relative"
              >
                {/* Article Number */}
                <span className="font-mono text-xs font-semibold text-[var(--accent)] mt-0.5 shrink-0">
                  #{formatArticleNumber(article.number)}
                </span>

                {/* Content */}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => {
                    onSelectArticle(article);
                    onClose();
                  }}
                >
                  <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] mb-1">
                    <span className="font-medium text-[var(--accent)]">{article.topicLabel}</span>
                    <span>·</span>
                    <span className="font-mono">{formatReadingTime(article.readingTimeMinutes)}</span>
                  </div>

                  <h3 className="font-serif-persian font-bold text-base text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors line-clamp-2 leading-snug mb-1">
                    {article.title}
                  </h3>

                  <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>

                {/* Remove from bookmarks button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveBookmark(article.id);
                  }}
                  className="shrink-0 p-1.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-[var(--bg-surface)] rounded transition-colors cursor-pointer"
                  title="حذف از نشان‌شده‌ها"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] mb-4">
                <Bookmark className="w-5 h-5" />
              </div>
              <h3 className="font-serif-persian text-lg font-bold text-[var(--text-primary)] mb-2">
                هنوز یادداشتی نشان نشده است
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-xs mb-6 font-body-persian">
                هنگام مطالعه‌ی هر یادداشت، با فشردن نماد نشان (Bookmark) در بالای صفحه، می‌توانید آن را به این فهرست بیفزایید تا در فرصتی آرام بخوانید.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-md transition-colors cursor-pointer"
              >
                مرور جستارها
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-divider)] bg-[var(--bg-surface)]/50 text-center text-[11px] text-[var(--text-muted)]">
          <span>این یادداشت‌ها روی همین مرورگر برای شما ذخیره می‌شوند.</span>
        </div>
      </div>
    </div>
  );
};
