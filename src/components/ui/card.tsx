import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  variant?: 'default' | 'glass';
}

/**
 * Card container component
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable = false, variant = 'default', className, ...props }, ref) => {
    const variants = {
      default: 'soft-panel',
      glass: 'glass-panel panel-glow',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'motion-pop rounded-[28px] p-6 transition-all duration-300 sm:p-7',
          variants[variant],
          hoverable && 'motion-hover hover:shadow-[var(--shadow-card-hover)]',
          className,
        )}
        {...props}
      />
    );
  },
);

Card.displayName = 'Card';

/**
 * Card header section
 */
export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mb-5 flex items-start justify-between gap-4', className)}
      {...props}
    />
  ),
);

CardHeader.displayName = 'CardHeader';

/**
 * Card title heading
 */
export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-text text-xl font-semibold tracking-tight', className)}
      {...props}
    />
  ),
);

CardTitle.displayName = 'CardTitle';

/**
 * Card content area
 */
export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('', className)} {...props} />,
);

CardContent.displayName = 'CardContent';
