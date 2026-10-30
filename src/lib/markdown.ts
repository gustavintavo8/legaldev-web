import DOMPurify from 'dompurify';
import { marked } from 'marked';

// The report is LLM output that can echo the user's description, so it is
// sanitized before it reaches innerHTML.
export function renderMarkdown(md: string): string {
  return DOMPurify.sanitize(marked.parse(md, { async: false }));
}
