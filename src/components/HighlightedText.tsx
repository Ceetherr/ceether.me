import React from 'react';
import { normalizePersian } from '../utils/persian';

interface HighlightedTextProps {
  text: string;
  query: string;
  className?: string;
}

function buildFlexibleTermPattern(term: string): string {
  const norm = normalizePersian(term);
  if (!norm) return '';

  return Array.from(norm)
    .map((ch) => {
      if (ch === 'ی') return '[یيى]';
      if (ch === 'ک') return '[کك]';
      if (ch === ' ') return '[\\s\\u200c]+';
      return ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('[\\u200B-\\u200D\\uFEFF\\u064B-\\u065F\\u0670]*');
}

/**
 * Safely renders text with matching search terms highlighted using subtle background marks.
 * Handles Persian character variants (ی/ي, ک/ك), diacritics, and ZWNJ (نیم‌فاصله).
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

  const rawWords = normalizePersian(query)
    .split(/\s+/)
    .filter((w) => w.length > 0);
  if (rawWords.length === 0) {
    return <span className={className}>{text}</span>;
  }

  const patterns = rawWords.map(buildFlexibleTermPattern).filter(Boolean);
  if (patterns.length === 0) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`(${patterns.join('|')})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (!part) return null;
        const normPart = normalizePersian(part);
        const isMatched = rawWords.some((w) => normPart === w);
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
