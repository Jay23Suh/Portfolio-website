import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

/** A link styled as a button, in the site's navy. */
export const Button: React.FC<{ to: string; children: React.ReactNode; variant?: 'solid' | 'outline' }> = ({
  to,
  children,
  variant = 'solid',
}) => (
  <Link
    to={to}
    className={cn(
      'inline-flex items-center rounded-lg px-4 py-2 font-beezee text-base transition-colors',
      variant === 'solid' ? 'bg-navy text-white hover:bg-navyDark' : 'border border-navy text-navy hover:bg-muted'
    )}
  >
    {children}
  </Link>
);
