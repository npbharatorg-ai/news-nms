import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Eye, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';

const AdminPaymentVerificationPanel = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    paymentMethod: '',
    approvalStatus: 'pending'
  });
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, [filters]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
      if (filters.approvalStatus) params.append('approvalStatus', filters.approvalStatus);

      const res = await apiServerClient.fetch(`/admin/payment-verification?${params.toString()}`);
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to fetch registrations');
      }

      setRegistrations(result.items || []);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this registration? User ID will be generated.')) return;

    setActionLoading(true);
    try {
      const res = await apiServerClient.fetch(`/admin/payment-verification/approve/${id}`, {
        method: 'POST'
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to approve registration');
      }

      toast.success(`Registration approved! User ID: ${result.userId}`);
      fetchRegistrations();
      setSelectedRegistration(null);
    } catch (err) {
      console.error('Approve error:', err);
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Enter rejection reason (optional):');
    if (reason === null) return;

    setActionLoading(true);
    try {
      const res = await apiServerClient.fetch(`/admin/payment-verification/reject/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason: reason })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to reject registration');
      }

      toast.success('Registration rejected');
      fetchRegistrations();
      setSelectedRegistration(null);
    } catch (err) {
      console.error('Reject error:', err);
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Payment Verification</h2>
        <Button onClick={fetchRegistrations} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Payment Method</label>
            <Select value={filters.paymentMethod} onValueChange={(val) => setFilters(prev => ({ ...prev, paymentMethod: val }))}>
              <SelectTrigger>
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Methods</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Approval Status</label>
            <Select value={filters.approvalStatus} onValueChange={(val) => setFilters(prev => ({ ...prev, approvalStatus: val }))}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Approval Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No registrations found
                  </TableCell>
                </TableRow>
              ) : (
                registrations.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell className="font-medium">{reg.fullName}</TableCell>
                    <TableCell>{reg.phoneNumber}</TableCell>
                    <TableCell>{reg.email}</TableCell>
                    <TableCell>
                      <Badge variant={reg.paymentMethod === 'online' ? 'default' : 'secondary'}>
                        {reg.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={reg.paymentStatus === 'completed' ? 'default' : 'secondary'}>
                        {reg.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          reg.approvalStatus === 'approved' ? 'default' : 
                          reg.approvalStatus === 'rejected' ? 'destructive' : 
                          'secondary'
                        }
                      >
                        {reg.approvalStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setSelectedRegistration(reg)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Registration Details</DialogTitle>
                            </DialogHeader>
                            {selectedRegistration && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">Full Name</p>
                                    <p className="font-medium">{selectedRegistration.fullName}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Phone</p>
                                    <p className="font-medium">{selectedRegistration.phoneNumber}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Email</p>
                                    <p className="font-medium">{selectedRegistration.email}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Date of Birth</p>
                                    <p className="font-medium">{selectedRegistration.dateOfBirth}</p>
                                  </div>
                                </div>
                                <div className="flex gap-2 pt-4">
                                  <Button 
                                    onClick={() => handleApprove(selectedRegistration.id)}
                                    disabled={actionLoading || selectedRegistration.approvalStatus === 'approved'}
                                    className="gap-2"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Approve
                                  </Button>
                                  <Button 
                                    onClick={() => handleReject(selectedRegistration.id)}
                                    disabled={actionLoading || selectedRegistration.approvalStatus === 'rejected'}
                                    variant="destructive"
                                    className="gap-2"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        {reg.approvalStatus === 'pending' && (
                          <>
                            <Button 
                              onClick={() => handleApprove(reg.id)}
                              disabled={actionLoading}
                              size="sm"
                              className="gap-1"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                            <Button 
                              onClick={() => handleReject(reg.id)}
                              disabled={actionLoading}
                              variant="destructive"
                              size="sm"
                              className="gap-1"
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default AdminPaymentVerificationPanel;