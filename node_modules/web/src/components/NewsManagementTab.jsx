import React, { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, RefreshCw, Eye, Edit2, Trash2, CheckCircle, XCircle, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';

const NewsManagementTab = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [authorFilter, setAuthorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  
  const [selectedIds, setSelectedIds] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, perPage: 50, totalItems: 0 });

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [selectedReporter, setSelectedReporter] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionInput, setShowRejectionInput] = useState(false);

  const fetchNews = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: pagination.perPage,
        page: page
      });
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (authorFilter.trim()) {
        params.append('author', authorFilter.trim());
      }
      
      const res = await apiServerClient.fetch(`/admin/news-management?${params.toString()}`);
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || 'Failed to fetch news');
      }
      
      setData(result.items || []);
      setPagination({
        page: result.page || 1,
        perPage: result.perPage || 50,
        totalItems: result.totalItems || 0
      });
    } catch (err) {
      console.error('Fetch news error:', err);
      toast.error(err.message || 'Failed to load news');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, authorFilter, pagination.perPage]);

  useEffect(() => {
    fetchNews(1);
  }, [statusFilter, authorFilter]);

  const handleRowClick = async (item) => {
    setSelectedNews(item);
    setDetailModalOpen(true);
    setShowRejectionInput(false);
    setRejectionReason('');
    
    // Fetch reporter details
    if (item.reporter_id) {
      try {
        const reporterRecord = await pb.collection('reporter_registrations').getOne(item.reporter_id, { $autoCancel: false });
        setSelectedReporter(reporterRecord);
      } catch (err) {
        console.error('Failed to fetch reporter:', err);
        setSelectedReporter(null);
      }
    } else {
      setSelectedReporter(null);
    }
  };

  const handleApprove = async () => {
    if (!selectedNews) return;
    
    setActionLoading(true);
    try {
      const res = await apiServerClient.fetch(`/admin/news/${selectedNews.id}/publish`, {
        method: 'POST'
      });
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || 'Approval failed');
      }
      
      toast.success('News approved and published successfully');
      setDetailModalOpen(false);
      fetchNews(pagination.page);
    } catch (err) {
      console.error('Approve error:', err);
      toast.error(err.message || 'Failed to approve news');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedNews) return;
    
    if (!showRejectionInput) {
      setShowRejectionInput(true);
      return;
    }
    
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    
    setActionLoading(true);
    try {
      // Update news status to rejected with admin comments
      await pb.collection('reporter_news').update(selectedNews.id, {
        status: 'rejected',
        admin_comments: rejectionReason
      }, { $autoCancel: false });
      
      toast.success('News rejected successfully');
      setDetailModalOpen(false);
      setShowRejectionInput(false);
      setRejectionReason('');
      fetchNews(pagination.page);
    } catch (err) {
      console.error('Reject error:', err);
      toast.error(err.message || 'Failed to reject news');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async (id) => {
    setActionLoading(true);
    try {
      const res = await apiServerClient.fetch(`/admin/news/${id}/publish`, {
        method: 'POST'
      });
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || 'Publish failed');
      }
      
      toast.success('News published successfully');
      fetchNews(pagination.page);
    } catch (err) {
      console.error('Publish error:', err);
      toast.error(err.message || 'Failed to publish news');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnpublish = async (id) => {
    setActionLoading(true);
    try {
      const res = await apiServerClient.fetch(`/admin/news/${id}/unpublish`, {
        method: 'POST'
      });
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || 'Unpublish failed');
      }
      
      toast.success('News unpublished successfully');
      fetchNews(pagination.page);
    } catch (err) {
      console.error('Unpublish error:', err);
      toast.error(err.message || 'Failed to unpublish news');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this news article?')) return;
    
    setActionLoading(true);
    try {
      const res = await apiServerClient.fetch(`/admin/news/${id}`, {
        method: 'DELETE'
      });
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || 'Delete failed');
      }
      
      toast.success('News deleted successfully');
      fetchNews(pagination.page);
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.message || 'Failed to delete news');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkPublish = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one news article');
      return;
    }
    
    setActionLoading(true);
    try {
      await Promise.all(selectedIds.map(id => 
        apiServerClient.fetch(`/admin/news/${id}/publish`, { method: 'POST' })
      ));
      
      toast.success(`${selectedIds.length} news articles published successfully`);
      setSelectedIds([]);
      fetchNews(pagination.page);
    } catch (err) {
      console.error('Bulk publish error:', err);
      toast.error('Failed to publish some news articles');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkUnpublish = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one news article');
      return;
    }
    
    setActionLoading(true);
    try {
      await Promise.all(selectedIds.map(id => 
        apiServerClient.fetch(`/admin/news/${id}/unpublish`, { method: 'POST' })
      ));
      
      toast.success(`${selectedIds.length} news articles unpublished successfully`);
      setSelectedIds([]);
      fetchNews(pagination.page);
    } catch (err) {
      console.error('Bulk unpublish error:', err);
      toast.error('Failed to unpublish some news articles');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one news article');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} news articles?`)) return;
    
    setActionLoading(true);
    try {
      await Promise.all(selectedIds.map(id => 
        apiServerClient.fetch(`/admin/news/${id}`, { method: 'DELETE' })
      ));
      
      toast.success(`${selectedIds.length} news articles deleted successfully`);
      setSelectedIds([]);
      fetchNews(pagination.page);
    } catch (err) {
      console.error('Bulk delete error:', err);
      toast.error('Failed to delete some news articles');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map(item => item.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > Math.ceil(pagination.totalItems / pagination.perPage)) return;
    fetchNews(newPage);
  };

  const totalPages = Math.ceil(pagination.totalItems / pagination.perPage);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Published</SelectItem>
              <SelectItem value="pending_approval">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          
          <Input 
            placeholder="Filter by author..." 
            value={authorFilter}
            onChange={(e) => setAuthorFilter(e.target.value)}
            className="w-[200px] bg-background text-foreground"
          />
          
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button variant="outline" onClick={() => fetchNews(pagination.page)} disabled={loading} className="gap-2 bg-background text-foreground">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex gap-2 p-4 bg-muted rounded-lg border">
          <span className="text-sm font-medium text-muted-foreground mr-2">
            {selectedIds.length} selected
          </span>
          <Button size="sm" variant="outline" onClick={handleBulkPublish} disabled={actionLoading} className="gap-1">
            <CheckCircle className="w-3 h-3" /> Publish
          </Button>
          <Button size="sm" variant="outline" onClick={handleBulkUnpublish} disabled={actionLoading} className="gap-1">
            <XCircle className="w-3 h-3" /> Unpublish
          </Button>
          <Button size="sm" variant="destructive" onClick={handleBulkDelete} disabled={actionLoading} className="gap-1">
            <Trash2 className="w-3 h-3" /> Delete
          </Button>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={selectedIds.length === data.length && data.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="font-semibold text-foreground">Title</TableHead>
              <TableHead className="font-semibold text-foreground">Author</TableHead>
              <TableHead className="font-semibold text-foreground">Status</TableHead>
              <TableHead className="font-semibold text-foreground">Created Date</TableHead>
              <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <FileText className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  No news articles found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow 
                  key={item.id} 
                  className="hover:bg-muted/30 cursor-pointer"
                  onClick={(e) => {
                    if (e.target.closest('button') || e.target.closest('[role="checkbox"]')) return;
                    handleRowClick(item);
                  }}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox 
                      checked={selectedIds.includes(item.id)}
                      onCheckedChange={() => toggleSelect(item.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-foreground max-w-[300px] truncate" title={item.title}>
                    {item.title}
                  </TableCell>
                  <TableCell className="text-foreground">{item.reporter_name}</TableCell>
                  <TableCell>
                    <Badge variant={
                      item.status === 'approved' ? 'default' : 
                      item.status === 'rejected' ? 'destructive' : 
                      'secondary'
                    } className={item.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}>
                      {item.status === 'approved' ? 'Published' : 
                       item.status === 'pending_approval' ? 'Pending' : 
                       item.status === 'rejected' ? 'Rejected' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" 
                        onClick={() => handleRowClick(item)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {item.status !== 'approved' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-green-600 hover:text-green-700 hover:bg-green-50" 
                          onClick={() => handlePublish(item.id)}
                          disabled={actionLoading}
                          title="Publish"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      {item.status === 'approved' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50" 
                          onClick={() => handleUnpublish(item.id)}
                          disabled={actionLoading}
                          title="Unpublish"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10" 
                        onClick={() => handleDelete(item.id)}
                        disabled={actionLoading}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {pagination.page} of {totalPages} ({pagination.totalItems} total)
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1 || loading}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages || loading}
              className="gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">News Details</DialogTitle>
          </DialogHeader>
          
          {selectedNews && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-2">{selectedNews.title}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <Badge variant={
                    selectedNews.status === 'approved' ? 'default' : 
                    selectedNews.status === 'rejected' ? 'destructive' : 
                    'secondary'
                  } className={selectedNews.status === 'approved' ? 'bg-green-600' : ''}>
                    {selectedNews.status === 'approved' ? 'Published' : 
                     selectedNews.status === 'pending_approval' ? 'Pending' : 
                     selectedNews.status === 'rejected' ? 'Rejected' : 'Draft'}
                  </Badge>
                  <span>{selectedNews.category}</span>
                  <span>{new Date(selectedNews.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {selectedNews.image && (
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={pb.files.getUrl(selectedNews, selectedNews.image)} 
                    alt={selectedNews.title}
                    className="w-full max-h-96 object-cover"
                  />
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Content</h4>
                <div className="prose max-w-none text-foreground/90">
                  {selectedNews.content.split('\n').map((para, idx) => (
                    para.trim() ? <p key={idx} className="mb-2">{para}</p> : <br key={idx} />
                  ))}
                </div>
              </div>

              {selectedReporter && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Reporter Information</h4>
                  <div className="flex items-center gap-4">
                    {selectedReporter.photo && (
                      <img 
                        src={pb.files.getUrl(selectedReporter, selectedReporter.photo)} 
                        alt={selectedReporter.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium text-lg">{selectedReporter.name}</p>
                      {selectedReporter.designation && (
                        <p className="text-sm text-muted-foreground">{selectedReporter.designation}</p>
                      )}
                      {selectedReporter.email && (
                        <p className="text-sm text-muted-foreground">{selectedReporter.email}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {showRejectionInput && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Rejection Reason</h4>
                  <Textarea 
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    className="min-h-[100px]"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
              Close
            </Button>
            {selectedNews?.status !== 'approved' && (
              <Button 
                onClick={handleApprove} 
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700 gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Approve & Publish
              </Button>
            )}
            {selectedNews?.status !== 'rejected' && (
              <Button 
                variant="destructive" 
                onClick={handleReject}
                disabled={actionLoading}
                className="gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                {showRejectionInput ? 'Confirm Rejection' : 'Reject'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NewsManagementTab;