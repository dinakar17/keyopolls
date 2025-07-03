'use client';

import React from 'react';

import { AlertTriangle, CheckCircle, Info, Loader2, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export type ConfirmationVariant = 'default' | 'destructive' | 'warning' | 'success' | 'info';

/*
<DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        itemName="post"
        title="Delete Post?"
        description={
          <div className="space-y-3">
            <p>Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="rounded-lg border-l-4 border-gray-300 bg-gray-50 p-3">
              <p className="text-sm text-gray-700 italic">"{getPostPreview()}"</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                <span>by {post.author_info.display_name}</span>
                <span>•</span>
                <span>{formatDate(post.created_at)}</span>
              </div>
            </div>
          </div>
        }
      />
*/

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmationVariant;
  isLoading?: boolean;
  showIcon?: boolean;
  customIcon?: React.ReactNode;
  children?: React.ReactNode; // For custom content
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  isLoading = false,
  showIcon = true,
  customIcon,
  children,
  disabled = false,
  size = 'md',
}) => {
  // Get icon based on variant
  const getIcon = () => {
    if (customIcon) return customIcon;
    if (!showIcon) return null;

    const iconProps = { size: 24 };

    switch (variant) {
      case 'destructive':
        return <AlertTriangle {...iconProps} className="text-red-500" />;
      case 'warning':
        return <AlertTriangle {...iconProps} className="text-yellow-500" />;
      case 'success':
        return <CheckCircle {...iconProps} className="text-green-500" />;
      case 'info':
        return <Info {...iconProps} className="text-blue-500" />;
      default:
        return <XCircle {...iconProps} className="text-gray-500" />;
    }
  };

  // Get button styling based on variant
  const getConfirmButtonProps = () => {
    const baseProps = {
      disabled: disabled || isLoading,
      onClick: onConfirm,
    };

    switch (variant) {
      case 'destructive':
        return {
          ...baseProps,
          variant: 'destructive' as const,
          className: 'bg-red-600 hover:bg-red-700 text-white',
        };
      case 'warning':
        return {
          ...baseProps,
          variant: 'default' as const,
          className: 'bg-yellow-600 hover:bg-yellow-700 text-white',
        };
      case 'success':
        return {
          ...baseProps,
          variant: 'default' as const,
          className: 'bg-green-600 hover:bg-green-700 text-white',
        };
      case 'info':
        return {
          ...baseProps,
          variant: 'default' as const,
          className: 'bg-blue-600 hover:bg-blue-700 text-white',
        };
      default:
        return {
          ...baseProps,
          variant: 'default' as const,
          className: '',
        };
    }
  };

  // Get dialog size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'max-w-sm';
      case 'lg':
        return 'max-w-lg';
      default:
        return 'max-w-md';
    }
  };

  // Handle confirm with async support
  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error('Confirmation action failed:', error);
      // Don't close modal on error - let parent handle it
    }
  };

  const confirmButtonProps = getConfirmButtonProps();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${getSizeClasses()} gap-6`}>
        <DialogHeader className="text-left">
          <div className="flex items-start gap-4">
            {getIcon() && <div className="mt-1 flex-shrink-0">{getIcon()}</div>}
            <div className="flex-1 space-y-2">
              <DialogTitle className="text-lg leading-tight font-semibold">{title}</DialogTitle>
              {description && (
                <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
                  {description}
                </DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Custom content area */}
        {children && <div className="space-y-4">{children}</div>}

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {cancelText}
          </Button>
          <Button
            {...confirmButtonProps}
            onClick={handleConfirm}
            className={`w-full sm:w-auto ${confirmButtonProps.className || ''}`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;

// Convenience components for common use cases
export const DeleteConfirmationModal: React.FC<
  Omit<ConfirmationModalProps, 'variant' | 'confirmText' | 'title'> & {
    itemName?: string;
    title?: string;
  }
> = ({ itemName = 'item', title, ...props }) => (
  <ConfirmationModal
    {...props}
    variant="destructive"
    title={title || `Delete ${itemName}?`}
    confirmText="Delete"
    description={
      props.description || (
        <p>Are you sure you want to delete this {itemName}? This action cannot be undone.</p>
      )
    }
  />
);

export const WarningModal: React.FC<Omit<ConfirmationModalProps, 'variant'>> = (props) => (
  <ConfirmationModal {...props} variant="warning" />
);

export const InfoModal: React.FC<Omit<ConfirmationModalProps, 'variant'>> = (props) => (
  <ConfirmationModal {...props} variant="info" />
);

export const SuccessModal: React.FC<Omit<ConfirmationModalProps, 'variant'>> = (props) => (
  <ConfirmationModal {...props} variant="success" />
);
