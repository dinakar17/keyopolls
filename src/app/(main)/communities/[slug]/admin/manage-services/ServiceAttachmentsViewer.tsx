import React, { useCallback, useEffect, useState } from 'react';

import Image from 'next/image';

import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  X,
} from 'lucide-react';

import { ServiceAttachmentSchema } from '@/api/schemas';

interface ServiceAttachmentsViewerProps {
  attachments: ServiceAttachmentSchema[];
  className?: string;
  maxHeight?: string;
}

const ServiceAttachmentsViewer: React.FC<ServiceAttachmentsViewerProps> = ({
  attachments,
  className = '',
  maxHeight = '120px',
}) => {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const getAttachmentIcon = useCallback((attachmentType: string) => {
    switch (attachmentType.toLowerCase()) {
      case 'image':
        return <ImageIcon className="h-6 w-6" />;
      case 'video':
        return <Video className="h-6 w-6" />;
      case 'audio':
        return <Music className="h-6 w-6" />;
      default:
        return <FileText className="h-6 w-6" />;
    }
  }, []);

  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }, []);

  const handleDownload = useCallback((attachment: ServiceAttachmentSchema) => {
    const link = document.createElement('a');
    link.href = attachment.file_url;
    link.download = attachment.file_name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const isImageType = useCallback((attachmentType: string) => {
    return attachmentType.toLowerCase() === 'image';
  }, []);

  const isVideoType = useCallback((attachmentType: string) => {
    return attachmentType.toLowerCase() === 'video';
  }, []);

  const openGallery = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsGalleryOpen(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeGallery = useCallback(() => {
    setIsGalleryOpen(false);
    document.body.style.overflow = 'unset';
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % attachments.length);
  }, [attachments.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + attachments.length) % attachments.length);
  }, [attachments.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isGalleryOpen) return;

      if (e.key === 'Escape') {
        closeGallery();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isGalleryOpen, closeGallery, goToNext, goToPrevious]);

  // Handle touch/swipe gestures
  useEffect(() => {
    if (!isGalleryOpen) return;

    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = startX - endX;
      const diffY = startY - endY;

      // Only handle horizontal swipes (ignore vertical scrolling)
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          goToNext();
        } else {
          goToPrevious();
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isGalleryOpen, goToNext, goToPrevious]);

  if (!attachments || attachments.length === 0) {
    return null;
  }

  // Sort attachments by display_order
  const sortedAttachments = [...attachments].sort((a, b) => a.display_order - b.display_order);
  const currentAttachment = sortedAttachments[currentIndex];

  return (
    <>
      {/* Thumbnail Grid */}
      <div className={`${className}`}>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ maxHeight }}>
          {sortedAttachments.map((attachment, index) => (
            <button
              key={attachment.id}
              onClick={() => openGallery(index)}
              className="flex-shrink-0 rounded-lg transition-opacity hover:opacity-80"
              style={{ minWidth: '80px', maxWidth: '120px' }}
            >
              {isImageType(attachment.attachment_type) ? (
                <Image
                  src={attachment.file_url}
                  alt={attachment.title || attachment.file_name}
                  className="h-20 w-full rounded-lg object-cover"
                  width={120}
                  height={80}
                />
              ) : isVideoType(attachment.attachment_type) ? (
                <div className="relative">
                  <video
                    src={attachment.file_url}
                    className="h-20 w-full rounded-lg object-cover"
                    muted
                  />
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50">
                    <Video className="h-5 w-5 text-white" />
                  </div>
                </div>
              ) : (
                <div className="bg-surface-elevated border-border flex h-20 w-full items-center justify-center rounded-lg border">
                  <div className="text-primary">
                    {getAttachmentIcon(attachment.attachment_type)}
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Full-Screen Gallery Modal */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          {/* Close Button */}
          <button
            onClick={closeGallery}
            className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Download Button */}
          <button
            onClick={() => handleDownload(currentAttachment)}
            className="absolute top-16 right-4 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
          >
            <Download className="h-5 w-5" />
          </button>

          {/* Navigation Buttons */}
          {attachments.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute top-1/2 left-4 z-10 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute top-1/2 right-4 z-10 -translate-y-1/2 rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Main Content */}
          <div className="flex h-full w-full items-center justify-center p-4">
            {isImageType(currentAttachment.attachment_type) ? (
              <Image
                src={currentAttachment.file_url}
                alt={currentAttachment.title || currentAttachment.file_name}
                className="max-h-full max-w-full object-contain"
                width={1200}
                height={800}
                priority
              />
            ) : isVideoType(currentAttachment.attachment_type) ? (
              <video
                src={currentAttachment.file_url}
                className="max-h-full max-w-full"
                controls
                autoPlay
              />
            ) : (
              <div className="bg-surface-elevated flex max-w-md flex-col items-center rounded-lg p-8 text-center">
                <div className="text-primary mb-4">
                  {getAttachmentIcon(currentAttachment.attachment_type)}
                </div>
                <h3 className="text-text mb-2 text-lg font-medium">
                  {currentAttachment.title || currentAttachment.file_name}
                </h3>
                <p className="text-text-secondary mb-4 text-sm">
                  {currentAttachment.attachment_type.toUpperCase()} •{' '}
                  {formatFileSize(currentAttachment.file_size)}
                </p>
                {currentAttachment.description && (
                  <p className="text-text-muted mb-6 text-sm">{currentAttachment.description}</p>
                )}
                <button
                  onClick={() => handleDownload(currentAttachment)}
                  className="bg-primary text-background flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
                >
                  <Download className="h-4 w-4" />
                  Download File
                </button>
              </div>
            )}
          </div>

          {/* Counter */}
          {attachments.length > 1 && (
            <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-white">
              <span className="text-sm">
                {currentIndex + 1} / {attachments.length}
              </span>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ServiceAttachmentsViewer;
