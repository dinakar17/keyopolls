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
  if (!content?.trim()) {
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

  const processedContent = processContent(content);

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
          h1: 'text-lg font-bold mb-3 mt-4 first:mt-0',
          h2: 'text-base font-semibold mb-2 mt-3',
          h3: 'text-sm font-medium mb-2 mt-2',
          p: 'mb-2 text-sm leading-relaxed',
          ul: 'list-disc list-inside mb-2 space-y-0.5 pl-2',
          ol: 'list-decimal list-inside mb-2 space-y-0.5 pl-2',
          li: 'text-sm',
          blockquote:
            'border-l-3 border-gray-300 dark:border-gray-600 pl-3 my-2 italic text-gray-600 dark:text-gray-400',
        };
      case 'article':
        return {
          h1: 'text-3xl font-bold mb-6 mt-8 first:mt-0',
          h2: 'text-2xl font-semibold mb-4 mt-6',
          h3: 'text-xl font-medium mb-3 mt-4',
          p: 'mb-4 leading-relaxed',
          ul: 'list-disc list-inside mb-4 space-y-1 pl-4',
          ol: 'list-decimal list-inside mb-4 space-y-1 pl-4',
          li: '',
          blockquote:
            'border-l-4 border-gray-300 dark:border-gray-600 pl-6 my-4 italic text-gray-600 dark:text-gray-400',
        };
      default:
        return {
          h1: 'text-xl font-bold mb-4 mt-6 first:mt-0',
          h2: 'text-lg font-semibold mb-3 mt-4',
          h3: 'text-base font-medium mb-2 mt-3',
          p: 'mb-3 text-sm leading-relaxed',
          ul: 'list-disc list-inside mb-3 space-y-1 pl-3',
          ol: 'list-decimal list-inside mb-3 space-y-1 pl-3',
          li: 'text-sm',
          blockquote:
            'border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-3 italic text-gray-600 dark:text-gray-400',
        };
    }
  };

  const spacingClasses = getSpacingClasses();

  return (
    <div
      className={`prose dark:prose-invert ${getVariantClasses()} text-gray-900 dark:text-gray-100 ${className}`}
      style={{ maxWidth }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Headings with improved spacing
          h1: ({ children }) => <h1 className={spacingClasses.h1}>{children}</h1>,
          h2: ({ children }) => <h2 className={spacingClasses.h2}>{children}</h2>,
          h3: ({ children }) => <h3 className={spacingClasses.h3}>{children}</h3>,
          h4: ({ children }) => <h4 className="mt-2 mb-1 text-sm font-medium">{children}</h4>,
          h5: ({ children }) => <h5 className="mt-2 mb-1 text-sm font-medium">{children}</h5>,
          h6: ({ children }) => <h6 className="mt-2 mb-1 text-sm font-medium">{children}</h6>,

          // Text elements
          p: ({ children }) => <p className={spacingClasses.p}>{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900 dark:text-gray-100">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,

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
                    className="rounded-lg border border-gray-200 dark:border-gray-700"
                    showLineNumbers={showCodeLineNumbers}
                    customStyle={{
                      fontSize: variant === 'compact' ? '0.75rem' : '0.875rem',
                      margin: 0,
                      padding: '1rem',
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
                className={`rounded border border-gray-200 bg-gray-100 px-2 py-1 font-mono text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 ${
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
              className="text-blue-600 underline decoration-blue-600/30 transition-colors hover:text-blue-800 hover:decoration-blue-800/60 dark:text-blue-400 dark:decoration-blue-400/30 dark:hover:text-blue-300 dark:hover:decoration-blue-300/60"
            >
              {children}
            </a>
          ),

          // Enhanced tables
          table: ({ children }) => (
            <div
              className={`overflow-x-auto ${variant === 'compact' ? 'my-3' : 'my-4'} rounded-lg border border-gray-200 dark:border-gray-700`}
            >
              <table className="w-full border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th
              className={`border-b border-gray-200 bg-gray-50 px-4 py-3 text-left font-semibold text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 ${
                variant === 'compact' ? 'text-xs' : 'text-sm'
              }`}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td
              className={`border-b border-gray-200 px-4 py-3 text-gray-700 dark:border-gray-700 dark:text-gray-300 ${
                variant === 'compact' ? 'text-xs' : 'text-sm'
              }`}
            >
              {children}
            </td>
          ),

          // Horizontal rule
          hr: () => (
            <hr
              className={`border-gray-300 dark:border-gray-600 ${variant === 'compact' ? 'my-4' : 'my-6'}`}
            />
          ),

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
                  className="h-auto max-w-full rounded-lg border border-gray-200 shadow-md dark:border-gray-700"
                  style={{ width: '100%', height: 'auto' }}
                />
                {alt && (
                  <p className="mt-2 text-xs text-gray-500 italic dark:text-gray-400">{alt}</p>
                )}
              </div>
            );
          },

          // Strikethrough
          del: ({ children }) => (
            <del className="text-gray-500 line-through dark:text-gray-400">{children}</del>
          ),

          // Task lists
          input: ({ type, checked, disabled }) =>
            type === 'checkbox' ? (
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                className="mr-2 scale-110 accent-blue-600 dark:accent-blue-400"
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
