/**
 * Strips HTML tags from a string and returns plain text
 */
export function stripHtmlTags(html: string): string {
  if (!html) return '';
  
  // Create a temporary div element to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  // Get text content without HTML tags
  return temp.textContent || temp.innerText || '';
}

/**
 * Truncates text to a specified length and adds ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Strips HTML and truncates text - useful for previews
 */
export function getTextPreview(html: string, maxLength: number = 50): string {
  const plainText = stripHtmlTags(html);
  return truncateText(plainText, maxLength);
}