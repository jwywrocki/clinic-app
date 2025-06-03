// Prosta funkcja do sanityzacji HTML - usuwa potencjalnie niebezpieczne tagi
export function sanitizeHtml(html: string): string {
    if (!html) return '';

    // Lista dozwolonych tagów HTML
    const allowedTags = [
        'p',
        'br',
        'strong',
        'b',
        'em',
        'i',
        'u',
        'ul',
        'ol',
        'li',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'blockquote',
        'a',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        'img',
        'span',
        'div',
        'ul',
        'ol',
        'li',
    ];

    // Usuń potencjalnie niebezpieczne tagi
    let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
    sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '');
    sanitized = sanitized.replace(/javascript:/gi, '');

    return sanitized;
}

export function stripHtmlTags(html: string): string {
    if (!html) return '';
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
}

export function textToHtml(text: string): string {
    if (!text) return '';

    return text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>').replace(/^/, '<p>').replace(/$/, '</p>');
}

export function sanitizePhoneNumberHtml(html: string | null | undefined): string {
    if (!html) return '';
    let sanitizedHtml = html;
    // Remove <font...> and </font> tags
    sanitizedHtml = sanitizedHtml.replace(/<\/?font[^>]*>/gi, '');
    // Remove <span...> and </span> tags
    sanitizedHtml = sanitizedHtml.replace(/<\/?span[^>]*>/gi, '');
    return sanitizedHtml;
}
