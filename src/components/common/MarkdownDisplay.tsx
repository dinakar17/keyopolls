import Image from 'next/image';

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

interface MarkdownDisplayProps {
  content: string;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  variant?: 'default' | 'compact' | 'article';
  showCodeLineNumbers?: boolean;
  maxWidth?: string;
}

export default function MarkdownDisplay({
  content,
  className = '',
  theme = 'auto',
  variant = 'default',
  showCodeLineNumbers = false,
  maxWidth = 'none',
}: MarkdownDisplayProps) {
  if (!content?.trim()) {
    return null;
  }

  // Determine syntax highlighter theme
  const getCodeTheme = () => {
    if (theme === 'dark') return oneDark;
    if (theme === 'light') return oneLight;
    // Auto theme - you can customize this based on your app's theme detection
    return oneDark;
  };

  // Variant-specific classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return 'prose-sm';
      case 'article':
        return 'prose-lg';
      default:
        return 'prose-sm';
    }
  };

  // Spacing classes based on variant
  const getSpacingClasses = () => {
    switch (variant) {
      case 'compact':
        return {
          h1: 'text-base font-bold mb-2',
          h2: 'text-sm font-semibold mb-1.5',
          h3: 'text-sm font-medium mb-1',
          p: 'mb-1.5 last:mb-0 text-sm',
          ul: 'list-disc list-inside mb-1.5 space-y-0.5',
          ol: 'list-decimal list-inside mb-1.5 space-y-0.5',
          li: 'text-sm',
          blockquote: 'border-l-3 border-border pl-2 my-1.5 italic text-text-secondary text-sm',
        };
      case 'article':
        return {
          h1: 'text-2xl font-bold mb-4',
          h2: 'text-xl font-semibold mb-3',
          h3: 'text-lg font-medium mb-2',
          p: 'mb-3 last:mb-0 leading-relaxed',
          ul: 'list-disc list-inside mb-3 space-y-1',
          ol: 'list-decimal list-inside mb-3 space-y-1',
          li: '',
          blockquote: 'border-l-4 border-border pl-4 my-3 italic text-text-secondary',
        };
      default:
        return {
          h1: 'text-lg font-bold mb-2',
          h2: 'text-base font-semibold mb-2',
          h3: 'text-sm font-medium mb-1',
          p: 'mb-2 last:mb-0 text-sm leading-relaxed',
          ul: 'list-disc list-inside mb-2 space-y-1',
          ol: 'list-decimal list-inside mb-2 space-y-1',
          li: 'text-sm',
          blockquote: 'border-l-4 border-border pl-3 my-2 italic text-text-secondary',
        };
    }
  };

  const spacingClasses = getSpacingClasses();

  return (
    <div
      className={`prose dark:prose-invert ${getVariantClasses()} text-text ${className}`}
      style={{ maxWidth }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ children }) => <h1 className={spacingClasses.h1}>{children}</h1>,
          h2: ({ children }) => <h2 className={spacingClasses.h2}>{children}</h2>,
          h3: ({ children }) => <h3 className={spacingClasses.h3}>{children}</h3>,
          h4: ({ children }) => <h4 className="mb-1 text-sm font-medium">{children}</h4>,
          h5: ({ children }) => <h5 className="mb-1 text-sm font-medium">{children}</h5>,
          h6: ({ children }) => <h6 className="mb-1 text-sm font-medium">{children}</h6>,

          // Text elements
          p: ({ children }) => <p className={spacingClasses.p}>{children}</p>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,

          // Lists
          ul: ({ children }) => <ul className={spacingClasses.ul}>{children}</ul>,
          ol: ({ children }) => <ol className={spacingClasses.ol}>{children}</ol>,
          li: ({ children }) => <li className={spacingClasses.li}>{children}</li>,

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className={spacingClasses.blockquote}>{children}</blockquote>
          ),

          // Code elements
          code: ({ inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');

            if (!inline && match) {
              return (
                <div className={variant === 'compact' ? 'my-2' : 'my-3'}>
                  <SyntaxHighlighter
                    style={getCodeTheme()}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-md"
                    showLineNumbers={showCodeLineNumbers}
                    customStyle={{
                      fontSize: variant === 'compact' ? '0.75rem' : '0.875rem',
                      margin: 0,
                    }}
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                </div>
              );
            }

            return (
              <code
                className={`bg-surface-elevated text-text rounded px-1 py-0.5 font-mono ${
                  variant === 'compact' ? 'text-xs' : 'text-sm'
                }`}
                {...props}
              >
                {children}
              </code>
            );
          },

          // Links
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 decoration-primary/30 hover:decoration-primary/60 underline transition-colors"
            >
              {children}
            </a>
          ),

          // Tables
          table: ({ children }) => (
            <div className={`overflow-x-auto ${variant === 'compact' ? 'my-2' : 'my-3'}`}>
              <table className="border-border w-full border-collapse border">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th
              className={`border-border bg-surface-elevated border px-3 py-2 text-left font-medium ${
                variant === 'compact' ? 'text-xs' : 'text-sm'
              }`}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td
              className={`border-border border px-3 py-2 ${
                variant === 'compact' ? 'text-xs' : 'text-sm'
              }`}
            >
              {children}
            </td>
          ),

          // Horizontal rule
          hr: () => <hr className={`border-border ${variant === 'compact' ? 'my-3' : 'my-4'}`} />,
          // Images
          img: ({ src, alt }) => {
            const imageSrc =
              typeof src === 'string' ? src : src instanceof Blob ? URL.createObjectURL(src) : '';
            return (
              <div className={variant === 'compact' ? 'my-2' : 'my-3'}>
                <Image
                  src={imageSrc || ''}
                  alt={alt || ''}
                  width={800}
                  height={600}
                  className="h-auto max-w-full rounded-lg"
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
            );
          },
          // Strikethrough (from GFM)
          del: ({ children }) => <del className="text-text-secondary line-through">{children}</del>,

          // Task lists (from GFM)
          input: ({ type, checked, disabled }) =>
            type === 'checkbox' ? (
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                className="accent-primary mr-2"
                readOnly
              />
            ) : null,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
