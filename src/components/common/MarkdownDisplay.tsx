import Image from 'next/image';

import 'katex/dist/katex.min.css';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

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
  // Parse content to handle both JSON strings and regular strings
  const parseContent = (rawContent: string): string => {
    if (!rawContent) return '';

    // Trim the content first
    const trimmed = rawContent.trim();

    // If empty after trimming, return empty string
    if (!trimmed) return '';

    // Check if it looks like a JSON string (starts and ends with quotes)
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      try {
        // Try to parse as JSON string
        const parsed = JSON.parse(trimmed);
        // If parsed successfully and result is a string, use it
        if (typeof parsed === 'string') {
          return parsed;
        }
        // If parsed but not a string, fall back to original
        return trimmed;
      } catch {
        // If JSON parsing fails, treat as regular string
        // Remove the outer quotes manually in case it's a malformed JSON string
        if (trimmed.length >= 2) {
          return trimmed.slice(1, -1);
        }
        return trimmed;
      }
    }

    // For regular strings, return as-is
    return trimmed;
  };

  const parsedContent = parseContent(content);

  // If no content after parsing, return null
  if (!parsedContent) {
    return null;
  }

  // Clean and process content for LaTeX rendering
  const processContent = (text: string): string => {
    let processed = text;

    // Remove duplicate text patterns that might occur in mathematical expressions
    processed = processed.replace(/(.+?)=(.+?)\1=\2/g, '$1=$2');

    // Handle common mathematical notation conversions
    processed = processed
      // Convert × to proper LaTeX multiplication
      .replace(/(\d+)×(\d+)/g, '$$$1 \\times $2$$')
      // Convert standalone equations with units
      .replace(/(\d+)\s*ft²/g, '$$$1 \\text{ ft}^2$$')
      // Handle addition chains
      .replace(/(\d+)\+(\d+)\+(\d+)=(\d+)/g, '$$$1 + $2 + $3 = $4$$')
      // Handle subtraction
      .replace(/(\d+)−(\d+)=(\d+)/g, '$$$1 - $2 = $3$$')
      // Handle basic equations
      .replace(/([A-Za-z\s]+)=(\d+)×(\d+)=(\d+)/g, '$$$1 = $2 \\times $3 = $4$$')
      // Wrap standalone LaTeX commands
      .replace(/\\text\{([^}]+)\}/g, '$\\text{$1}$')
      .replace(/\\boxed\{([^}]+)\}/g, '$\\boxed{$1}$');

    return processed;
  };

  const processedContent = processContent(parsedContent);

  const getCodeTheme = () => {
    if (theme === 'dark') return oneDark;
    if (theme === 'light') return oneLight;
    return oneDark; // Default to dark theme
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return 'prose-sm max-w-none';
      case 'article':
        return 'prose-lg max-w-none';
      default:
        return 'prose max-w-none';
    }
  };

  const getSpacingClasses = () => {
    switch (variant) {
      case 'compact':
        return {
          h1: 'text-lg font-bold mb-3 mt-4 first:mt-0 text-text',
          h2: 'text-base font-semibold mb-2 mt-3 text-text',
          h3: 'text-sm font-medium mb-2 mt-2 text-text',
          p: 'mb-2 text-sm leading-relaxed text-text',
          ul: 'list-disc list-inside mb-2 space-y-0.5 pl-2',
          ol: 'list-decimal list-inside mb-2 space-y-0.5 pl-2',
          li: 'text-sm text-text',
          blockquote: 'border-l-3 border-border pl-3 my-2 italic text-text-secondary',
        };
      case 'article':
        return {
          h1: 'text-3xl font-bold mb-6 mt-8 first:mt-0 text-text',
          h2: 'text-2xl font-semibold mb-4 mt-6 text-text',
          h3: 'text-xl font-medium mb-3 mt-4 text-text',
          p: 'mb-4 leading-relaxed text-text',
          ul: 'list-disc list-inside mb-4 space-y-1 pl-4',
          ol: 'list-decimal list-inside mb-4 space-y-1 pl-4',
          li: 'text-text',
          blockquote: 'border-l-4 border-border pl-6 my-4 italic text-text-secondary',
        };
      default:
        return {
          h1: 'text-xl font-bold mb-4 mt-6 first:mt-0 text-text',
          h2: 'text-lg font-semibold mb-3 mt-4 text-text',
          h3: 'text-base font-medium mb-2 mt-3 text-text',
          p: 'mb-3 text-sm leading-relaxed text-text',
          ul: 'list-disc list-inside mb-3 space-y-1 pl-3',
          ol: 'list-decimal list-inside mb-3 space-y-1 pl-3',
          li: 'text-sm text-text',
          blockquote: 'border-l-4 border-border pl-4 my-3 italic text-text-secondary',
        };
    }
  };

  const spacingClasses = getSpacingClasses();

  return (
    <div className={`${getVariantClasses()} text-text ${className}`} style={{ maxWidth }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Headings with improved spacing
          h1: ({ children }) => <h1 className={spacingClasses.h1}>{children}</h1>,
          h2: ({ children }) => <h2 className={spacingClasses.h2}>{children}</h2>,
          h3: ({ children }) => <h3 className={spacingClasses.h3}>{children}</h3>,
          h4: ({ children }) => (
            <h4 className="text-text mt-2 mb-1 text-sm font-medium">{children}</h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-text mt-2 mb-1 text-sm font-medium">{children}</h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-text mt-2 mb-1 text-sm font-medium">{children}</h6>
          ),

          // Text elements
          p: ({ children }) => <p className={spacingClasses.p}>{children}</p>,
          strong: ({ children }) => <strong className="text-text font-semibold">{children}</strong>,
          em: ({ children }) => <em className="text-text italic">{children}</em>,

          // Lists with better spacing
          ul: ({ children }) => <ul className={spacingClasses.ul}>{children}</ul>,
          ol: ({ children }) => <ol className={spacingClasses.ol}>{children}</ol>,
          li: ({ children }) => <li className={spacingClasses.li}>{children}</li>,

          // Enhanced blockquotes
          blockquote: ({ children }) => (
            <blockquote className={spacingClasses.blockquote}>{children}</blockquote>
          ),

          // Code blocks with syntax highlighting
          code: ({ inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');

            if (!inline && match) {
              return (
                <div className={variant === 'compact' ? 'my-3' : 'my-4'}>
                  <SyntaxHighlighter
                    style={getCodeTheme()}
                    language={match[1]}
                    PreTag="div"
                    className="border-border rounded-lg border"
                    showLineNumbers={showCodeLineNumbers}
                    customStyle={{
                      fontSize: variant === 'compact' ? '0.75rem' : '0.875rem',
                      margin: 0,
                      padding: '1rem',
                      backgroundColor: 'var(--color-surface-elevated)',
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
                className={`border-border bg-surface-elevated text-text rounded border px-2 py-1 font-mono ${
                  variant === 'compact' ? 'text-xs' : 'text-sm'
                }`}
                {...props}
              >
                {children}
              </code>
            );
          },

          // Enhanced links
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary decoration-primary/30 hover:text-primary/80 hover:decoration-primary/60 underline transition-colors"
            >
              {children}
            </a>
          ),

          // Enhanced tables
          table: ({ children }) => (
            <div
              className={`overflow-x-auto ${variant === 'compact' ? 'my-3' : 'my-4'} border-border rounded-lg border`}
            >
              <table className="bg-surface w-full border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th
              className={`border-border bg-surface-elevated text-text border-b px-4 py-3 text-left font-semibold ${
                variant === 'compact' ? 'text-xs' : 'text-sm'
              }`}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td
              className={`border-border text-text-secondary border-b px-4 py-3 ${
                variant === 'compact' ? 'text-xs' : 'text-sm'
              }`}
            >
              {children}
            </td>
          ),

          // Horizontal rule
          hr: () => <hr className={`border-border ${variant === 'compact' ? 'my-4' : 'my-6'}`} />,

          // Enhanced images
          img: ({ src, alt }) => {
            const imageSrc =
              typeof src === 'string' ? src : src instanceof Blob ? URL.createObjectURL(src) : '';
            return (
              <div className={`${variant === 'compact' ? 'my-3' : 'my-4'} text-center`}>
                <Image
                  src={imageSrc || ''}
                  alt={alt || ''}
                  width={800}
                  height={600}
                  className="border-border h-auto max-w-full rounded-lg border shadow-sm"
                  style={{ width: '100%', height: 'auto' }}
                />
                {alt && <p className="text-text-muted mt-2 text-xs italic">{alt}</p>}
              </div>
            );
          },

          // Strikethrough
          del: ({ children }) => <del className="text-text-muted line-through">{children}</del>,

          // Task lists
          input: ({ type, checked, disabled }) =>
            type === 'checkbox' ? (
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                className="accent-primary mr-2 scale-110"
                readOnly
              />
            ) : null,
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
