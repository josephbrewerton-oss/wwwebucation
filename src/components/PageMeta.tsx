import React, { useEffect } from 'react';

export interface PageMetaProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

/**
 * Standard client-side React component to set document title, meta description,
 * OpenGraph social share cards, Twitter cards, and canonical link synchronization.
 */
export default function PageMeta({ title, description, children }: PageMetaProps): React.JSX.Element {
  useEffect(() => {
    // 1. Title formatting: Avoid generic 'Home' placeholder
    const isHomeOrBranded = !title || title.trim().toLowerCase() === 'home' || title.includes("St Joseph's Curriculum Portal");
    const fullTitle = isHomeOrBranded
      ? "St Joseph's Curriculum Portal — Education Should Be Free"
      : `${title} — St Joseph's Curriculum Portal`;

    document.title = fullTitle;

    const setMetaTag = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        const [attrName, attrVal] = selector.replace(/^meta\[|\]$/g, '').split('=');
        if (attrName && attrVal) {
          el.setAttribute(attrName, attrVal.replace(/['"]/g, ''));
        }
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    // 2. OpenGraph & Twitter Titles
    setMetaTag('meta[property="og:title"]', 'content', fullTitle);
    setMetaTag('meta[name="twitter:title"]', 'content', fullTitle);

    // 3. Descriptions
    if (description) {
      setMetaTag('meta[name="description"]', 'content', description);
      setMetaTag('meta[property="og:description"]', 'content', description);
      setMetaTag('meta[name="twitter:description"]', 'content', description);
    }

    // 4. URL & Canonical Resolution
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href;
      const canonicalUrl = window.location.origin + window.location.pathname;

      setMetaTag('meta[property="og:url"]', 'content', currentUrl);

      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', canonicalUrl);
    }
  }, [title, description]);

  return <>{children}</>;
}
