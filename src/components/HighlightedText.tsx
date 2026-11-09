import React from 'react';
import { normalizePersian } from '../utils/persian';

interface HighlightedTextProps {
  text: string;
  query: string;
  className?: string;
}

/**
 * Safely renders text with matching search terms highlighted using subtle background marks.
 */
export const HighlightedText: React.FC<HighlightedTextProps> = ({
  text,
  query,
  className = '',
}) => {
  if (!text) return null;
  if (!query || !query.trim()) {
    return <span className={className}>{text}</span>;
  }

  const rawWords = query.trim().split(/\s+/).filter((w) => w.length > 0);
  if (rawWords.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Escape special regex characters
  const escapedWords = rawWords.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escapedWords.join('|')})`, 'gi');

  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatched = rawWords.some(
          (w) => normalizePersian(w) === normalizePersian(part)
        );
        if (isMatched) {
          return (
            <mark
              key={index}
              className="bg-[var(--accent-surface)] text-[var(--accent)] font-bold rounded-xs px-0.5 border-b border-[var(--accent)]"
            >
              {part}
            </mark>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
};
