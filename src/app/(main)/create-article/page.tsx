'use client';

import React, { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ArrowLeft,
  Building,
  Eye,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Upload,
  User,
  X,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  useKeyopollsArticlesApiCreateArticle,
  useKeyopollsArticlesApiGetArticle,
  useKeyopollsArticlesApiUpdateArticle,
} from '@/api/default/default';
import { toast } from '@/components/ui/toast';
import { useCommunityStore } from '@/stores/useCommunityStore';
import { useProfileStore } from '@/stores/useProfileStore';

// Form validation schema
const articleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  subtitle: z
    .string()
    .min(1, 'Subtitle is required')
    .max(300, 'Subtitle must be less than 300 characters'),
  link: z.string().url('Please enter a valid URL').min(1, 'Article link is required'),
  author_name: z
    .string()
    .max(100, 'Author name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  community_id: z.number().min(1, 'Please select a community'),
  is_published: z.boolean(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

// Storage data type
interface StorageData extends Partial<ArticleFormData> {
  timestamp: number;
  editMode: boolean;
  articleId: string | null;
}

const STORAGE_KEY = 'createArticleFormData';

const CreateArticlePage = () => {
  const { accessToken } = useProfileStore();
  const { communityDetails } = useCommunityStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get article ID from search params for edit mode
  const articleId = searchParams.get('edit');
  const isEditMode = !!articleId;

  // State
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // API hooks
  const { mutate: createArticle } = useKeyopollsArticlesApiCreateArticle({
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  const { mutate: updateArticle } = useKeyopollsArticlesApiUpdateArticle({
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  const { data: articleData, isLoading: isLoadingArticle } = useKeyopollsArticlesApiGetArticle(
    parseInt(articleId || '0'),
    {
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      query: {
        enabled: !!articleId && !!accessToken,
      },
    }
  );

  // Form setup
  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      link: '',
      author_name: '',
      community_id: 0,
      is_published: true, // Default to published since no draft option
    },
  });

  // Watch form values for local storage
  const watchedValues = form.watch();

  // Local storage functions
  const saveToLocalStorage = (data: Partial<ArticleFormData>) => {
    if (typeof window === 'undefined') return;
    try {
      const storageData: StorageData = {
        ...data,
        timestamp: Date.now(),
        editMode: isEditMode,
        articleId: articleId,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const loadFromLocalStorage = (): Partial<ArticleFormData> => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return {};

      const data = JSON.parse(saved) as StorageData;
      // Check if data is from the same mode and article
      if (data.editMode === isEditMode && data.articleId === articleId) {
        // Check if data is not older than 24 hours
        const isRecent = data.timestamp && Date.now() - data.timestamp < 24 * 60 * 60 * 1000;
        if (isRecent) {
          const { timestamp, editMode, articleId, ...formData } = data; // eslint-disable-line @typescript-eslint/no-unused-vars
          return formData;
        }
      }
      return {};
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return {};
    }
  };

  const clearLocalStorage = () => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };

  // Load saved data or article data on mount
  useEffect(() => {
    if (isEditMode && articleData?.data) {
      // Load article data for editing
      const article = articleData.data;
      form.reset({
        title: article.title,
        subtitle: article.subtitle || '',
        link: article.link || '',
        author_name: article.author_display_name || '',
        community_id: article.community_id,
        is_published: article.is_published,
      });

      // Set main image preview if exists
      if (article.main_image_url) {
        setMainImagePreview(article.main_image_url);
      }
    } else if (!isEditMode) {
      // Load from localStorage for new articles
      const savedData = loadFromLocalStorage();
      if (Object.keys(savedData).length > 0) {
        form.reset({
          ...form.getValues(),
          ...savedData,
        });
      }
    }
  }, [articleData, isEditMode, form]);

  // Set community if available
  useEffect(() => {
    if (communityDetails && !isEditMode) {
      form.setValue('community_id', communityDetails.id);
    }
  }, [communityDetails, isEditMode, form]);

  // Save to localStorage when form values change (only for new articles)
  useEffect(() => {
    if (!isEditMode) {
      const timer = setTimeout(() => {
        saveToLocalStorage(watchedValues);
      }, 1000); // Debounce saves

      return () => clearTimeout(timer);
    }
  }, [watchedValues, isEditMode]);

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size must be less than 5MB');
      return;
    }

    setMainImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setMainImagePreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Remove image
  const removeImage = () => {
    setMainImage(null);
    setMainImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle form submission
  const onSubmit = async (data: ArticleFormData) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      // Prepare data with empty content
      const submissionData = {
        ...data,
        content: '', // Always pass empty string for content
        is_published: true, // Always publish since no draft option
      };

      if (isEditMode && articleId) {
        // Update existing article
        updateArticle(
          {
            articleId: parseInt(articleId),
            data: {
              data: submissionData,
              main_image: mainImage || undefined,
            },
          },
          {
            onSuccess: (response) => {
              toast.success('Article updated successfully!');
              clearLocalStorage();
              router.push(`/articles/${response.data.id}`);
            },
            onError: (error) => {
              setErrorMessage(error.response?.data?.message || 'Failed to update article');
            },
          }
        );
      } else {
        // Create new article
        createArticle(
          {
            data: {
              data: submissionData,
              main_image: mainImage || undefined,
            },
          },
          {
            onSuccess: (response) => {
              toast.success('Article created successfully!');
              clearLocalStorage();
              router.push(`/articles/${response.data.id}`);
            },
            onError: (error) => {
              setErrorMessage(error.response?.data?.message || 'Failed to create article');
            },
          }
        );
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred');
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle publish
  const publishArticle = () => {
    form.handleSubmit(onSubmit)();
  };

  // Handle back navigation
  const handleBack = () => {
    router.back();
  };

  if (isEditMode && isLoadingArticle) {
    return (
      <div className="bg-background min-h-screen">
        <div className="animate-pulse">
          <div className="border-border-subtle border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="bg-surface-elevated h-8 w-8 rounded-full"></div>
              <div className="bg-surface-elevated h-6 w-32 rounded"></div>
              <div className="bg-surface-elevated h-8 w-16 rounded"></div>
            </div>
          </div>
          <div className="space-y-4 p-4">
            <div className="bg-surface-elevated h-12 w-full rounded"></div>
            <div className="bg-surface-elevated h-8 w-full rounded"></div>
            <div className="bg-surface-elevated h-40 w-full rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="border-border-subtle bg-background sticky top-0 z-10 border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="text-text-muted hover:text-text rounded-full p-1.5 transition-colors"
            type="button"
          >
            <ArrowLeft size={20} />
          </button>

          <h1 className="text-text text-lg font-semibold">
            {isEditMode ? 'Edit Article' : 'Create Article'}
          </h1>

          <div className="flex items-center gap-2">
            <button
              onClick={publishArticle}
              disabled={isSubmitting}
              type="button"
              className="bg-primary text-background flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <Eye size={16} />
              {isSubmitting ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-4xl p-4">
        <div className="space-y-6">
          {/* Main Image Upload */}
          <div className="space-y-3">
            <label className="text-text flex items-center gap-2 text-sm font-medium">
              <ImageIcon size={16} />
              Featured Image
            </label>

            {mainImagePreview ? (
              <div className="relative">
                <div className="relative h-48 w-full overflow-hidden rounded-lg">
                  <Image
                    src={mainImagePreview}
                    alt="Article preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-border hover:border-primary group flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors"
              >
                <Upload className="text-text-muted group-hover:text-primary mb-2 h-8 w-8 transition-colors" />
                <p className="text-text-muted group-hover:text-text text-sm transition-colors">
                  Click to upload featured image
                </p>
                <p className="text-text-muted text-xs">PNG, JPG up to 5MB</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-text flex items-center gap-2 text-sm font-medium">
              <FileText size={16} />
              Title *
            </label>
            <input
              {...form.register('title')}
              placeholder="Enter article title..."
              className="border-border bg-surface text-text placeholder:text-text-muted focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none"
            />
            {form.formState.errors.title && (
              <p className="text-error text-sm">{form.formState.errors.title.message}</p>
            )}
          </div>

          {/* Subtitle */}
          <div className="space-y-2">
            <label className="text-text text-sm font-medium">Subtitle *</label>
            <input
              {...form.register('subtitle')}
              placeholder="Enter article subtitle..."
              className="border-border bg-surface text-text placeholder:text-text-muted focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none"
            />
            {form.formState.errors.subtitle && (
              <p className="text-error text-sm">{form.formState.errors.subtitle.message}</p>
            )}
          </div>

          {/* Article Link */}
          <div className="space-y-2">
            <label className="text-text flex items-center gap-2 text-sm font-medium">
              <LinkIcon size={16} />
              Article Link *
            </label>
            <input
              {...form.register('link')}
              placeholder="https://example.com/your-article"
              type="url"
              className="border-border bg-surface text-text placeholder:text-text-muted focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none"
            />
            {form.formState.errors.link && (
              <p className="text-error text-sm">{form.formState.errors.link.message}</p>
            )}
            <p className="text-text-muted text-xs">
              Link to your article on Substack, Medium, LinkedIn, or any other platform
            </p>
          </div>

          {/* Author Name */}
          <div className="space-y-2">
            <label className="text-text flex items-center gap-2 text-sm font-medium">
              <User size={16} />
              Author Name
            </label>
            <input
              {...form.register('author_name')}
              placeholder="Leave empty to use your profile name..."
              className="border-border bg-surface text-text placeholder:text-text-muted focus:border-primary focus:ring-primary/20 w-full rounded-lg border px-4 py-3 transition-colors focus:ring-2 focus:outline-none"
            />
            {form.formState.errors.author_name && (
              <p className="text-error text-sm">{form.formState.errors.author_name.message}</p>
            )}
            <p className="text-text-muted text-xs">
              Only fill this if you're sharing someone else's article
            </p>
          </div>

          {/* Community Selection */}
          {!isEditMode && (
            <div className="space-y-2">
              <label className="text-text flex items-center gap-2 text-sm font-medium">
                <Building size={16} />
                Community *
              </label>
              {communityDetails ? (
                <div className="border-border bg-surface-elevated flex items-center gap-3 rounded-lg border p-3">
                  {communityDetails.avatar && (
                    <Image
                      src={communityDetails.avatar}
                      alt={communityDetails.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                  <span className="text-text font-medium">{communityDetails.name}</span>
                </div>
              ) : (
                <div className="border-border bg-surface text-text-secondary flex items-center justify-center rounded-lg border p-8">
                  <p>Please select a community to publish your article</p>
                </div>
              )}
            </div>
          )}
        </div>
      </form>

      {/* Error Message */}
      {errorMessage && (
        <div className="fixed right-4 bottom-4 left-4 z-20 mx-auto max-w-2xl">
          <div className="flex items-center gap-3 rounded-lg border border-red-400 bg-red-500 p-3 text-white shadow-lg">
            <AlertCircle size={20} />
            <span className="flex-1 text-sm font-medium">{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="rounded-full p-1 transition-colors hover:bg-red-600"
              type="button"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateArticlePage;
