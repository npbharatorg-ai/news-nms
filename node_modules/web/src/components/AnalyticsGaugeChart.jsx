import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

const AnalyticsGaugeChart = ({ value = 0, title, loading = false, suffix = '%' }) => {
  if (loading) {
    return (
      <div className="w-full bg-card border rounded-2xl p-6 shadow-sm flex flex-col items-center">
        <Skeleton className="h-6 w-32 mb-6" />
        <Skeleton className="h-[150px] w-[300px] rounded-t-full" />
      </div>
    );
  }

  const data = [
    { name: 'Value', value: value },
    { name: 'Remainder', value: Math.max(0, 100 - value) }
  ];

  let color = 'hsl(var(--chart-primary))';
  if (value >= 80) color = 'hsl(var(--chart-success))';
  else if (value <= 40) color = 'hsl(var(--chart-danger))';
  else if (value <= 70) color = 'hsl(var(--chart-warning))';

  return (
    <div className="w-full bg-card border rounded-2xl p-6 shadow-sm flex flex-col items-center relative overflow-hidden">
      {title && <h3 className="text-lg font-bold mb-4 text-foreground w-full text-center">{title}</h3>}
      <div className="w-full h-[200px] -mb-12 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="75%"
              startAngle={180}
              endAngle={0}
              innerRadius={80}
              outerRadius={110}
              dataKey="value"
              stroke="none"
              animationDuration={1500}
            >
              <Cell fill={color} />
              <Cell fill="hsl(var(--muted))" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center justify-end pointer-events-none">
          <span className="text-4xl font-extrabold" style={{ color }}>{value}{suffix}</span>
          <span className="text-sm text-muted-foreground font-medium mt-1">Overall Score</span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsGaugeChart;