/**
 * Converts English digits to Persian digits.
 */
export function toPersianDigits(input: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(input).replace(/[0-9]/g, (digit) => persianDigits[parseInt(digit, 10)]);
}

/**
 * Formats an article number with leading zero and Persian digits.
 * e.g., 8 -> "۰۸"
 */
export function formatArticleNumber(num: number): string {
  const padded = num < 10 ? `0${num}` : `${num}`;
  return toPersianDigits(padded);
}

/**
 * Formats reading time in Persian.
 */
export function formatReadingTime(minutes: number): string {
  return `${toPersianDigits(minutes)} دقیقه مطالعه`;
}

/**
 * Normalizes Persian and Arabic text for robust full-text search:
 * - Unifies Arabic/Persian Ye (ي / ى -> ی)
 * - Unifies Arabic/Persian Kaf (ك -> ک)
 * - Removes diacritics/tashkeel (ـَ, ـِ, ـُ, ـً, ـٍ, ـٌ, ـّ, ـْ)
 * - Unifies half-spaces (ZWNJ \u200c) with regular space for broad matching
 * - Lowercases Latin characters
 */
export function normalizePersian(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove Arabic/Persian diacritics
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // remove zero-width non-joiners/joiners for fuzzy matching
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Copies text to user's clipboard and handles feedback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      textArea.remove();
      return successful;
    }
  } catch {
    return false;
  }
}

