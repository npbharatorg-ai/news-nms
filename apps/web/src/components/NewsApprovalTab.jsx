import React, { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient.js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, CheckCircle, XCircle, Globe, Trash2, AlertCircle, RefreshCw, FileText } from 'lucide-react';
import { toast } from 'sonner';
import NewsDetailModal from '@/components/NewsDetailModal.jsx';
import RejectionReasonModal from '@/components/RejectionReasonModal.jsx';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog.jsx';

const NewsApprovalTab = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('pending');
  
  const [selectedNews, setSelectedNews] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionTargetId, setActionTargetId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let filterStr = `status="${filterStatus}"`;
      if (filterStatus === 'pending') {
        filterStr = `status="pending" || status="pending_approval" || status=""`;
      }

      const records = await pb.collection('reporter_news').getList(1, 100, {
        filter: filterStr,
        sort: '-created_at',
        $autoCancel: false
      });
      setNews(records.items);
    } catch (err) {
      console.error('Failed to fetch reporter news:', err);
      setError('Failed to load news articles.');
      toast.error('Failed to load news articles.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const handleAction = async (action, id, extraData = {}) => {
    setActionLoading(true);
    try {
      let updates = {};
      let successMessage = '';

      switch (action) {
        case 'approve':
          updates = { status: 'approved' };
          successMessage = 'News approved successfully.';
          break;
        case 'publish':
          updates = { status: 'published', published_at: new Date().toISOString() };
          successMessage = 'News published successfully.';
          break;
        case 'reject':
          updates = { status: 'rejected', admin_comments: extraData.reason };
          successMessage = 'News rejected successfully.';
          break;
        case 'delete':
          await pb.collection('reporter_news').delete(id, { $autoCancel: false });
          toast.success('News deleted successfully.');
          setShowDeleteConfirm(false);
          fetchNews();
          return;
        default:
          return;
      }

      await pb.collection('reporter_news').update(id, updates, { $autoCancel: false });
      toast.success(successMessage);
      if (action === 'reject') setShowRejectModal(false);
      fetchNews();
    } catch (err) {
      console.error(`Failed to ${action} news:`, err);
      toast.error(`Failed to ${action} news.`);
    } finally {
      setActionLoading(false);
      setActionTargetId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-500">Approved</Badge>;
      case 'published': return <Badge className="bg-blue-500">Published</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
      case 'pending_approval': return <Badge variant="outline" className="border-amber-500 text-amber-600">Pending</Badge>;
      default: return <Badge variant="secondary">{status || 'Draft'}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs value={filterStatus} onValueChange={setFilterStatus} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-4 w-full sm:w-[400px]">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button variant="outline" onClick={fetchNews} disabled={loading} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
        </div>
      ) : error ? (
        <div className="py-12 flex flex-col items-center justify-center text-destructive bg-destructive/5 rounded-xl border border-destructive/20 border-dashed">
          <AlertCircle className="h-10 w-10 mb-3 opacity-50" />
          <p className="font-medium">{error}</p>
        </div>
      ) : news.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-muted-foreground bg-slate-50 rounded-xl border border-dashed">
          <FileText className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">No {filterStatus} news found.</p>
        </div>
      ) : (
        <div className="rounded-md border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {news.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium max-w-[250px] truncate" title={item.title || item.headline}>
                    {item.title || item.headline || 'Untitled'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{item.category || 'Uncategorized'}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(item.created_at || item.created).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(item.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => { setSelectedNews(item); setShowDetailModal(true); }} 
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {(filterStatus === 'pending' || filterStatus === 'rejected') && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-green-600 hover:text-green-700 hover:bg-green-50" 
                          onClick={() => handleAction('approve', item.id)} 
                          title="Approve"
                          disabled={actionLoading}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}

                      {(filterStatus === 'pending' || filterStatus === 'approved') && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50" 
                          onClick={() => { setActionTargetId(item.id); setShowRejectModal(true); }} 
                          title="Reject"
                          disabled={actionLoading}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}

                      {(filterStatus === 'approved' || filterStatus === 'pending') && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" 
                          onClick={() => handleAction('publish', item.id)} 
                          title="Publish"
                          disabled={actionLoading}
                        >
                          <Globe className="h-4 w-4" />
                        </Button>
                      )}

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10" 
                        onClick={() => { setActionTargetId(item.id); setShowDeleteConfirm(true); }} 
                        title="Delete"
                        disabled={actionLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
        onStatusChange={fetchNews}
      />

      <RejectionReasonModal
        isOpen={showRejectModal}
        onClose={() => { setShowRejectModal(false); setActionTargetId(null); }}
        onSubmit={(reason) => handleAction('reject', actionTargetId, { reason })}
        isSubmitting={actionLoading}
      />

      <DeleteConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setActionTargetId(null); }}
        onConfirm={() => handleAction('delete', actionTargetId)}
        loading={actionLoading}
        title="Delete News Article"
        description="Are you sure you want to permanently delete this news article? This action cannot be undone."
      />
    </div>
  );
};

export default NewsApprovalTab;