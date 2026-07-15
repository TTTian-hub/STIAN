import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showHome?: boolean;
}

export function ErrorDisplay({
  title = '出错了',
  message,
  onRetry,
  showHome = true,
}: ErrorDisplayProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground mb-6">{message}</p>
        <div className="flex items-center justify-center gap-3">
          {onRetry && (
            <Button
              onClick={onRetry}
              className="bg-primary hover:bg-primary/90"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              重试
            </Button>
          )}
          {showHome && (
            <Link href="/">
              <Button variant="outline" className="border-border hover:bg-secondary">
                <Home className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// Form validation error
interface FormErrorProps {
  message: string;
}

export function FormError({ message }: FormErrorProps) {
  return (
    <div className="flex items-center gap-2 text-destructive text-sm mt-1">
      <AlertCircle className="w-4 h-4" />
      <span>{message}</span>
    </div>
  );
}
