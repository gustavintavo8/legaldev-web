const FALLBACK_MS = 1500;

/**
 * Calls `onSeen` with each batch of elements as they come on screen, once per
 * element. Without IntersectionObserver everything counts as seen at once; if
 * the observer stays silent, a position check after 1.5 s and on scroll stands
 * in for it, so nothing gated on being seen can stay hidden. Returns a cleanup.
 */
export function observeOnce(elements: Element[], onSeen: (batch: Element[]) => void, threshold = 0.6): () => void {
  if (elements.length === 0) return () => {};
  if (typeof IntersectionObserver === 'undefined') {
    onSeen(elements);
    return () => {};
  }

  const pending = new Set(elements);
  const take = (batch: Element[]) => {
    const fresh = batch.filter((el) => pending.delete(el));
    if (fresh.length) onSeen(fresh);
  };

  const io = new IntersectionObserver(
    (entries) => {
      const batch = entries.filter((e) => e.isIntersecting).map((e) => e.target);
      batch.forEach((el) => io.unobserve(el));
      take(batch);
    },
    { threshold },
  );
  elements.forEach((el) => io.observe(el));

  const check = () =>
    take(
      [...pending].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= window.innerHeight && r.bottom >= 0;
      }),
    );
  const timer = window.setTimeout(() => {
    check();
    window.addEventListener('scroll', check, { passive: true });
  }, FALLBACK_MS);

  return () => {
    io.disconnect();
    window.clearTimeout(timer);
    window.removeEventListener('scroll', check);
  };
}
