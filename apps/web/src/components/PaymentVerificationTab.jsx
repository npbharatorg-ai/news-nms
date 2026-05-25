import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, RefreshCw, CheckCircle, XCircle, Eye, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';

const PaymentVerificationTab = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [approveTargetId, setApproveTargetId] = useState(null);
  
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const [pagination, setPagination] = useState({ page: 1, perPage: 50, totalItems: 0 });

  const fetchPayments = async (page = 1) => {
    setLoading(true);
    try {
      const res = await apiServerClient.fetch(`/admin/payment-verification?status=pending&limit=50&page=${page}`);
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || 'Failed to fetch payment verifications');
      }
      
      setData(result.items || []);
      setPagination({
        page: result.page || 1,
        perPage: result.perPage || 50,
        totalItems: result.totalItems || 0
      });
    } catch (err) {
      console.error('Fetch payments error:', err);
      toast.error(err.message || 'Failed to load pending payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(1);
  }, []);

  const handleApprove = async () => {
    if (!approveTargetId) return;
    
    setActionLoading(true);
    try {
      const res = await apiServerClient.fetch(`/admin/payment-verification/approve/${approveTargetId}`, {
        method: 'POST'
      });
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || 'Approval failed');
      }
      
      toast.success(`Payment approved successfully. User ID: ${result.userId}`);
      setApproveModalOpen(false);
      setApproveTargetId(null);
      fetchPayments(pagination.page);
    } catch (err) {
      console.error('Approve error:', err);
      toast.error(err.message || 'Failed to approve payment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectTargetId) return;
    
    if (!rejectionReason || rejectionReason.trim() === '') {
      toast.error('Please provide a rejection reason');
      return;
    }
    
    setActionLoading(true);
    try {
      const res = await apiServerClient.fetch(`/admin/payment-verification/reject/${rejectTargetId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason.trim() })
      });
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || 'Rejection failed');
      }
      
      toast.success('Payment rejected successfully');
      setRejectModalOpen(false);
      setRejectTargetId(null);
      setRejectionReason('');
      fetchPayments(pagination.page);
    } catch (err) {
      console.error('Reject error:', err);
      toast.error(err.message || 'Failed to reject payment');
    } finally {
      setActionLoading(false);
    }
  };

  const viewScreenshot = (url) => {
    if (!url) {
      toast.error('No screenshot available');
      return;
    }
    setSelectedImage(url);
    setIsImageModalOpen(true);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > Math.ceil(pagination.totalItems / pagination.perPage)) return;
    fetchPayments(newPage);
  };

  const totalPages = Math.ceil(pagination.totalItems / pagination.perPage);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing {data.length} of {pagination.totalItems} pending payments
        </div>
        <Button variant="outline" onClick={() => fetchPayments(pagination.page)} disabled={loading} className="gap-2 bg-background text-foreground">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold text-foreground">User Name</TableHead>
              <TableHead className="font-semibold text-foreground">Contact</TableHead>
              <TableHead className="font-semibold text-foreground">Payment Method</TableHead>
              <TableHead className="font-semibold text-foreground">Payment Status</TableHead>
              <TableHead className="font-semibold text-foreground">Transaction ID</TableHead>
              <TableHead className="font-semibold text-foreground">Created Date</TableHead>
              <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  <FileText className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  No pending payments found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  <TableCell className="font-medium text-foreground">{item.user_name}</TableCell>
                  <TableCell>
                    <div className="text-sm text-foreground">{item.phone}</div>
                    <div className="text-xs text-muted-foreground">{item.email}</div>
                  </TableCell>
                  <TableCell className="capitalize text-foreground">
                    <Badge variant={item.payment_method === 'online' ? 'default' : 'secondary'}>
                      {item.payment_method}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.payment_status === 'completed' ? 'default' : 'outline'}>
                      {item.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {item.payment_method === 'offline' ? (
                      <div className="flex items-center gap-2">
                        {item.payment_screenshot && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => viewScreenshot(item.payment_screenshot)} 
                            className="h-7 text-xs"
                          >
                            <Eye className="w-3 h-3 mr-1" /> View
                          </Button>
                        )}
                        <span className="text-xs text-muted-foreground font-mono">
                          {item.transaction_id || 'No Txn ID'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground font-mono">Online Payment</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" 
                        onClick={() => { 
                          setApproveTargetId(item.id); 
                          setApproveModalOpen(true); 
                        }}
                        disabled={actionLoading}
                        title="Approve Payment"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10" 
                        onClick={() => { 
                          setRejectTargetId(item.id); 
                          setRejectModalOpen(true); 
                        }}
                        disabled={actionLoading}
                        title="Reject Payment"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {pagination.page} of {totalPages}
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

      {/* Screenshot Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-3xl bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Payment Screenshot</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center bg-muted/30 rounded-lg p-2 border border-border">
            {selectedImage ? (
              <img src={selectedImage} alt="Payment Proof" className="max-h-[70vh] object-contain rounded" />
            ) : (
              <p className="text-muted-foreground py-8">Image not available</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Approve Confirmation Modal */}
      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent className="max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Approve Payment</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-muted-foreground">
            Are you sure you want to approve this payment? This will generate a User ID and activate the account.
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setApproveModalOpen(false)} 
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApprove} 
              disabled={actionLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {actionLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Approving...</>
              ) : (
                'Confirm Approve'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal with Reason */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Reject Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejecting this payment. This will be sent to the applicant via email.
            </p>
            <div className="space-y-2">
              <Label htmlFor="rejection-reason" className="text-foreground">
                Rejection Reason <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="rejection-reason"
                placeholder="e.g., Payment screenshot is unclear, transaction ID does not match..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px] bg-background text-foreground"
                disabled={actionLoading}
              />
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setRejectModalOpen(false);
                setRejectionReason('');
              }} 
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject} 
              disabled={actionLoading || !rejectionReason.trim()}
            >
              {actionLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Rejecting...</>
              ) : (
                'Confirm Reject'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentVerificationTab;