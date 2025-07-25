'use client';

import { useState } from 'react';

// MDXEditor imports
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  ChangeCodeMirrorLanguage,
  CodeToggle,
  ConditionalContents,
  CreateLink,
  InsertTable,
  InsertThematicBreak,
  ListsToggle,
  MDXEditor,
  Separator,
  UndoRedo,
  codeBlockPlugin,
  codeMirrorPlugin,
  headingsPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  minCharacters?: number;
  maxCharacters?: number;
  showCharacterCount?: boolean;
  showModeToggle?: boolean;
  disabled?: boolean;
  className?: string;
  height?: string;
  label?: string;
  required?: boolean;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Start writing...',
  error,
  minCharacters,
  maxCharacters,
  showCharacterCount = false,
  showModeToggle = true,
  disabled = false,
  className = '',
  height = '150px',
  label,
  required = false,
}: MarkdownEditorProps) {
  const [editorMode, setEditorMode] = useState<'rich' | 'source'>('rich');

  // Calculate character count for markdown content (strip markdown syntax)
  const getPlainTextLength = (markdown: string) => {
    if (!markdown) return 0;
    // Remove markdown syntax for character counting
    return markdown
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/~~(.*?)~~/g, '$1') // Remove strikethrough
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
      .replace(/!\[(.*?)\]\(.*?\)/g, '$1') // Remove images
      .replace(/>\s/g, '') // Remove blockquotes
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .trim().length;
  };

  const characterCount = getPlainTextLength(value);
  const isOverMaxLength = maxCharacters && characterCount > maxCharacters;
  const isUnderMinLength = minCharacters && characterCount < minCharacters;

  const handleChange = (newValue: string) => {
    if (disabled) return;

    // Check max character limit
    if (maxCharacters && getPlainTextLength(newValue) > maxCharacters) {
      return; // Don't update if over limit
    }

    onChange(newValue);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      {label && (
        <label className="text-text block text-sm font-medium">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}

      {/* Mode Toggle */}
      {showModeToggle && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setEditorMode('rich')}
              disabled={disabled}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                editorMode === 'rich'
                  ? 'bg-primary text-background'
                  : 'bg-surface-elevated text-text hover:bg-border'
              }`}
            >
              Rich Text
            </button>
            <button
              type="button"
              onClick={() => setEditorMode('source')}
              disabled={disabled}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                editorMode === 'source'
                  ? 'bg-primary text-background'
                  : 'bg-surface-elevated text-text hover:bg-border'
              }`}
            >
              Source
            </button>
          </div>
          <div className="text-text-muted text-xs">
            {editorMode === 'rich' ? 'WYSIWYG Editor' : 'Markdown Source'}
          </div>
        </div>
      )}

      {/* Editor Container */}
      <div
        className={`border-border overflow-hidden rounded-lg border ${disabled ? 'opacity-50' : ''} ${error ? 'border-error' : ''}`}
      >
        {typeof window !== 'undefined' && (
          <>
            {editorMode === 'rich' ? (
              <MDXEditor
                markdown={value}
                onChange={handleChange}
                readOnly={disabled}
                plugins={[
                  toolbarPlugin({
                    toolbarContents: () => (
                      <>
                        <UndoRedo />
                        <Separator />
                        <BoldItalicUnderlineToggles />
                        <CodeToggle />
                        <Separator />
                        <BlockTypeSelect />
                        <Separator />
                        <CreateLink />
                        <ListsToggle />
                        <Separator />
                        <InsertTable />
                        <InsertThematicBreak />
                        <Separator />
                        <ConditionalContents
                          options={[
                            {
                              when: (editor) => editor?.editorType === 'codeblock',
                              contents: () => <ChangeCodeMirrorLanguage />,
                            },
                          ]}
                        />
                      </>
                    ),
                  }),
                  headingsPlugin(),
                  listsPlugin(),
                  quotePlugin(),
                  thematicBreakPlugin(),
                  markdownShortcutPlugin(),
                  linkPlugin(),
                  tablePlugin(),
                  codeBlockPlugin({
                    defaultCodeBlockLanguage: 'js',
                    codeBlockEditorDescriptors: [],
                  }),
                  codeMirrorPlugin({
                    codeBlockLanguages: {
                      js: 'JavaScript',
                      ts: 'TypeScript',
                      jsx: 'JSX',
                      tsx: 'TSX',
                      css: 'CSS',
                      html: 'HTML',
                      json: 'JSON',
                      md: 'Markdown',
                      txt: 'Text',
                      python: 'Python',
                      sql: 'SQL',
                      bash: 'Bash',
                      yaml: 'YAML',
                    },
                  }),
                ]}
                placeholder={placeholder}
                className="prose dark:prose-invert max-w-none"
                contentEditableClassName={`p-4 prose dark:prose-invert max-w-none focus:outline-none ${disabled ? 'cursor-not-allowed' : ''}`}
                // style={{ minHeight: height }}
              />
            ) : (
              <textarea
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={`# ${placeholder}

You can use **bold**, *italic*, and other markdown syntax here.

## Subheading
- Bullet points
- [Links](https://example.com)
- \`inline code\`

\`\`\`js
// Code blocks
console.log('Hello world!');
\`\`\``}
                disabled={disabled}
                className={`text-text placeholder-text-muted w-full resize-none bg-transparent p-4 font-mono text-sm outline-none ${
                  disabled ? 'cursor-not-allowed' : ''
                }`}
                style={{
                  minHeight: height,
                  fontFamily:
                    'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                }}
              />
            )}
          </>
        )}
      </div>

      {/* Footer with error, character count, and validation status */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          {error && <span className="text-error">{error}</span>}
        </div>

        <div className="flex items-center space-x-3">
          {/* Validation indicators */}
          {minCharacters && (
            <span className={isUnderMinLength ? 'text-warning' : 'text-success'}>
              {isUnderMinLength ? '⚠' : '✓'} Min: {minCharacters}
            </span>
          )}

          {/* Character count */}
          {(showCharacterCount || minCharacters || maxCharacters) && (
            <span
              className={`${
                isOverMaxLength
                  ? 'text-error'
                  : isUnderMinLength
                    ? 'text-warning'
                    : 'text-text-muted'
              }`}
            >
              {characterCount}
              {minCharacters && `/${minCharacters} min`}
              {maxCharacters && `/${maxCharacters} max`}
              {!minCharacters && !maxCharacters && ' characters'}
            </span>
          )}

          {/* Mode indicator for source mode */}
          {editorMode === 'source' && <span className="text-text-muted opacity-70">Markdown</span>}
        </div>
      </div>
    </div>
  );
}
