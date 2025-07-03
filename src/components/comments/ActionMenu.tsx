import React from 'react';

import { Copy, Edit, Flag, Trash2, UserX } from 'lucide-react';

import { useKeyopollsCommentsApiDeleteComment } from '@/api/comments/comments';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { toast } from '@/components/ui/toast';
import { useCommentsUIStore } from '@/stores/useCommentsUIStore';
import { useProfileStore } from '@/stores/useProfileStore';

interface ActionMenuProps {
  onCommentDeleted?: (commentId: number) => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ onCommentDeleted }) => {
  const { actionMenuState, closeActionMenu, openEditDrawer } = useCommentsUIStore();
  const { accessToken } = useProfileStore();

  // Build auth headers
  const getAuthHeaders = () => {
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return headers;
  };

  // Delete comment mutation
  const deleteComment = useKeyopollsCommentsApiDeleteComment({
    request: { headers: getAuthHeaders() },
    mutation: {
      onSuccess: (data) => {
        if (onCommentDeleted) {
          onCommentDeleted(data.data.comment_id);
        }
        toast.success('Comment deleted successfully');
        closeActionMenu();
      },
      onError: (error) => {
        toast.error(`${error.response?.data?.message || 'Failed to delete comment'}`);
        closeActionMenu();
      },
    },
  });

  if (!actionMenuState.comment) return null;

  const userIsAuthor = actionMenuState.comment.is_author;

  const handleEdit = () => {
    closeActionMenu();
    openEditDrawer(actionMenuState.comment!);
  };

  const handleDelete = () => {
    // Show confirmation toast with action
    toast('Are you sure you want to delete this comment?', {
      title: 'Confirm Delete',
      duration: 0,
      action: {
        label: 'Delete',
        onClick: () => {
          deleteComment.mutate({ commentId: actionMenuState.comment!.id });
        },
      },
      cancel: {
        label: 'Cancel',
        onClick: () => {
          console.log('Delete cancelled');
        },
      },
    });
    closeActionMenu();
  };

  const handleCopyLink = () => {
    // Create a link to the comment thread
    const url = `${window.location.origin}${window.location.pathname}?view=thread&commentId=${actionMenuState.comment!.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
    closeActionMenu();
  };

  const handleReport = () => {
    // TODO: Implement report functionality
    toast.info('Report functionality coming soon');
    closeActionMenu();
  };

  const handleMute = () => {
    // TODO: Implement mute functionality
    toast.info('Mute functionality coming soon');
    closeActionMenu();
  };

  return (
    <Drawer open={actionMenuState.isOpen} onOpenChange={(open) => !open && closeActionMenu()}>
      <DrawerContent className="bg-background border-surface h-auto max-h-[40vh] rounded-t-xl">
        <DrawerHeader className="border-border border-b px-4 py-3">
          <DrawerTitle className="text-muted-foreground text-sm font-medium">Actions</DrawerTitle>
        </DrawerHeader>

        <div className="space-y-1 py-2">
          {userIsAuthor && (
            <>
              <button
                className="text-foreground hover:bg-surface-elevated flex w-full items-center px-4 py-3 text-left transition-colors"
                onClick={handleEdit}
              >
                <Edit className="text-muted-foreground mr-3 h-5 w-5" />
                <span>Edit</span>
              </button>

              <button
                className="text-destructive hover:bg-surface-elevated flex w-full items-center px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleDelete}
                disabled={deleteComment.isPending}
              >
                <Trash2 className="mr-3 h-5 w-5" />
                <span>{deleteComment.isPending ? 'Deleting...' : 'Delete'}</span>
              </button>
            </>
          )}

          <button
            className="text-foreground hover:bg-surface-elevated flex w-full items-center px-4 py-3 text-left transition-colors"
            onClick={handleCopyLink}
          >
            <Copy className="text-muted-foreground mr-3 h-5 w-5" />
            <span>Copy Link</span>
          </button>

          {!userIsAuthor && (
            <>
              <button
                className="text-foreground hover:bg-surface-elevated flex w-full items-center px-4 py-3 text-left transition-colors"
                onClick={handleReport}
              >
                <Flag className="text-muted-foreground mr-3 h-5 w-5" />
                <span>Report Comment</span>
              </button>

              <button
                className="text-foreground hover:bg-surface-elevated flex w-full items-center px-4 py-3 text-left transition-colors"
                onClick={handleMute}
              >
                <UserX className="text-muted-foreground mr-3 h-5 w-5" />
                <span>Mute User</span>
              </button>
            </>
          )}
        </div>

        <div className="border-surface border-t pt-3 pb-3">
          <button
            onClick={closeActionMenu}
            className="text-primary hover:bg-surface-elevated flex w-full items-center justify-center rounded-md px-4 py-3 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ActionMenu;
