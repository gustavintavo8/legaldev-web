import type { CitationStats } from './types';

// Same rules as legaldev/app/citations.py (_STRIP_RE + normalize): ignore case,
// quotes, dashes, soft hyphens, "|", whitespace and invisible characters, which
// the PDF extraction scatters inside words ("per files").
const STRIP_RE = /[\s"“”«»'‘’\-–—­|​‌‍⁠﻿]+/gu;

export function normalize(text: string): string {
  return text.normalize('NFKC').replace(STRIP_RE, '').toLocaleLowerCase('es');
}

const OPENING = ['"', '“', '«'];
const CLOSING = ['"', '”', '»'];

/** The text between the first opening and the last closing quote, or null if there is no quote. */
function quotedText(text: string): string | null {
  const open = Math.min(...OPENING.map((q) => text.indexOf(q)).filter((i) => i >= 0));
  const close = Math.max(...CLOSING.map((q) => text.lastIndexOf(q)));
  if (!Number.isFinite(open) || close <= open) return null;
  return text.slice(open + 1, close);
}

const NOTE = 'No encontrada literalmente en el texto oficial';

/**
 * Marks each report quote as verified or not. The API lists only the
 * unverified quotes (cut to 120 chars), so the verified ones can be named only
 * when the quotes on the page are exactly the ones the backend counted and
 * every unverified entry is matched to its own blockquote. Otherwise nothing
 * is marked: the page never claims a quote was checked when it can't tell
 * which one.
 */
export function markCitations(root: HTMLElement, citas: CitationStats | undefined): 'marked' | 'neutral' {
  if (!citas) return 'neutral';
  const candidates = Array.from(root.querySelectorAll('blockquote')).filter((q) => !q.dataset.cita);
  const quotes = candidates.filter((q) => quotedText(q.textContent ?? '') !== null);
  if (quotes.length !== citas.total) return 'neutral';
  const normalized = quotes.map((q) => normalize(quotedText(q.textContent ?? '') ?? ''));
  const unverifiedIdx = new Set<number>();

  for (const entry of citas.no_verificadas) {
    const needle = normalize(entry);
    const i = normalized.findIndex((n, idx) => !unverifiedIdx.has(idx) && needle.length > 0 && n.startsWith(needle));
    if (i === -1) return 'neutral';
    unverifiedIdx.add(i);
  }

  quotes.forEach((q, i) => {
    if (unverifiedIdx.has(i)) {
      q.dataset.cita = 'no-verificada';
      const note = document.createElement('p');
      note.className = 'cita-nota';
      note.textContent = NOTE;
      q.after(note);
    } else {
      q.dataset.cita = 'verificada';
    }
  });
  return 'marked';
}

export function stripLeadingEmoji(s: string): string {
  return s.replace(/^[\p{Extended_Pictographic}️‍\s]+/u, '');
}
