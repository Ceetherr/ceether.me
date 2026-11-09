import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'persian_journal_bookmarks';

export function useBookmarks() {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Keep localStorage synchronized
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarkedIds));
    } catch (e) {
      console.error('Failed to save bookmarks to localStorage', e);
    }
  }, [bookmarkedIds]);

  const isBookmarked = useCallback(
    (id: string) => bookmarkedIds.includes(id),
    [bookmarkedIds]
  );

  const toggleBookmark = useCallback((id: string) => {
    setBookmarkedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);

  const removeBookmark = useCallback((id: string) => {
    setBookmarkedIds((prev) => prev.filter((item) => item !== id));
  }, []);

  const clearAllBookmarks = useCallback(() => {
    setBookmarkedIds([]);
  }, []);

  return {
    bookmarkedIds,
    isBookmarked,
    toggleBookmark,
    removeBookmark,
    clearAllBookmarks,
    count: bookmarkedIds.length,
  };
}
