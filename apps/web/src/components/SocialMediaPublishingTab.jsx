import React, { useState, useEffect, useCallback } from 'react';
import apiServerClient from '@/lib/apiServerClient.js';
import pb from '@/lib/pocketbaseClient.js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader2, RefreshCw, Facebook, Instagram, Twitter, Send, MessageCircle, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';

const PLATFORMS = ['facebook', 'instagram', 'x', 'telegram', 'whatsapp'];

const PlatformIcon = ({ platform }) => {
  switch (platform) {
    case 'facebook': return <Facebook className="w-4 h-4 text-[#1877F2]" />;
    case 'instagram': return <Instagram className="w-4 h-4 text-[#E4405F]" />;
    case 'x': return <Twitter className="w-4 h-4 text-slate-900 dark:text-white" />;
    case 'telegram': return <Send className="w-4 h-4 text-[#0088cc]" />;
    case 'whatsapp': return <MessageCircle className="w-4 h-4 text-[#25D366]" />;
    default: return null;
  }
};

const StatusIndicator = ({ log, onRetry }) => {
  if (!log) return <span className="text-muted-foreground text-xs">-</span>;

  if (log.status === 'success') {
    return <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" />;
  }
  
  if (log.status === 'pending') {
    return <Clock className="w-5 h-5 text-amber-500 mx-auto animate-pulse" />;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center gap-1 cursor-help">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-[10px] text-primary" 
              onClick={(e) => { e.stopPropagation(); onRetry(log.id || log.log_id); }}
            >
              Retry
            </Button>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs bg-destructive text-destructive-foreground font-medium p-3">
          <p className="text-sm">{log.error_message || 'Publishing failed'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const SocialMediaPublishingTab = () => {
  const [logsByPost, setLogsByPost] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [titles, setTitles] = useState({});

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiServerClient.fetch('/social-media/logs?limit=500');
      const data = await response.json();
      
      const grouped = {};
      const postIds = new Set();
      
      if (data.logs && Array.isArray(data.logs)) {
        data.logs.forEach(log => {
          postIds.add(log.post_id);
          if (!grouped[log.post_id]) {
            grouped[log.post_id] = { post_id: log.post_id, logs: {}, last_updated: log.updated || log.created_at };
          }
          grouped[log.post_id].logs[log.platform] = log;
          
          if (new Date(log.updated || log.created_at) > new Date(grouped[log.post_id].last_updated)) {
            grouped[log.post_id].last_updated = log.updated || log.created_at;
          }
        });
      }

      // Fetch titles
      const uniqueIds = Array.from(postIds);
      const titleMap = {};
      
      if (uniqueIds.length > 0) {
        // Batch requests if too many
        const filter = uniqueIds.map(id => `id="${id}"`).join(' || ');
        try {
          const newsRes = await pb.collection('news').getFullList({ filter, $autoCancel: false });
          newsRes.forEach(n => { titleMap[n.id] = n.title || n.headline; });
        } catch (e) {
          console.error("Could not map all titles:", e);
        }
      }
      
      setTitles(titleMap);
      setLogsByPost(Object.values(grouped).sort((a, b) => new Date(b.last_updated) - new Date(a.last_updated)));
    } catch (err) {
      console.error('Error fetching social media logs:', err);
      toast.error('Failed to load publishing logs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleRetry = async (logId) => {
    if (!logId) return;
    setActionLoading(true);
    try {
      await apiServerClient.fetch('/social-media/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ log_id: logId })
      });
      toast.success('Retry initiated. Status updated to pending.');
      fetchLogs();
    } catch (error) {
      console.error('Retry failed:', error);
      toast.error('Failed to initiate retry');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkRetry = async () => {
    setActionLoading(true);
    try {
      // Find all failed logs
      const failedLogIds = [];
      logsByPost.forEach(postGroup => {
        Object.values(postGroup.logs).forEach(log => {
          if (log.status === 'failed') failedLogIds.push(log.id || log.log_id);
        });
      });

      if (failedLogIds.length === 0) {
        toast.info('No failed posts to retry.');
        setActionLoading(false);
        return;
      }

      toast.info(`Initiating retry for ${failedLogIds.length} failed posts...`);
      
      await Promise.all(
        failedLogIds.map(id => 
          apiServerClient.fetch('/social-media/retry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ log_id: id })
          }).catch(e => console.error(`Bulk retry failed for ${id}:`, e))
        )
      );

      toast.success('Bulk retry initiated successfully.');
      fetchLogs();
    } catch (error) {
      console.error('Bulk retry error:', error);
      toast.error('Error during bulk retry');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium">Loading sync logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg border">
        <div>
          <h3 className="font-semibold text-foreground">Publishing Overview</h3>
          <p className="text-sm text-muted-foreground">Monitor automated publishing to external platforms</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleBulkRetry} disabled={actionLoading} className="gap-2 bg-white">
            <RefreshCw className="w-4 h-4" /> Bulk Retry Failed
          </Button>
          <Button onClick={fetchLogs} disabled={actionLoading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${actionLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Post Title</TableHead>
              {PLATFORMS.map(p => (
                <TableHead key={p} className="text-center font-semibold">
                  <div className="flex items-center justify-center gap-2 capitalize">
                    <PlatformIcon platform={p} />
                    <span className="hidden md:inline">{p}</span>
                  </div>
                </TableHead>
              ))}
              <TableHead className="text-right font-semibold">Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logsByPost.length === 0 ? (
              <TableRow>
                <TableCell colSpan={PLATFORMS.length + 2} className="text-center py-12 text-muted-foreground">
                  No social media publishing logs found.
                </TableCell>
              </TableRow>
            ) : (
              logsByPost.map((postGroup) => (
                <TableRow key={postGroup.post_id} className="hover:bg-muted/30">
                  <TableCell className="font-medium max-w-[250px] truncate" title={titles[postGroup.post_id] || postGroup.post_id}>
                    {titles[postGroup.post_id] || <span className="text-muted-foreground font-mono text-xs">{postGroup.post_id}</span>}
                  </TableCell>
                  
                  {PLATFORMS.map(p => (
                    <TableCell key={p} className="text-center">
                      <StatusIndicator log={postGroup.logs[p]} onRetry={handleRetry} />
                    </TableCell>
                  ))}
                  
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {new Date(postGroup.last_updated).toLocaleString('en-IN', { 
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default SocialMediaPublishingTab;