'use client';

import React, { useRef, useState } from 'react';

import {
  BarChart2,
  Gift,
  Image as ImageIcon,
  Link as LinkIcon,
  MapPin,
  Smile,
  Video,
} from 'lucide-react';
import { FieldValues, Path, PathValue, useFormContext } from 'react-hook-form';

import { toast } from '@/components/ui/toast';

import GifSelector from './GifSelector';
import LinkSelector from './LinkSelector';

// Constants
const MAX_VIDEO_SIZE_MB = 50; // Maximum video size in MB
const MAX_VIDEO_SIZE_BYTES = MAX_VIDEO_SIZE_MB * 1024 * 1024;

// Define a type for valid media types
type MediaType = 'none' | 'images' | 'video' | 'link' | 'gif' | 'poll' | 'emoji';

// Define the GIF object type
interface GifObject {
  url: string;
  // Add other properties that might be in the GIF object
}

type MediaOption = {
  id: string;
  name: string;
  icon: React.ReactNode;
  action: () => void;
  disableOn: Array<MediaType>;
};

type MediaSelectorProps<T extends FieldValues> = {
  imagesFieldName: Path<T>;
  videoFieldName: Path<T>;
  linkFieldName: Path<T>;
  gifFieldName: Path<T>;
  mediaTypeFieldName: Path<T>;
  maxImages: number;
  allowedMediaTypes?: ('images' | 'video' | 'link' | 'gif' | 'poll' | 'location' | 'emoji')[];
};

const MediaSelector = <T extends FieldValues>({
  imagesFieldName,
  videoFieldName,
  linkFieldName,
  gifFieldName,
  mediaTypeFieldName,
  maxImages,
  allowedMediaTypes = ['images', 'video', 'link', 'gif'], // Default allowed types
}: MediaSelectorProps<T>) => {
  const { watch, setValue } = useFormContext<T>();

  // State for managing tooltips and modal visibility
  const [featureTooltip, setFeatureTooltip] = useState<string | null>(null);
  const [isLinkSelectorOpen, setIsLinkSelectorOpen] = useState(false);
  const [isGifSelectorOpen, setIsGifSelectorOpen] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Properly type and watch the media type
  const mediaType = watch(mediaTypeFieldName) as MediaType | undefined;

  // Show tooltip for features coming soon
  const showFeatureTooltip = (featureId: string) => {
    setFeatureTooltip(featureId);
    setTimeout(() => setFeatureTooltip(null), 2000);
  };

  // Open GIF selector
  const openGifSelector = () => {
    if (mediaType !== 'gif' && mediaType !== 'none') {
      toast.error('Please remove your current media before adding a GIF.');
      return;
    }
    setIsGifSelectorOpen(true);
  };

  // Select a GIF from the GIF picker
  const selectGif = (gif: GifObject) => {
    // Use the dedicated GIF field instead of images array
    setValue(gifFieldName, gif.url as PathValue<T, typeof gifFieldName>, { shouldValidate: true });
    setValue(mediaTypeFieldName, 'gif' as PathValue<T, typeof mediaTypeFieldName>, {
      shouldValidate: true,
    });
    setIsGifSelectorOpen(false);
  };

  // All possible media options
  const allMediaOptions: MediaOption[] = [
    {
      id: 'images',
      name: 'Image',
      icon: <ImageIcon size={20} strokeWidth={1.5} />,
      action: () => {
        if (mediaType !== 'images' && mediaType !== 'none') {
          toast.error('Please remove your current media before adding images.');
          return;
        }
        imageInputRef.current?.click();
      },
      disableOn: ['video', 'link', 'gif', 'poll'],
    },
    {
      id: 'video',
      name: 'Video',
      icon: <Video size={20} strokeWidth={1.5} />,
      action: () => {
        if (mediaType !== 'video' && mediaType !== 'none') {
          toast.error('Please remove your current media before adding a video.');
          return;
        }
        videoInputRef.current?.click();
      },
      disableOn: ['images', 'link', 'gif', 'poll'],
    },
    {
      id: 'gif',
      name: 'GIF',
      icon: <Gift size={20} strokeWidth={1.5} />,
      action: openGifSelector,
      disableOn: ['images', 'video', 'link', 'poll'],
    },
    {
      id: 'link',
      name: 'Link',
      icon: <LinkIcon size={20} strokeWidth={1.5} />,
      action: () => {
        if (mediaType !== 'link' && mediaType !== 'none') {
          toast.error('Please remove your current media before adding a link.');
          return;
        }
        setIsLinkSelectorOpen(true);
      },
      disableOn: ['images', 'video', 'gif', 'poll'],
    },
    {
      id: 'location',
      name: 'Location',
      icon: <MapPin size={20} strokeWidth={1.5} />,
      action: () => showFeatureTooltip('location'),
      disableOn: [], // Location doesn't conflict with other media
    },
    {
      id: 'emoji',
      name: 'Emoji',
      icon: <Smile size={20} strokeWidth={1.5} />,
      action: () => showFeatureTooltip('emoji'),
      disableOn: [], // Emoji doesn't conflict with other media
    },
    {
      id: 'poll',
      name: 'Poll',
      icon: <BarChart2 size={20} strokeWidth={1.5} />,
      action: () => {
        if (mediaType !== 'poll' && mediaType !== 'none') {
          toast.error('Please remove your current media before creating a poll.');
          return;
        }
        showFeatureTooltip('poll');
      },
      disableOn: ['images', 'video', 'link', 'gif'],
    },
  ];

  // Filter media options based on allowedMediaTypes prop
  const mediaOptions = allMediaOptions.filter((option) =>
    allowedMediaTypes.includes(
      option.id as 'images' | 'video' | 'link' | 'gif' | 'poll' | 'location' | 'emoji'
    )
  );

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // In a real app, you would upload the files and get URLs back
      // Here we create URL objects for the selected files for preview
      const newImageUrls = Array.from(e.target.files)
        .slice(0, maxImages)
        .map((file) => {
          return URL.createObjectURL(file);
        });

      setValue(imagesFieldName, newImageUrls as PathValue<T, typeof imagesFieldName>, {
        shouldValidate: true,
      });
      setValue(mediaTypeFieldName, 'images' as PathValue<T, typeof mediaTypeFieldName>, {
        shouldValidate: true,
      });
    }
  };

  // Handle video selection with size validation
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Check video file size
      if (file.size > MAX_VIDEO_SIZE_BYTES) {
        toast.error(
          `Video file size exceeds ${MAX_VIDEO_SIZE_MB}MB limit. Please select a smaller video.`
        );
        // Reset the input value to allow selecting the same file again after user fixes it
        e.target.value = '';
        return;
      }

      // Create URL object for the selected video file for preview
      const videoUrl = URL.createObjectURL(file);
      setValue(videoFieldName, videoUrl as PathValue<T, typeof videoFieldName>, {
        shouldValidate: true,
      });
      setValue(mediaTypeFieldName, 'video' as PathValue<T, typeof mediaTypeFieldName>, {
        shouldValidate: true,
      });
    }
  };

  // Check if an option should be disabled
  const isOptionDisabled = (option: MediaOption) => {
    if (mediaType === 'none' || mediaType === undefined) return false;
    return option.disableOn.includes(mediaType);
  };

  // Get tooltip text based on feature ID
  const getTooltipText = (featureId: string) => {
    switch (featureId) {
      case 'poll':
        return 'Polls coming soon!';
      case 'location':
        return 'Location sharing coming soon!';
      case 'emoji':
        return 'Emoji picker coming soon!';
      default:
        return '';
    }
  };

  return (
    <div className="relative">
      {/* Media Options Bar */}
      <div className="border-border-subtle flex items-center justify-end p-3">
        <div className="flex space-x-1">
          {mediaOptions.map((option) => (
            <div key={option.id} className="group relative">
              <button
                type="button"
                onClick={option.action}
                disabled={isOptionDisabled(option)}
                className={`rounded-full p-2 transition-colors ${
                  isOptionDisabled(option)
                    ? 'text-text-muted cursor-not-allowed opacity-50'
                    : 'text-text-muted hover:bg-surface-elevated hover:text-text'
                }`}
                aria-label={option.name}
              >
                {option.icon}
              </button>

              {/* Hover tooltip */}
              <div className="bg-text text-background pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-md px-2 py-1 text-xs whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                {option.name}
              </div>
            </div>
          ))}
        </div>

        {/* Feature coming soon tooltip - appears on click */}
        {featureTooltip && (
          <div className="bg-text text-background absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded-md px-2 py-1 text-xs whitespace-nowrap transition-all duration-200">
            {getTooltipText(featureTooltip)}
          </div>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={imageInputRef}
        onChange={handleImageSelect}
        multiple
      />
      <input
        type="file"
        accept="video/*"
        className="hidden"
        ref={videoInputRef}
        onChange={handleVideoSelect}
      />

      {/* Link Selector Modal */}
      {isLinkSelectorOpen && (
        <LinkSelector<T>
          linkFieldName={linkFieldName}
          mediaTypeFieldName={mediaTypeFieldName}
          onClose={() => setIsLinkSelectorOpen(false)}
        />
      )}

      {/* GIF Selector Modal */}
      {isGifSelectorOpen && (
        <GifSelector onSelect={selectGif} onClose={() => setIsGifSelectorOpen(false)} />
      )}
    </div>
  );
};

export default MediaSelector;
