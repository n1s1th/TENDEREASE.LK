'use client';

import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  kpiColor?: string;
  onClick?: () => void;
  className?: string;
}

export default function KPICard({
  title,
  value,
  change,
  isPositive,
  kpiColor,
  onClick,
  className,
}: KPICardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden cursor-pointer transition-all duration-200',
        'bg-surface border border-border rounded-[12px] p-5',
        'hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5',
        'after:content-[""] after:absolute after:top-0 after:left-0 after:right-0 after:h-[3px]',
        'after:bg-[var(--kpi-color)] after:origin-left after:transition-transform after:duration-200 after:scale-x-0',
        'hover:after:scale-x-100',
        className
      )}
      style={{ '--kpi-color': kpiColor } as React.CSSProperties}
      onClick={onClick}
    >
      {/* Label */}
      <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-text-muted mb-2">
        {title}
      </p>
      
      {/* Value */}
      <h2 className="text-[40px] font-bold text-text-primary leading-none mb-3">
        {value}
      </h2>
      
      {/* Bottom Section - Change indicator left, View details right */}
      <div className="flex items-center justify-between">
        {/* Change Indicator */}
        <div className="flex items-center gap-[3px]">
          {isPositive ? (
            <TrendingUp className="h-3 w-3 text-success" />
          ) : (
            <TrendingDown className="h-3 w-3 text-danger" />
          )}
          <span
            className={cn(
              'text-[12px] font-semibold',
              isPositive ? 'text-success' : 'text-danger'
            )}
          >
            {change}
          </span>
        </div>

        {/* View Details - Bottom Right */}
        <button
          className="text-[11px] text-primary font-semibold flex items-center gap-[3px] hover:underline transition-all"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          View details <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}