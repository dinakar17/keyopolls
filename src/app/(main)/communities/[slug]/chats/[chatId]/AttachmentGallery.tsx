import React, { useCallback, useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import { ChevronLeft, ChevronRight, Download, ExternalLink, FileText, X } from 'lucide-react';

import { TimelineItemSchema } from '@/api/schemas';

interface AttachmentData {
  id: string;
  file_url: string;
  file_name: string;
  file_size: number;
  attachment_type: string;
  messageId: string;
  messageContent: string;
  messageIndex: number;
  attachmentIndex: number;
}

interface AttachmentGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  initialAttachmentIndex: number;
  initialMessageId: string;
  timelineItems: TimelineItemSchema[];
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  onGoToMessage: (messageId: string) => void;
}

const AttachmentGallery = ({
  isOpen,
  onClose,
  initialAttachmentIndex,
  initialMessageId,
  timelineItems,
  onLoadMore,
  hasMore,
  isLoading,
  onGoToMessage,
}: AttachmentGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attachments, setAttachments] = useState<AttachmentData[]>([]);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract all attachments from timeline items
  const extractAttachments = useCallback(() => {
    const allAttachments: AttachmentData[] = [];

    timelineItems.forEach((item, messageIndex) => {
      // Get attachments from either timeline attachments or service item attachments
      const itemAttachments = item.service_item
        ? item.service_item.attachments || []
        : item.attachments || [];

      // Handle multiple attachments
      itemAttachments.forEach((attachment, attachmentIndex) => {
        allAttachments.push({
          id: attachment.id,
          file_url: attachment.file_url,
          file_name: attachment.file_name,
          file_size: attachment.file_size,
          attachment_type: attachment.attachment_type,
          messageContent: item.service_item?.description || item.content || '',
          messageId: item.id,
          messageIndex,
          attachmentIndex,
        });
      });
    });

    return allAttachments;
  }, [timelineItems]);

  // Update attachments when timeline items change
  useEffect(() => {
    const newAttachments = extractAttachments();
    setAttachments(newAttachments);

    // Find the initial attachment index
    if (initialMessageId && initialAttachmentIndex !== undefined) {
      const targetIndex = newAttachments.findIndex(
        (att) =>
          att.messageId === initialMessageId && att.attachmentIndex === initialAttachmentIndex
      );
      if (targetIndex !== -1) {
        setCurrentIndex(targetIndex);
      }
    }
  }, [timelineItems, initialMessageId, initialAttachmentIndex, extractAttachments]);

  // Load more when approaching the end
  useEffect(() => {
    if (attachments.length > 0 && currentIndex >= attachments.length - 3 && hasMore && !isLoading) {
      onLoadMore();
    }
  }, [currentIndex, attachments.length, hasMore, isLoading, onLoadMore]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen || isTransitioning) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, isTransitioning]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isTransitioning) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isTransitioning) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || isTransitioning) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev - 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const goToNext = () => {
    if (currentIndex < attachments.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleGoToMessage = () => {
    const currentAttachment = attachments[currentIndex];
    if (currentAttachment) {
      onGoToMessage(currentAttachment.messageId);
      onClose();
    }
  };

  const renderAttachmentContent = (attachment: AttachmentData, index: number) => {
    const isImage = attachment.attachment_type === 'image';
    const isVideo = attachment.attachment_type === 'video';
    const isDocument = attachment.attachment_type === 'document';

    return (
      <div
        key={attachment.id}
        className="absolute inset-0 flex items-center justify-center p-4 pt-20 pb-20"
        style={{
          transform: `translateX(${(index - currentIndex) * 100}%)`,
          transition: isTransitioning ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
        }}
      >
        {isImage && (
          <Image
            src={attachment.file_url}
            alt={attachment.file_name}
            className="max-h-full max-w-full object-contain"
            width={800}
            height={600}
            priority={Math.abs(index - currentIndex) <= 1}
          />
        )}

        {isVideo && (
          <video
            src={attachment.file_url}
            className="max-h-full max-w-full"
            controls
            autoPlay={false}
            preload={Math.abs(index - currentIndex) <= 1 ? 'metadata' : 'none'}
          />
        )}

        {isDocument && (
          <div className="flex max-w-md flex-col items-center rounded-lg bg-white/10 p-8 text-center">
            <FileText className="mb-4 h-16 w-16 text-white" />
            <h3 className="mb-2 text-lg font-medium text-white">{attachment.file_name}</h3>
            <p className="mb-4 text-sm text-white/70">{formatFileSize(attachment.file_size)}</p>
            <a
              href={attachment.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-white/20 px-4 py-2 text-sm text-white transition-colors hover:bg-white/30"
            >
              Open Document
            </a>
          </div>
        )}
      </div>
    );
  };

  if (!isOpen || attachments.length === 0) return null;

  const currentAttachment = attachments[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="text-white">
            <p className="text-sm font-medium">{currentAttachment?.file_name}</p>
            <p className="text-xs opacity-70">
              {currentIndex + 1} of {attachments.length} •{' '}
              {formatFileSize(currentAttachment?.file_size || 0)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGoToMessage}
            className="rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
            title="Go to message"
          >
            <ExternalLink className="h-5 w-5" />
          </button>
          {currentAttachment?.file_url && (
            <a
              href={currentAttachment.file_url}
              download={currentAttachment.file_name}
              className="rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
              title="Download"
            >
              <Download className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>

      {/* Main content container */}
      <div
        ref={containerRef}
        className="relative h-full w-full overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Previous button */}
        {currentIndex > 0 && (
          <button
            onClick={goToPrevious}
            disabled={isTransitioning}
            className="absolute top-1/2 left-4 z-20 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70 disabled:opacity-50"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

        {/* Next button */}
        {currentIndex < attachments.length - 1 && (
          <button
            onClick={goToNext}
            disabled={isTransitioning}
            className="absolute top-1/2 right-4 z-20 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70 disabled:opacity-50"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        {/* Render current and adjacent attachments for smooth sliding */}
        {attachments.map((attachment, index) => {
          // Only render current and adjacent items for performance
          if (Math.abs(index - currentIndex) > 1) return null;
          return renderAttachmentContent(attachment, index);
        })}
      </div>

      {/* Description */}
      <div className="absolute right-0 bottom-20 left-0 z-20 flex justify-center">
        <div
          className="max-w-2xl rounded-lg bg-black/70 px-6 py-4 transition-opacity duration-300"
          style={{
            opacity: isTransitioning ? 0.5 : 1,
          }}
        >
          <p className="text-sm break-words text-white/70">
            {currentAttachment.messageContent || 'No description available.'}
          </p>
        </div>
      </div>

      {/* Bottom indicator */}
      <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center justify-center">
          <div className="flex gap-1">
            {attachments.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((_, index) => {
              const actualIndex = Math.max(0, currentIndex - 2) + index;
              return (
                <div
                  key={actualIndex}
                  className={`h-1 w-8 rounded-full transition-all duration-300 ${
                    actualIndex === currentIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {isLoading && (
          <div className="mt-2 flex justify-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        )}
      </div>
    </div>
  );
};

export default AttachmentGallery;
