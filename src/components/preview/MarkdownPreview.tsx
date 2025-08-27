import React, { useMemo, useRef, useCallback } from 'react';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeStringify from 'rehype-stringify';

export interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  content,
  className = '',
}) => {
  const previewRef = useRef<HTMLDivElement>(null);

  // Process markdown content
  const htmlContent = useMemo(() => {
    try {
      const result = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkMath)
        .use(remarkBreaks)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeRaw)
        .use(rehypeHighlight, {
          detect: true,
          ignoreMissing: true,
        })
        .use(rehypeKatex)
        .use(rehypeStringify)
        .processSync(content);

      return String(result);
    } catch (error) {
      console.error('Markdown processing error:', error);
      return `<pre>${content}</pre>`;
    }
  }, [content]);

  // Handle link clicks
  const handleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A') {
      e.preventDefault();
      const href = target.getAttribute('href');
      
      if (href) {
        if (href.startsWith('http://') || href.startsWith('https://')) {
          console.log('Opening external link:', href);
          // TODO: Use Tauri shell API to open external links
        } else if (href.startsWith('#')) {
          const element = document.getElementById(href.substring(1));
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    }
  }, []);

  return (
    <div 
      ref={previewRef}
      className={`${className}`}
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      style={{
        height: '100%',
        width: '100%',
        overflow: 'auto',
        padding: '16px',
        color: 'var(--text-primary)',
        backgroundColor: 'var(--bg-secondary)',
      }}
    />
  );
};

export default MarkdownPreview;