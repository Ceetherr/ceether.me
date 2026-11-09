import React from 'react';
import { TopicId, TopicInfo } from '../types';
import { toPersianDigits } from '../utils/persian';

interface TopicChipsProps {
  topics: TopicInfo[];
  selectedTopic: TopicId;
  onSelectTopic: (topicId: TopicId) => void;
  topicCounts: Record<TopicId, number>;
}

export const TopicChips: React.FC<TopicChipsProps> = ({
  topics,
  selectedTopic,
  onSelectTopic,
  topicCounts,
}) => {
  return (
    <div className="py-6 flex items-center gap-2 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-1.5 p-1 bg-[var(--bg-surface)] border border-[var(--border-divider)] rounded-lg">
        {topics.map((t) => {
          const isSelected = selectedTopic === t.id;
          const count = topicCounts[t.id] ?? 0;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTopic(t.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[var(--bg-page)] text-[var(--accent)] font-semibold shadow-xs border border-[var(--border-subtle)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-page)]/50'
              }`}
            >
              <span>{t.label}</span>
              <span
                className={`font-mono text-[10px] ${
                  isSelected ? 'text-[var(--accent)] font-bold' : 'text-[var(--text-muted)]'
                }`}
              >
                {toPersianDigits(count)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
