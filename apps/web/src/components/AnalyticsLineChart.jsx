import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

const AnalyticsLineChart = ({ data, dataKey = 'amount', xAxisKey = 'date', title, loading = false, valuePrefix = '' }) => {
  if (loading) {
    return (
      <div className="w-full bg-card border rounded-2xl p-6 shadow-sm">
        <Skeleton className="h-6 w-48 mb-6" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full bg-card border rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center h-[400px]">
        <p className="text-muted-foreground font-medium">No data available for this period.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-card border rounded-2xl p-6 shadow-sm">
      {title && <h3 className="text-lg font-bold mb-6 text-foreground">{title}</h3>}
      <div className="chart-container-inner">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey={xAxisKey} 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              dy={10}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `${valuePrefix}${value}`}
              dx={-10}
            />
            <RechartsTooltip
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))', 
                borderColor: 'hsl(var(--border))', 
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
              labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '0.25rem' }}
              formatter={(value) => [`${valuePrefix}${value}`, 'Value']}
            />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke="hsl(var(--chart-primary))" 
              strokeWidth={3} 
              dot={{ r: 4, fill: 'hsl(var(--background))', strokeWidth: 2, stroke: 'hsl(var(--chart-primary))' }} 
              activeDot={{ r: 6, fill: 'hsl(var(--chart-primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }} 
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsLineChart;