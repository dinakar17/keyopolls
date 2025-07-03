import React, { useEffect, useRef } from 'react';

import { useParams } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { X } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  useKeyopollsCommentsApiCreateComment,
  useKeyopollsCommentsApiUpdateComment,
} from '@/api/comments/comments';
import { CommentOut, ContentTypeEnum } from '@/api/schemas';
import MediaPreview from '@/components/common/MediaPreview';
import MediaSelector from '@/components/common/MediaSelector';
import { toast } from '@/components/ui/toast';
import { useCommentsUIStore } from '@/stores/useCommentsUIStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { convertMediaUrlsToFiles } from '@/utils/fileUtils';

// Form schema
const commentFormSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
  images: z.array(z.string()).optional(),
  video: z.string().optional(),
  link: z
    .object({
      url: z.string().url(),
      title: z.string(),
      image: z.string().optional(),
    })
    .optional(),
  gif: z.string().optional(),
  media_type: z.enum(['none', 'images', 'video', 'link', 'gif']),
});

type CommentFormInputs = z.infer<typeof commentFormSchema>;

interface CommentDrawerProps {
  allowedMediaTypes: ('images' | 'video' | 'link' | 'gif' | 'poll' | 'location' | 'emoji')[];
  maxImages?: number;
  // Callback props for parent to handle the results
  onCommentCreated?: (comment: CommentOut) => void;
  onReplyCreated?: (parentId: number, reply: CommentOut) => void;
  onCommentUpdated?: (comment: CommentOut) => void;
}

const CommentDrawer: React.FC<CommentDrawerProps> = ({
  allowedMediaTypes,
  maxImages = 4,
  onCommentCreated,
  onReplyCreated,
  onCommentUpdated,
}) => {
  const { slug } = useParams<{ slug: string }>();

  // Get only what we need from the store - drawer state and close function
  const { drawerState, closeDrawer } = useCommentsUIStore();
  const { accessToken } = useProfileStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentContainerRef = useRef<HTMLDivElement>(null);

  // Extract content context from URL params or use slug
  const contentType: ContentTypeEnum = 'Poll'; // Assuming this is always 'Poll' for now
  const objectId = Number(slug); // Convert slug to post ID

  // Build auth headers
  const getAuthHeaders = () => {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };
    return headers;
  };

  // Create comment mutation
  const createComment = useKeyopollsCommentsApiCreateComment({
    request: { headers: getAuthHeaders() },
    mutation: {
      onSuccess: (response) => {
        const newComment = response.data.data;
        if (newComment) {
          // Call the appropriate callback
          if (drawerState.mode === 'reply' && drawerState.replyingTo && onReplyCreated) {
            onReplyCreated(drawerState.replyingTo.id, newComment);
          } else if (onCommentCreated) {
            onCommentCreated(newComment);
          }

          toast.success('Comment created successfully');
          closeDrawer();
          reset();
        }
      },
      onError: (error) => {
        toast.error(`${error.response?.data?.message || 'Failed to create comment'}`);
      },
    },
  });

  // Update comment mutation
  const updateComment = useKeyopollsCommentsApiUpdateComment({
    request: { headers: getAuthHeaders() },
    mutation: {
      onSuccess: (response) => {
        const updatedComment = response.data.data;
        if (updatedComment && onCommentUpdated) {
          onCommentUpdated(updatedComment);
          toast.success('Comment updated successfully');
          closeDrawer();
          reset();
        }
      },
      onError: (error) => {
        toast.error(`${error.response?.data?.message || 'Failed to update comment'}`);
      },
    },
  });

  const methods = useForm<CommentFormInputs>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: '',
      images: [],
      video: undefined,
      link: undefined,
      gif: undefined,
      media_type: 'none',
    },
  });

  const {
    handleSubmit,
    reset,
    watch,
    register,
    formState: { errors },
  } = methods;
  const contentValue = watch('content');

  // Get the appropriate loading state based on drawer mode
  const isSubmitting =
    drawerState.mode === 'edit' ? updateComment.isPending : createComment.isPending;

  // Auto-resize textarea function - now uses available container height
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    const container = contentContainerRef.current;

    if (textarea && container) {
      // Reset height to calculate actual scrollHeight
      textarea.style.height = 'auto';

      // Get container dimensions
      const containerRect = container.getBoundingClientRect();
      const availableHeight = containerRect.height;

      // Calculate the height we should use
      const minHeight = 80;
      const scrollHeight = textarea.scrollHeight;

      // Use the minimum between scroll height and available container height
      // but always respect the minimum height
      const newHeight = Math.max(minHeight, Math.min(scrollHeight, availableHeight - 20)); // 20px for padding

      textarea.style.height = `${newHeight}px`;
    }
  };

  // Adjust textarea height when content changes or container size changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [contentValue]);

  // Handle window resize to readjust textarea
  useEffect(() => {
    const handleResize = () => {
      adjustTextareaHeight();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle escape key and browser back button to close overlay
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawerState.isOpen && !isSubmitting) {
        handleClose();
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      if (drawerState.isOpen && !isSubmitting) {
        e.preventDefault();
        handleClose();
        window.history.pushState(null, '', window.location.href);
      }
    };

    if (drawerState.isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('popstate', handlePopState);
      document.body.style.overflow = 'unset';
    };
  }, [drawerState.isOpen, isSubmitting]);

  // Reset form when drawer opens/closes or when editing different comment
  useEffect(() => {
    if (drawerState.isOpen) {
      const initialContent = drawerState.editingComment?.content || '';
      const editingComment = drawerState.editingComment;

      let initialImages: string[] = [];
      let initialVideo: string | undefined = undefined;
      let initialGif: string | undefined = undefined;
      let initialLink: { url: string; title: string; image?: string } | undefined = undefined;
      let initialMediaType: 'none' | 'images' | 'video' | 'link' | 'gif' = 'none';

      if (editingComment?.media && editingComment.media.file_url) {
        const media = editingComment.media;

        if (media.media_type === 'image' && media.file_url) {
          initialImages = [media.file_url];
          initialMediaType = 'images';
        } else if (media.media_type === 'video' && media.file_url) {
          initialVideo = media.file_url;
          initialMediaType = 'video';
        } else if (media.media_type === 'gif' && media.file_url) {
          initialGif = media.file_url;
          initialMediaType = 'gif';
        }
      }

      if (editingComment?.link) {
        initialLink = {
          url: editingComment.link.url,
          title: editingComment.link.title || editingComment.link.display_text,
          image: editingComment.link.image_url || undefined,
        };
        if (initialMediaType === 'none') {
          initialMediaType = 'link';
        }
      }

      reset({
        content: initialContent,
        images: initialImages,
        video: initialVideo,
        link: initialLink,
        gif: initialGif,
        media_type: initialMediaType,
      });

      // Delay textarea adjustment to ensure DOM is ready
      setTimeout(() => {
        adjustTextareaHeight();
      }, 100);
    }
  }, [drawerState.isOpen, drawerState.editingComment, drawerState.mode, reset]);

  const onFormSubmit = async (data: CommentFormInputs) => {
    console.log('Submitting comment data:', data);
    try {
      const commentData = {
        content: data.content,
        link: data.link
          ? {
              url: data.link.url,
              display_text: data.link.title || data.link.url,
            }
          : undefined,
      };

      let mediaFiles: File[] = [];

      if (data.media_type === 'images' && data.images?.length) {
        const blobUrls = data.images.filter((url) => url.startsWith('blob:'));
        if (blobUrls.length > 0) {
          mediaFiles = await convertMediaUrlsToFiles(blobUrls, 'images');
        }
      } else if (data.media_type === 'video' && data.video) {
        if (data.video.startsWith('blob:')) {
          mediaFiles = await convertMediaUrlsToFiles([data.video], 'video');
        }
      } else if (data.media_type === 'gif' && data.gif) {
        if (data.gif.startsWith('blob:')) {
          mediaFiles = await convertMediaUrlsToFiles([data.gif], 'gif');
        }
      }

      if (drawerState.mode === 'edit' && drawerState.editingComment) {
        // Update existing comment
        updateComment.mutate({
          commentId: drawerState.editingComment.id,
          data: { data: commentData, media_files: mediaFiles },
        });
      } else {
        // Create new comment or reply
        const createData =
          drawerState.mode === 'reply' && drawerState.replyingTo
            ? { ...commentData, parent_id: drawerState.replyingTo.id }
            : commentData;

        createComment.mutate({
          contentType: contentType,
          objectId: objectId,
          data: { data: createData, media_files: mediaFiles },
        });
      }

      // Form will be reset automatically by the mutation success handlers
      // The drawer will close automatically via closeDrawer() in the mutations
    } catch (error) {
      console.error('Error submitting comment:', error);
      // Error handling is done in mutation callbacks
    }
  };

  const getDrawerTitle = () => {
    if (drawerState.mode === 'edit') return 'Edit Comment';
    if (drawerState.mode === 'reply') return 'Reply';
    return 'Add Comment';
  };

  const getActionButtonText = () => {
    if (drawerState.mode === 'edit') return 'Update';
    if (drawerState.mode === 'reply') return 'Reply';
    return 'Post';
  };

  const handleClose = () => {
    // Don't close if currently submitting
    if (isSubmitting) return;

    if (drawerState.mode !== 'edit') {
      reset();
    }
    closeDrawer();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Don't close if currently submitting
    if (isSubmitting) return;

    if (e.target === overlayRef.current) {
      handleClose();
    }
  };

  const getReplyDisplayName = () => {
    if (!drawerState.replyingTo) return '';
    return drawerState.replyingTo.author_info.username;
  };

  const formatReplyDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24 * 7) {
        return formatDistanceToNow(date, { addSuffix: true, includeSeconds: true }).replace(
          /^about\s+/,
          ''
        );
      }

      return format(date, 'MMM d, yyyy');
    } catch {
      return new Date(dateString).toLocaleDateString();
    }
  };

  const { onChange: registerOnChange, ref: registerRef, ...registerRest } = register('content');

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    registerOnChange(e);
    setTimeout(() => {
      adjustTextareaHeight();
    }, 0);
  };

  if (!drawerState.isOpen) return null;

  return (
    <FormProvider {...methods}>
      {/* Mobile-First Full Screen Overlay */}
      <div
        ref={overlayRef}
        className="bg-background fixed inset-0 z-50"
        onClick={handleBackdropClick}
      >
        {/* Drawer Content - Full height on mobile */}
        <div className="flex h-full flex-col">
          {/* Mobile Header - Compact */}
          <header className="border-border-subtle flex flex-shrink-0 items-center justify-between border-b px-4 py-3">
            {/* Close Button - Left - Disabled during submission */}
            <button
              type="button"
              className={`text-text-muted hover:text-text hover:bg-surface-elevated flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                isSubmitting ? 'cursor-not-allowed opacity-50' : ''
              }`}
              onClick={handleClose}
              disabled={isSubmitting}
            >
              <X size={20} />
            </button>

            {/* Title - Center */}
            <h1 className="text-text font-medium">{getDrawerTitle()}</h1>

            {/* Action Button - Right - Show loading state */}
            <button
              type="submit"
              form="comment-form"
              disabled={isSubmitting || !contentValue.trim()}
              className="bg-primary text-background disabled:bg-surface-elevated disabled:text-text-muted flex min-w-[60px] items-center justify-center rounded-full px-4 py-1.5 text-sm font-medium transition-all hover:opacity-90 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  {/* Simple spinner */}
                  <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent"></div>
                  <span className="hidden sm:inline">
                    {drawerState.mode === 'edit' ? 'Updating...' : 'Posting...'}
                  </span>
                </div>
              ) : (
                getActionButtonText()
              )}
            </button>
          </header>

          {/* Reply Context - Mobile Optimized */}
          {drawerState.mode === 'reply' && drawerState.replyingTo && (
            <div className="border-primary bg-surface-elevated/50 mx-4 mt-3 flex-shrink-0 rounded-r-lg border-l-2 p-3">
              <div className="mb-1 flex items-center space-x-2 text-xs">
                <span className="text-text truncate font-medium">{getReplyDisplayName()}</span>
                <span className="text-text-muted">·</span>
                <span className="text-text-secondary">
                  {formatReplyDate(drawerState.replyingTo.created_at || '')}
                </span>
              </div>
              <div className="text-text-secondary line-clamp-2 text-sm leading-relaxed">
                {drawerState.replyingTo.content}
              </div>
            </div>
          )}

          <form
            id="comment-form"
            onSubmit={handleSubmit(onFormSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            {/* Content Input - Mobile Optimized - Disabled during submission */}
            <div ref={contentContainerRef} className="flex min-h-0 flex-1 flex-col px-4 py-3">
              <textarea
                ref={(e) => {
                  textareaRef.current = e;
                  registerRef(e);
                }}
                {...registerRest}
                onChange={handleTextareaChange}
                placeholder={
                  drawerState.mode === 'edit'
                    ? 'Edit your comment...'
                    : drawerState.mode === 'reply'
                      ? 'Write your reply...'
                      : 'Write your comment...'
                }
                className={`text-text placeholder-text-muted w-full flex-1 resize-none bg-transparent leading-relaxed focus:outline-none ${
                  isSubmitting ? 'cursor-not-allowed opacity-50' : ''
                }`}
                style={{ minHeight: '80px' }}
                autoFocus
                disabled={isSubmitting}
              />

              {/* Form Validation Error */}
              {errors.content && (
                <p className="text-error mt-2 flex-shrink-0 text-sm">{errors.content.message}</p>
              )}

              {/* Media Preview - Disabled during submission */}
              <div
                className={`mt-3 flex-shrink-0 ${isSubmitting ? 'pointer-events-none opacity-50' : ''}`}
              >
                <MediaPreview
                  imagesFieldName="images"
                  videoFieldName="video"
                  linkFieldName="link"
                  gifFieldName="gif"
                  mediaTypeFieldName="media_type"
                />
              </div>
            </div>

            {/* Footer - Media Selector - Disabled during submission */}
            <footer
              className={`border-border-subtle flex-shrink-0 border-t p-4 ${isSubmitting ? 'pointer-events-none opacity-50' : ''}`}
            >
              <MediaSelector
                imagesFieldName="images"
                videoFieldName="video"
                linkFieldName="link"
                gifFieldName="gif"
                mediaTypeFieldName="media_type"
                maxImages={maxImages}
                allowedMediaTypes={allowedMediaTypes}
              />
            </footer>
          </form>
        </div>
      </div>
    </FormProvider>
  );
};

export default CommentDrawer;
