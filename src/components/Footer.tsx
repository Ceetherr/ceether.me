import React from 'react';
import { AUTHOR_BIO } from '../data/articles';

interface FooterProps {
  onNavigate: (view: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="mt-20 border-t border-[var(--border-divider)] py-12 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 text-center md:text-right">
          {/* Warm Personal Sentence & Copyright */}
          <div className="max-w-md">
            <p className="font-serif-persian text-base sm:text-lg text-[var(--text-primary)] italic leading-relaxed mb-3">
              «{AUTHOR_BIO.quote}»
            </p>
            <p className="text-xs text-[var(--text-muted)] font-body-persian">
              دفتر آنلاین جستارها و تاملات سلطان (Ceether) · نگارش یافته در خونمون
            </p>
          </div>

          {/* Clean Text Links for Socials */}
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-5">
              <a
                href={AUTHOR_BIO.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--accent)] transition-colors underline-offset-4 hover:underline"
              >
                تلگرام
              </a>
              <span aria-hidden="true" className="text-[var(--border-subtle)]">/</span>
              <a
                href={AUTHOR_BIO.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--accent)] transition-colors underline-offset-4 hover:underline"
              >
                گیت‌هاب
              </a>
              <span aria-hidden="true" className="text-[var(--border-subtle)]">/</span>
            </div>

            <div className="text-[11px] font-mono text-[var(--text-muted)]">
              ۱۴۰۵ ه‍.ش
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
