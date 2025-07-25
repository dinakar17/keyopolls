'use client';

import { useEffect, useRef, useState } from 'react';

import { UseFormReturn } from 'react-hook-form';

import { useKeyopollsCommonApiTagsGetTagsList } from '@/api/tags/tags';
import MarkdownEditor from '@/components/common/MarkdownEditor';
import { PollFormData } from '@/types';

interface PollFormSettingsProps {
  form: UseFormReturn<PollFormData>;
  handleMaxChoicesSelect: (choices: number) => void;
}

export default function PollFormSettings({ form, handleMaxChoicesSelect }: PollFormSettingsProps) {
  // Tags state
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [highlightedSuggestionIndex, setHighlightedSuggestionIndex] = useState(-1);

  const { data: tagsData, isLoading: tagsLoading } = useKeyopollsCommonApiTagsGetTagsList(
    {
      search: tagInput,
      per_page: 10,
      order_by: '-usage_count',
    },
    {
      query: {
        enabled: showTagSuggestions && tagInput.length >= 1,
      },
    }
  );

  const tagInputRef = useRef<HTMLInputElement>(null);

  // Watch form values
  const watchedOptions = form.watch('options');
  const watchedPollType = form.watch('poll_type');
  const watchedMaxChoices = form.watch('max_choices');
  const watchedTags = form.watch('tags') || [];
  const watchedExplanation = form.watch('explanation');

  // Get available tag suggestions
  const availableTags = tagsData?.data.tags || [];
  const filteredSuggestions = availableTags.filter(
    (tag) =>
      !watchedTags.some((selectedTag) => selectedTag.toLowerCase() === tag.name.toLowerCase())
  );

  // Handle tag input changes
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
    setHighlightedSuggestionIndex(-1);
    setShowTagSuggestions(e.target.value.length >= 1);
  };

  // Handle tag input key events
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        setHighlightedSuggestionIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        setHighlightedSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedSuggestionIndex >= 0 && filteredSuggestions[highlightedSuggestionIndex]) {
        selectTag(filteredSuggestions[highlightedSuggestionIndex].name);
      } else {
        addNewTag();
      }
    } else if (e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addNewTag();
    } else if (e.key === 'Backspace' && tagInput === '' && watchedTags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      removeTag(watchedTags.length - 1);
    } else if (e.key === 'Escape') {
      setShowTagSuggestions(false);
      setHighlightedSuggestionIndex(-1);
    }
  };

  // Add new tag (user typed)
  const addNewTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !watchedTags.includes(trimmedTag) && watchedTags.length < 5) {
      const currentTags = form.getValues('tags') || [];
      form.setValue('tags', [...currentTags, trimmedTag]);
      setTagInput('');
      setShowTagSuggestions(false);
      setHighlightedSuggestionIndex(-1);
    }
  };

  // Select existing tag
  const selectTag = (tagName: string) => {
    const normalizedTag = tagName.toLowerCase();
    if (!watchedTags.includes(normalizedTag) && watchedTags.length < 5) {
      const currentTags = form.getValues('tags') || [];
      form.setValue('tags', [...currentTags, normalizedTag]);
      setTagInput('');
      setShowTagSuggestions(false);
      setHighlightedSuggestionIndex(-1);
    }
  };

  // Remove tag
  const removeTag = (index: number) => {
    const currentTags = form.getValues('tags') || [];
    const newTags = currentTags.filter((_, i) => i !== index);
    form.setValue('tags', newTags);
  };

  // Handle tag input focus
  const handleTagInputFocus = () => {
    if (tagInput.length >= 1) {
      setShowTagSuggestions(true);
    }
  };

  // Handle tag input blur
  const handleTagInputBlur = () => {
    // Use setTimeout to allow click events on suggestions to fire first
    setTimeout(() => {
      if (tagInput.trim()) {
        addNewTag();
      }
      setShowTagSuggestions(false);
      setHighlightedSuggestionIndex(-1);
    }, 150);
  };

  // Handle suggestion click
  const handleSuggestionClick = (tagName: string) => {
    selectTag(tagName);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagInputRef.current && !tagInputRef.current.contains(event.target as Node)) {
        setShowTagSuggestions(false);
        setHighlightedSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formErrors = form.formState.errors;

  return (
    <>
      {/* Enhanced Tags Input with Suggestions */}
      <div className="border-border bg-surface space-y-3 rounded-lg border p-3">
        <div>
          <h3 className="text-text text-sm font-medium">Tags</h3>
          <p className="text-text-muted text-xs">
            Add tags to help people discover your poll (max 5)
          </p>
        </div>

        <div className="space-y-2">
          {/* Tag Display */}
          {watchedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {watchedTags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-primary/10 text-primary border-primary/20 flex items-center space-x-1 rounded-full border px-2 py-1 text-xs"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className="text-primary hover:text-primary/70 ml-1 flex h-3 w-3 items-center justify-center rounded-full text-xs"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Tag Input with Suggestions */}
          {watchedTags.length < 5 && (
            <div className="relative" ref={tagInputRef}>
              <input
                type="text"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagInputKeyDown}
                onBlur={handleTagInputBlur}
                onFocus={handleTagInputFocus}
                placeholder={
                  watchedTags.length === 0
                    ? 'Type to search existing tags or create new ones...'
                    : 'Add another tag...'
                }
                className="border-border bg-surface-elevated text-text placeholder-text-muted focus:border-primary w-full rounded-lg border px-3 py-2 text-sm outline-none"
                maxLength={50}
              />

              {/* Tag Suggestions Dropdown */}
              {showTagSuggestions && (
                <div className="border-border bg-surface absolute top-full right-0 left-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border shadow-lg">
                  {tagsLoading && (
                    <div className="flex items-center justify-center p-3">
                      <div className="text-text-muted text-sm">Loading tags...</div>
                    </div>
                  )}

                  {!tagsLoading && filteredSuggestions.length > 0 && (
                    <>
                      <div className="border-border bg-surface-elevated text-text-muted border-b px-3 py-2 text-xs font-medium">
                        Existing Tags
                      </div>
                      {filteredSuggestions.map((tag, index) => (
                        <button
                          key={tag.id}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()} // Prevent blur
                          onClick={() => handleSuggestionClick(tag.name)}
                          onMouseEnter={() => setHighlightedSuggestionIndex(index)}
                          className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                            index === highlightedSuggestionIndex
                              ? 'bg-primary text-background'
                              : 'text-text hover:bg-surface-elevated'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{tag.name}</span>
                            <span className="text-xs opacity-70">
                              {tag.usage_count} {tag.usage_count === 1 ? 'use' : 'uses'}
                            </span>
                          </div>
                          {tag.description && (
                            <div className="mt-1 truncate text-xs opacity-70">
                              {tag.description}
                            </div>
                          )}
                        </button>
                      ))}
                    </>
                  )}

                  {!tagsLoading &&
                    tagInput.trim() &&
                    !filteredSuggestions.some(
                      (tag) => tag.name.toLowerCase() === tagInput.trim().toLowerCase()
                    ) && (
                      <>
                        {filteredSuggestions.length > 0 && (
                          <div className="border-border border-t"></div>
                        )}
                        <button
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => addNewTag()}
                          className="text-text hover:bg-surface-elevated w-full px-3 py-2 text-left text-sm transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                            <span>Create "{tagInput.trim()}"</span>
                          </div>
                        </button>
                      </>
                    )}

                  {!tagsLoading && filteredSuggestions.length === 0 && !tagInput.trim() && (
                    <div className="text-text-muted p-3 text-center text-sm">
                      Start typing to search or create tags
                    </div>
                  )}

                  {!tagsLoading && filteredSuggestions.length === 0 && tagInput.trim() && (
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => addNewTag()}
                      className="text-text hover:bg-surface-elevated w-full px-3 py-2 text-left text-sm transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        <span>Create "{tagInput.trim()}"</span>
                      </div>
                    </button>
                  )}
                </div>
              )}

              <div className="mt-1 flex items-center justify-between">
                <div className="text-xs">
                  {formErrors.tags && <p className="text-error">{formErrors.tags.message}</p>}
                </div>
                <div className="text-text-muted text-xs">
                  {watchedTags.length}/5 tags
                  {showTagSuggestions && !tagsLoading && (
                    <span className="ml-2 opacity-70">
                      ↑↓ navigate • Enter to select • Esc to close
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Correct Answer Settings (mandatory) */}
      <div className="border-border bg-surface space-y-3 rounded-lg border p-3">
        <div>
          <h3 className="text-text text-sm font-medium">Correct Answer</h3>
          <p className="text-text-muted text-xs">Set the correct answer for this poll</p>
        </div>

        <div className="space-y-3">
          {watchedPollType === 'text_input' && (
            <div>
              <label className="text-text-secondary mb-2 block text-sm">
                Correct text answer (single word/number) *
              </label>
              <input
                {...form.register('correct_text_answer')}
                type="text"
                placeholder="Enter correct answer"
                className="border-border bg-surface-elevated text-text placeholder-text-muted focus:border-primary w-full rounded-lg border px-3 py-2 text-sm outline-none"
              />
              {formErrors.correct_text_answer && (
                <p className="text-error mt-1 text-sm">{formErrors.correct_text_answer.message}</p>
              )}
            </div>
          )}

          {watchedPollType === 'single' && (
            <p className="text-text-muted text-sm">
              Check the correct option above. Only one option can be marked as correct.
            </p>
          )}

          {watchedPollType === 'multiple' && (
            <p className="text-text-muted text-sm">
              Check all correct options above. Users must select exactly all correct options to be
              marked as correct.
            </p>
          )}

          {watchedPollType === 'ranking' && (
            <p className="text-text-muted text-sm">
              The correct ranking will be based on the current order of your options. Users must
              rank them in the exact same order to be marked as correct.
            </p>
          )}
        </div>
      </div>

      {/* Explanation with MarkdownEditor (mandatory) */}
      <div className="border-border bg-surface space-y-3 rounded-lg border p-3">
        <div>
          <h3 className="text-text text-sm font-medium">Explanation *</h3>
          <p className="text-text-muted text-xs">
            Provide a detailed explanation for the correct answer (minimum 250 characters)
          </p>
        </div>

        <MarkdownEditor
          value={watchedExplanation || ''}
          onChange={(value) => {
            form.setValue('explanation', value);
            form.trigger('explanation');
          }}
          label=""
          placeholder="Explain why this is the correct answer. Include relevant details, context, and reasoning to help users understand the concept better..."
          minCharacters={250}
          showCharacterCount={true}
          error={formErrors.explanation?.message}
          height="200px"
          required={true}
          showModeToggle={true}
          className="w-full"
        />
      </div>

      {/* Multiple Choice Settings */}
      {watchedPollType === 'multiple' && (
        <div className="border-border bg-surface space-y-3 rounded-lg border p-3">
          <h3 className="text-text text-sm font-medium">Multiple Choice Settings</h3>

          <div>
            <label className="text-text-secondary mb-2 block text-sm">
              Maximum choices per user
            </label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                .slice(0, Math.max(4, watchedOptions.length))
                .map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => handleMaxChoicesSelect(choice)}
                    disabled={choice > watchedOptions.length}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      watchedMaxChoices === choice
                        ? 'bg-primary text-background'
                        : choice > watchedOptions.length
                          ? 'bg-surface-elevated text-text-muted cursor-not-allowed'
                          : 'bg-surface-elevated text-text hover:bg-border'
                    }`}
                  >
                    {choice}
                  </button>
                ))}
            </div>
            <p className="text-text-muted mt-1 text-xs">
              Users can select up to {watchedMaxChoices} option
              {watchedMaxChoices !== 1 ? 's' : ''} when voting
            </p>
            {formErrors.max_choices && (
              <p className="text-error mt-1 text-sm">{formErrors.max_choices.message}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
