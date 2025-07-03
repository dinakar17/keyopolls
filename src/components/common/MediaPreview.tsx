'use client';

import React from 'react';

import Image from 'next/image';

import { X } from 'lucide-react';
import { FieldValues, Path, PathValue, useFormContext } from 'react-hook-form';

type MediaPreviewProps<T extends FieldValues> = {
  imagesFieldName: Path<T>;
  videoFieldName: Path<T>;
  linkFieldName: Path<T>;
  gifFieldName: Path<T>;
  mediaTypeFieldName: Path<T>;
};

const MediaPreview = <T extends FieldValues>({
  imagesFieldName,
  videoFieldName,
  linkFieldName,
  gifFieldName,
  mediaTypeFieldName,
}: MediaPreviewProps<T>) => {
  const { watch, setValue } = useFormContext<T>();

  const images = watch(imagesFieldName) as string[] | undefined;
  const video = watch(videoFieldName) as string | undefined;
  const link = watch(linkFieldName) as { title: string; url: string; image?: string } | undefined;
  const gif = watch(gifFieldName) as string | undefined;
  const mediaType = watch(mediaTypeFieldName) as
    | 'images'
    | 'video'
    | 'gif'
    | 'link'
    | 'none'
    | undefined;

  const removeGif = () => {
    if (gif && gif.startsWith('blob:')) {
      URL.revokeObjectURL(gif);
    }
    setValue(gifFieldName, undefined as PathValue<T, typeof gifFieldName>, {
      shouldValidate: true,
    });
    setValue(mediaTypeFieldName, 'none' as PathValue<T, typeof mediaTypeFieldName>, {
      shouldValidate: true,
    });
  };

  // const resetMedia = () => {
  //   setValue(mediaTypeFieldName, 'none' as PathValue<T, typeof mediaTypeFieldName>, {
  //     shouldValidate: true,
  //   });
  // };

  const removeImage = (index: number) => {
    if (!images) return;

    const currentImages = [...images];
    if (currentImages[index]?.startsWith('blob:')) {
      URL.revokeObjectURL(currentImages[index]);
    }

    currentImages.splice(index, 1);

    if (currentImages.length === 0) {
      setValue(mediaTypeFieldName, 'none' as PathValue<T, typeof mediaTypeFieldName>, {
        shouldValidate: true,
      });
    }

    setValue(imagesFieldName, currentImages as PathValue<T, typeof imagesFieldName>, {
      shouldValidate: true,
    });
  };

  const removeAllImages = () => {
    images?.forEach((url) => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });

    setValue(imagesFieldName, [] as PathValue<T, typeof imagesFieldName>, { shouldValidate: true });
    setValue(mediaTypeFieldName, 'none' as PathValue<T, typeof mediaTypeFieldName>, {
      shouldValidate: true,
    });
  };

  const removeVideo = () => {
    if (video && video.startsWith('blob:')) {
      URL.revokeObjectURL(video);
    }

    setValue(videoFieldName, undefined as PathValue<T, typeof videoFieldName>, {
      shouldValidate: true,
    });
    setValue(mediaTypeFieldName, 'none' as PathValue<T, typeof mediaTypeFieldName>, {
      shouldValidate: true,
    });
  };

  const removeLink = () => {
    setValue(linkFieldName, undefined as PathValue<T, typeof linkFieldName>, {
      shouldValidate: true,
    });
    setValue(mediaTypeFieldName, 'none' as PathValue<T, typeof mediaTypeFieldName>, {
      shouldValidate: true,
    });
  };

  return (
    <div className="w-full">
      {/* Images */}
      {mediaType === 'images' && images && images.length > 0 && (
        <div className="mt-4 w-full">
          <div className="mb-3 flex items-center justify-end">
            {images.length > 1 && (
              <button
                type="button"
                onClick={removeAllImages}
                className="text-error text-xs transition-opacity hover:opacity-80"
              >
                Remove All
              </button>
            )}
          </div>

          <div className="w-full overflow-hidden">
            <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4">
              {images.map((image, index) => (
                <div
                  key={index}
                  className="relative flex-shrink-0 snap-center"
                  style={{
                    width: images.length === 1 ? '100%' : '160px',
                    height: '160px',
                    maxWidth: images.length === 1 ? '100%' : '160px',
                  }}
                >
                  <Image
                    src={image}
                    alt={`Selected image ${index + 1}`}
                    width={160}
                    height={160}
                    className="border-border h-full w-full rounded-xl border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="bg-background/80 text-text hover:bg-background absolute top-2 right-2 rounded-full p-1.5 backdrop-blur-sm transition-colors"
                  >
                    <X size={14} />
                  </button>
                  {images.length > 1 && (
                    <div className="bg-background/80 text-text absolute right-2 bottom-2 rounded-full px-2 py-1 text-xs backdrop-blur-sm">
                      {index + 1}/{images.length}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {images.length > 1 && (
              <div className="mt-2 flex justify-center space-x-1">
                {images.map((_, index) => (
                  <div key={index} className="bg-text-muted h-1.5 w-1.5 rounded-full" />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video */}
      {mediaType === 'video' && video && (
        <div className="mt-4 w-full">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-text text-sm font-medium">Video</h4>
          </div>
          <div className="border-border relative w-full overflow-hidden rounded-xl border">
            <video src={video} controls className="bg-surface-elevated h-48 w-full object-cover" />
            <button
              type="button"
              onClick={removeVideo}
              className="bg-background/80 text-text hover:bg-background absolute top-3 right-3 rounded-full p-1.5 backdrop-blur-sm transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* GIF */}
      {mediaType === 'gif' && gif && (
        <div className="mt-4 w-full">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-text text-sm font-medium">GIF</h4>
          </div>
          <div className="border-border relative w-full overflow-hidden rounded-xl border">
            <Image
              src={gif}
              alt="Selected GIF"
              width={500}
              height={500}
              className="bg-surface-elevated h-48 w-full object-cover"
            />
            <button
              type="button"
              onClick={removeGif}
              className="bg-background/80 text-text hover:bg-background absolute top-3 right-3 rounded-full p-1.5 backdrop-blur-sm transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Link */}
      {mediaType === 'link' && link && (
        <div className="mt-4 w-full">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-text text-sm font-medium">Link Preview</h4>
          </div>
          <div className="border-border bg-surface relative w-full overflow-hidden rounded-xl border">
            <div className="p-4">
              <div className="text-text line-clamp-2 text-sm font-medium">{link.title}</div>
              <div className="text-text-secondary mt-1 truncate text-xs">{link.url}</div>
            </div>
            {link.image && (
              <div className="relative h-32 w-full">
                <Image
                  src={link.image}
                  alt="Link preview"
                  width={500}
                  height={128}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <button
              type="button"
              onClick={removeLink}
              className="bg-background/80 text-text hover:bg-background absolute top-3 right-3 rounded-full p-1.5 backdrop-blur-sm transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaPreview;
