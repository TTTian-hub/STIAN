import { Loader2 } from 'lucide-react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export function Loading({
  size = 'md',
  text = '加载中...',
  className = '',
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} text-primary animate-spin`} />
      {text && <span className="text-muted-foreground text-sm">{text}</span>}
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
}

export function LoadingOverlay({
  isLoading,
  children,
  text = '加载中...',
}: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 rounded-2xl flex items-center justify-center z-10">
          <Loading text={text} />
        </div>
      )}
    </div>
  );
}

// Skeleton grid for feature cards
export function FeatureSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-muted border border-border rounded-2xl p-6 h-48 animate-pulse"
        >
          <div className="w-12 h-12 bg-border rounded-xl mb-4" />
          <div className="h-6 bg-border rounded w-1/2 mb-3" />
          <div className="h-4 bg-border rounded w-3/4" />
        </div>
      ))}
    </div>
  );
}
