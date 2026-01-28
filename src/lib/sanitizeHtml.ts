import DOMPurify from 'dompurify';

/**
 * Strict DOMPurify configuration for AI-generated content
 * Only allows safe HTML elements and attributes needed for the LLM curriculum
 */
const STRICT_SANITIZE_CONFIG = {
  // Allowed HTML tags for curriculum content
  ALLOWED_TAGS: [
    // Structure
    'div', 'span', 'section', 'article', 'main', 'header', 'footer', 'nav',
    // Text
    'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'b', 'i', 'u',
    'small', 'mark', 'del', 'ins', 'sub', 'sup', 'br', 'hr',
    // Lists
    'ul', 'ol', 'li', 'dl', 'dt', 'dd',
    // Tables
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
    // Forms (for interactive curriculum)
    'button', 'input', 'textarea', 'label', 'fieldset', 'legend', 'select', 'option', 'optgroup',
    // Code
    'code', 'pre', 'kbd', 'samp', 'var',
    // Links and media (sanitized)
    'a', 'img',
    // Semantic
    'blockquote', 'cite', 'q', 'abbr', 'address', 'time', 'figure', 'figcaption',
    // Details
    'details', 'summary',
  ],
  // Allowed attributes - strict set for security
  ALLOWED_ATTR: [
    // Global
    'class', 'id', 'title', 'lang', 'dir', 'hidden',
    // Interactive curriculum data attributes
    'data-interaction-id', 'data-value-from', 'data-step', 'data-module', 'data-phase',
    // Form attributes
    'type', 'name', 'value', 'placeholder', 'required', 'disabled', 'readonly',
    'maxlength', 'minlength', 'pattern', 'autocomplete', 'rows', 'cols',
    // Button attributes
    'aria-label', 'aria-labelledby', 'aria-describedby', 'role',
    // Links (href sanitized separately)
    'href', 'target', 'rel',
    // Images (src sanitized separately)
    'src', 'alt', 'width', 'height', 'loading',
    // Table
    'colspan', 'rowspan', 'scope',
    // Input types
    'checked', 'selected', 'multiple', 'min', 'max', 'step',
  ],
  // Security settings
  ALLOW_DATA_ATTR: true, // Allow data-* attributes (needed for interactions)
  ALLOW_UNKNOWN_PROTOCOLS: false,
  SAFE_FOR_TEMPLATES: false,
  WHOLE_DOCUMENT: false,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  FORCE_BODY: false,
  SANITIZE_DOM: true,
};

/**
 * Sanitize HTML content with strict configuration
 * Use this for all AI-generated or user-provided HTML content
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, STRICT_SANITIZE_CONFIG);
}

/**
 * Sanitize HTML and log if content was modified (for monitoring)
 * Use in development to detect XSS attempts
 */
export function sanitizeHtmlWithLogging(dirty: string, context?: string): string {
  const cleaned = DOMPurify.sanitize(dirty, STRICT_SANITIZE_CONFIG);
  
  // Log if content was modified (potential XSS attempt)
  if (cleaned.length !== dirty.length || cleaned !== dirty) {
    const removedLength = dirty.length - cleaned.length;
    if (removedLength > 0) {
      console.warn(
        `[DOMPurify] Content sanitized (${removedLength} chars removed)`,
        context ? `Context: ${context}` : ''
      );
    }
  }
  
  return cleaned;
}

/**
 * Default export for simple usage
 */
export default sanitizeHtml;
