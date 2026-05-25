import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

const AnalyticsBarChart = ({ data, dataKey = 'value', xAxisKey = 'name', title, loading = false, colors = [] }) => {
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
        <p className="text-muted-foreground font-medium">No data available.</p>
      </div>
    );
  }

  const defaultColor = 'hsl(var(--chart-primary))';

  return (
    <div className="w-full bg-card border rounded-2xl p-6 shadow-sm">
      {title && <h3 className="text-lg font-bold mb-6 text-foreground">{title}</h3>}
      <div className="chart-container-inner">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={32}>
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
              dx={-10}
            />
            <RechartsTooltip
              cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))', 
                borderColor: 'hsl(var(--border))', 
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
            />
            <Bar dataKey={dataKey} radius={[4, 4, 0, 0]} animationDuration={1000}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length] || defaultColor} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsBarChart;