import React from 'react';
import { Zap } from 'lucide-react';

const BreakingNewsTicker = () => {
  const breakingNews = [
    { id: 1, headline: 'Major policy announcement expected in parliament session today', time: '2 min ago' },
    { id: 2, headline: 'State government launches new infrastructure development project', time: '15 min ago' },
    { id: 3, headline: 'District administration implements new digital services portal', time: '32 min ago' },
    { id: 4, headline: 'Economic reforms show positive impact on local businesses', time: '1 hour ago' },
  ];

  const allNews = [...breakingNews, ...breakingNews];

  return (
    <div className="bg-primary text-primary-foreground py-2 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-background text-foreground px-4 py-1.5 rounded-lg font-bold text-sm whitespace-nowrap">
            <Zap className="w-4 h-4 fill-current" />
            <span>BREAKING</span>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <div className="flex gap-8 ticker-scroll">
              {allNews.map((news, index) => (
                <div key={`${news.id}-${index}`} className="flex items-center gap-3 whitespace-nowrap">
                  <span className="font-medium">{news.headline}</span>
                  <span className="text-primary-foreground/70 text-sm">• {news.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakingNewsTicker;