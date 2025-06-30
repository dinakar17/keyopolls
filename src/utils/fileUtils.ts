// Helper function to get file extension from MIME type
export function getExtensionFromMimeType(mimeType: string): string {
  const parts = mimeType.split('/');
  if (parts.length !== 2) return 'bin';

  let ext = parts[1];
  // Handle special cases
  if (ext === 'jpeg') ext = 'jpg';
  if (ext.includes('+')) {
    // Handle complex MIME types like "image/svg+xml"
    ext = ext.split('+')[0];
  }
  return ext;
}

/**
 * Converts blob URLs to File objects with appropriate names based on media type
 * @param mediaUrls Array of blob URLs to convert
 * @param mediaType Type of media being processed
 * @returns Promise resolving to an array of File objects
 */
export const convertMediaUrlsToFiles = async (
  mediaUrls: string[],
  mediaType: 'images' | 'video' | 'gif' | string
): Promise<File[]> => {
  return Promise.all(
    mediaUrls.map(async (url, index) => {
      const response = await fetch(url);
      const blob = await response.blob();

      // Create appropriate filename based on media type
      let fileName;
      if (mediaType === 'video') {
        fileName = `video.${getExtensionFromMimeType(blob.type)}`;
      } else if (mediaType === 'images') {
        fileName = `image_${index}.${getExtensionFromMimeType(blob.type)}`;
      } else if (mediaType === 'gif') {
        fileName = `gif.${getExtensionFromMimeType(blob.type)}`;
      } else {
        fileName = `file_${index}.${getExtensionFromMimeType(blob.type)}`;
      }

      // Create a File object instead of using the Blob directly
      return new File([blob], fileName, { type: blob.type });
    })
  );
};

/**
 * Cleans up blob URLs to prevent memory leaks
 * @param images Array of image URLs to clean up
 * @param video Video URL to clean up
 * @param gif GIF URL to clean up
 */
export const cleanupMediaBlobUrls = (images: string[] = [], video?: string, gif?: string): void => {
  // Clean up image blob URLs
  images.forEach((url) => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  });

  // Clean up video blob URL
  if (video && video.startsWith('blob:')) {
    URL.revokeObjectURL(video);
  }

  // Clean up gif blob URL
  if (gif && gif.startsWith('blob:')) {
    URL.revokeObjectURL(gif);
  }
};

export const processFileForUpload = (fileData: File | string | null | undefined): File | null => {
  if (!fileData) return null;

  // If it's already a File object, return as-is
  if (fileData instanceof File) return fileData;

  // If it's a string (existing URL from server), we don't need to upload it
  // The backend will keep the existing file
  if (typeof fileData === 'string') return null;

  return null;
};

// Helper function to get the display URL for images
export const getImageDisplayUrl = (
  fileOrUrl: File | string | null | undefined,
  previewUrl: string | null
): string | null => {
  if (previewUrl) return previewUrl; // New file preview
  if (typeof fileOrUrl === 'string') return fileOrUrl; // Existing URL from server
  return null; // No image
};
