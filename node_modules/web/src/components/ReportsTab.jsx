import React, { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Trash2, AlertCircle, RefreshCw, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog.jsx';
import NewsDetailModal from '@/components/NewsDetailModal.jsx';

const ReportsTab = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('pending');
  
  const [selectedNews, setSelectedNews] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  const [actionTarget, setActionTarget] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const records = await pb.collection('news_reports').getList(1, 100, {
        filter: `status="${filterStatus}"`,
        sort: '-created',
        expand: 'news_id',
        $autoCancel: false
      });
      
      const groupedReports = {};
      
      records.items.forEach(report => {
        const newsId = report.news_id;
        if (!groupedReports[newsId]) {
          groupedReports[newsId] = {
            newsId: newsId,
            newsData: report.expand?.news_id || { title: 'Deleted/Unknown News', id: newsId },
            reports: [],
            reportCount: 0,
            primaryReason: report.reason,
            latestReportId: report.id
          };
        }
        groupedReports[newsId].reports.push(report);
        groupedReports[newsId].reportCount += 1;
      });

      setReports(Object.values(groupedReports));
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setError('Failed to load reports.');
      toast.error('Failed to load reports.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleViewNews = async (newsId) => {
    try {
      const newsItem = await pb.collection('reporter_news').getOne(newsId, { $autoCancel: false });
      setSelectedNews(newsItem);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Failed to fetch news details:', err);
      toast.error('News article may have been deleted or is unavailable.');
    }
  };

  const executeAction = async () => {
    if (!actionTarget) return;
    
    setActionLoading(true);
    try {
      if (actionTarget.type === 'dismiss') {
        const reportsToUpdate = reports.find(r => r.newsId === actionTarget.newsId)?.reports || [];
        await Promise.all(
          reportsToUpdate.map(report => 
            pb.collection('news_reports').update(report.id, { status: 'dismissed' }, { $autoCancel: false })
          )
        );
        toast.success('Reports dismissed successfully.');
      } else if (actionTarget.type === 'delete') {
        try {
          await pb.collection('reporter_news').delete(actionTarget.newsId, { $autoCancel: false });
        } catch (e) {
          console.warn('News might already be deleted:', e);
        }
        
        const reportsToUpdate = reports.find(r => r.newsId === actionTarget.newsId)?.reports || [];
        await Promise.all(
          reportsToUpdate.map(report => 
            pb.collection('news_reports').update(report.id, { status: 'dismissed' }, { $autoCancel: false })
          )
        );
        toast.success('News article deleted and reports dismissed.');
      }
      
      setShowConfirmDialog(false);
      fetchReports();
    } catch (err) {
      console.error(`Failed to execute ${actionTarget.type}:`, err);
      toast.error(`Failed to complete action. Please try again.`);
    } finally {
      setActionLoading(false);
      setActionTarget(null);
    }
  };

  const getReasonBadge = (reason) => {
    switch (reason) {
      case 'Spam': return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Spam</Badge>;
      case 'Offensive': return <Badge variant="destructive">Offensive</Badge>;
      case 'Misinformation': return <Badge variant="destructive" className="bg-red-600">Misinformation</Badge>;
      default: return <Badge variant="outline">{reason || 'Other'}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-2 w-full sm:w-[300px]">
            <TabsTrigger value="pending">Pending Review</TabsTrigger>
            <TabsTrigger value="dismissed">Dismissed</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button variant="outline" onClick={fetchReports} disabled={loading} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
        </div>
      ) : error ? (
        <div className="py-12 flex flex-col items-center justify-center text-destructive bg-destructive/5 rounded-xl border border-destructive/20 border-dashed">
          <AlertCircle className="h-10 w-10 mb-3 opacity-50" />
          <p className="font-medium">{error}</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-muted-foreground bg-slate-50 rounded-xl border border-dashed">
          <ShieldAlert className="h-12 w-12 mb-4 opacity-30" />
          <p className="text-lg font-medium">No {filterStatus} reports found.</p>
          <p className="text-sm mt-1">All clear! No news articles have been reported.</p>
        </div>
      ) : (
        <div className="rounded-md border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Reported News</TableHead>
                <TableHead className="font-semibold">Primary Reason</TableHead>
                <TableHead className="font-semibold text-center">Total Reports</TableHead>
                <TableHead className="font-semibold">Latest Report</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((group) => (
                <TableRow key={group.newsId} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium max-w-[300px]">
                    <div className="truncate" title={group.newsData.title || group.newsData.headline}>
                      {group.newsData.title || group.newsData.headline || 'Untitled News'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 truncate">
                      ID: {group.newsId}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getReasonBadge(group.primaryReason)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="font-bold text-sm px-2 py-0.5">
                      {group.reportCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(group.reports[0].created).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewNews(group.newsId)} 
                        className="gap-1.5"
                      >
                        <Eye className="h-3.5 w-3.5" /> View News
                      </Button>
                      
                      {filterStatus === 'pending' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-green-200 text-green-700 hover:bg-green-50 gap-1.5" 
                            onClick={() => { 
                              setActionTarget({ type: 'dismiss', newsId: group.newsId }); 
                              setShowConfirmDialog(true); 
                            }}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Dismiss
                          </Button>
                          
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="gap-1.5" 
                            onClick={() => { 
                              setActionTarget({ type: 'delete', newsId: group.newsId }); 
                              setShowConfirmDialog(true); 
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete News
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <NewsDetailModal 
        isOpen={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedNews(null); }}
        newsItem={selectedNews}
        onStatusChange={fetchReports}
      />

      <DeleteConfirmationDialog
        isOpen={showConfirmDialog}
        onClose={() => { setShowConfirmDialog(false); setActionTarget(null); }}
        onConfirm={executeAction}
        loading={actionLoading}
        title={actionTarget?.type === 'delete' ? "Delete News Article" : "Dismiss Reports"}
        description={
          actionTarget?.type === 'delete' 
            ? "Are you sure you want to permanently delete this news article? This will also dismiss all associated reports. This action cannot be undone."
            : "Are you sure you want to dismiss all reports for this news article? The article will remain published."
        }
      />
    </div>
  );
};

export default ReportsTab;