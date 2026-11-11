import React, { useState, useEffect, useRef } from 'react';
import { Article, Footnote } from '../types';
import { AUTHOR_BIO } from '../data/articles';
import { formatArticleNumber, formatReadingTime, toPersianDigits, copyToClipboard } from '../utils/persian';
import {
  ArrowRight,
  ArrowLeft,
  Share2,
  Check,
  Bookmark,
  SlidersHorizontal,
  Maximize2,
  Minimize2,
  Copy,
  Send,
  X,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

type FontSize = 'sm' | 'md' | 'lg' | 'xl';
type FontFamily = 'sans' | 'serif';
type LineHeight = 'compact' | 'normal' | 'relaxed';

interface ArticleViewProps {
  article: Article;
  allArticles: Article[];
  onBack: () => void;
  onSelectArticle: (article: Article) => void;
  onSelectTopic: (topicId: Article['topicId']) => void;
  onScrollProgress?: (progress: number) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (articleId: string) => void;
  isFocusMode?: boolean;
  onToggleFocusMode?: () => void;
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
  isFocusMode = false,
  onToggleFocusMode,
}) => {
  const [copied, setCopied] = useState(false);
  const [bookmarkToast, setBookmarkToast] = useState<string | null>(null);
  const [codeCopiedIndex, setCodeCopiedIndex] = useState<number | null>(null);

  // Reading Experience Preferences (Persisted)
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    return (localStorage.getItem('reader_font_size') as FontSize) || 'md';
  });
  const [fontFamily, setFontFamily] = useState<FontFamily>(() => {
    return (localStorage.getItem('reader_font_family') as FontFamily) || 'sans';
  });
  const [lineHeight, setLineHeight] = useState<LineHeight>(() => {
    return (localStorage.getItem('reader_line_height') as LineHeight) || 'normal';
  });
  const [showSettingsPopover, setShowSettingsPopover] = useState(false);

  // Interactive Footnote Popover State
  const [activeFootnote, setActiveFootnote] = useState<{
    footnote: Footnote;
    top: number;
    left: number;
  } | null>(null);
  const [highlightedFootnoteId, setHighlightedFootnoteId] = useState<string | null>(null);

  // Quote Selection Popover State
  const [quoteSelection, setQuoteSelection] = useState<{
    text: string;
    top: number;
    left: number;
  } | null>(null);
  const [quoteCopied, setQuoteCopied] = useState(false);

  const articleBodyRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Scroll to top upon opening article
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveFootnote(null);
    setQuoteSelection(null);
  }, [article.id]);

  // Persist reading preferences
  useEffect(() => {
    localStorage.setItem('reader_font_size', fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('reader_font_family', fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    localStorage.setItem('reader_line_height', lineHeight);
  }, [lineHeight]);

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

  // Keyboard shortcut listener (Esc to close popovers or exit focus mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeFootnote) {
          setActiveFootnote(null);
        } else if (showSettingsPopover) {
          setShowSettingsPopover(false);
        } else if (quoteSelection) {
          setQuoteSelection(null);
        } else if (isFocusMode && onToggleFocusMode) {
          onToggleFocusMode();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFootnote, showSettingsPopover, quoteSelection, isFocusMode, onToggleFocusMode]);

  // Close settings popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setShowSettingsPopover(false);
      }
    };
    if (showSettingsPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSettingsPopover]);

  // Text selection handler for Quote Tooltip
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !articleBodyRef.current) {
        setQuoteSelection(null);
        return;
      }

      const selectedText = selection.toString().trim();
      // Minimum 6 characters and selection must be within article body
      if (selectedText.length < 6) {
        setQuoteSelection(null);
        return;
      }

      // Check if selection is within the article body
      const anchorNode = selection.anchorNode;
      if (!anchorNode || !articleBodyRef.current.contains(anchorNode)) {
        setQuoteSelection(null);
        return;
      }

      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setQuoteSelection({
            text: selectedText,
            top: rect.top + window.scrollY - 48,
            left: Math.max(20, Math.min(window.innerWidth - 220, rect.left + rect.width / 2 - 100)),
          });
        }
      } catch {
        setQuoteSelection(null);
      }
    };

    const handleMouseUp = () => {
      setTimeout(handleSelection, 10);
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Find previous and next articles
  const currentIndex = allArticles.findIndex((a) => a.id === article.id);
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

  const handleCopyQuote = async () => {
    if (!quoteSelection) return;
    const formatted = `«${quoteSelection.text}»\n\n— از جستار «${article.title}» (${AUTHOR_BIO.name})`;
    const ok = await copyToClipboard(formatted);
    if (ok) {
      setQuoteCopied(true);
      setTimeout(() => {
        setQuoteCopied(false);
        setQuoteSelection(null);
      }, 1500);
    }
  };

  const handleShareQuoteTelegram = () => {
    if (!quoteSelection) return;
    const text = `«${quoteSelection.text}»\n\n— از جستار «${article.title}»`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    setQuoteSelection(null);
  };

  // Font size values
  const fontSizeValues: Record<FontSize, string> = {
    sm: '0.985rem',
    md: '1.095rem',
    lg: '1.24rem',
    xl: '1.4rem',
  };

  const lineHeightValues: Record<LineHeight, string> = {
    compact: '1.85',
    normal: '2.08',
    relaxed: '2.38',
  };

  const fontFamilyValues: Record<FontFamily, string> = {
    sans: "'Vazirmatn', -apple-system, BlinkMacSystemFont, sans-serif",
    serif: "'Markazi Text', 'Amiri', 'Traditional Arabic', serif",
  };

  // Quick font size step cycle
  const handleIncreaseFontSize = () => {
    if (fontSize === 'sm') setFontSize('md');
    else if (fontSize === 'md') setFontSize('lg');
    else if (fontSize === 'lg') setFontSize('xl');
  };

  const handleDecreaseFontSize = () => {
    if (fontSize === 'xl') setFontSize('lg');
    else if (fontSize === 'lg') setFontSize('md');
    else if (fontSize === 'md') setFontSize('sm');
  };

  const handleOpenFootnote = (fn: Footnote, targetElement: HTMLElement) => {
    const rect = targetElement.getBoundingClientRect();
    setActiveFootnote({
      footnote: fn,
      top: rect.bottom + window.scrollY + 8,
      left: Math.max(16, Math.min(window.innerWidth - 320, rect.left - 120)),
    });
  };

  const handleScrollToFootnoteBottom = (fnId: string) => {
    setActiveFootnote(null);
    const element = document.getElementById(`footnote-${fnId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedFootnoteId(fnId);
      setTimeout(() => setHighlightedFootnoteId(null), 2500);
    }
  };

  // Render text containing [^1] or [1] or [^۱] or [۱] markers with clickable interactive buttons
  const renderTextWithFootnotes = (text: string) => {
    if (!article.footnotes || article.footnotes.length === 0) {
      return text;
    }

    const regex = /\[\^?([0-9۰-۹]+)\]/g;
    const parts: (string | React.ReactNode)[] = [];
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        parts.push(text.substring(lastIdx, match.index));
      }

      const rawId = match[1];
      const latinId = rawId.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
      const persianId = toPersianDigits(latinId);
      const fn = article.footnotes.find((f) => f.id === latinId || f.id === rawId);

      parts.push(
        <button
          key={`fn-${match.index}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (fn) {
              handleOpenFootnote(fn, e.currentTarget);
            }
          }}
          title={fn?.term ? `${fn.term}: ${fn.content}` : `مشاهده پاورقی شماره ${persianId}`}
          aria-label={`مشاهده پاورقی شماره ${persianId}`}
          className="inline-flex items-center justify-center align-super mx-0.5 px-1.5 py-0.5 text-[11px] font-mono font-bold text-[var(--accent)] hover:bg-[var(--accent-surface)] hover:text-[var(--accent-hover)] rounded border border-[var(--border-subtle)] hover:border-[var(--accent)] transition-all cursor-pointer select-none leading-none"
        >
          [{persianId}]
        </button>
      );

      lastIdx = regex.lastIndex;
    }

    if (lastIdx < text.length) {
      parts.push(text.substring(lastIdx));
    }

    return parts;
  };

  return (
    <div
      className={`py-8 sm:py-12 transition-all ${
        isFocusMode ? 'focus-mode-active max-w-[720px] mx-auto px-5' : ''
      }`}
    >
      {/* Floating Zen / Focus Mode Exit Pill */}
      {isFocusMode && (
        <div className="fixed top-5 left-5 z-40 animate-in fade-in duration-200">
          <button
            onClick={onToggleFocusMode}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-md text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>خروج از تمرکز</span>
            <kbd className="text-[10px] font-mono px-1 py-0.5 rounded bg-[var(--bg-page)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
              Esc
            </kbd>
          </button>
        </div>
      )}

      {/* Floating Quote Selection Tooltip */}
      {quoteSelection && (
        <div
          style={{
            position: 'absolute',
            top: `${quoteSelection.top}px`,
            left: `${quoteSelection.left}px`,
          }}
          className="z-50 flex items-center gap-1.5 p-1 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-lg animate-in fade-in zoom-in-95 duration-150"
        >
          <button
            onClick={handleCopyQuote}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[var(--text-primary)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface)] rounded transition-colors cursor-pointer"
          >
            {quoteCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 text-[11px]">کپی شد</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11px]">کپی نقل‌قول</span>
              </>
            )}
          </button>

          <span className="text-[var(--border-subtle)] text-xs">|</span>

          <button
            onClick={handleShareQuoteTelegram}
            title="اشتراک‌گذاری در تلگرام"
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface)] rounded transition-colors cursor-pointer"
          >
            <Send className="w-3 h-3 rotate-180" />
            <span className="text-[11px]">تلگرام</span>
          </button>
        </div>
      )}

      {/* Interactive Footnote Floating Popover */}
      {activeFootnote && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/5"
            onClick={() => setActiveFootnote(null)}
          />
          <div
            style={{
              position: 'absolute',
              top: `${activeFootnote.top}px`,
              left: `${activeFootnote.left}px`,
            }}
            className="z-50 w-80 max-w-[calc(100vw-32px)] p-4 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-xl text-right animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border-divider)]">
              <span className="font-mono text-xs font-bold text-[var(--accent)] bg-[var(--accent-surface)] px-2 py-0.5 rounded">
                پاورقی #{toPersianDigits(activeFootnote.footnote.id)}
              </span>
              <button
                onClick={() => setActiveFootnote(null)}
                aria-label="بستن پاورقی"
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeFootnote.footnote.term && (
              <h4 className="font-serif-persian font-bold text-sm text-[var(--text-primary)] mb-1.5">
                {activeFootnote.footnote.term}
              </h4>
            )}

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-body-persian mb-3">
              {activeFootnote.footnote.content}
            </p>

            <button
              onClick={() => handleScrollToFootnoteBottom(activeFootnote.footnote.id)}
              className="inline-flex items-center gap-1.5 text-[11px] text-[var(--accent)] hover:underline font-medium cursor-pointer"
            >
              <span>مشاهده در انتهای متن</span>
              <ArrowLeft className="w-3 h-3" />
            </button>
          </div>
        </>
      )}

      <div className="max-w-[680px] mx-auto px-5 sm:px-6">
        {/* Top Breadcrumb & Quick Actions Bar (Hidden in Zen/Focus Mode) */}
        {!isFocusMode && (
          <div className="flex items-center justify-between gap-4 pb-6 mb-8 border-b border-[var(--border-divider)] text-xs text-[var(--text-muted)]">
            <button
              onClick={onBack}
              className="group cursor-pointer inline-flex items-center gap-2 hover:text-[var(--accent)] transition-colors font-medium"
            >
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              <span>بازگشت به فهرست یادداشت‌ها</span>
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quick Font Size Switcher (الف- / الف+) */}
              <div
                className="flex items-center border border-[var(--border-subtle)] rounded-md overflow-hidden bg-[var(--bg-surface)]"
                title="تغییر اندازه قلم متن"
              >
                <button
                  onClick={handleDecreaseFontSize}
                  title="اندازه قلم کوچکتر (الف-)"
                  disabled={fontSize === 'sm'}
                  className={`px-2 py-1 text-xs cursor-pointer transition-colors ${
                    fontSize === 'sm'
                      ? 'opacity-40 cursor-not-allowed text-[var(--text-muted)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-page)]'
                  }`}
                >
                  الف-
                </button>
                <button
                  onClick={() => setFontSize('md')}
                  title="اندازه قلم استاندارد (الف)"
                  className={`px-2 py-1 text-xs font-semibold cursor-pointer transition-colors border-x border-[var(--border-subtle)] ${
                    fontSize === 'md'
                      ? 'bg-[var(--bg-page)] text-[var(--accent)] font-bold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--accent)]'
                  }`}
                >
                  الف
                </button>
                <button
                  onClick={handleIncreaseFontSize}
                  title="اندازه قلم بزرگتر (الف+)"
                  disabled={fontSize === 'xl'}
                  className={`px-2 py-1 text-xs font-medium cursor-pointer transition-colors ${
                    fontSize === 'xl'
                      ? 'opacity-40 cursor-not-allowed text-[var(--text-muted)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-page)]'
                  }`}
                >
                  الف+
                </button>
              </div>

              {/* Reader Settings Popover Button (قلم، فاصله خطوط، حالت تمرکز) */}
              <div className="relative" ref={settingsRef}>
                <button
                  onClick={() => setShowSettingsPopover(!showSettingsPopover)}
                  title="تنظیمات پیشرفته مطالعه (قلم و چینش)"
                  className={`p-1.5 rounded-md border border-[var(--border-subtle)] transition-colors cursor-pointer ${
                    showSettingsPopover
                      ? 'bg-[var(--accent-surface)] text-[var(--accent)] border-[var(--accent)]'
                      : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>

                {showSettingsPopover && (
                  <div className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 z-30 w-64 p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-xl text-right animate-in fade-in zoom-in-95 duration-100">
                    <div className="text-xs font-semibold text-[var(--text-primary)] pb-2 mb-3 border-b border-[var(--border-divider)]">
                      تنظیمات خوانش متن
                    </div>

                    {/* Font Family Option */}
                    <div className="mb-3.5">
                      <label className="block text-[11px] text-[var(--text-muted)] mb-1.5">
                        نوع قلم (فونت):
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 p-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                        <button
                          onClick={() => setFontFamily('sans')}
                          className={`py-1 px-2 text-xs rounded transition-colors cursor-pointer ${
                            fontFamily === 'sans'
                              ? 'bg-[var(--bg-page)] text-[var(--accent)] font-bold shadow-xs'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          وزیرمتن (مدرن)
                        </button>
                        <button
                          onClick={() => setFontFamily('serif')}
                          className={`py-1 px-2 text-xs font-serif-persian rounded transition-colors cursor-pointer ${
                            fontFamily === 'serif'
                              ? 'bg-[var(--bg-page)] text-[var(--accent)] font-bold shadow-xs'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          مرکزی (کتابی)
                        </button>
                      </div>
                    </div>

                    {/* Line Height Option */}
                    <div className="mb-3.5">
                      <label className="block text-[11px] text-[var(--text-muted)] mb-1.5">
                        فاصله خطوط:
                      </label>
                      <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center text-xs">
                        <button
                          onClick={() => setLineHeight('compact')}
                          className={`py-1 rounded transition-colors cursor-pointer ${
                            lineHeight === 'compact'
                              ? 'bg-[var(--bg-page)] text-[var(--accent)] font-bold shadow-xs'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          فشرده
                        </button>
                        <button
                          onClick={() => setLineHeight('normal')}
                          className={`py-1 rounded transition-colors cursor-pointer ${
                            lineHeight === 'normal'
                              ? 'bg-[var(--bg-page)] text-[var(--accent)] font-bold shadow-xs'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          معمولی
                        </button>
                        <button
                          onClick={() => setLineHeight('relaxed')}
                          className={`py-1 rounded transition-colors cursor-pointer ${
                            lineHeight === 'relaxed'
                              ? 'bg-[var(--bg-page)] text-[var(--accent)] font-bold shadow-xs'
                              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          باز
                        </button>
                      </div>
                    </div>

                    {/* Focus Mode Toggle */}
                    {onToggleFocusMode && (
                      <div className="pt-2 border-t border-[var(--border-divider)]">
                        <button
                          onClick={() => {
                            setShowSettingsPopover(false);
                            onToggleFocusMode();
                          }}
                          className="w-full flex items-center justify-between py-1.5 px-2 text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface)] rounded transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>ورود به حالت تمرکز (Zen)</span>
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)]">Esc</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
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
        )}

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

        {/* Article Body Content with dynamic CSS Variables for reader sizing */}
        <div
          ref={articleBodyRef}
          style={{
            '--prose-font-size': fontSizeValues[fontSize],
            '--prose-line-height': lineHeightValues[lineHeight],
            '--prose-font-family': fontFamilyValues[fontFamily],
          } as React.CSSProperties}
          className="persian-prose text-right select-text"
        >
          {article.sections.map((sec, idx) => {
            if (sec.type === 'heading') {
              return (
                <h2 key={idx} className="font-serif-persian font-bold text-[var(--text-primary)]">
                  {renderTextWithFootnotes(sec.text || '')}
                </h2>
              );
            }

            if (sec.type === 'subheading') {
              return (
                <h3 key={idx} className="font-serif-persian font-bold text-[var(--text-primary)]">
                  {renderTextWithFootnotes(sec.text || '')}
                </h3>
              );
            }

            if (sec.type === 'blockquote') {
              return (
                <div
                  key={idx}
                  className="my-8 py-5 px-6 sm:px-8 border-y border-[var(--border-divider)] bg-[var(--bg-surface)]/40 rounded-sm"
                >
                  <blockquote className="font-serif-persian text-lg sm:text-xl text-[var(--text-primary)] leading-relaxed italic">
                    {renderTextWithFootnotes(sec.text || '')}
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

            // Default: Paragraph with footnote parser
            return (
              <p key={idx}>
                {renderTextWithFootnotes(sec.text || '')}
              </p>
            );
          })}
        </div>

        {/* Interactive Footnotes Section (at the end of article) */}
        {article.footnotes && article.footnotes.length > 0 && (
          <section
            id="article-footnotes"
            className="mt-16 pt-8 border-t border-[var(--border-divider)] text-right"
          >
            <h3 className="font-serif-persian text-lg font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[var(--accent)]" />
              <span>پاورقی‌ها و یادداشت‌های ارجاعی</span>
              <span className="text-xs font-mono text-[var(--text-muted)] font-normal">
                ({toPersianDigits(article.footnotes.length)})
              </span>
            </h3>

            <ol className="space-y-4 text-xs sm:text-sm text-[var(--text-secondary)] font-body-persian">
              {article.footnotes.map((fn) => {
                const isTarget = highlightedFootnoteId === fn.id;
                return (
                  <li
                    key={fn.id}
                    id={`footnote-${fn.id}`}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                      isTarget
                        ? 'bg-[var(--accent-surface)] border-[var(--accent)] shadow-sm'
                        : 'border-transparent hover:bg-[var(--bg-surface)]'
                    }`}
                  >
                    <span className="shrink-0 font-mono font-bold text-[var(--accent)] text-xs bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-2 py-0.5 rounded">
                      [{toPersianDigits(fn.id)}]
                    </span>
                    <div className="flex-1 leading-relaxed">
                      {fn.term && (
                        <strong className="font-semibold text-[var(--text-primary)] ml-1.5 block sm:inline">
                          {fn.term}:
                        </strong>
                      )}
                      <span>{fn.content}</span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {/* End of Essay Ornament */}
        <div className="my-12 text-center text-[var(--border-subtle)] text-lg select-none">
          ✦ ✦ ✦
        </div>

        {/* Previous and Next Article Navigation (Hidden in Zen mode for total immersion) */}
        {!isFocusMode && (
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
        )}

        {/* Related Articles Section (Hidden in Zen mode) */}
        {!isFocusMode && relatedArticles.length > 0 && (
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
