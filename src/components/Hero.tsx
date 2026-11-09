import React from 'react';
import { Send, BookOpen, ArrowLeft, Twitter, Github } from 'lucide-react';
import { AUTHOR_BIO } from '../data/articles';

interface HeroProps {
  onExploreArticles: () => void;
  onReadAbout: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreArticles, onReadAbout }) => {
  return (
    <section className="pt-12 pb-14 border-b border-[var(--border-divider)]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col-reverse md:flex-row items-center md:items-start justify-between gap-8 md:gap-12">
          {/* Text Column */}
          <div className="flex-1 text-right max-w-2xl">
            {/* Friendly Greeting in authentic Persian Serif */}
            <h1 className="font-serif-persian text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-[var(--text-primary)] leading-tight mb-4">
              {AUTHOR_BIO.greeting}
            </h1>

            {/* 2-3 line Personal Bio */}
            <p className="text-[var(--text-secondary)] text-base sm:text-lg leading-relaxed font-body-persian mb-6">
              {AUTHOR_BIO.bioShort}
            </p>

            {/* Social & Exploration Action Links */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={onExploreArticles}
                className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[var(--accent)] hover:bg-[var(--accent-hover)] rounded-md transition-colors shadow-xs"
              >
                <span>خواندن جستارها</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <button
                onClick={onReadAbout}
                className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-md transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>درباره‌ی این دفتر</span>
              </button>

              <a
                href={AUTHOR_BIO.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="کانال تلگرام (Ceether)"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
              >
                <Send className="w-3.5 h-3.5 rotate-180" />
                <span>تلگرام</span>
              </a>
            </div>
          </div>

          {/* Portrait Photo with soft mask & warm border */}
          <div className="shrink-0 relative group">
            <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-1 transition-transform duration-300 group-hover:scale-[1.01]">
              <img
                src={AUTHOR_BIO.portrait}
                alt={AUTHOR_BIO.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-xl filter contrast-[1.02] brightness-[0.98]"
              />
            </div>
            {/* Subtle vintage stamp motif in corner */}
            <div className="absolute -bottom-2 -left-2 bg-[var(--bg-page)] border border-[var(--border-subtle)] px-2 py-0.5 rounded text-[10px] font-mono text-[var(--text-muted)]">
              ۱۴۰۴
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
