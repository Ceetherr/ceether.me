import React, { useState } from 'react';
import { AUTHOR_BIO, RECOMMENDED_BOOKS } from '../data/articles';
import { Send, BookOpen, Heart, Mail, Check } from 'lucide-react';
import { copyToClipboard } from '../utils/persian';

export const AboutPage: React.FC = () => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const contactEmail = 'ceether.notes@gmail.com';

  const handleCopyEmail = async () => {
    const ok = await copyToClipboard(contactEmail);
    if (ok) {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2200);
    }
  };

  return (
    <div className="py-10 sm:py-16">
      <div className="max-w-[700px] mx-auto px-5 sm:px-6 text-right">
        {/* Profile Lockup */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-10 mb-10 border-b border-[var(--border-divider)]">
          <div className="w-28 h-28 sm:w-36 sm:h-36 shrink-0 rounded-2xl overflow-hidden border border-[var(--border-subtle)] p-1 bg-[var(--bg-surface)]">
            <img
              src={AUTHOR_BIO.portrait}
              alt={AUTHOR_BIO.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>

          <div className="flex-1 text-center sm:text-right">
            <h1 className="font-serif-persian text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
              {AUTHOR_BIO.name}
            </h1>
            <p className="text-sm font-medium text-[var(--accent)] mb-3">
              {AUTHOR_BIO.title}
            </p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {AUTHOR_BIO.bioShort}
            </p>
          </div>
        </div>

        {/* Longform Personal Essay / Manifesto */}
        <section className="mb-14">
          <h2 className="font-serif-persian text-2xl font-bold text-[var(--text-primary)] mb-4">
            چرا می‌نویسم؟
          </h2>
          <div className="persian-prose text-[var(--text-secondary)] leading-[2.1] space-y-4">
            <p>
              نوشتن برای من تلاشی است برای وضوح بخشیدن به مهِ پراکنده‌ی افکار. در جهانی که با سیل بی‌امان داده‌ها، اعلان‌های فوری و قطبی‌سازی‌های شتابزده احاطه شده‌ایم، یافتن فضایی برای ایستادن و آهسته اندیشیدن به یک ضرورت حیاتی بدل شده است.
            </p>
            <p>
              علاقه‌ی من نه در حبس شدن در عاج دانایی انتزاعی است و نه در غرق شدن در روزمرگی‌های سطحی؛ بلکه در پیوند زدن میان چهار ساحت است:
            </p>
            <ul className="list-disc pr-5 space-y-2 my-4 text-sm sm:text-base text-[var(--text-primary)]">
              <li>
                <strong className="text-[var(--accent)]">فلسفه:</strong> برای یادآوری پرسش‌های ازلی درباره‌ی حقیقت، رنج و معنای زندگی خوب.
              </li>
              <li>
                <strong className="text-[var(--accent)]">علم و کیهان:</strong> برای حفظ حس حیرت در برابر نظم شگفت‌انگیز طبیعت و تواضع در برابر جهان بیکران.
              </li>
              <li>
                <strong className="text-[var(--accent)]">فناوری و جامعه:</strong> برای واکاوی نقادانه‌ی تاثیری که ابزارها و الگوریتم‌ها بر روان و آزادی انسان می‌گذارند.
              </li>
              <li>
                <strong className="text-[var(--accent)]">تاملات زیسته:</strong> برای پاسداشت زیبایی‌های کوچک زندگی، کتاب‌خوانی‌های دیرهنگام و دست‌خط‌هایی که روی کاغذ می‌مانند.
              </li>
            </ul>
            <p>
              این وبگاه نه یک رسانه‌ی خبری است و نه یک پایگاه تجاری؛ بلکه پنجره‌ای است گشوده به گفتگویی آرام با هر آن‌کس که هنوز به قدرت کلمات و تامل عمیق باور دارد.
            </p>
          </div>
        </section>

        {/* Bookshelf / Recommendations */}
        <section className="mb-14 pt-8 border-t border-[var(--border-divider)]">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="w-5 h-5 text-[var(--accent)]" />
            <h2 className="font-serif-persian text-2xl font-bold text-[var(--text-primary)]">
              کتاب‌های بالینی و الهام‌بخش
            </h2>
          </div>
          <p className="text-xs text-[var(--text-muted)] mb-6">
            چند اثری که نگاهم را به نوشتن، علم و جهان صیقل داده‌اند:
          </p>

          <div className="space-y-4">
            {RECOMMENDED_BOOKS.map((book, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-[var(--bg-surface)]/60 border border-[var(--border-divider)] text-right"
              >
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <h3 className="font-serif-persian font-bold text-base text-[var(--text-primary)]">
                    {book.title}
                  </h3>
                  <span className="text-[11px] text-[var(--accent)] font-medium">
                    {book.category}
                  </span>
                </div>
                <div className="text-xs text-[var(--text-muted)] mb-2 font-medium">
                  نویسنده: {book.author}
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-body-persian">
                  {book.note}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact and Telegram Channel Box */}
        <section className="pt-8 border-t border-[var(--border-divider)]">
          <h2 className="font-serif-persian text-2xl font-bold text-[var(--text-primary)] mb-4">
            پیوند و هم‌صحبتی
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
            اگر سطری از این دفتر شما را به فکر واداشته یا مایل به گفتگویی پیرامون این موضوعات هستید، بسیار خوشحال خواهم شد پیامتان را بخوانم:
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={AUTHOR_BIO.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-xs sm:text-sm font-medium transition-colors"
            >
              <Send className="w-4 h-4 rotate-180" />
              <span>عضویت در کانال تلگرام</span>
            </a>

            <button
              onClick={handleCopyEmail}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-xs sm:text-sm font-medium hover:border-[var(--accent)] transition-colors cursor-pointer"
            >
              {copiedEmail ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>آدرس ایمیل کپی شد</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 text-[var(--text-muted)]" />
                  <span className="font-mono text-xs">{contactEmail}</span>
                </>
              )}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
