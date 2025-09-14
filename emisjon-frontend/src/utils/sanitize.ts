/**
 * Enkel HTML-sanitizer:
 * - Fjerner <script>, on* attributter
 * - Tillater trygg grunn-markup (p, ul, ol, li, strong, em, a, br, h1-h6, div, span)
 *
 * For produksjon anbefales DOMPurify e.l., men dette er et trygt minimum uten lib.
 */
export function sanitizeHtml(input?: string) {
  if (!input) return '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(input, 'text/html');

  const ALLOWED = new Set([
    'P','UL','OL','LI','STRONG','EM','A','BR','H1','H2','H3','H4','H5','H6','DIV','SPAN'
  ]);

  const walk = (node: Element) => {
    // fjern script og event-attrib.
    if (node.tagName === 'SCRIPT') {
      node.remove();
      return;
    }

    // remove event handler attributes (on*)
    [...node.attributes].forEach(attr => {
      if (/^on/i.test(attr.name)) node.removeAttribute(attr.name);
      if (node.tagName === 'A' && attr.name === 'href' && attr.value.startsWith('javascript:')) {
        node.removeAttribute('href');
      }
    });

    // hvis ikke lov, unwrap (behold barn)
    if (!ALLOWED.has(node.tagName)) {
      const parent = node.parentElement;
      if (parent) {
        while (node.firstChild) parent.insertBefore(node.firstChild, node);
        parent.removeChild(node);
      }
      return;
    }

    // rekursivt
    [...node.children].forEach(walk);
  };

  [...doc.body.children].forEach(walk);
  return doc.body.innerHTML;
}