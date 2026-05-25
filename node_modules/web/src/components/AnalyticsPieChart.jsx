import React from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

const AnalyticsPieChart = ({ data, dataKey = 'value', nameKey = 'name', title, loading = false, colors = [] }) => {
  if (loading) {
    return (
      <div className="w-full bg-card border rounded-2xl p-6 shadow-sm">
        <Skeleton className="h-6 w-48 mb-6" />
        <div className="flex justify-center items-center h-[300px]">
          <Skeleton className="h-48 w-48 rounded-full" />
        </div>
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

  const defaultColors = [
    'hsl(var(--chart-primary))',
    'hsl(var(--chart-success))',
    'hsl(var(--chart-warning))',
    'hsl(var(--chart-danger))',
    'hsl(var(--chart-info))',
    'hsl(var(--chart-purple))'
  ];

  const pieColors = colors.length > 0 ? colors : defaultColors;

  return (
    <div className="w-full bg-card border rounded-2xl p-6 shadow-sm">
      {title && <h3 className="text-lg font-bold mb-2 text-foreground">{title}</h3>}
      <div className="chart-container-inner flex justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              dataKey={dataKey}
              nameKey={nameKey}
              animationDuration={1000}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} stroke="transparent" />
              ))}
            </Pie>
            <RechartsTooltip
              contentStyle={{ 
                backgroundColor: 'hsl(var(--popover))', 
                borderColor: 'hsl(var(--border))', 
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              itemStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsPieChart;