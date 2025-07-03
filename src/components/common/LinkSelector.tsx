'use client';

import React, { useState } from 'react';

import { FieldValues, Path, PathValue, useFormContext } from 'react-hook-form';

type LinkSelectorProps<T extends FieldValues> = {
  linkFieldName: Path<T>;
  mediaTypeFieldName: Path<T>;
  onClose: () => void;
};

const LinkSelector = <T extends FieldValues>({
  linkFieldName,
  mediaTypeFieldName,
  onClose,
}: LinkSelectorProps<T>) => {
  const { setValue } = useFormContext<T>();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      return;
    }

    // Add protocol if missing
    let processedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      processedUrl = 'https://' + url;
    }

    // In a real app, you would fetch metadata for the link here
    // For now, we'll just use the entered data
    const linkData = {
      url: processedUrl,
      title: title || processedUrl,
      image: '/api/placeholder/300/200', // Placeholder image
    };

    setValue(linkFieldName, linkData as PathValue<T, typeof linkFieldName>, {
      shouldValidate: true,
    });

    setValue(mediaTypeFieldName, 'link' as PathValue<T, typeof mediaTypeFieldName>, {
      shouldValidate: true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-surface border-border w-full max-w-md rounded-lg border p-6 shadow-xl">
        <h3 className="text-text mb-6 text-lg font-semibold">Add Link</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-text mb-2 block text-sm font-medium">URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="border-border bg-background focus:border-primary focus:ring-primary/20 w-full rounded-md border px-3 py-3 text-sm focus:ring-2 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-text mb-2 block text-sm font-medium">Title (Optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title for your link"
              className="border-border bg-background focus:border-primary focus:ring-primary/20 w-full rounded-md border px-3 py-3 text-sm focus:ring-2 focus:outline-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="border-border bg-background text-text-secondary hover:bg-surface-elevated rounded-md border px-4 py-2 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!url.trim()}
              className="bg-primary text-background rounded-md px-4 py-2 text-sm font-medium transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LinkSelector;
