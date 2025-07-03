import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { CommentOut } from '@/api/schemas';

interface DrawerState {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'reply';
  editingComment?: CommentOut;
  replyingTo?: CommentOut;
}

interface ActionMenuState {
  isOpen: boolean;
  comment?: CommentOut;
}

interface UIState {
  collapsedComments: Set<number>;
  highlightedLine: number | null;
  expandedLongComments: Set<number>;
}

interface CommentsUIStore {
  // UI state
  drawerState: DrawerState;
  actionMenuState: ActionMenuState;
  uiState: UIState;

  // Drawer actions
  openCreateDrawer: () => void;
  openReplyDrawer: (comment: CommentOut) => void;
  openEditDrawer: (comment: CommentOut) => void;
  closeDrawer: () => void;

  // Action menu actions
  openActionMenu: (comment: CommentOut) => void;
  closeActionMenu: () => void;

  // UI state actions
  toggleCollapse: (commentId: number) => void;
  toggleReadMore: (commentId: number) => void;
  setHighlightedLine: (commentId: number | null) => void;
  getHighlightedLine: () => number | null;
  isCollapsed: (commentId: number) => boolean;
  isExpanded: (commentId: number) => boolean;
  isHighlighted: (commentId: number) => boolean;

  // Initialize collapsed state from comments data
  initializeCollapsedState: (comments: CommentOut[]) => void;

  // Reset store
  reset: () => void;
}

const initialState = {
  drawerState: {
    isOpen: false,
    mode: 'create' as const,
    editingComment: undefined,
    replyingTo: undefined,
    profileType: undefined,
  },
  actionMenuState: {
    isOpen: false,
    comment: undefined,
  },
  uiState: {
    collapsedComments: new Set<number>(),
    highlightedLine: null,
    expandedLongComments: new Set<number>(),
  },
};

export const useCommentsUIStore = create<CommentsUIStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Initialize collapsed state from comment data
      initializeCollapsedState: (comments: CommentOut[]) => {
        const collectCollapsedComments = (comments: CommentOut[]): Set<number> => {
          const collapsed = new Set<number>();

          const processComment = (comment: CommentOut) => {
            // If comment has default_collapsed flag set to true, add it to collapsed set
            if (comment.default_collapsed) {
              collapsed.add(comment.id);
            }

            // Recursively process replies
            if (comment.replies && comment.replies.length > 0) {
              comment.replies.forEach(processComment);
            }
          };

          comments.forEach(processComment);
          return collapsed;
        };

        const collapsedComments = collectCollapsedComments(comments);

        set({
          uiState: {
            ...get().uiState,
            collapsedComments,
          },
        });
      },

      // Drawer Actions
      openCreateDrawer: () => {
        set({
          drawerState: {
            isOpen: true,
            mode: 'create',
            editingComment: undefined,
            replyingTo: undefined,
          },
        });
      },

      openReplyDrawer: (comment: CommentOut) => {
        set({
          drawerState: {
            isOpen: true,
            mode: 'reply',
            editingComment: undefined,
            replyingTo: comment,
          },
        });
      },

      openEditDrawer: (comment: CommentOut) => {
        set({
          drawerState: {
            isOpen: true,
            mode: 'edit',
            editingComment: comment,
            replyingTo: undefined,
          },
        });
      },

      closeDrawer: () => {
        set({
          drawerState: {
            isOpen: false,
            mode: 'create',
            editingComment: undefined,
            replyingTo: undefined,
          },
        });
      },

      // Action Menu Actions
      openActionMenu: (comment: CommentOut) => {
        set({
          actionMenuState: {
            isOpen: true,
            comment,
          },
        });
      },

      closeActionMenu: () => {
        set({
          actionMenuState: {
            isOpen: false,
            comment: undefined,
          },
        });
      },

      // UI State Actions
      toggleCollapse: (commentId: number) => {
        const { uiState } = get();
        const newCollapsed = new Set(uiState.collapsedComments);
        if (newCollapsed.has(commentId)) {
          newCollapsed.delete(commentId);
        } else {
          newCollapsed.add(commentId);
        }
        set({
          uiState: {
            ...uiState,
            collapsedComments: newCollapsed,
          },
        });
      },

      toggleReadMore: (commentId: number) => {
        const { uiState } = get();
        const newExpanded = new Set(uiState.expandedLongComments);
        if (newExpanded.has(commentId)) {
          newExpanded.delete(commentId);
        } else {
          newExpanded.add(commentId);
        }
        set({
          uiState: {
            ...uiState,
            expandedLongComments: newExpanded,
          },
        });
      },

      setHighlightedLine: (commentId: number | null) => {
        const { uiState } = get();
        set({
          uiState: {
            ...uiState,
            highlightedLine: uiState.highlightedLine === commentId ? null : commentId,
          },
        });
      },

      getHighlightedLine: () => {
        return get().uiState.highlightedLine;
      },

      // UI State Getters
      isCollapsed: (commentId: number) => {
        return get().uiState.collapsedComments.has(commentId);
      },

      isExpanded: (commentId: number) => {
        return get().uiState.expandedLongComments.has(commentId);
      },

      isHighlighted: (commentId: number) => {
        return get().uiState.highlightedLine === commentId;
      },

      // Reset store
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'comments-ui-store',
    }
  )
);
