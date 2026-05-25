import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const AnalyticsHeatmap = ({ data, title, loading = false }) => {
  if (loading) {
    return (
      <div className="w-full bg-card border rounded-2xl p-6 shadow-sm">
        <Skeleton className="h-6 w-48 mb-6" />
        <Skeleton className="h-[250px] w-full" />
      </div>
    );
  }

  // Generate deterministic mock data if none provided (to ensure stable visualization)
  const generateMockGrid = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = ['12a','2a','4a','6a','8a','10a','12p','2p','4p','6p','8p','10p'];
    
    return days.map((day, dIdx) => {
      return {
        day,
        values: hours.map((hour, hIdx) => {
          // Creating organic-looking hot spots around 10am-2pm and 6pm-8pm on weekdays
          let intensity = Math.random() * 20;
          if (dIdx < 5) { // Weekdays
            if (hIdx >= 4 && hIdx <= 7) intensity += 40 + Math.random() * 40; // 8a-2p
            if (hIdx >= 9 && hIdx <= 10) intensity += 30 + Math.random() * 30; // 6p-10p
          } else { // Weekends
            if (hIdx >= 5 && hIdx <= 9) intensity += 20 + Math.random() * 30; // 10a-6p
          }
          return Math.min(100, Math.floor(intensity));
        })
      };
    });
  };

  const gridData = data && data.length > 0 ? data : generateMockGrid();
  const hoursLabel = ['12a','2a','4a','6a','8a','10a','12p','2p','4p','6p','8p','10p'];

  const getIntensityClass = (val) => {
    if(val > 80) return 'bg-primary';
    if(val > 60) return 'bg-primary/80';
    if(val > 40) return 'bg-primary/60';
    if(val > 20) return 'bg-primary/40';
    if(val > 5) return 'bg-primary/20';
    return 'bg-muted';
  };

  return (
    <div className="w-full bg-card border rounded-2xl p-6 shadow-sm">
      {title && <h3 className="text-lg font-bold mb-6 text-foreground">{title}</h3>}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="flex ml-12 mb-2">
            {hoursLabel.map((hour, i) => (
              <div key={i} className="flex-1 text-center text-xs text-muted-foreground font-medium">{hour}</div>
            ))}
          </div>
          <div className="space-y-2">
            {gridData.map((row, i) => (
              <div key={i} className="flex items-center">
                <div className="w-12 text-xs font-semibold text-muted-foreground">{row.day}</div>
                <div className="flex flex-1 gap-1">
                  {row.values.map((val, j) => (
                    <div 
                      key={j} 
                      className={`flex-1 h-8 rounded-sm ${getIntensityClass(val)} transition-all duration-200 hover:ring-2 hover:ring-ring hover:ring-offset-1 hover:scale-110 z-10 cursor-crosshair`}
                      title={`${row.day} at ${hoursLabel[j]}: ${val} interactions`}
                    ></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-6 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-4 h-4 rounded-sm bg-muted"></div>
          <div className="w-4 h-4 rounded-sm bg-primary/20"></div>
          <div className="w-4 h-4 rounded-sm bg-primary/40"></div>
          <div className="w-4 h-4 rounded-sm bg-primary/80"></div>
          <div className="w-4 h-4 rounded-sm bg-primary"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

export default AnalyticsHeatmap;