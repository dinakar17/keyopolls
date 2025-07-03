import React, { useEffect, useRef, useState } from 'react';

import { X } from 'lucide-react';

import { useKeyopollsPollsApiOperationsUpdatePoll } from '@/api/polls/polls';
import toast from '@/components/ui/toast';
import { useProfileStore } from '@/stores/useProfileStore';

interface EditPollModalProps {
  isOpen: boolean;
  onClose: () => void;
  poll: {
    id: number;
    title: string;
    description: string;
  };
  refetch?: () => void;
}

const EditPollModal: React.FC<EditPollModalProps> = ({ isOpen, onClose, poll, refetch }) => {
  const { accessToken } = useProfileStore();
  const [title, setTitle] = useState(poll.title);
  const [description, setDescription] = useState(poll.description);

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);

  // Reset form when poll changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle(poll.title);
      setDescription(poll.description);
    }
  }, [isOpen, poll.title, poll.description]);

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

    if (title.trim() === poll.title && description.trim() === poll.description) {
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
      <div className="bg-surface border-border w-full max-w-2xl rounded-2xl border shadow-2xl">
        {/* Header */}
        <div className="border-border flex items-center justify-between border-b px-8 py-6">
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
            {/* Title Field - Paper-like */}
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
                {/* Animated underline */}
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

            {/* Description Field - Paper-like */}
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
                {/* Animated underline */}
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
              disabled={isPending || !title.trim()}
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
