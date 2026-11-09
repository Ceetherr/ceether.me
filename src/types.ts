export type TopicId = 'all' | 'philosophy' | 'science' | 'technology' | 'reflections';

export interface TopicInfo {
  id: TopicId;
  label: string;
  description: string;
  count?: number;
}

export interface ArticleContentSection {
  type: 'paragraph' | 'heading' | 'subheading' | 'blockquote' | 'image' | 'code' | 'callout' | 'divider';
  text?: string;
  cite?: string;
  imageUrl?: string;
  caption?: string;
  code?: string;
  language?: string;
}

export interface Article {
  id: string;
  number: number; // e.g. 8 for #۰۸
  slug: string;
  title: string;
  excerpt: string;
  topicId: TopicId;
  topicLabel: string;
  shamsiDate: string; // e.g. "۱۶ اسفند ۱۴۰۴"
  rawDate: string; // ISO format for sorting
  readingTimeMinutes: number;
  wordCount: number;
  featuredImage?: string;
  featuredImageCaption?: string;
  sections: ArticleContentSection[];
}
