import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const MetricCard = ({ title, value, prefix = '', suffix = '', trend, trendText = 'vs last period', icon: Icon, loading = false, valueColor = 'text-foreground' }) => {
  if (loading) {
    return (
      <Card className="analytics-card">
        <CardContent className="p-0 space-y-4">
          <div className="flex justify-between items-start">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-4 w-40" />
        </CardContent>
      </Card>
    );
  }

  const isPositive = trend > 0;
  const isNegative = trend < 0;
  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;
  const trendColor = isPositive ? 'text-emerald-600 bg-emerald-50' : isNegative ? 'text-rose-600 bg-rose-50' : 'text-slate-600 bg-slate-50';

  return (
    <Card className="analytics-card group">
      <CardContent className="p-0 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          {Icon && (
            <div className="p-2 rounded-xl bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>
        
        <div>
          <h3 className={`text-3xl font-bold tracking-tight mb-2 ${valueColor}`}>
            {prefix}{value}{suffix}
          </h3>
          
          {trend !== undefined && (
            <div className="flex items-center gap-2 mt-auto">
              <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md ${trendColor}`}>
                <TrendIcon className="w-3 h-3" />
                {Math.abs(trend)}%
              </span>
              <span className="text-xs text-muted-foreground">{trendText}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};