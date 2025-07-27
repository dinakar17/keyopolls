import React, { useEffect, useRef, useState } from 'react';

import { X } from 'lucide-react';

import { useKeyopollsPollsApiOperationsUpdatePoll } from '@/api/polls/polls';
import { useKeyopollsCommonApiTagsGetTagsList } from '@/api/tags/tags';
import MarkdownEditor from '@/components/common/MarkdownEditor';
import toast from '@/components/ui/toast';
import { useProfileStore } from '@/stores/useProfileStore';

interface EditPollModalProps {
  isOpen: boolean;
  onClose: () => void;
  poll: {
    id: number;
    title: string;
    description: string;
    tags: string[];
    explanation: string;
    community_id?: number;
  };
  refetch?: () => void;
}

const EditPollModal: React.FC<EditPollModalProps> = ({ isOpen, onClose, poll, refetch }) => {
  const { accessToken } = useProfileStore();
  const [title, setTitle] = useState(poll.title);
  const [description, setDescription] = useState(poll.description);
  const [tags, setTags] = useState<string[]>(poll.tags || []);
  const [explanation, setExplanation] = useState('');

  // Tags input state
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [highlightedSuggestionIndex, setHighlightedSuggestionIndex] = useState(-1);

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  // Fetch tags for suggestions
  const { data: tagsData, isLoading: tagsLoading } = useKeyopollsCommonApiTagsGetTagsList(
    {
      search: tagInput,
      community_id: poll.community_id,
      per_page: 10,
      order_by: '-usage_count',
    },
    {
      query: {
        enabled: showTagSuggestions && tagInput.length >= 1,
      },
    }
  );

  // Reset form when poll changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle(poll.title);
      setDescription(poll.description);
      setTags(poll.tags || []);

      // Parse explanation from JSON string if it exists
      try {
        const parsedExplanation = poll.explanation ? JSON.parse(poll.explanation) : '';
        setExplanation(typeof parsedExplanation === 'string' ? parsedExplanation : '');
      } catch {
        // If parsing fails, treat as plain text
        setExplanation(poll.explanation || '');
      }
    }
  }, [isOpen, poll]);

  // Auto-resize textarea function
  const autoResize = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
  };

  // Handle textarea changes with auto-resize
  const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTitle(e.target.value);
    autoResize(e.target);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    autoResize(e.target);
  };

  // Auto-resize on content load
  useEffect(() => {
    if (isOpen && titleRef.current) {
      autoResize(titleRef.current);
    }
    if (isOpen && descriptionRef.current) {
      autoResize(descriptionRef.current);
    }
  }, [isOpen, title, description]);

  // Tag suggestion logic
  const availableTags = tagsData?.data.tags || [];
  const filteredSuggestions = availableTags.filter(
    (tag) => !tags.some((selectedTag) => selectedTag.toLowerCase() === tag.name.toLowerCase())
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
    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    } else if (e.key === 'Escape') {
      setShowTagSuggestions(false);
      setHighlightedSuggestionIndex(-1);
    }
  };

  // Add new tag
  const addNewTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
      setShowTagSuggestions(false);
      setHighlightedSuggestionIndex(-1);
    }
  };

  // Select existing tag
  const selectTag = (tagName: string) => {
    const normalizedTag = tagName.toLowerCase();
    if (!tags.includes(normalizedTag) && tags.length < 5) {
      setTags([...tags, normalizedTag]);
      setTagInput('');
      setShowTagSuggestions(false);
      setHighlightedSuggestionIndex(-1);
    }
  };

  // Remove tag
  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // Handle tag input focus/blur
  const handleTagInputFocus = () => {
    if (tagInput.length >= 1) {
      setShowTagSuggestions(true);
    }
  };

  const handleTagInputBlur = () => {
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

  const { mutate: updatePoll, isPending } = useKeyopollsPollsApiOperationsUpdatePoll({
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!explanation.trim()) {
      toast.error('Explanation is required');
      return;
    }

    // Check if anything has changed
    const originalExplanation = (() => {
      try {
        const parsed = poll.explanation ? JSON.parse(poll.explanation) : '';
        return typeof parsed === 'string' ? parsed : '';
      } catch {
        return poll.explanation || '';
      }
    })();

    const hasChanges =
      title.trim() !== poll.title ||
      description.trim() !== poll.description ||
      JSON.stringify(tags.sort()) !== JSON.stringify((poll.tags || []).sort()) ||
      explanation.trim() !== originalExplanation;

    if (!hasChanges) {
      toast.info('No changes made');
      onClose();
      return;
    }

    updatePoll(
      {
        pollId: poll.id,
        data: {
          title: title.trim(),
          description: description.trim(),
          tags: tags,
          explanation: JSON.stringify(explanation.trim()),
        },
      },
      {
        onSuccess: () => {
          toast.success('Poll updated successfully');
          onClose();
          if (refetch) {
            refetch();
          }
        },
        onError: (error) => {
          console.error('Error updating poll:', error);
          const errorMessage =
            error.response?.data?.message || error.message || 'Failed to update poll';
          toast.error(errorMessage);
        },
      }
    );
  };

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="bg-text/60 fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-surface border-border max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border shadow-2xl">
        {/* Header */}
        <div className="border-border bg-surface sticky top-0 z-10 flex items-center justify-between border-b px-8 py-6">
          <h2 className="text-text text-xl font-semibold">Edit Poll</h2>
          <button
            onClick={handleClose}
            disabled={isPending}
            className="text-text-muted hover:bg-surface-elevated hover:text-text flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-8">
            {/* Title Field */}
            <div className="group">
              <label className="text-text mb-3 block text-sm font-medium">
                Poll Title <span className="text-error">*</span>
              </label>
              <div className="relative">
                <textarea
                  ref={titleRef}
                  value={title}
                  onChange={handleTitleChange}
                  disabled={isPending}
                  maxLength={200}
                  rows={1}
                  className="border-border text-text placeholder-text-muted focus:border-border disabled:bg-surface-elevated w-full resize-none border-0 border-b-2 bg-transparent px-0 py-3 text-lg font-medium transition-all duration-200 focus:ring-0 focus:outline-none disabled:cursor-not-allowed"
                  placeholder="Enter your poll title..."
                  style={{
                    lineHeight: '1.4',
                    minHeight: '2.8rem',
                    overflow: 'hidden',
                  }}
                  required
                />
                <div className="bg-primary absolute bottom-1.5 left-0 h-0.5 w-0 transition-all duration-300 group-focus-within:w-full"></div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-text-secondary text-xs">
                  This will be the main question or topic of your poll
                </div>
                <div
                  className={`text-xs transition-colors ${
                    title.length > 180 ? 'text-error' : 'text-text-muted'
                  }`}
                >
                  {title.length}/200
                </div>
              </div>
            </div>

            {/* Description Field */}
            <div className="group">
              <label className="text-text mb-3 block text-sm font-medium">
                Description
                <span className="text-text-secondary ml-2 text-xs font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <textarea
                  ref={descriptionRef}
                  value={description}
                  onChange={handleDescriptionChange}
                  disabled={isPending}
                  rows={3}
                  maxLength={1000}
                  className="border-border text-text placeholder-text-muted focus:border-border disabled:bg-surface-elevated w-full resize-none border-0 border-b-2 bg-transparent px-0 py-3 text-base transition-all duration-200 focus:ring-0 focus:outline-none disabled:cursor-not-allowed"
                  placeholder="Add more context or details about your poll..."
                  style={{
                    lineHeight: '1.5',
                    minHeight: '4.5rem',
                    overflow: 'hidden',
                  }}
                />
                <div
                  className="bg-primary absolute bottom-2 left-0 h-0.5 w-0 transition-all duration-300 group-focus-within:w-full"
                  style={{ marginBottom: '-2px' }}
                ></div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-text-secondary text-xs">
                  Provide additional context to help voters understand your poll
                </div>
                <div
                  className={`text-xs transition-colors ${
                    description.length > 900 ? 'text-warning' : 'text-text-muted'
                  }`}
                >
                  {description.length}/1000
                </div>
              </div>
            </div>

            {/* Tags Section */}
            <div className="border-border bg-surface space-y-3 rounded-lg border p-4">
              <div>
                <h3 className="text-text text-sm font-medium">Tags</h3>
                <p className="text-text-muted text-xs">
                  Add tags to help people discover your poll (max 5)
                </p>
              </div>

              <div className="space-y-2">
                {/* Tag Display */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-primary/10 text-primary border-primary/20 flex items-center space-x-1 rounded-full border px-2 py-1 text-xs"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          disabled={isPending}
                          className="text-primary hover:text-primary/70 ml-1 flex h-3 w-3 items-center justify-center rounded-full text-xs disabled:cursor-not-allowed"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Tag Input */}
                {tags.length < 5 && (
                  <div className="relative" ref={tagInputRef}>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={handleTagInputChange}
                      onKeyDown={handleTagInputKeyDown}
                      onBlur={handleTagInputBlur}
                      onFocus={handleTagInputFocus}
                      disabled={isPending}
                      placeholder={
                        tags.length === 0
                          ? 'Type to search existing tags or create new ones...'
                          : 'Add another tag...'
                      }
                      className="border-border bg-surface-elevated text-text placeholder-text-muted focus:border-primary w-full rounded-lg border px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
                                onMouseDown={(e) => e.preventDefault()}
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
                      </div>
                    )}

                    <div className="mt-1 flex items-center justify-between">
                      <div className="text-xs">
                        <span className="text-text-muted">{tags.length}/5 tags</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Explanation Field */}
            <div className="border-border bg-surface space-y-3 rounded-lg border p-4">
              <div>
                <h3 className="text-text text-sm font-medium">
                  Explanation <span className="text-error">*</span>
                </h3>
                <p className="text-text-muted text-xs">
                  Provide a detailed explanation for your poll (minimum 250 characters)
                </p>
              </div>

              <MarkdownEditor
                value={explanation}
                onChange={setExplanation}
                placeholder="Explain the context, background, or reasoning for your poll. Include relevant details to help users understand the topic better..."
                minCharacters={250}
                showCharacterCount={true}
                height="200px"
                required={true}
                showModeToggle={true}
                disabled={isPending}
                className="w-full"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex gap-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="border-border text-text hover:border-border-subtle hover:bg-surface-elevated flex-1 rounded-xl border-2 px-6 py-3 text-base font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !title.trim() || !explanation.trim()}
              className="bg-primary text-background focus:ring-primary/20 flex-1 rounded-xl px-6 py-3 text-base font-medium transition-all duration-200 hover:opacity-90 focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="border-background h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                  Updating...
                </div>
              ) : (
                'Update Poll'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPollModal;
