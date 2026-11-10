import React, { useState, useEffect } from 'react';
import { Article } from '../types';
import { formatArticleNumber, formatReadingTime, toPersianDigits, copyToClipboard } from '../utils/persian';
import { ArrowRight, Share2, Check, Bookmark, BookOpen, Clock, Tag, ArrowLeft, Copy } from 'lucide-react';

interface ArticleViewProps {
  article: Article;
  allArticles: Article[];
  onBack: () => void;
  onSelectArticle: (article: Article) => void;
  onSelectTopic: (topicId: Article['topicId']) => void;
  onScrollProgress?: (progress: number) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (articleId: string) => void;
}

export const ArticleView: React.FC<ArticleViewProps> = ({
  article,
  allArticles,
  onBack,
  onSelectArticle,
  onSelectTopic,
  onScrollProgress,
  isBookmarked = false,
  onToggleBookmark,
}) => {
  const [copied, setCopied] = useState(false);
  const [bookmarkToast, setBookmarkToast] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'huge'>('normal');
  const [codeCopiedIndex, setCodeCopiedIndex] = useState<number | null>(null);

  // Scroll to top upon opening article
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [article.id]);

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        if (onScrollProgress) {
          onScrollProgress(Math.min(100, Math.max(0, currentProgress)));
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [onScrollProgress]);

  // Find previous and next articles
  const currentIndex = allArticles.findIndex((a) => a.id === article.id);
  // In reverse numbered list: previous article has lower index (newer) or higher index (older)
  const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null; // Newer article
  const nextArticle = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null; // Older article

  // Related articles (same topic or adjacent)
  const relatedArticles = allArticles
    .filter((a) => a.id !== article.id && (a.topicId === article.topicId || Math.abs(a.number - article.number) <= 2))
    .slice(0, 3);

  const handleShare = async () => {
    const url = window.location.href;
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleCopyCode = async (codeText: string, index: number) => {
    const ok = await copyToClipboard(codeText);
    if (ok) {
      setCodeCopiedIndex(index);
      setTimeout(() => setCodeCopiedIndex(null), 2000);
    }
  };

  const fontSizeClass = {
    normal: 'text-base sm:text-[1.075rem]',
    large: 'text-lg sm:text-[1.175rem]',
    huge: 'text-xl sm:text-[1.3rem]',
  }[fontSize];

  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-[680px] mx-auto px-5 sm:px-6">
        {/* Top Breadcrumb & Quick Actions Bar */}
        <div className="flex items-center justify-between gap-4 pb-6 mb-8 border-b border-[var(--border-divider)] text-xs text-[var(--text-muted)]">
          <button
            onClick={onBack}
            className="group cursor-pointer inline-flex items-center gap-2 hover:text-[var(--accent)] transition-colors font-medium"
          >
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            <span>بازگشت به فهرست یادداشت‌ها</span>
          </button>

          <div className="flex items-center gap-3">
            {/* Font size picker */}
            <div className="flex items-center border border-[var(--border-subtle)] rounded-md overflow-hidden bg-[var(--bg-surface)]">
              <button
                onClick={() => setFontSize('normal')}
                title="اندازه قلم معمولی"
                className={`px-2 py-1 text-xs cursor-pointer ${
                  fontSize === 'normal' ? 'bg-[var(--bg-page)] text-[var(--accent)] font-bold' : 'text-[var(--text-secondary)]'
                }`}
              >
                الف
              </button>
              <button
                onClick={() => setFontSize('large')}
                title="اندازه قلم بزرگتر"
                className={`px-2 py-1 text-sm cursor-pointer ${
                  fontSize === 'large' ? 'bg-[var(--bg-page)] text-[var(--accent)] font-bold' : 'text-[var(--text-secondary)]'
                }`}
              >
                الف+
              </button>
            </div>

            {/* Bookmark button */}
            <div className="relative">
              <button
                onClick={() => {
                  if (onToggleBookmark) {
                    onToggleBookmark(article.id);
                    setBookmarkToast(isBookmarked ? 'از نشان‌ها حذف شد' : 'به نشان‌ها افزوده شد');
                    setTimeout(() => setBookmarkToast(null), 2000);
                  }
                }}
                title={isBookmarked ? 'نشان شده (حذف از نشان‌ها)' : 'نشان کردن برای خواندن بعدی'}
                className={`p-1.5 rounded-md border border-[var(--border-subtle)] transition-colors cursor-pointer ${
                  isBookmarked
                    ? 'bg-[var(--accent-surface)] text-[var(--accent)] border-[var(--accent)]'
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              {bookmarkToast && (
                <div className="absolute top-full mt-2 -right-8 z-20 whitespace-nowrap px-2.5 py-1 rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-primary)] shadow-md animate-in fade-in zoom-in-95 duration-100">
                  {bookmarkToast}
                </div>
              )}
            </div>

            {/* Share / Copy Link button */}
            <button
              onClick={handleShare}
              title="رونوشت پیوند جستار"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:text-[var(--accent)] transition-colors text-xs cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 text-[11px]">کپی شد</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="text-[11px]">اشتراک</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Article Header */}
        <header className="mb-10 text-right">
          {/* Unboxed Metadata Line */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)] mb-3">
            <span className="font-mono text-xs font-semibold text-[var(--accent)]">
              #{formatArticleNumber(article.number)}
            </span>
            <span aria-hidden="true" className="text-[var(--border-subtle)]">/</span>
            <button
              onClick={() => onSelectTopic(article.topicId)}
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
            <span aria-hidden="true" className="text-[var(--border-subtle)]">·</span>
            <span className="font-mono text-[11px] text-[var(--text-muted)]">
              {toPersianDigits(article.wordCount)} کلمه
            </span>
          </div>

          {/* Large Title in Persian Serif */}
          <h1 className="font-serif-persian text-3xl sm:text-4xl md:text-[2.6rem] font-bold text-[var(--text-primary)] leading-[1.3] mb-4">
            {article.title}
          </h1>

          {/* Lead Excerpt */}
          <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed font-body-persian border-b border-[var(--border-divider)] pb-6 mb-8 italic">
            {article.excerpt}
          </p>
        </header>

        {/* Featured Image if present */}
        {article.featuredImage && (
          <figure className="mb-10">
            <div className="rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
              <img
                src={article.featuredImage}
                alt={article.title}
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover max-h-[420px]"
              />
            </div>
            {article.featuredImageCaption && (
              <figcaption className="text-xs text-center text-[var(--text-muted)] mt-2.5 font-serif-persian italic">
                {article.featuredImageCaption}
              </figcaption>
            )}
          </figure>
        )}

        {/* Article Body Content */}
        <div className={`persian-prose ${fontSizeClass} text-right`}>
          {article.sections.map((sec, idx) => {
            if (sec.type === 'heading') {
              return (
                <h2 key={idx} className="font-serif-persian font-bold text-[var(--text-primary)]">
                  {sec.text}
                </h2>
              );
            }

            if (sec.type === 'blockquote') {
              return (
                <div
                  key={idx}
                  className="my-8 py-5 px-6 sm:px-8 border-y border-[var(--border-divider)] bg-[var(--bg-surface)]/40 rounded-sm"
                >
                  <blockquote className="font-serif-persian text-lg sm:text-xl text-[var(--text-primary)] leading-relaxed italic">
                    {sec.text}
                  </blockquote>
                  {sec.cite && (
                    <cite className="block not-italic text-xs text-[var(--accent)] font-medium mt-3 text-start">
                      — {sec.cite}
                    </cite>
                  )}
                </div>
              );
            }

            if (sec.type === 'code') {
              return (
                <div
                  key={idx}
                  dir="ltr"
                  className="my-8 rounded-lg overflow-hidden border border-[var(--code-border)] bg-[var(--code-bg)] text-xs text-left"
                >
                  <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--code-border)] bg-[var(--bg-surface)] text-[var(--text-muted)]">
                    <span className="font-mono text-[11px] font-semibold uppercase">
                      {sec.language || 'code'}
                    </span>
                    <button
                      onClick={() => handleCopyCode(sec.text || '', idx)}
                      className="inline-flex items-center gap-1.5 text-[11px] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                    >
                      {codeCopiedIndex === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy code</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 font-mono overflow-x-auto leading-relaxed text-[var(--text-primary)]">
                    <code>{sec.text}</code>
                  </pre>
                  {sec.caption && (
                    <div dir="rtl" className="px-4 py-2 text-xs text-[var(--text-muted)] border-t border-[var(--code-border)] bg-[var(--bg-surface)]/60 text-right">
                      {sec.caption}
                    </div>
                  )}
                </div>
              );
            }
            if (sec.type === 'image') {
  return (
    <figure key={idx} className="my-8">
      <div className="rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <img
          src={sec.imageUrl}
          alt={sec.caption || article.title}
          className="w-full h-auto object-cover max-h-[480px]"
        />
      </div>
      {sec.caption && (
        <figcaption className="text-xs text-center text-[var(--text-muted)] mt-2.5 font-serif-persian italic">
          {sec.caption}
        </figcaption>
      )}
    </figure>
  );
}
            // Default: Paragraph
            return (
              <p key={idx} className="leading-[2.05]">
                {sec.text}
              </p>
            );
          })}
        </div>

        {/* End of Essay Ornament */}
        <div className="my-12 text-center text-[var(--border-subtle)] text-lg select-none">
          ✦ ✦ ✦
        </div>

        {/* Previous and Next Article Navigation */}
        <nav
          aria-label="پیمایش میان جستارها"
          className="border-t border-b border-[var(--border-divider)] py-6 my-10 grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {/* Previous / Newer Article */}
          <div className="text-right">
            {prevArticle ? (
              <button
                onClick={() => onSelectArticle(prevArticle)}
                className="group w-full text-right p-3 rounded-lg hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
              >
                <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                  <ArrowRight className="w-3 h-3" />
                  جستار بعدی (جدیدتر)
                </span>
                <span className="block font-serif-persian font-bold text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)] line-clamp-1 mt-1">
                  {prevArticle.title}
                </span>
              </button>
            ) : (
              <div className="p-3 text-[11px] text-[var(--text-muted)]">
                آخرین جستار منتشرشده
              </div>
            )}
          </div>

          {/* Next / Older Article */}
          <div className="text-left sm:border-r border-[var(--border-divider)] sm:pr-4">
            {nextArticle ? (
              <button
                onClick={() => onSelectArticle(nextArticle)}
                className="group w-full text-left sm:text-left p-3 rounded-lg hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
              >
                <span className="text-[11px] text-[var(--text-muted)] flex items-center justify-end sm:justify-start gap-1">
                  جستار قبلی (کهن‌تر)
                  <ArrowLeft className="w-3 h-3" />
                </span>
                <span className="block font-serif-persian font-bold text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)] line-clamp-1 mt-1 text-right sm:text-left">
                  {nextArticle.title}
                </span>
              </button>
            ) : (
              <div className="p-3 text-[11px] text-[var(--text-muted)] text-left">
                نخستین یادداشت این دفتر
              </div>
            )}
          </div>
        </nav>

        {/* Related Articles Section */}
        {relatedArticles.length > 0 && (
          <section className="pt-4">
            <h3 className="font-serif-persian text-xl font-bold text-[var(--text-primary)] mb-6 text-right">
              جستارهای مرتبط
            </h3>
            <div className="space-y-4">
              {relatedArticles.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectArticle(rel)}
                  className="group flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--bg-surface)]/60 border border-transparent hover:border-[var(--border-divider)] transition-colors cursor-pointer"
                >
                  <span className="font-mono text-xs text-[var(--text-muted)] group-hover:text-[var(--accent)] font-semibold mt-0.5">
                    #{formatArticleNumber(rel.number)}
                  </span>
                  <div className="flex-1 min-w-0 text-right">
                    <h4 className="font-serif-persian font-bold text-sm sm:text-base text-[var(--text-primary)] group-hover:text-[var(--accent)] leading-snug">
                      {rel.title}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-1 mt-1">
                      {rel.excerpt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
