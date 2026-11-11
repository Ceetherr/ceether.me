import React, { useState } from 'react';
import { Sun, Moon, Send, Menu, X, BookOpen, Layers, User, Search, Bookmark } from 'lucide-react';
import { AUTHOR_BIO } from '../data/articles';
import { toPersianDigits } from '../utils/persian';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
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
  readingProgress,
  onOpenSearch,
  savedCount = 0,
  onOpenSaved,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'صفحه اصلی' },
    { id: 'articles', label: 'جستارها' },
    { id: 'topics', label: 'موضوعات' },
    { id: 'about', label: 'درباره من' },
  ];

  const handleNavClick = (viewId: string) => {
    onNavigate(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-page)]/90 backdrop-blur-md border-b border-[var(--border-divider)] transition-colors duration-200">
      {/* Optional Top Reading Progress Bar for Article Reading */}
      {typeof readingProgress === 'number' && readingProgress > 0 && (
        <div className="absolute top-0 right-0 left-0 h-[2px] bg-[var(--border-divider)]">
          <div
            className="h-full bg-[var(--accent)] transition-all duration-150 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, readingProgress))}%` }}
            role="progressbar"
            aria-valuenow={Math.round(readingProgress)}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-5 sm:px-8 h-18 flex items-center justify-between gap-6">
        {/* Zone 1: Site Brand / Name in display serif */}
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

        {/* Zone 3: Actions - Search + Bookmarks + Telegram + Theme Toggle + Mobile Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Search Trigger Button */}
          <button
            onClick={onOpenSearch}
            aria-label="جستجوی جستارها"
            title="جستجو در جستارها (Ctrl+K)"
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)]/70 hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px] font-body-persian">جستجو...</span>
            <kbd className="hidden lg:inline font-mono text-[9px] bg-[var(--bg-page)] border border-[var(--border-subtle)] px-1 rounded text-[var(--text-muted)]">
              ⌘K
            </kbd>
          </button>

          {/* Bookmarks / Saved Essays Drawer Trigger Button */}
          <button
            onClick={onOpenSaved}
            aria-label="یادداشت‌های نشان‌شده"
            title={savedCount > 0 ? `${toPersianDigits(savedCount)} یادداشت نشان‌شده` : 'یادداشت‌های نشان‌شده'}
            className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] border border-transparent hover:border-[var(--border-divider)] rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <Bookmark className={`w-4 h-4 ${savedCount > 0 ? 'fill-[var(--accent)] text-[var(--accent)]' : ''}`} />
            {savedCount > 0 && (
              <span className="absolute -top-1 -left-1 min-w-4 h-4 px-1 rounded-full bg-[var(--accent)] text-white font-mono text-[9px] flex items-center justify-center font-bold shadow-xs">
                {toPersianDigits(savedCount)}
              </span>
            )}
          </button>

          {/* Telegram Channel Ghost Button */}
          <a
            href={AUTHOR_BIO.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="عضویت در کانال تلگرام"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] bg-transparent hover:bg-[var(--accent-surface)] border border-[var(--border-subtle)] hover:border-[var(--accent)] rounded-md transition-all duration-150"
          >
            <Send className="w-3.5 h-3.5 rotate-180" />
            <span>کانال تلگرام</span>
          </a>

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            aria-label={isDark ? 'تغییر به پوسته روشن (کاغذی)' : 'تغییر به پوسته تاریک'}
            title={isDark ? 'پوسته کاغذی' : 'پوسته شب'}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] border border-transparent hover:border-[var(--border-divider)] rounded-md transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-[var(--text-secondary)]" />
            )}
          </button>

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
        <div className="md:hidden border-t border-[var(--border-divider)] bg-[var(--bg-page)] px-5 py-4 space-y-2">
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

          {/* Mobile Saved Essays Button */}
          <button
            onClick={() => {
              if (onOpenSaved) onOpenSaved();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-divider)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-3"
          >
            <span className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[var(--accent)]" />
              یادداشت‌های نشان‌شده
            </span>
            <span className="font-mono text-[10px] bg-[var(--accent-surface)] text-[var(--accent)] px-2 py-0.5 rounded-full font-bold">
              {toPersianDigits(savedCount)}
            </span>
          </button>

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full text-right px-3 py-2.5 rounded text-sm transition-colors cursor-pointer ${
                currentView === item.id
                  ? 'bg-[var(--accent-surface)] text-[var(--accent)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
              }`}
            >
              {item.label}
            </button>
          ))}
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
              <span className="font-mono text-[10px]">t.me/arash_notes</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
