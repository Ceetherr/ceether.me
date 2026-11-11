import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TopicChips } from './components/TopicChips';
import { ArticleRow } from './components/ArticleRow';
import { ArticleView } from './components/ArticleView';
import { ArticlesPage } from './components/ArticlesPage';
import { TopicPage } from './components/TopicPage';
import { AboutPage } from './components/AboutPage';
import { Footer } from './components/Footer';
import { ARTICLES, TOPICS, AUTHOR_BIO } from './data/articles';
import { Article, TopicId } from './types';
import { SearchModal } from './components/SearchModal';
import { SavedArticlesDrawer } from './components/SavedArticlesDrawer';
import { useBookmarks } from './hooks/useBookmarks';
import { ArrowLeft, BookOpen, Layers, Search, Bookmark } from 'lucide-react';
import { toPersianDigits } from './utils/persian';

type ViewMode = 'home' | 'articles' | 'topic' | 'article' | 'about';

export default function App() {
  // Theme state: default paper light or dark
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('persian_journal_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Current view routing
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [selectedTopicId, setSelectedTopicId] = useState<TopicId>('all');
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);

  // Persistent bookmarks and reading list
  const {
    bookmarkedIds,
    isBookmarked,
    toggleBookmark,
    removeBookmark,
    clearAllBookmarks,
    count: savedCount,
  } = useBookmarks();

  // Global keyboard shortcut: Cmd+K / Ctrl+K or '/' to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      } else if (e.key === '/' && !isInputFocused) {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Sync theme class to document.documentElement
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('persian_journal_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('persian_journal_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  // Article count per topic
  const topicCounts = useMemo(() => {
    const counts: Record<TopicId, number> = {
      all: ARTICLES.length,
      philosophy: 0,
      science: 0,
      technology: 0,
      reflections: 0,
    };
    ARTICLES.forEach((art) => {
      if (counts[art.topicId] !== undefined) {
        counts[art.topicId]++;
      }
    });
    return counts;
  }, []);

  // Filtered articles for home view
  const homeFilteredArticles = useMemo(() => {
    if (selectedTopicId === 'all') {
      return ARTICLES;
    }
    return ARTICLES.filter((art) => art.topicId === selectedTopicId);
  }, [selectedTopicId]);

  // Navigate handler
  const handleNavigate = (view: string, param?: string) => {
    if (view === 'home') {
      setCurrentView('home');
      setActiveArticle(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'articles') {
      setCurrentView('articles');
      setActiveArticle(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'topics') {
      if (param) {
        setSelectedTopicId(param as TopicId);
        setCurrentView('topic');
      } else {
        // If no param, go to topic page with current or first topic
        setCurrentView('topic');
      }
      setActiveArticle(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'about') {
      setCurrentView('about');
      setActiveArticle(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectArticle = (article: Article) => {
    setActiveArticle(article);
    setCurrentView('article');
    setReadingProgress(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTopicFromChip = (topicId: TopicId) => {
    setSelectedTopicId(topicId);
  };

  const handleNavigateToTopicPage = (topicId: TopicId) => {
    setSelectedTopicId(topicId);
    setCurrentView('topic');
    setActiveArticle(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeTopicInfo = TOPICS.find((t) => t.id === selectedTopicId) || TOPICS[0];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Sticky Header with 3 zones, Theme Toggle, Telegram Ghost Button, and Search */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        readingProgress={currentView === 'article' ? readingProgress : undefined}
        onOpenSearch={() => setIsSearchModalOpen(true)}
        savedCount={savedCount}
        onOpenSaved={() => setIsSavedDrawerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* VIEW 1: HOME PAGE */}
        {currentView === 'home' && (
          <div>
            {/* Hero Section */}
            <Hero
              onExploreArticles={() => handleNavigate('articles')}
              onReadAbout={() => handleNavigate('about')}
            />

            {/* Articles & Topics Section */}
            <section className="py-10 sm:py-14">
              <div className="max-w-4xl mx-auto px-5 sm:px-8">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-3 border-b border-[var(--border-divider)] pb-4">
                  <div>
                    <h2 className="font-serif-persian text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                      تازه‌ترین جستارها
                    </h2>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
                      نوشته‌هایی پیرامون فلسفه، علم، فناوری و تاملات زیسته به ترتیب شماره معکوس
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
                    <button
                      onClick={() => setIsSearchModalOpen(true)}
                      className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent)] transition-colors cursor-pointer"
                      title="جستجوی تمام‌متن (⌘K)"
                    >
                      <Search className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>جستجو در متن...</span>
                    </button>

                    {savedCount > 0 && (
                      <button
                        onClick={() => setIsSavedDrawerOpen(true)}
                        className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--accent)] transition-colors cursor-pointer"
                        title="مشاهده یادداشت‌های نشان‌شده"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-[var(--accent)] fill-current" />
                        <span>نشان‌شده‌ها ({toPersianDigits(savedCount)})</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleNavigate('articles')}
                      className="text-xs font-medium text-[var(--accent)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>آرشیو کامل</span>
                      <span>←</span>
                    </button>
                  </div>
                </div>

                {/* Topic Filtering Chips */}
                <TopicChips
                  topics={TOPICS}
                  selectedTopic={selectedTopicId}
                  onSelectTopic={handleSelectTopicFromChip}
                  topicCounts={topicCounts}
                />

                {/* Numbered Articles List (Reverse Order) */}
                <div className="divide-y divide-[var(--border-divider)] pt-2">
                  {homeFilteredArticles.slice(0, 5).map((article) => (
                    <ArticleRow
                      key={article.id}
                      article={article}
                      onSelect={handleSelectArticle}
                      onSelectTopic={handleNavigateToTopicPage}
                    />
                  ))}
                </div>

                {/* Bottom "View all articles" link */}
                <div className="pt-10 text-center">
                  <button
                    onClick={() => handleNavigate('articles')}
                    className="group cursor-pointer inline-flex items-center gap-2.5 px-6 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] hover:border-[var(--accent)] text-sm font-medium text-[var(--text-primary)] transition-all shadow-xs"
                  >
                    <span>مشاهده همه‌ی جستارها</span>
                    <span className="group-hover:-translate-x-1 transition-transform">←</span>
                    <span className="font-mono text-xs text-[var(--text-muted)] mr-1">
                      ({toPersianDigits(ARTICLES.length)} نوشته)
                    </span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: ARTICLE READING PAGE */}
        {currentView === 'article' && activeArticle && (
          <ArticleView
            article={activeArticle}
            allArticles={ARTICLES}
            onBack={() => setCurrentView('home')}
            onSelectArticle={handleSelectArticle}
            onSelectTopic={handleNavigateToTopicPage}
            onScrollProgress={setReadingProgress}
            isBookmarked={isBookmarked(activeArticle.id)}
            onToggleBookmark={toggleBookmark}
          />
        )}

        {/* VIEW 3: ALL ARTICLES DIRECTORY */}
        {currentView === 'articles' && (
          <ArticlesPage
            articles={ARTICLES}
            topics={TOPICS}
            selectedTopic={selectedTopicId}
            onSelectTopic={setSelectedTopicId}
            onSelectArticle={handleSelectArticle}
            topicCounts={topicCounts}
          />
        )}

        {/* VIEW 4: TOPIC DEDICATED PAGE */}
        {currentView === 'topic' && (
          <TopicPage
            topic={activeTopicInfo}
            allTopics={TOPICS.filter((t) => t.id !== 'all')}
            articles={ARTICLES}
            onSelectTopic={setSelectedTopicId}
            onSelectArticle={handleSelectArticle}
            onBackToArticles={() => handleNavigate('articles')}
          />
        )}

        {/* VIEW 5: ABOUT PAGE */}
        {currentView === 'about' && <AboutPage />}
      </main>

      {/* Warm Literary Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Global Quick Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        articles={ARTICLES}
        onSelectArticle={handleSelectArticle}
      />

      {/* Saved / Bookmarked Articles Drawer */}
      <SavedArticlesDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        articles={ARTICLES}
        bookmarkedIds={bookmarkedIds}
        onSelectArticle={handleSelectArticle}
        onRemoveBookmark={removeBookmark}
        onClearAll={clearAllBookmarks}
      />
    </div>
  );
}
