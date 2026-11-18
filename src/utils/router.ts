import { Article, TopicId, TopicInfo } from '../types';

export type ViewMode = 'home' | 'articles' | 'topic' | 'article' | 'about';

export interface RouteState {
  view: ViewMode;
  topicId?: TopicId;
  articleSlug?: string;
}

/**
 * Parses a URL pathname into an application route state.
 */
export function parseLocation(
  pathname: string,
  articles: Article[],
  topics: TopicInfo[]
): RouteState {
  const cleanPath = decodeURIComponent(pathname || '/')
    .replace(/\/+$/, '') || '/';

  if (cleanPath === '/' || cleanPath === '') {
    return { view: 'home' };
  }

  if (cleanPath === '/about') {
    return { view: 'about' };
  }

  if (cleanPath === '/articles') {
    return { view: 'articles' };
  }

  if (cleanPath.startsWith('/articles/')) {
    const slug = cleanPath.slice('/articles/'.length);
    const matchedArticle = articles.find((a) => a.slug === slug || a.id === slug);
    if (matchedArticle) {
      return { view: 'article', articleSlug: matchedArticle.slug };
    }
    return { view: 'articles' };
  }

  if (cleanPath === '/topics') {
    const defaultTopic = topics.find((t) => t.id !== 'all')?.id || 'philosophy';
    return { view: 'topic', topicId: defaultTopic };
  }

  if (cleanPath.startsWith('/topics/')) {
    const rawTopicId = cleanPath.slice('/topics/'.length) as TopicId;
    const matchedTopic = topics.find((t) => t.id === rawTopicId && t.id !== 'all');
    if (matchedTopic) {
      return { view: 'topic', topicId: matchedTopic.id };
    }
    const defaultTopic = topics.find((t) => t.id !== 'all')?.id || 'philosophy';
    return { view: 'topic', topicId: defaultTopic };
  }

  return { view: 'home' };
}

/**
 * Builds the canonical URL path for a given view state.
 */
export function buildPath(state: RouteState): string {
  switch (state.view) {
    case 'home':
      return '/';
    case 'about':
      return '/about';
    case 'articles':
      return '/articles';
    case 'article':
      return state.articleSlug ? `/articles/${encodeURIComponent(state.articleSlug)}` : '/articles';
    case 'topic':
      return state.topicId && state.topicId !== 'all'
        ? `/topics/${encodeURIComponent(state.topicId)}`
        : '/topics';
    default:
      return '/';
  }
}
