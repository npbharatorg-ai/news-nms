import React, { useState, useEffect } from 'react';
import apiServerClient from '@/lib/apiServerClient.js';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const LiveScoresSection = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchScores = async () => {
    try {
      setError(null);
      const response = await apiServerClient.fetch('/cricket-scores');
      if (!response.ok) {
        throw new Error('Failed to fetch cricket scores');
      }
      const data = await response.json();
      setScores(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching cricket scores:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();

    // Auto-refresh every 30 seconds
    const intervalId = setInterval(() => {
      fetchScores();
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Live Cricket Scores</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Live Cricket Scores</h2>
        </div>
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-medium mb-4">Failed to load cricket scores</p>
          <Button onClick={fetchScores} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  if (scores.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-6">
          <Trophy className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Live Cricket Scores</h2>
        </div>
        <div className="bg-muted/50 rounded-xl p-8 text-center text-muted-foreground">
          No live matches at the moment
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--live-indicator))] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[hsl(var(--live-indicator))]"></span>
          </div>
          <h2 className="text-2xl font-bold">Live Cricket Scores</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchScores} className="h-8 w-8">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scores.map((match, index) => {
          const isLive = match.status?.toLowerCase().includes('live') || match.status?.toLowerCase().includes('inprogress');
          const isCompleted = match.status?.toLowerCase().includes('complete');
          
          return (
            <motion.div
              key={match.id || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4" style={{ borderLeftColor: isLive ? 'hsl(var(--live-indicator))' : 'hsl(var(--border))' }}>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-sm line-clamp-2 flex-1 pr-2">
                      {match.match_name || 'Cricket Match'}
                    </h3>
                    {isLive && (
                      <Badge className="bg-[hsl(var(--live-indicator))] text-[hsl(var(--live-indicator-foreground))] border-transparent live-pulse shrink-0">
                        🔴 LIVE
                      </Badge>
                    )}
                    {isCompleted && (
                      <Badge variant="secondary" className="shrink-0">
                        Completed
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium text-base">{match.team1 || 'Team 1'}</span>
                      <span className="font-bold text-xl tabular-nums">
                        {match.team1_runs !== null && match.team1_runs !== undefined ? (
                          <>
                            {match.team1_runs}
                            {match.team1_wickets !== null && match.team1_wickets !== undefined && `/${match.team1_wickets}`}
                          </>
                        ) : '-'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium text-base">{match.team2 || 'Team 2'}</span>
                      <span className="font-bold text-xl tabular-nums">
                        {match.team2_runs !== null && match.team2_runs !== undefined ? (
                          <>
                            {match.team2_runs}
                            {match.team2_wickets !== null && match.team2_wickets !== undefined && `/${match.team2_wickets}`}
                          </>
                        ) : '-'}
                      </span>
                    </div>
                  </div>

                  {match.winner && (
                    <div className="mt-4 pt-3 border-t">
                      <p className="text-sm font-medium text-primary">
                        🏆 Winner: {match.winner}
                      </p>
                    </div>
                  )}

                  {match.status && !isLive && !isCompleted && (
                    <div className="mt-4 pt-3 border-t">
                      <p className="text-xs text-muted-foreground">
                        Status: {match.status}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default LiveScoresSection;