import React, { useState, useEffect } from 'react';
import apiServerClient from '@/lib/apiServerClient.js';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Cloud, Droplets, Wind, MapPin, RefreshCw, AlertCircle, Sun, CloudRain, CloudSnow, CloudDrizzle, CloudFog } from 'lucide-react';
import { motion } from 'framer-motion';

const getWeatherIcon = (condition) => {
  const cond = condition?.toLowerCase() || '';
  if (cond.includes('rain') || cond.includes('shower')) return <CloudRain className="w-10 h-10 text-blue-500" />;
  if (cond.includes('drizzle')) return <CloudDrizzle className="w-10 h-10 text-blue-400" />;
  if (cond.includes('snow')) return <CloudSnow className="w-10 h-10 text-blue-200" />;
  if (cond.includes('fog') || cond.includes('mist') || cond.includes('haze')) return <CloudFog className="w-10 h-10 text-gray-400" />;
  if (cond.includes('cloud')) return <Cloud className="w-10 h-10 text-gray-500" />;
  if (cond.includes('clear') || cond.includes('sun')) return <Sun className="w-10 h-10 text-yellow-500" />;
  return <Cloud className="w-10 h-10 text-gray-400" />;
};

const WeatherSection = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeather = async () => {
    try {
      setError(null);
      const response = await apiServerClient.fetch('/weather');
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      const data = await response.json();
      setWeatherData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching weather:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();

    // Auto-refresh every 5 minutes
    const intervalId = setInterval(() => {
      fetchWeather();
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-6">
          <Cloud className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Weather Updates</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-6">
          <Cloud className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Weather Updates</h2>
        </div>
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-medium mb-4">Failed to load weather data</p>
          <Button onClick={fetchWeather} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  if (weatherData.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-6">
          <Cloud className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Weather Updates</h2>
        </div>
        <div className="bg-muted/50 rounded-xl p-8 text-center text-muted-foreground">
          No weather data available
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Cloud className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Weather Updates</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchWeather} className="h-8 w-8">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {weatherData.map((weather, index) => (
          <motion.div
            key={weather.city || index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.08, duration: 0.3 }}
          >
            <Card className="overflow-hidden bg-gradient-to-br from-card to-muted/30 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-muted-foreground" /> 
                      {weather.city}
                    </h3>
                    <p className="text-sm text-muted-foreground capitalize mt-1">
                      {weather.condition}
                    </p>
                  </div>
                  {getWeatherIcon(weather.condition)}
                </div>
                
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-5xl font-extrabold tabular-nums tracking-tighter">
                    {Math.round(weather.temperature)}°
                  </span>
                  <span className="text-xl text-muted-foreground mb-1.5">C</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{weather.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Wind className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{Math.round(weather.wind_speed)} km/h</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WeatherSection;