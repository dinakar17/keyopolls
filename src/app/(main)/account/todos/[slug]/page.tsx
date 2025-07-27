'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  Filter,
  Search,
  Square,
  X,
} from 'lucide-react';

import { BookmarkedTodoItemSchema } from '@/api/schemas';
import {
  useKeyopollsCommonApiTodoListTodos,
  useKeyopollsCommonApiTodoUpdateTodoItem,
} from '@/api/todos/todos';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import toast from '@/components/ui/toast';
import { useProfileStore } from '@/stores/useProfileStore';

interface FilterState {
  completed: boolean | null;
  overdue: boolean | null;
  search: string;
  ordering: string;
}

const TodoListPage: React.FC = () => {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const { accessToken } = useProfileStore();

  // State management
  const [filters, setFilters] = useState<FilterState>({
    completed: null,
    overdue: null,
    search: '',
    ordering: '-created_at',
  });

  const [allTodos, setAllTodos] = useState<BookmarkedTodoItemSchema[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingTodo, setEditingTodo] = useState<BookmarkedTodoItemSchema | null>(null);
  const [editDueDate, setEditDueDate] = useState('');

  // API calls
  const { data, isLoading, error, refetch } = useKeyopollsCommonApiTodoListTodos(
    slug,
    {
      page: currentPage,
      page_size: 20,
      ...(filters.completed !== null && { completed: filters.completed }),
      ...(filters.overdue !== null && { overdue: filters.overdue }),
      ...(filters.search && { search: filters.search }),
      ordering: filters.ordering,
    },
    {
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );

  const { mutate: updateTodo, isPending: isUpdatingTodo } = useKeyopollsCommonApiTodoUpdateTodoItem(
    {
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      mutation: {
        onSuccess: (response, variables) => {
          // Update local state
          setAllTodos((prev) =>
            prev.map((todo) => (todo.id === variables.todoId ? response.data : todo))
          );

          if (variables.data.todo_completed !== undefined) {
            toast.success(
              variables.data.todo_completed
                ? 'Todo marked as completed!'
                : 'Todo marked as incomplete'
            );
          } else {
            toast.success('Todo updated successfully!');
          }

          setEditingTodo(null);
          setEditDueDate('');
        },
        onError: (error) => {
          toast.error('Failed to update todo');
          console.error('Update todo error:', error);
        },
      },
    }
  );

  // Handle data updates
  useEffect(() => {
    if (data?.data) {
      if (currentPage === 1) {
        setAllTodos(data.data.todos);
      } else {
        setAllTodos((prev) => [...prev, ...data.data.todos]);
      }

      setHasMore(data.data.pagination.has_next);
      setIsLoadingMore(false);
    }
  }, [data, currentPage]);

  // Reset when filters change
  useEffect(() => {
    setCurrentPage(1);
    setAllTodos([]);
    setHasMore(true);
  }, [filters]);

  // Load more function
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading) {
      setIsLoadingMore(true);
      setCurrentPage((prev) => prev + 1);
    }
  }, [isLoadingMore, hasMore, isLoading]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  // Utility functions
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleToggleCompletion = (todo: BookmarkedTodoItemSchema) => {
    if (!data?.data?.folder.is_owner) {
      toast.error('Only the list owner can update todos');
      return;
    }

    updateTodo({
      slug,
      todoId: todo.id,
      data: {
        todo_completed: !todo.todo_completed,
      },
    });
  };

  const handleEditDueDate = (todo: BookmarkedTodoItemSchema) => {
    setEditingTodo(todo);
    setEditDueDate(
      todo.todo_due_date ? new Date(todo.todo_due_date).toISOString().slice(0, 16) : ''
    );
  };

  const handleSaveDueDate = () => {
    if (!editingTodo) return;

    updateTodo({
      slug,
      todoId: editingTodo.id,
      data: {
        todo_due_date: editDueDate ? new Date(editDueDate).toISOString() : null,
      },
    });
  };

  const isOverdue = (todo: BookmarkedTodoItemSchema) => {
    if (!todo.todo_due_date || todo.todo_completed) return false;
    return new Date(todo.todo_due_date) < new Date();
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays === -1) return 'Due yesterday';
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    if (diffDays <= 7) return `Due in ${diffDays} days`;

    return date.toLocaleDateString();
  };

  // Loading skeleton component
  const TodoSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border-border animate-pulse rounded-lg border p-4">
          <div className="flex items-start gap-3">
            <div className="bg-surface-elevated mt-1 h-5 w-5 rounded"></div>
            <div className="flex-1 space-y-2">
              <div className="bg-surface-elevated h-4 w-3/4 rounded"></div>
              <div className="bg-surface-elevated h-4 w-1/2 rounded"></div>
              <div className="mt-3 flex items-center gap-4">
                <div className="bg-surface-elevated h-3 w-16 rounded"></div>
                <div className="bg-surface-elevated h-3 w-12 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const folder = data?.data?.folder;

  if (isLoading && currentPage === 1) {
    return (
      <div className="bg-background min-h-screen">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <div className="mb-6 animate-pulse">
            <div className="mb-4 flex items-center gap-4">
              <div className="bg-surface-elevated h-10 w-10 rounded-full"></div>
              <div className="flex-1">
                <div className="bg-surface-elevated mb-2 h-6 w-48 rounded"></div>
                <div className="bg-surface-elevated h-4 w-32 rounded"></div>
              </div>
            </div>
            <div className="bg-surface-elevated h-2 w-full rounded"></div>
          </div>
          <TodoSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="text-error mx-auto mb-4 h-12 w-12" />
          <h2 className="text-text mb-2 font-semibold">Failed to load todo list</h2>
          <p className="text-text-muted mb-4 text-sm">
            {error.message || 'An error occurred while loading the todo list'}
          </p>
          <div className="space-x-3">
            <button
              onClick={() => refetch()}
              className="bg-warning text-background rounded-md px-4 py-2 font-medium transition-opacity hover:opacity-90"
            >
              Try Again
            </button>
            <button
              onClick={() => router.back()}
              className="border-border text-text hover:bg-surface-elevated rounded-md border px-4 py-2 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!folder) {
    return null;
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <div className="bg-background border-border sticky top-0 z-40 border-b">
        <div className="mx-auto max-w-2xl px-4 py-4">
          {/* Back Button & Title */}
          <div className="mb-4 flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="hover:bg-surface-elevated rounded-full p-2 transition-colors"
            >
              <ArrowLeft className="text-text-muted h-5 w-5" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center gap-3">
                <div
                  className="h-4 w-4 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: folder.color }}
                />
                <h1 className="text-text truncate text-xl font-bold">{folder.name}</h1>
                {folder.access_level === 'paid' && (
                  <div className="bg-warning flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
                    <span className="text-background text-xs">$</span>
                  </div>
                )}
              </div>

              {folder.description && (
                <p className="text-text-muted text-sm">{folder.description}</p>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-text-secondary">
                {folder.completed_todos} of {folder.total_todos} completed
              </span>
              <span className="text-text font-medium">{folder.completion_percentage}%</span>
            </div>
            <div className="bg-surface-elevated h-2 w-full rounded-full">
              <div
                className="bg-warning h-2 rounded-full transition-all duration-300"
                style={{ width: `${folder.completion_percentage}%` }}
              />
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search todos..."
                className="border-border bg-background text-text placeholder-text-muted focus:border-warning focus:ring-warning/20 w-full rounded-lg border py-2 pr-4 pl-10 text-sm focus:ring-2 focus:outline-none"
              />
              <Search className="text-text-muted absolute top-2.5 left-3 h-4 w-4" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`rounded-lg border px-3 py-2 transition-colors ${
                showFilters
                  ? 'border-warning bg-warning/10 text-warning'
                  : 'border-border text-text-muted hover:bg-surface-elevated'
              }`}
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="border-border bg-surface mt-3 space-y-3 rounded-lg border p-3">
              {/* Status Filter */}
              <div>
                <label className="text-text mb-2 block text-sm font-medium">Status</label>
                <div className="flex gap-2">
                  {[
                    { value: null, label: 'All' },
                    { value: false, label: 'Incomplete' },
                    { value: true, label: 'Completed' },
                  ].map((option) => (
                    <button
                      key={String(option.value)}
                      onClick={() => handleFilterChange('completed', option.value)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        filters.completed === option.value
                          ? 'bg-warning text-background'
                          : 'bg-surface-elevated text-text-muted hover:bg-border'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due Date Filter */}
              <div>
                <label className="text-text mb-2 block text-sm font-medium">Due Date</label>
                <div className="flex gap-2">
                  {[
                    { value: null, label: 'All', color: 'warning' },
                    { value: true, label: 'Overdue', color: 'error' },
                    { value: false, label: 'On Time', color: 'success' },
                  ].map((option) => (
                    <button
                      key={String(option.value)}
                      onClick={() => handleFilterChange('overdue', option.value)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        filters.overdue === option.value
                          ? option.color === 'error'
                            ? 'bg-error text-background'
                            : option.color === 'success'
                              ? 'bg-success text-background'
                              : 'bg-warning text-background'
                          : 'bg-surface-elevated text-text-muted hover:bg-border'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sorting */}
              <div>
                <label className="text-text mb-2 block text-sm font-medium">Sort By</label>
                <select
                  value={filters.ordering}
                  onChange={(e) => handleFilterChange('ordering', e.target.value)}
                  className="border-border bg-background text-text focus:border-warning focus:ring-warning/20 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                >
                  <option value="-created_at">Newest First</option>
                  <option value="created_at">Oldest First</option>
                  <option value="todo_due_date">Due Date (Earliest)</option>
                  <option value="-todo_due_date">Due Date (Latest)</option>
                  <option value="todo_completed">Incomplete First</option>
                  <option value="-todo_completed">Completed First</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-4">
        {/* Todo Items */}
        {allTodos.length > 0 ? (
          <div className="space-y-3">
            {allTodos.map((todo) => (
              <div
                key={todo.id}
                className={`rounded-lg border p-4 transition-colors ${
                  todo.todo_completed
                    ? 'border-success/20 bg-success/5'
                    : isOverdue(todo)
                      ? 'border-error/20 bg-error/5'
                      : 'border-border hover:bg-surface-elevated/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Completion Checkbox */}
                  <button
                    onClick={() => handleToggleCompletion(todo)}
                    disabled={!folder.is_owner || isUpdatingTodo}
                    className={`mt-1 flex-shrink-0 rounded p-1 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      todo.todo_completed
                        ? 'text-success hover:text-success/80'
                        : 'text-text-muted hover:text-warning'
                    }`}
                    title={folder.is_owner ? 'Toggle completion' : 'Only list owner can update'}
                  >
                    {todo.todo_completed ? (
                      <CheckSquare className="h-5 w-5" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                  </button>

                  {/* Todo Content */}
                  <div className="min-w-0 flex-1">
                    {/* Todo Text */}
                    <div className="mb-3">
                      <p
                        className={`text-text leading-relaxed ${
                          todo.todo_completed ? 'line-through opacity-60' : ''
                        }`}
                      >
                        {todo.text}
                      </p>
                    </div>

                    {/* Due Date and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Due Date Display */}
                        {todo.todo_due_date ? (
                          <div
                            className={`flex items-center gap-1 text-xs ${
                              isOverdue(todo) && !todo.todo_completed
                                ? 'text-error font-medium'
                                : todo.todo_completed
                                  ? 'text-text-muted opacity-60'
                                  : 'text-text-secondary'
                            }`}
                          >
                            <Clock className="h-3 w-3" />
                            <span>{formatDueDate(todo.todo_due_date)}</span>
                          </div>
                        ) : (
                          <span className="text-text-muted text-xs">No due date</span>
                        )}

                        {/* Completion Status */}
                        {todo.todo_completed && (
                          <div className="text-success flex items-center gap-1 text-xs">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Completed</span>
                          </div>
                        )}
                      </div>

                      {/* Edit Due Date Button */}
                      {folder.is_owner && (
                        <button
                          onClick={() => handleEditDueDate(todo)}
                          className="text-text-muted hover:bg-warning/10 hover:text-warning rounded p-1.5 transition-colors"
                          title="Edit due date"
                        >
                          <Calendar className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-12 text-center">
            <div className="bg-warning/10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full p-4">
              <CheckSquare className="text-warning h-10 w-10" />
            </div>
            <h3 className="text-text mb-2 font-medium">No todos found</h3>
            <p className="text-text-muted text-sm">
              {filters.search || filters.completed !== null || filters.overdue !== null
                ? 'Try adjusting your filters to see more todos'
                : 'This todo list is empty'}
            </p>
          </div>
        )}

        {/* Load More Loading */}
        {isLoadingMore && (
          <div className="py-8 text-center">
            <div className="border-border border-t-warning mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2"></div>
            <p className="text-text-secondary text-sm">Loading more todos...</p>
          </div>
        )}

        {/* No More Items */}
        {!hasMore && allTodos.length > 0 && (
          <div className="py-8 text-center">
            <p className="text-text-secondary text-sm">You've reached the end! 🎉</p>
          </div>
        )}
      </div>

      {/* Edit Due Date Drawer */}
      <Drawer open={!!editingTodo} onOpenChange={(open) => !open && setEditingTodo(null)}>
        <DrawerContent>
          <DrawerHeader className="border-border border-b">
            <div className="flex items-center justify-between">
              <DrawerTitle>Edit Due Date</DrawerTitle>
              <DrawerClose asChild>
                <button
                  onClick={() => setEditDueDate('')}
                  className="hover:bg-surface-elevated rounded-full p-1 transition-colors"
                >
                  <X className="text-text-muted h-5 w-5" />
                </button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="space-y-4 p-4">
            {/* Todo Text */}
            {editingTodo && (
              <div className="bg-surface-elevated rounded-lg p-3">
                <p className="text-text text-sm">{editingTodo.text}</p>
              </div>
            )}

            {/* Due Date Input */}
            <div>
              <label className="text-text mb-2 block text-sm font-medium">Due Date & Time</label>
              <input
                type="datetime-local"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                className="border-border bg-background text-text focus:border-warning focus:ring-warning/20 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
              />
              <p className="text-text-muted mt-1 text-xs">Leave empty to remove due date</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <DrawerClose asChild>
                <button
                  onClick={() => setEditDueDate('')}
                  className="border-border text-text hover:bg-surface-elevated flex-1 rounded-lg border px-4 py-2 transition-colors"
                >
                  Cancel
                </button>
              </DrawerClose>
              <button
                onClick={handleSaveDueDate}
                disabled={isUpdatingTodo}
                className="bg-warning text-background flex-1 rounded-lg px-4 py-2 font-medium transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUpdatingTodo ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default TodoListPage;
