'use client';

import React, { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

import { X } from 'lucide-react';

import { MediaSchema } from '@/api/schemas';

interface MediaViewerProps {
  media: MediaSchema[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

interface MediaDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

const MediaViewer: React.FC<MediaViewerProps> = ({ media, initialIndex = 0, isOpen, onClose }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [mediaDimensions, setMediaDimensions] = useState<{ [key: number]: MediaDimensions }>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Update URL with query params when opening/closing media viewer
  useEffect(() => {
    if (isOpen) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('media', currentIndex.toString());
      router.replace(`?${params.toString()}`, { scroll: false });
    } else if (!isOpen) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('media');
      const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
      router.replace(newUrl, { scroll: false });
    }
  }, [isOpen, currentIndex, router, searchParams]);

  // Handle initial index from URL params
  useEffect(() => {
    const mediaParam = searchParams.get('media');
    if (mediaParam && isOpen) {
      const mediaIndex = parseInt(mediaParam, 10);
      if (!isNaN(mediaIndex) && mediaIndex >= 0 && mediaIndex < media.length) {
        setCurrentIndex(mediaIndex);
      }
    }
  }, [searchParams, isOpen, media.length]);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      document.body.style.overflow = 'hidden';

      // Scroll to initial media item
      setTimeout(() => {
        if (scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          const itemWidth = container.clientWidth;
          container.scrollTo({
            left: initialIndex * itemWidth,
            behavior: 'smooth',
          });
        }
      }, 100);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialIndex]);

  // Load media dimensions
  const loadMediaDimensions = (mediaItem: MediaSchema, index: number) => {
    if (!mediaItem?.file_url) return;

    if (mediaItem.media_type === 'video') {
      const video = document.createElement('video');
      video.src = mediaItem.file_url;
      video.onloadedmetadata = () => {
        setMediaDimensions((prev) => ({
          ...prev,
          [index]: {
            width: video.videoWidth,
            height: video.videoHeight,
            aspectRatio: video.videoWidth / video.videoHeight,
          },
        }));
      };
    } else {
      const img = document.createElement('img');
      img.src = mediaItem.file_url;
      img.onload = () => {
        setMediaDimensions((prev) => ({
          ...prev,
          [index]: {
            width: img.naturalWidth,
            height: img.naturalHeight,
            aspectRatio: img.naturalWidth / img.naturalHeight,
          },
        }));
      };
    }
  };

  // Load dimensions for all media items when component mounts
  useEffect(() => {
    if (isOpen) {
      media.forEach((mediaItem, index) => {
        loadMediaDimensions(mediaItem, index);
      });
    }
  }, [isOpen, media]);

  // Calculate responsive dimensions that fit within viewport while maintaining aspect ratio
  const getMediaStyle = (index: number) => {
    const dimensions = mediaDimensions[index];
    if (!dimensions) return {};

    // Get viewport dimensions with some padding
    const viewportWidth = window.innerWidth * 0.95;
    const viewportHeight = window.innerHeight * 0.85; // Account for header and controls

    const { aspectRatio } = dimensions;

    let width = dimensions.width;
    let height = dimensions.height;

    // Scale down if larger than viewport
    if (width > viewportWidth) {
      width = viewportWidth;
      height = width / aspectRatio;
    }

    if (height > viewportHeight) {
      height = viewportHeight;
      width = height * aspectRatio;
    }

    return {
      width: `${width}px`,
      height: `${height}px`,
      maxWidth: '95vw',
      maxHeight: '85vh',
    };
  };

  // Handle scroll to update current index
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const itemWidth = container.clientWidth;
    const scrollLeft = container.scrollLeft;
    const newIndex = Math.round(scrollLeft / itemWidth);

    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < media.length) {
      setCurrentIndex(newIndex);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (currentIndex > 0) {
            scrollToIndex(currentIndex - 1);
          }
          break;
        case 'ArrowRight':
          if (currentIndex < media.length - 1) {
            scrollToIndex(currentIndex + 1);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, media.length]);

  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const itemWidth = container.clientWidth;

    container.scrollTo({
      left: index * itemWidth,
      behavior: 'smooth',
    });
  };

  if (!isOpen || !media.length) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm">
      {/* Header */}
      <div className="absolute top-0 right-0 left-0 z-20 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent p-4">
        <div className="text-sm font-medium text-white/90">
          {media.length > 1 && `${currentIndex + 1} of ${media.length}`}
          {mediaDimensions[currentIndex] && (
            <span className="ml-2 text-xs text-white/70">
              {mediaDimensions[currentIndex].width} × {mediaDimensions[currentIndex].height}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-2 text-white/90 transition-all duration-200 hover:bg-white/10 hover:text-white"
          aria-label="Close media viewer"
        >
          <X size={22} />
        </button>
      </div>

      {/* Horizontal scroll container */}
      <div
        ref={scrollContainerRef}
        className="scrollbar-hide flex h-full w-full snap-x snap-mandatory overflow-x-auto"
        onScroll={handleScroll}
        style={{ scrollBehavior: 'smooth' }}
      >
        {media.map((mediaItem, index) => (
          <div
            key={index}
            className="flex h-full w-full flex-shrink-0 snap-center items-center justify-center"
          >
            {mediaItem?.file_url ? (
              mediaItem.media_type === 'video' ? (
                <video
                  src={mediaItem.file_url}
                  className="object-contain"
                  style={getMediaStyle(index)}
                  controls
                  playsInline
                  muted
                  autoPlay={index === currentIndex}
                  loop
                  aria-label={mediaItem.alt_text || `Video ${index + 1}`}
                />
              ) : (
                <div style={getMediaStyle(index)} className="relative">
                  <Image
                    src={mediaItem.file_url}
                    alt={mediaItem.alt_text || `Media ${index + 1}`}
                    className="object-contain"
                    fill
                    unoptimized
                    priority={index === currentIndex}
                    sizes="95vw"
                  />
                </div>
              )
            ) : (
              <div className="flex h-64 w-64 items-center justify-center rounded-lg bg-gray-800 text-gray-400">
                <span className="text-sm">Media unavailable</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      {media.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 space-x-2 rounded-full bg-black/30 px-3 py-2 backdrop-blur-sm">
          {media.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`h-2 w-2 rounded-full transition-all duration-200 ${
                index === currentIndex ? 'scale-125 bg-white' : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to media ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Alt text display */}
      {media[currentIndex]?.alt_text && (
        <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <p className="mx-auto max-w-2xl text-center text-sm text-white/90">
            {media[currentIndex].alt_text}
          </p>
        </div>
      )}

      {/* Click outside to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
};

export default MediaViewer;
