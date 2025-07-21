'use client';

import React, { useEffect, useRef, useState } from 'react';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ArrowLeft,
  Building,
  ChevronDown,
  Eye,
  FileText,
  Hash,
  Image as ImageIcon,
  Link as LinkIcon,
  Search,
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
import { useKeyopollsCommonApiTagsGetTagsList } from '@/api/tags/tags';
import { toast } from '@/components/ui/toast';
import { useCommunityStore } from '@/stores/useCommunityStore';
import { useProfileStore } from '@/stores/useProfileStore';

// Tag interface
interface Tag {
  id: number;
  name: string;
  usage_count?: number;
  created_at?: string;
}

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
  tags: z
    .array(z.object({ id: z.number(), name: z.string() }))
    .min(1, 'At least one tag is required')
    .max(2, 'Maximum 2 tags allowed'),
  community_id: z.number().min(1, 'Please select a community'),
  is_published: z.boolean(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

// Storage data type
interface StorageData extends Partial<Omit<ArticleFormData, 'tags'> & { tags: Tag[] }> {
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
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  // Get article ID from search params for edit mode
  const articleId = searchParams.get('edit');
  const isEditMode = !!articleId;

  // State
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tag search state
  const [tagSearch, setTagSearch] = useState('');
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [debouncedTagSearch, setDebouncedTagSearch] = useState('');

  // Debounce tag search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTagSearch(tagSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [tagSearch]);

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

  // Tags search API
  const { data: tagsData, isLoading: isLoadingTags } = useKeyopollsCommonApiTagsGetTagsList(
    {
      search: debouncedTagSearch,
      per_page: 20,
    },
    {
      request: {
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {},
      },
      query: {
        enabled: isTagDropdownOpen && debouncedTagSearch.length >= 1,
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
      tags: [],
      community_id: 0,
      is_published: true,
    },
  });

  // Watch form values for local storage
  const watchedValues = form.watch();

  // Local storage functions
  const saveToLocalStorage = (data: Partial<ArticleFormData>, tags: Tag[]) => {
    if (typeof window === 'undefined') return;
    try {
      const storageData: StorageData = {
        ...data,
        tags,
        timestamp: Date.now(),
        editMode: isEditMode,
        articleId: articleId,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const loadFromLocalStorage = (): { formData: Partial<ArticleFormData>; tags: Tag[] } => {
    if (typeof window === 'undefined') return { formData: {}, tags: [] };
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return { formData: {}, tags: [] };

      const data = JSON.parse(saved) as StorageData;
      if (data.editMode === isEditMode && data.articleId === articleId) {
        const isRecent = data.timestamp && Date.now() - data.timestamp < 24 * 60 * 60 * 1000;
        if (isRecent) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { timestamp, editMode, articleId, tags, ...formData } = data;
          return {
            formData: {
              ...formData,
              tags: tags?.map((tag) => ({ id: tag.id, name: tag.name })) || [],
            },
            tags: tags || [],
          };
        }
      }
      return { formData: {}, tags: [] };
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      return { formData: {}, tags: [] };
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

  // Tag management functions
  const handleTagSelect = (tag: Tag) => {
    if (selectedTags.length >= 2) {
      setErrorMessage('Maximum 2 tags allowed');
      return;
    }

    if (selectedTags.some((t) => t.id === tag.id)) {
      setErrorMessage('Tag already selected');
      return;
    }

    const newTags = [...selectedTags, tag];
    setSelectedTags(newTags);
    form.setValue(
      'tags',
      newTags.map((t) => ({ id: t.id, name: t.name }))
    );
    setTagSearch('');
    setIsTagDropdownOpen(false);
    setErrorMessage(null);
  };

  const handleTagRemove = (tagId: number) => {
    const newTags = selectedTags.filter((tag) => tag.id !== tagId);
    setSelectedTags(newTags);
    form.setValue(
      'tags',
      newTags.map((t) => ({ id: t.id, name: t.name }))
    );
  };

  const handleCreateNewTag = () => {
    if (!tagSearch.trim()) return;

    if (selectedTags.length >= 2) {
      setErrorMessage('Maximum 2 tags allowed');
      return;
    }

    if (tagSearch.length > 50) {
      setErrorMessage('Tag must be less than 50 characters');
      return;
    }

    // Create a temporary tag with negative ID for new tags
    const newTag: Tag = {
      id: -Date.now(), // Temporary negative ID
      name: tagSearch.trim(),
    };

    const newTags = [...selectedTags, newTag];
    setSelectedTags(newTags);
    form.setValue(
      'tags',
      newTags.map((t) => ({ id: t.id, name: t.name }))
    );
    setTagSearch('');
    setIsTagDropdownOpen(false);
    setErrorMessage(null);
  };

  // Click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagDropdownRef.current && !tagDropdownRef.current.contains(event.target as Node)) {
        setIsTagDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load saved data or article data on mount
  useEffect(() => {
    if (isEditMode && articleData?.data) {
      const article = articleData.data;
      const articleTags = article.tags?.map((tag: any) => ({ id: tag.id, name: tag.name })) || [];

      form.reset({
        title: article.title,
        subtitle: article.subtitle || '',
        link: article.link || '',
        author_name: article.author_display_name || '',
        tags: articleTags,
        community_id: article.community_id,
        is_published: article.is_published,
      });

      setSelectedTags(article.tags || []);

      if (article.main_image_url) {
        setMainImagePreview(article.main_image_url);
      }
    } else if (!isEditMode) {
      const { formData, tags } = loadFromLocalStorage();
      if (Object.keys(formData).length > 0) {
        form.reset({ ...form.getValues(), ...formData });
        setSelectedTags(tags);
      }
    }
  }, [articleData, isEditMode, form]);

  // Set community if available
  useEffect(() => {
    if (communityDetails && !isEditMode) {
      form.setValue('community_id', communityDetails.id);
    }
  }, [communityDetails, isEditMode, form]);

  // Save to localStorage when form values change
  useEffect(() => {
    if (!isEditMode) {
      const timer = setTimeout(() => {
        saveToLocalStorage(watchedValues, selectedTags);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [watchedValues, selectedTags, isEditMode]);

  // Handle image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size must be less than 5MB');
      return;
    }

    setMainImage(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setMainImagePreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

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

      // Convert tag data for submission
      const submissionData = {
        ...data,
        content: '',
        is_published: true,
        tag_ids: selectedTags.filter((tag) => tag.id > 0).map((tag) => tag.id), // Existing tags
        new_tags: selectedTags.filter((tag) => tag.id < 0).map((tag) => tag.name), // New tags
      };

      if (isEditMode && articleId) {
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
        createArticle(
          {
            data: {
              data: submissionData,
              main_image: mainImage || undefined,
            },
          },
          {
            onSuccess: (response) => {
              toast.success('Article shared successfully!');
              clearLocalStorage();
              router.push(`/articles/${response.data.id}`);
            },
            onError: (error) => {
              setErrorMessage(error.response?.data?.message || 'Failed to share article');
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

  const publishArticle = () => {
    form.handleSubmit(onSubmit)();
  };

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

  // Filter available tags (exclude already selected)
  const availableTags =
    tagsData?.data?.tags?.filter(
      (tag) => !selectedTags.some((selected) => selected.id === tag.id)
    ) || [];

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
            {isEditMode ? 'Edit Article' : 'Share Article'}
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

          {/* Tags */}
          <div className="space-y-3">
            <label className="text-text flex items-center gap-2 text-sm font-medium">
              <Hash size={16} />
              Tags * (1-2 tags required)
            </label>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag.id}
                    className="bg-primary text-background flex items-center gap-1 rounded-full px-3 py-1 text-sm"
                  >
                    #{tag.name}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag.id)}
                      className="text-background hover:text-background/80 ml-1 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tag Search */}
            {selectedTags.length < 2 && (
              <div className="relative" ref={tagDropdownRef}>
                <div className="relative">
                  <Search className="text-text-muted absolute top-3 left-3 h-5 w-5" />
                  <input
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    onFocus={() => setIsTagDropdownOpen(true)}
                    placeholder="Search for tags..."
                    className="border-border bg-surface text-text placeholder:text-text-muted focus:border-primary focus:ring-primary/20 w-full rounded-lg border py-3 pr-10 pl-10 transition-colors focus:ring-2 focus:outline-none"
                  />
                  <ChevronDown className="text-text-muted absolute top-3 right-3 h-5 w-5" />
                </div>

                {/* Dropdown */}
                {isTagDropdownOpen && (
                  <div className="border-border bg-surface absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border shadow-lg">
                    {isLoadingTags ? (
                      <div className="p-4 text-center">
                        <div className="text-text-muted text-sm">Searching tags...</div>
                      </div>
                    ) : (
                      <>
                        {/* Create New Tag Option */}
                        {tagSearch.trim() && tagSearch.length <= 50 && (
                          <button
                            type="button"
                            onClick={handleCreateNewTag}
                            className="text-primary hover:bg-surface-elevated w-full p-3 text-left text-sm transition-colors"
                          >
                            Create "{tagSearch.trim()}"
                          </button>
                        )}

                        {/* Existing Tags */}
                        {availableTags.length > 0 ? (
                          availableTags.map((tag) => (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => handleTagSelect(tag)}
                              className="hover:bg-surface-elevated flex w-full items-center justify-between p-3 text-left transition-colors"
                            >
                              <div>
                                <span className="text-text text-sm">#{tag.name}</span>
                                {tag.usage_count && (
                                  <span className="text-text-muted ml-2 text-xs">
                                    {tag.usage_count} uses
                                  </span>
                                )}
                              </div>
                            </button>
                          ))
                        ) : tagSearch.length >= 1 && !isLoadingTags ? (
                          <div className="text-text-muted p-4 text-center text-sm">
                            No tags found.{' '}
                            {tagSearch.trim() &&
                              tagSearch.length <= 50 &&
                              'Create a new one above.'}
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            <p className="text-text-muted text-xs">
              Search for existing tags or create new ones. You can select 1-2 tags.
            </p>

            {form.formState.errors.tags && (
              <p className="text-error text-sm">{form.formState.errors.tags.message}</p>
            )}
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
