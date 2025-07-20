import { X } from 'lucide-react';

// Error display component
const ErrorDisplay = ({ error, onRetry }: { error: any; onRetry: () => void }) => (
  <div className="p-8 text-center">
    <div className="bg-error/10 border-error/20 text-error mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border">
      <X size={24} />
    </div>
    <p className="text-text-secondary mb-2">
      {error?.response?.data?.message || 'Something went wrong'}
    </p>
    <button
      onClick={onRetry}
      className="bg-primary text-background hover:bg-primary/90 rounded-full px-4 py-2 text-sm font-medium transition-colors"
    >
      Try Again
    </button>
  </div>
);

export default ErrorDisplay;
