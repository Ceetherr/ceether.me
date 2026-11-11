import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Send, Menu, X, BookOpen, Layers, User, Search, Bookmark } from 'lucide-react';
import { AUTHOR_BIO } from '../data/articles';
import { toPersianDigits } from '../utils/persian';
import { ThemeMode } from '../types';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  currentTheme?: ThemeMode;
  onSelectTheme?: (theme: ThemeMode) => void;
  readingProgress?: number; // 0 to 100 if on article page
  onOpenSearch: () => void;
  savedCount?: number;
  onOpenSaved?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  isDark,
  onToggleTheme,
  currentTheme = 'paper',
  onSelectTheme,
  readingProgress,
  onOpenSearch,
  savedCount = 0,
  onOpenSaved,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeMenuOpen(false);
      }
    };
    if (themeMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [themeMenuOpen]);

  const navItems = [
    { id: 'home', label: 'صفحه اصلی' },
    { id: 'articles', label: 'تمامی یادداشت‌ها' },
    { id: 'about', label: 'درباره من' },
  ];

  const handleNavClick = (viewId: string) => {
    onNavigate(viewId);
    setMobileMenuOpen(false);
  };

  const themes: Array<{
    id: ThemeMode;
    label: string;
    desc: string;
    previewBg: string;
    previewBorder: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'paper',
      label: 'کاغذی',
      desc: 'روشن طبیعی',
      previewBg: '#f6f1e7',
      previewBorder: '#d6d0c4',
      icon: <Sun className="w-3.5 h-3.5 text-amber-600" />,
    },
    {
      id: 'parchment',
      label: 'پوست‌آهو',
      desc: 'کاهی کهن',
      previewBg: '#ebe1cd',
      previewBorder: '#c5b597',
      icon: <BookOpen className="w-3.5 h-3.5 text-amber-800" />,
    },
    {
      id: 'night',
      label: 'شب',
      desc: 'تیره تحریریه',
      previewBg: '#0a0a0a',
      previewBorder: '#2d2b27',
      icon: <Moon className="w-3.5 h-3.5 text-slate-300" />,
    },
  ];

  const currentThemeObj = themes.find((t) => t.id === currentTheme) || themes[0];

  return (
    <header className="sticky top-0 z-30 w-full bg-[var(--bg-page)]/90 backdrop-blur-md border-b border-[var(--border-divider)] transition-colors duration-200">
      {/* Reading Progress Indicator Bar */}
      {typeof readingProgress === 'number' && (
        <div
          role="progressbar"
          aria-valuenow={Math.round(readingProgress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="پیشرفت مطالعه جستار"
          className="absolute top-0 right-0 left-0 h-[2px] bg-transparent"
        >
          <div
            className="h-full bg-[var(--accent)] transition-all duration-150 ease-out"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-5 sm:px-8 h-18 flex items-center justify-between gap-4">
        {/* Zone 1: Brand & Logo Title */}
        <button
          onClick={() => handleNavClick('home')}
          className="text-right group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded"
        >
          <span className="block font-serif-persian text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
            {AUTHOR_BIO.name}
          </span>
          <span className="block text-[11px] text-[var(--text-muted)] -mt-1 font-body-persian tracking-normal">
            یادداشت‌ها و جستارهای شخصی
          </span>
        </button>

        {/* Zone 2: Minimal Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`transition-colors cursor-pointer py-1 text-sm ${
                  isActive
                    ? 'text-[var(--accent)] font-semibold border-b border-[var(--accent)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions - Search + Bookmarks + Telegram + Theme Selector + Mobile Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Search Trigger Button */}
          <button
            onClick={onOpenSearch}
            aria-label="جستجوی جستارها"
            title="جستجو در جستارها (Ctrl+K)"
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)]/70 hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-body-persian">جستجو...</span>
            <kbd className="hidden sm:inline-block font-mono text-[10px] text-[var(--text-muted)] bg-[var(--bg-page)] px-1 py-0.5 rounded border border-[var(--border-subtle)]">
              ⌘K
            </kbd>
          </button>

          {/* Bookmarks / Saved Drawer Button */}
          {onOpenSaved && (
            <button
              onClick={onOpenSaved}
              aria-label="یادداشت‌های نشان‌شده"
              title="نشان‌های من"
              className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] border border-transparent hover:border-[var(--border-divider)] rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              <Bookmark className="w-4 h-4" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 font-mono text-[10px] w-4 h-4 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold">
                  {toPersianDigits(savedCount)}
                </span>
              )}
            </button>
          )}

          {/* Quiet Telegram Ghost Link */}
          <a
            href={AUTHOR_BIO.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="کانال تلگرام سیدر"
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--bg-surface)] border border-transparent hover:border-[var(--border-divider)] rounded-md transition-colors"
          >
            <Send className="w-3.5 h-3.5 rotate-180" />
            <span>تلگرام</span>
          </a>

          {/* Theme Palette Dropdown Popover */}
          <div className="relative" ref={themeRef}>
            <button
              onClick={() => setThemeMenuOpen(!themeMenuOpen)}
              aria-label="تغییر پوسته بصری"
              title={`پوسته فعلی: ${currentThemeObj.label}`}
              className="flex items-center gap-1.5 p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] border border-transparent hover:border-[var(--border-divider)] rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              {currentThemeObj.icon}
              <span
                style={{ backgroundColor: currentThemeObj.previewBg, borderColor: currentThemeObj.previewBorder }}
                className="w-2.5 h-2.5 rounded-full border hidden sm:inline-block"
              />
            </button>

            {themeMenuOpen && (
              <div className="absolute top-full mt-2 left-0 sm:left-auto sm:right-0 z-40 w-48 p-2 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] shadow-xl text-right animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[11px] font-semibold text-[var(--text-muted)] px-2 py-1 mb-1 border-b border-[var(--border-divider)]">
                  انتخاب پوسته کاغذ
                </div>

                <div className="space-y-1">
                  {themes.map((t) => {
                    const isSelected = currentTheme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          if (onSelectTheme) onSelectTheme(t.id);
                          setThemeMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[var(--accent-surface)] text-[var(--accent)] font-bold'
                            : 'text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span
                            style={{ backgroundColor: t.previewBg, borderColor: t.previewBorder }}
                            className="w-3 h-3 rounded-full border shadow-2xs shrink-0"
                          />
                          <span>{t.label}</span>
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] font-normal">
                          {t.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="منوی سایت"
            className="md:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] rounded-md transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border-divider)] bg-[var(--bg-page)] px-5 py-4 space-y-3">
          {/* Mobile Search Button */}
          <button
            onClick={() => {
              onOpenSearch();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-divider)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[var(--accent)]" />
              جستجو در میان جستارها...
            </span>
            <kbd className="font-mono text-[10px] bg-[var(--bg-page)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">
              جستجو
            </kbd>
          </button>

          {/* Mobile Theme Selector Strip */}
          <div className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-divider)]">
            <div className="text-[11px] text-[var(--text-muted)] mb-1.5 text-right font-medium">
              پوسته و کاغذ مطالعه:
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center text-[11px]">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    if (onSelectTheme) onSelectTheme(t.id);
                  }}
                  className={`py-1.5 px-1 rounded flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                    currentTheme === t.id
                      ? 'bg-[var(--bg-page)] text-[var(--accent)] font-bold shadow-xs'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  <span
                    style={{ backgroundColor: t.previewBg, borderColor: t.previewBorder }}
                    className="w-3.5 h-3.5 rounded-full border shadow-2xs"
                  />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Nav Links */}
          <div className="pt-2 border-t border-[var(--border-divider)] space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-right px-3 py-2 rounded-md text-sm transition-colors cursor-pointer ${
                  currentView === item.id
                    ? 'bg-[var(--accent-surface)] text-[var(--accent)] font-semibold'
                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Telegram Link */}
          <div className="pt-2 border-t border-[var(--border-divider)]">
            <a
              href={AUTHOR_BIO.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full px-3 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--accent)]"
            >
              <span className="flex items-center gap-2">
                <Send className="w-3.5 h-3.5 rotate-180" />
                کانال تلگرام سیدر (Ceether)
              </span>
              <span className="font-mono text-[10px]">t.me/ceether</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
