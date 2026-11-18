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
import { Article, TopicId, ThemeMode } from './types';
import { SearchModal } from './components/SearchModal';
import { SavedArticlesDrawer } from './components/SavedArticlesDrawer';
import { useBookmarks } from './hooks/useBookmarks';
import { Search, Bookmark } from 'lucide-react';
import { toPersianDigits } from './utils/persian';
import { articleHasTopic, computeTopicCounts } from './utils/topics';
import { ViewMode, RouteState, parseLocation, buildPath } from './utils/router';

export default function App() {
  // Theme state: 3 curated paper & dark palettes
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('persian_journal_theme');
    if (saved === 'paper' || saved === 'parchment' || saved === 'night') {
      return saved;
    }
    if (saved === 'dark') return 'night';
    if (saved === 'light') return 'paper';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'night'
      : 'paper';
  });

  const isDark = currentTheme === 'night';

  // Initial route state parsed from browser URL
  const initialRoute = useMemo(
    () => parseLocation(window.location.pathname, ARTICLES, TOPICS),
    []
  );

  // Current view routing
  const [currentView, setCurrentView] = useState<ViewMode>(initialRoute.view);
  const [selectedTopicId, setSelectedTopicId] = useState<TopicId>(initialRoute.topicId || 'all');
  const [activeArticle, setActiveArticle] = useState<Article | null>(() => {
    if (initialRoute.view === 'article' && initialRoute.articleSlug) {
      return ARTICLES.find((a) => a.slug === initialRoute.articleSlug) || null;
    }
    return null;
  });
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

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

  // Sync theme to document.documentElement
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    if (currentTheme === 'night') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('persian_journal_theme', currentTheme);
  }, [currentTheme]);

  const toggleTheme = () => {
    const order: ThemeMode[] = ['paper', 'parchment', 'night'];
    const nextIdx = (order.indexOf(currentTheme) + 1) % order.length;
    setCurrentTheme(order[nextIdx]);
  };

  // Sync browser back/forward navigation (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const route = parseLocation(window.location.pathname, ARTICLES, TOPICS);
      setIsFocusMode(false);
      setCurrentView(route.view);
      if (route.view === 'article' && route.articleSlug) {
        const found = ARTICLES.find((a) => a.slug === route.articleSlug) || null;
        setActiveArticle(found);
        setReadingProgress(0);
      } else {
        setActiveArticle(null);
      }
      if (route.topicId) {
        setSelectedTopicId(route.topicId);
      } else if (route.view === 'home' || route.view === 'articles') {
        setSelectedTopicId('all');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync document.title with active route
  useEffect(() => {
    const baseName = AUTHOR_BIO.name;
    if (currentView === 'article' && activeArticle) {
      document.title = `${activeArticle.title} | ${baseName}`;
    } else if (currentView === 'articles') {
      document.title = `جستارها | ${baseName}`;
    } else if (currentView === 'topic') {
      const topicInfo = TOPICS.find((t) => t.id === selectedTopicId) || TOPICS[0];
      document.title = `${topicInfo.label} | ${baseName}`;
    } else if (currentView === 'about') {
      document.title = `درباره من | ${baseName}`;
    } else {
      document.title = 'بهترین کیان عمرت | یادداشت‌ها و جستارها';
    }
  }, [currentView, activeArticle, selectedTopicId]);

  const pushRouteUrl = (route: RouteState) => {
    const nextPath = buildPath(route);
    if (window.location.pathname !== nextPath) {
      window.history.pushState(null, '', nextPath);
    }
  };

  // Article count per topic (supports multi-topic articles)
  const topicCounts = useMemo(() => computeTopicCounts(ARTICLES, TOPICS), []);

  // Filtered articles for home view (supports extraTopics)
  const homeFilteredArticles = useMemo(() => {
    if (selectedTopicId === 'all') {
      return ARTICLES;
    }
    return ARTICLES.filter((art) => articleHasTopic(art, selectedTopicId));
  }, [selectedTopicId]);

  // Navigate handler
  const handleNavigate = (view: string, param?: string) => {
    setIsFocusMode(false);
    if (view === 'home') {
      setCurrentView('home');
      setActiveArticle(null);
      pushRouteUrl({ view: 'home' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'articles') {
      setCurrentView('articles');
      setActiveArticle(null);
      pushRouteUrl({ view: 'articles' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'topics') {
      const targetTopic = (param as TopicId) || (selectedTopicId !== 'all' ? selectedTopicId : (TOPICS.find((t) => t.id !== 'all')?.id || 'philosophy'));
      setSelectedTopicId(targetTopic);
      setCurrentView('topic');
      setActiveArticle(null);
      pushRouteUrl({ view: 'topic', topicId: targetTopic });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'about') {
      setCurrentView('about');
      setActiveArticle(null);
      pushRouteUrl({ view: 'about' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectArticle = (article: Article) => {
    setIsFocusMode(false);
    setActiveArticle(article);
    setCurrentView('article');
    setReadingProgress(0);
    pushRouteUrl({ view: 'article', articleSlug: article.slug });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTopicFromChip = (topicId: TopicId) => {
    setSelectedTopicId(topicId);
  };

  const handleNavigateToTopicPage = (topicId: TopicId) => {
    const resolvedTopic = topicId === 'all' ? (TOPICS.find((t) => t.id !== 'all')?.id || 'philosophy') : topicId;
    setSelectedTopicId(resolvedTopic);
    setCurrentView('topic');
    setActiveArticle(null);
    pushRouteUrl({ view: 'topic', topicId: resolvedTopic });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeTopicInfo = TOPICS.find((t) => t.id === selectedTopicId) || TOPICS[0];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Sticky Header with 3 zones, Theme Toggle, Telegram Ghost Button, and Search */}
      {!(currentView === 'article' && isFocusMode) && (
        <Header
          currentView={currentView}
          onNavigate={handleNavigate}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          currentTheme={currentTheme}
          onSelectTheme={setCurrentTheme}
          readingProgress={currentView === 'article' ? readingProgress : undefined}
          onOpenSearch={() => setIsSearchModalOpen(true)}
          savedCount={savedCount}
          onOpenSaved={() => setIsSavedDrawerOpen(true)}
        />
      )}

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
            onBack={() => handleNavigate('home')}
            onSelectArticle={handleSelectArticle}
            onSelectTopic={handleNavigateToTopicPage}
            onScrollProgress={setReadingProgress}
            isBookmarked={isBookmarked(activeArticle.id)}
            onToggleBookmark={toggleBookmark}
            isFocusMode={isFocusMode}
            onToggleFocusMode={() => setIsFocusMode((prev) => !prev)}
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
            onSelectTopic={handleNavigateToTopicPage}
            onSelectArticle={handleSelectArticle}
            onBackToArticles={() => handleNavigate('articles')}
          />
        )}

        {/* VIEW 5: ABOUT PAGE */}
        {currentView === 'about' && <AboutPage />}
      </main>

      {/* Warm Literary Footer */}
      {!(currentView === 'article' && isFocusMode) && (
        <Footer onNavigate={handleNavigate} />
      )}

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
