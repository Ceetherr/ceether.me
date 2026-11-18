import { Article, TopicId, TopicInfo } from '../types';

export interface ArticleTopicBadge {
  id: TopicId;
  label: string;
}

/**
 * Returns all topics assigned to an article (primary topic + extraTopics), deduplicated by id.
 */
export function getArticleTopics(article: Article): ArticleTopicBadge[] {
  const result: ArticleTopicBadge[] = [
    { id: article.topicId, label: article.topicLabel },
  ];

  if (article.extraTopics && article.extraTopics.length > 0) {
    for (const extra of article.extraTopics) {
      if (!result.some((t) => t.id === extra.id)) {
        result.push({ id: extra.id, label: extra.label });
      }
    }
  }

  return result;
}

/**
 * Checks whether an article belongs to the given topicId (supports 'all' and extraTopics).
 */
export function articleHasTopic(article: Article, topicId: TopicId): boolean {
  if (topicId === 'all') return true;
  if (article.topicId === topicId) return true;
  return Boolean(article.extraTopics?.some((t) => t.id === topicId));
}

/**
 * Checks whether two articles share at least one topic (primary or extraTopics).
 */
export function articlesShareTopic(a: Article, b: Article): boolean {
  const topicsA = getArticleTopics(a).map((t) => t.id);
  const topicsB = getArticleTopics(b).map((t) => t.id);
  return topicsA.some((id) => topicsB.includes(id));
}

/**
 * Computes article counts per topic, counting multi-topic articles in each of their assigned topics.
 */
export function computeTopicCounts(
  articles: Article[],
  topics: TopicInfo[]
): Record<TopicId, number> {
  const counts: Record<TopicId, number> = {
    all: articles.length,
    philosophy: 0,
    science: 0,
    technology: 0,
    reflections: 0,
  };

  for (const topic of topics) {
    if (topic.id !== 'all' && counts[topic.id] === undefined) {
      counts[topic.id] = 0;
    }
  }

  for (const article of articles) {
    for (const t of getArticleTopics(article)) {
      if (counts[t.id] !== undefined) {
        counts[t.id]++;
      }
    }
  }

  return counts;
}
