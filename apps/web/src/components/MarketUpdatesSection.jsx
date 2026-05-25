import React, { useState, useEffect } from 'react';
import apiServerClient from '@/lib/apiServerClient.js';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, LineChart, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const MarketUpdatesSection = () => {
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMarketData = async () => {
    try {
      setError(null);
      const response = await apiServerClient.fetch('/market-updates');
      if (!response.ok) {
        throw new Error('Failed to fetch market data');
      }
      const data = await response.json();
      setMarketData(data);
    } catch (err) {
      console.error('Error fetching market updates:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();

    // Auto-refresh every 1 minute
    const intervalId = setInterval(() => {
      fetchMarketData();
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-6">
          <LineChart className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Market Updates</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-6">
          <LineChart className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Market Updates</h2>
        </div>
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-medium mb-4">Failed to load market data</p>
          <Button onClick={fetchMarketData} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!marketData) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-6">
          <LineChart className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Market Updates</h2>
        </div>
        <div className="bg-muted/50 rounded-xl p-8 text-center text-muted-foreground">
          No market data available
        </div>
      </div>
    );
  }

  const markets = [
    { name: 'Gold', symbol: 'XAU', data: marketData.gold, unit: '₹/10g' },
    { name: 'Silver', symbol: 'XAG', data: marketData.silver, unit: '₹/kg' },
    { name: 'TCS Stock', symbol: 'TCS.BSE', data: marketData.stock, unit: '₹' }
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <LineChart className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Market Updates</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchMarketData} className="h-8 w-8">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {markets.map((market, index) => {
          if (!market.data) return null;
          
          const isPositive = market.data.change >= 0;
          
          return (
            <motion.div
              key={market.symbol}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{market.name}</h3>
                      <p className="text-xs text-muted-foreground font-medium">{market.symbol}</p>
                    </div>
                    <div className={`p-2 rounded-lg ${isPositive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                      {isPositive ? (
                        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="text-3xl font-extrabold tabular-nums tracking-tight">
                      {market.data.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{market.unit}</div>
                  </div>
                  
                  <div className="flex items-center gap-3 pt-3 border-t">
                    <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      <span>{isPositive ? '+' : ''}{market.data.change?.toFixed(2)}</span>
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      <span>({isPositive ? '+' : ''}{market.data.percentage?.toFixed(2)}%)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default MarketUpdatesSection;