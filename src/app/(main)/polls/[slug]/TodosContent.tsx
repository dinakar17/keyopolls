'use client';

import React, { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Bookmark, BookmarkCheck, Check, Folder, Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useKeyopollsCommonApiBookmarkCheckTodosBookmarkStatus } from '@/api/bookmarks/bookmarks';
import { useKeyopollsCommonApiBookmarkToggleBookmark } from '@/api/bookmarks/bookmarks';
import { useKeyopollsCommonApiBookmarkGetBookmarkFolders } from '@/api/bookmarks/bookmarks';
import { useKeyopollsCommonApiBookmarkCreateBookmarkFolder } from '@/api/bookmarks/bookmarks';
import {
  BookmarkFolderDetailsSchema,
  TodoBookmarkStatusResponseSchema,
  TodoItemSchema,
} from '@/api/schemas';
import MarkdownDisplay from '@/components/common/MarkdownDisplay';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import toast from '@/components/ui/toast';
import { useProfileStore } from '@/stores/useProfileStore';

// Zod schema for folder creation form
const createFolderSchema = z.object({
  name: z
    .string()
    .min(1, 'Folder name is required')
    .max(100, 'Folder name must be 100 characters or less')
    .trim(),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional()
    .default('')
    .transform((val) => val?.trim() || ''),
});

type CreateFolderFormData = z.input<typeof createFolderSchema>;

interface TodoListProps {
  todos: TodoItemSchema[];
  className?: string;
  isLoading?: boolean;
}

const TodoList: React.FC<TodoListProps> = ({ todos, className = '', isLoading = false }) => {
  const { accessToken } = useProfileStore();

  // State management
  const [bookmarkStatuses, setBookmarkStatuses] = useState<
    Map<number, TodoBookmarkStatusResponseSchema>
  >(new Map());
  const [selectedTodo, setSelectedTodo] = useState<TodoItemSchema | null>(null);
  const [showFolderSelector, setShowFolderSelector] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    watch,
  } = useForm<CreateFolderFormData>({
    resolver: zodResolver(createFolderSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
    },
  });

  // Watch form values for character counting
  const watchedName = watch('name');
  const watchedDescription = watch('description');

  // API hooks
  const { mutate: checkBookmarkStatus, isPending: isCheckingBookmarkStatus } =
    useKeyopollsCommonApiBookmarkCheckTodosBookmarkStatus({
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      mutation: {
        onSuccess: (response) => {
          const statusMap = new Map();
          response.data.statuses.forEach((status) => {
            statusMap.set(status.todo_id, status);
          });
          setBookmarkStatuses(statusMap);
        },
      },
    });

  const { mutate: toggleBookmark, isPending: isTogglingBookmark } =
    useKeyopollsCommonApiBookmarkToggleBookmark({
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      mutation: {
        onSuccess: (response, variables) => {
          const todoId = selectedTodo?.id;
          if (!todoId) return;

          // Update local state
          setBookmarkStatuses((prev) => {
            const newMap = new Map(prev);
            if (response.data.bookmarked) {
              newMap.set(todoId, {
                todo_id: todoId,
                is_bookmarked: true,
                folder_id: variables.data.folder_id || undefined,
                folder_name: undefined, // Will be updated on next status check
              });
              toast.success('Todo added to your list!');
            } else {
              newMap.set(todoId, {
                todo_id: todoId,
                is_bookmarked: false,
                folder_id: undefined,
                folder_name: undefined,
              });
              toast.success('Todo removed from your list');
            }
            return newMap;
          });

          setShowFolderSelector(false);
          setSelectedTodo(null);
        },
        onError: (error) => {
          toast.error('Failed to update todo bookmark');
          console.error('Bookmark toggle error:', error);
        },
      },
    });

  const {
    data: foldersData,
    refetch: refetchFolders,
    isLoading: isFoldersLoading,
  } = useKeyopollsCommonApiBookmarkGetBookmarkFolders(
    {
      page: 1,
      page_size: 50,
      is_todo_folder: true,
      content_type: 'PollTodo',
      ordering: 'name',
    },
    {
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      query: {
        enabled: showFolderSelector && !!accessToken,
      },
    }
  );

  const { mutate: createFolder, isPending: isCreatingFolder } =
    useKeyopollsCommonApiBookmarkCreateBookmarkFolder({
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      mutation: {
        onSuccess: (response) => {
          toast.success('Todo folder created successfully!');
          reset(); // Reset form using react-hook-form
          setShowCreateFolder(false);
          refetchFolders();

          // Automatically bookmark the todo to the new folder
          if (selectedTodo) {
            toggleBookmark({
              contentType: 'PollTodo',
              objectId: selectedTodo.id || 0,
              data: {
                folder_id: response.data.id,
                is_todo: true,
              },
            });
          }
        },
        onError: (error) => {
          toast.error(
            `Failed to create folder: ${error?.response?.data?.message || 'An unexpected error occurred. Please try again.'}`
          );
          console.error('Create folder error:', error);
        },
      },
    });

  // Check bookmark status on mount and when todos change
  useEffect(() => {
    if (!accessToken || todos.length === 0) return;

    const todoIds = todos.map((todo) => todo.id);
    checkBookmarkStatus({
      data: {
        todo_ids: todoIds.filter((id) => id !== undefined && id !== null),
      },
    });
  }, [todos, accessToken, checkBookmarkStatus]);

  // Handle bookmark button click
  const handleBookmarkClick = (todo: TodoItemSchema) => {
    if (!accessToken) {
      toast.error('Please sign in to bookmark todos');
      return;
    }

    const status = bookmarkStatuses.get(todo.id || 0);

    if (status?.is_bookmarked) {
      // Already bookmarked, remove it
      toggleBookmark({
        contentType: 'PollTodo',
        objectId: todo.id || 0,
        data: {
          is_todo: true,
        },
      });
    } else {
      // Not bookmarked, show folder selector
      setSelectedTodo(todo);
      setShowFolderSelector(true);
    }
  };

  // Handle folder selection
  const handleFolderSelect = (folder: BookmarkFolderDetailsSchema) => {
    if (!selectedTodo) return;

    toggleBookmark({
      contentType: 'PollTodo',
      objectId: selectedTodo.id || 0,
      data: {
        folder_id: folder.id,
        is_todo: true,
      },
    });
  };

  // Handle form submission for creating folder
  const onSubmit = (data: CreateFolderFormData) => {
    createFolder({
      data: {
        name: data.name,
        description: data.description,
        is_todo_folder: true,
        content_type: 'PollTodo',
        access_level: 'private',
      },
    });
  };

  // Handle drawer close and reset form
  const handleCreateFolderClose = (open: boolean) => {
    setShowCreateFolder(open);
    if (!open) {
      reset();
    }
  };

  // Loading skeleton component
  const TodoSkeleton = () => (
    <div className="space-y-2">
      {Array.from({ length: 1 }).map((_, i) => (
        <div key={i} className="border-border animate-pulse rounded-lg border p-3">
          <div className="flex items-start justify-between">
            <div className="flex flex-1 items-start gap-3">
              <div className="bg-surface-elevated mt-0.5 h-4 w-4 rounded border-2"></div>
              <div className="flex-1 space-y-2">
                <div className="bg-surface-elevated h-4 w-3/4 rounded"></div>
                <div className="bg-surface-elevated h-4 w-1/2 rounded"></div>
              </div>
            </div>
            <div className="bg-surface-elevated h-8 w-8 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Folder skeleton component
  const FolderSkeleton = () => (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border-border animate-pulse rounded-lg border p-3">
          <div className="flex items-center gap-3">
            <div className="bg-surface-elevated h-4 w-4 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="bg-surface-elevated h-4 w-1/2 rounded"></div>
              <div className="bg-surface-elevated h-3 w-1/3 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  if (!todos || todos.length === 0) {
    return null;
  }

  return (
    <>
      <div className={`space-y-3 ${className}`}>
        <div className="mb-4 flex items-center gap-2">
          <div className="bg-warning rounded-lg p-1.5">
            <Check className="text-background h-4 w-4" />
          </div>
          <h2 className="text-text text-sm font-semibold">Todo Items ({todos.length})</h2>
        </div>

        {isLoading || isCheckingBookmarkStatus ? (
          <TodoSkeleton />
        ) : (
          <div className="space-y-2">
            {todos.map((todo) => {
              const status = bookmarkStatuses.get(todo.id || 0);
              const isBookmarked = status?.is_bookmarked || false;

              return (
                <div
                  key={todo.id}
                  className="border-border hover:bg-surface-elevated/30 rounded-lg border p-3 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-3">
                        {/* Todo checkbox visual */}
                        <div className="mt-0.5 flex-shrink-0">
                          <div className="border-warning bg-background flex h-4 w-4 items-center justify-center rounded border-2">
                            <Check className="text-warning h-3 w-3 opacity-30" />
                          </div>
                        </div>

                        {/* Todo text */}
                        <div className="min-w-0 flex-1">
                          <MarkdownDisplay content={todo.text} />

                          {/* Bookmark status */}
                          {isBookmarked && status?.folder_name && (
                            <div className="mt-2 flex items-center gap-1">
                              <Folder className="text-warning h-3 w-3" />
                              <span className="text-warning text-xs font-medium">
                                Saved to {status.folder_name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bookmark button */}
                    <button
                      onClick={() => handleBookmarkClick(todo)}
                      disabled={isTogglingBookmark}
                      className={`flex-shrink-0 rounded-full p-2 transition-colors ${
                        isBookmarked
                          ? 'text-warning hover:bg-warning/10'
                          : 'text-text-muted hover:bg-warning/10 hover:text-warning'
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                      title={isBookmarked ? 'Remove from your todos' : 'Add to your todos'}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="h-4 w-4" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Folder Selector Drawer */}
      <Drawer open={showFolderSelector} onOpenChange={setShowFolderSelector}>
        <DrawerContent className="max-h-[80vh]">
          <DrawerHeader className="border-border border-b">
            <div className="flex items-center justify-between">
              <DrawerTitle>Save Todo To</DrawerTitle>
              <DrawerClose asChild>
                <button className="hover:bg-surface-elevated rounded-full p-1 transition-colors">
                  <X className="text-text-muted h-5 w-5" />
                </button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto">
            {/* Selected Todo */}
            {selectedTodo && (
              <div className="border-border bg-surface-elevated border-b p-4">
                <div className="flex items-start gap-2">
                  <Check className="text-warning mt-0.5 h-4 w-4 flex-shrink-0" />
                  <p className="text-text text-sm">{selectedTodo.text}</p>
                </div>
              </div>
            )}

            {/* Folders Content */}
            <div className="p-4">
              {isFoldersLoading ? (
                <FolderSkeleton />
              ) : (
                <div className="space-y-2">
                  {foldersData?.data?.folders?.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => handleFolderSelect(folder)}
                      className="border-border hover:bg-surface-elevated w-full rounded-lg border p-3 text-left transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-4 w-4 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: folder.color }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-text font-medium">{folder.name}</span>
                            <span className="text-text-muted text-xs">
                              ({folder.bookmark_count} items)
                            </span>
                          </div>
                          {folder.description && (
                            <p className="text-text-muted mt-1 line-clamp-1 text-xs">
                              {folder.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}

                  {/* Create New Folder Button */}
                  <button
                    onClick={() => setShowCreateFolder(true)}
                    className="border-border hover:bg-surface-elevated w-full rounded-lg border border-dashed p-3 text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-warning flex h-4 w-4 items-center justify-center rounded-full">
                        <Plus className="text-background h-3 w-3" />
                      </div>
                      <span className="text-text font-medium">Create New Todo Folder</span>
                    </div>
                  </button>

                  {/* No folders message */}
                  {(!foldersData?.data?.folders || foldersData.data.folders.length === 0) && (
                    <div className="py-8 text-center">
                      <Folder className="text-text-muted mx-auto mb-3 h-12 w-12 opacity-50" />
                      <p className="text-text-muted text-sm">No todo folders yet</p>
                      <p className="text-text-muted text-xs">Create your first one below</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Create Folder Drawer */}
      <Drawer open={showCreateFolder} onOpenChange={handleCreateFolderClose}>
        <DrawerContent>
          <DrawerHeader className="border-border border-b">
            <div className="flex items-center justify-between">
              <DrawerTitle>Create Todo Folder</DrawerTitle>
              <DrawerClose asChild>
                <button className="hover:bg-surface-elevated rounded-full p-1 transition-colors">
                  <X className="text-text-muted h-5 w-5" />
                </button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
            {/* Folder Name */}
            <div>
              <label className="text-text mb-2 block text-sm font-medium">Folder Name *</label>
              <input
                type="text"
                {...register('name')}
                placeholder="My Todo List"
                className={`text-text focus:ring-warning/20 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none ${
                  errors.name
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-border bg-background focus:border-warning'
                }`}
              />
              <div className="mt-1 flex justify-between">
                <div>
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <p className="text-text-muted text-xs">{watchedName?.length || 0}/100</p>
              </div>
            </div>

            {/* Folder Description */}
            <div>
              <label className="text-text mb-2 block text-sm font-medium">
                Description (Optional)
              </label>
              <textarea
                {...register('description')}
                placeholder="Describe what this todo list is for..."
                rows={3}
                className={`text-text focus:ring-warning/20 w-full resize-none rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none ${
                  errors.description
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-border bg-background focus:border-warning'
                }`}
              />
              <div className="mt-1 flex justify-between">
                <div>
                  {errors.description && (
                    <p className="text-xs text-red-500">{errors.description.message}</p>
                  )}
                </div>
                <p className="text-text-muted text-xs">{watchedDescription?.length || 0}/500</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <DrawerClose asChild>
                <button
                  type="button"
                  className="border-border text-text hover:bg-surface-elevated flex-1 rounded-lg border px-4 py-2 transition-colors"
                >
                  Cancel
                </button>
              </DrawerClose>
              <button
                type="submit"
                disabled={!isValid || isCreatingFolder}
                className="bg-warning text-background flex-1 rounded-lg px-4 py-2 font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCreatingFolder ? 'Creating...' : 'Create & Save'}
              </button>
            </div>
          </form>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default TodoList;
