export type TopicId = 'all' | 'philosophy' | 'science' | 'technology' | 'reflections';
export type ThemeMode = 'paper' | 'parchment' | 'night';

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

export interface Footnote {
  id: string; // e.g. "1", "2"
  term?: string; // Optional concept name, e.g. "کوالیا (Qualia)"
  content: string; // The footnote note or reference text
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
  footnotes?: Footnote[];
}

export interface AuthorBio {
  name: string;
  title: string;
  greeting: string;
  bioShort: string;
  bioFull: string;
  portrait: string;
  telegramUrl?: string;
  githubUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  quote: string;
}
