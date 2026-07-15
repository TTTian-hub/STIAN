'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  href,
}: FeatureCardProps) {
  return (
    <Link href={href} className="group block touch-manipulation">
      <div className="
        relative overflow-hidden
        bg-card rounded-xl border border-border
        p-4 h-full
        cursor-pointer
        transition-all duration-200
        hover:border-primary/30 hover:shadow-md
        hover:-translate-y-0.5
      ">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="
            flex-shrink-0 w-10 h-10 rounded-lg
            bg-secondary flex items-center justify-center
            group-hover:bg-primary/10 transition-colors
          ">
            <Icon className="w-5 h-5 text-primary" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                {title}
              </h3>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <p className="text-muted-foreground text-xs mt-0.5 truncate">
              {description}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

interface FeatureGridProps {
  children: React.ReactNode;
}

export function FeatureGrid({ children }: FeatureGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {children}
    </div>
  );
}
