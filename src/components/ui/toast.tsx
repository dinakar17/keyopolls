'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { createPortal } from 'react-dom';

// Toast types
type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading' | 'default';
type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

interface ToastData {
  id: string;
  type: ToastType;
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  dismissible?: boolean;
  position?: ToastPosition;
}

interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
  duration?: number;
  dismissible?: boolean;
  richColors?: boolean;
  expand?: boolean;
  gap?: number;
  offset?: string;
}

interface ToastContextType {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, 'id'>) => string;
  removeToast: (id: string) => void;
  dismiss: (id?: string) => void;
  defaultPosition: ToastPosition;
  defaultDuration: number;
  defaultDismissible: boolean;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Global toast manager for use outside React components
class ToastManager {
  private static instance: ToastManager;
  private listeners: Set<(toasts: ToastData[]) => void> = new Set();
  private toasts: ToastData[] = [];
  private defaultPosition: ToastPosition = 'top-right';
  private defaultDuration: number = 4000;
  private defaultDismissible: boolean = true;

  static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  setDefaults(position: ToastPosition, duration: number, dismissible: boolean): void {
    this.defaultPosition = position;
    this.defaultDuration = duration;
    this.defaultDismissible = dismissible;
  }

  addToast(toast: Omit<ToastData, 'id'>): string {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastData = {
      id,
      duration: this.defaultDuration,
      dismissible: this.defaultDismissible,
      position: this.defaultPosition,
      ...toast,
    };

    this.toasts = [...this.toasts, newToast];
    this.notifyListeners();

    // Auto dismiss
    if (newToast.duration && newToast.duration > 0 && newToast.type !== 'loading') {
      setTimeout(() => {
        this.removeToast(id);
      }, newToast.duration);
    }

    return id;
  }

  removeToast(id: string): void {
    const toast = this.toasts.find((t) => t.id === id);
    if (toast?.onDismiss) {
      toast.onDismiss();
    }
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
    this.notifyListeners();
  }

  dismiss(id?: string): void {
    if (id) {
      this.removeToast(id);
    } else {
      this.toasts = [];
      this.notifyListeners();
    }
  }

  getToasts(): ToastData[] {
    return this.toasts;
  }

  getDefaults() {
    return {
      position: this.defaultPosition,
      duration: this.defaultDuration,
      dismissible: this.defaultDismissible,
    };
  }

  subscribe(listener: (toasts: ToastData[]) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.toasts));
  }
}

// Toast Provider Component
export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
  duration = 4000,
  dismissible = true,
  gap = 8,
  offset = '16px',
}) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const manager = ToastManager.getInstance();

  useEffect(() => {
    // Set default values in the manager
    manager.setDefaults(position, duration, dismissible);

    const unsubscribe = manager.subscribe((newToasts) => {
      setToasts(newToasts);
    });

    // Initialize with current toasts
    setToasts(manager.getToasts());

    return unsubscribe;
  }, [manager, position, duration, dismissible]);

  const addToast = useCallback(
    (toast: Omit<ToastData, 'id'>) => {
      return manager.addToast(toast);
    },
    [manager]
  );

  const removeToast = useCallback(
    (id: string) => {
      manager.removeToast(id);
    },
    [manager]
  );

  const dismiss = useCallback(
    (id?: string) => {
      manager.dismiss(id);
    },
    [manager]
  );

  const contextValue: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    dismiss,
    defaultPosition: position,
    defaultDuration: duration,
    defaultDismissible: dismissible,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer gap={gap} offset={offset} />
    </ToastContext.Provider>
  );
};

// Toast Container Component
const ToastContainer: React.FC<{ gap: number; offset: string }> = ({ gap, offset }) => {
  const context = useContext(ToastContext);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !context) return null;

  const { toasts } = context;

  const groupedToasts = toasts.reduce(
    (acc, toast) => {
      const position = toast.position || context.defaultPosition;
      if (!acc[position]) acc[position] = [];
      acc[position].push(toast);
      return acc;
    },
    {} as Record<string, ToastData[]>
  );

  return createPortal(
    <>
      {Object.entries(groupedToasts).map(([position, positionToasts]) => (
        <div
          key={position}
          className={`fixed z-50 flex flex-col ${getPositionClasses(position)}`}
          style={{
            pointerEvents: 'none',
            gap: `${gap}px`,
            padding: offset,
            width: getContainerWidth(position),
            maxWidth: getMaxContainerWidth(position),
          }}
        >
          {positionToasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} />
          ))}
        </div>
      ))}
    </>,
    document.body
  );
};

// Individual Toast Item Component
const ToastItem: React.FC<{ toast: ToastData }> = ({ toast }) => {
  const context = useContext(ToastContext);
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => {
      if (context) {
        context.removeToast(toast.id);
      }
    }, 150);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={18} className="text-success flex-shrink-0" />;
      case 'error':
        return <AlertCircle size={18} className="text-error flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle size={18} className="text-warning flex-shrink-0" />;
      case 'info':
        return <Info size={18} className="text-primary flex-shrink-0" />;
      case 'loading':
        return (
          <div className="border-primary h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-t-transparent" />
        );
      default:
        return null;
    }
  };

  const getToastStyles = () => {
    const baseStyles =
      'rounded-lg border shadow-lg backdrop-blur-sm transition-all duration-200 ease-out';

    switch (toast.type) {
      case 'success':
        return `${baseStyles} bg-background/95 border-success/20 text-text`;
      case 'error':
        return `${baseStyles} bg-background/95 border-error/20 text-text`;
      case 'warning':
        return `${baseStyles} bg-background/95 border-warning/20 text-text`;
      case 'info':
        return `${baseStyles} bg-background/95 border-primary/20 text-text`;
      case 'loading':
        return `${baseStyles} bg-background/95 border-border text-text`;
      default:
        return `${baseStyles} bg-background/95 border-border text-text`;
    }
  };

  const getAnimationDirection = () => {
    const position = toast.position || context?.defaultPosition || 'top-right';

    if (position.includes('right')) {
      return isVisible && !isLeaving
        ? 'translate-x-0 opacity-100 scale-100'
        : 'translate-x-full opacity-0 scale-95';
    } else if (position.includes('left')) {
      return isVisible && !isLeaving
        ? 'translate-x-0 opacity-100 scale-100'
        : '-translate-x-full opacity-0 scale-95';
    } else {
      // center
      return isVisible && !isLeaving
        ? 'translate-y-0 opacity-100 scale-100'
        : position.includes('top')
          ? '-translate-y-full opacity-0 scale-95'
          : 'translate-y-full opacity-0 scale-95';
    }
  };

  const getToastWidth = () => {
    const position = toast.position || context?.defaultPosition || 'top-right';

    if (position.includes('center')) {
      return 'w-full max-w-sm mx-auto'; // Full width with max constraint and center alignment for mobile
    }
    return 'w-full max-w-sm'; // Constrained width for side positions
  };

  return (
    <div
      className={`${getToastWidth()} transform transition-all duration-200 ease-out ${getAnimationDirection()}`}
      style={{ pointerEvents: 'auto' }}
    >
      <div className={getToastStyles()}>
        <div className="flex items-start gap-3 p-4">
          {getIcon()}

          <div className="min-w-0 flex-1">
            {toast.title && <div className="text-text mb-1 text-sm font-medium">{toast.title}</div>}
            {toast.description && (
              <div className="text-text-secondary text-sm leading-relaxed">{toast.description}</div>
            )}
          </div>

          {toast.dismissible && (
            <button
              onClick={handleDismiss}
              className="text-text-muted hover:text-text hover:bg-surface-elevated rounded-md p-1 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {(toast.action || toast.cancel) && (
          <div className="flex justify-end gap-2 px-4 pt-0 pb-4">
            {toast.cancel && (
              <button
                onClick={() => {
                  toast.cancel?.onClick();
                  handleDismiss();
                }}
                className="text-text-secondary hover:text-text hover:bg-surface-elevated rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
              >
                {toast.cancel.label}
              </button>
            )}
            {toast.action && (
              <button
                onClick={() => {
                  toast.action?.onClick();
                  handleDismiss();
                }}
                className="bg-primary text-background rounded-md px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-90"
              >
                {toast.action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Position utility function
const getPositionClasses = (position: string) => {
  switch (position) {
    case 'top-left':
      return 'top-0 left-0';
    case 'top-center':
      return 'top-0 left-0 right-0 flex justify-center';
    case 'top-right':
      return 'top-0 right-0';
    case 'bottom-left':
      return 'bottom-0 left-0';
    case 'bottom-center':
      return 'bottom-0 left-0 right-0 flex justify-center';
    case 'bottom-right':
      return 'bottom-0 right-0';
    default:
      return 'top-0 right-0';
  }
};

// Container width utility function
const getContainerWidth = (position: string) => {
  if (position.includes('center')) {
    return '100%'; // Full width for center containers
  }
  return 'auto'; // Auto width for side positions
};

// Max container width utility function
const getMaxContainerWidth = (position: string) => {
  if (position.includes('center')) {
    return 'none'; // No max width constraint for center containers
  }
  return '384px'; // Fixed max width for side positions (max-w-sm equivalent)
};

// Hook to use toast (only for use within React components)
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Global toast functions that work anywhere
const manager = ToastManager.getInstance();

// Main toast function with Sonner-like API
export const toast = (message: string | React.ReactNode, options?: Partial<ToastData>) => {
  if (typeof message === 'string') {
    return manager.addToast({
      type: 'default',
      description: message,
      ...options,
    });
  }

  return manager.addToast({
    type: 'default',
    ...options,
  });
};

// Toast variants (Sonner-compatible)
toast.success = (message: string, options?: Partial<ToastData>) => {
  return manager.addToast({
    type: 'success',
    description: message,
    ...options,
  });
};

toast.error = (message: string, options?: Partial<ToastData>) => {
  return manager.addToast({
    type: 'error',
    description: message,
    ...options,
  });
};

toast.info = (message: string, options?: Partial<ToastData>) => {
  return manager.addToast({
    type: 'info',
    description: message,
    ...options,
  });
};

toast.warning = (message: string, options?: Partial<ToastData>) => {
  return manager.addToast({
    type: 'warning',
    description: message,
    ...options,
  });
};

toast.loading = (message: string, options?: Partial<ToastData>) => {
  return manager.addToast({
    type: 'loading',
    description: message,
    duration: 0, // Loading toasts don't auto-dismiss
    ...options,
  });
};

toast.promise = async <T,>(
  promise: Promise<T>,
  options: {
    loading?: string;
    success?: string | ((data: T) => string);
    error?: string | ((error: any) => string);
  }
) => {
  const loadingId = manager.addToast({
    type: 'loading',
    description: options.loading || 'Loading...',
    duration: 0,
  });

  try {
    const result = await promise;
    manager.removeToast(loadingId);

    const successMessage =
      typeof options.success === 'function'
        ? options.success(result)
        : options.success || 'Success!';

    manager.addToast({
      type: 'success',
      description: successMessage,
    });

    return result;
  } catch (error) {
    manager.removeToast(loadingId);

    const errorMessage =
      typeof options.error === 'function'
        ? options.error(error)
        : options.error || 'Something went wrong!';

    manager.addToast({
      type: 'error',
      description: errorMessage,
    });

    throw error;
  }
};

toast.dismiss = (id?: string) => {
  manager.dismiss(id);
};

// Additional utility function to get current defaults
toast.getDefaults = () => {
  return manager.getDefaults();
};

export default toast;
