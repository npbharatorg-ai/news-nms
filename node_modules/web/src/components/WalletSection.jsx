import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, IndianRupee, Wallet, ArrowUpRight, Clock, CheckCircle2, History } from 'lucide-react';
import { toast } from 'sonner';

const WalletSection = () => {
  const { currentUser } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawData, setWithdrawData] = useState({ amount: '', bank_details: '' });

  const fetchData = async () => {
    if (!currentUser) return;
    setLoading(true);
    
    try {
      // Fetch Wallet Data
      const walletRes = await pb.collection('reporter_wallet').getFullList({
        filter: `reporter_id = "${currentUser.id}"`,
        $autoCancel: false
      });
      
      if (walletRes.length > 0) {
        setWallet(walletRes[0]);
      } else {
        // Fallback placeholder if no wallet record exists yet
        setWallet({ total_earnings: 0, pending_earnings: 0, approved_earnings: 0 });
      }

      // Fetch Withdrawal History
      const withdrawalRes = await pb.collection('withdrawal_requests').getList(1, 10, {
        filter: `reporter_id = "${currentUser.id}"`,
        sort: '-requested_at',
        $autoCancel: false
      });
      
      setWithdrawals(withdrawalRes.items);
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
      toast.error('Failed to load wallet information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const handleWithdrawRequest = async (e) => {
    e.preventDefault();
    
    const amountNum = parseFloat(withdrawData.amount);
    
    if (isNaN(amountNum) || amountNum < 100) {
      toast.error('Minimum withdrawal amount is ₹100');
      return;
    }
    
    if (amountNum > (wallet?.approved_earnings || 0)) {
      toast.error('Amount exceeds available approved earnings');
      return;
    }
    
    if (!withdrawData.bank_details.trim()) {
      toast.error('Bank details are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await pb.collection('withdrawal_requests').create({
        reporter_id: currentUser.id,
        amount: amountNum,
        status: 'pending',
        bank_details: withdrawData.bank_details,
        requested_at: new Date().toISOString()
      }, { $autoCancel: false });
      
      toast.success('Withdrawal request submitted successfully');
      setIsModalOpen(false);
      setWithdrawData({ amount: '', bank_details: '' });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Withdrawal request failed:', error);
      toast.error('Failed to submit withdrawal request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return <Badge className="bg-emerald-500 hover:bg-emerald-600"><CheckCircle2 className="w-3 h-3 mr-1"/> Completed</Badge>;
      case 'approved': return <Badge className="bg-blue-500 hover:bg-blue-600"><CheckCircle2 className="w-3 h-3 mr-1"/> Approved</Badge>;
      case 'pending': return <Badge className="bg-amber-500 hover:bg-amber-600"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-md bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-primary mb-1">Available to Withdraw</p>
                <h3 className="text-3xl font-bold flex items-center text-foreground">
                  <IndianRupee className="w-6 h-6 mr-1" />
                  {(wallet?.approved_earnings || 0).toLocaleString()}
                </h3>
              </div>
              <div className="p-3 bg-primary/20 rounded-xl">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-primary/10">
              <Button 
                onClick={() => setIsModalOpen(true)} 
                className="w-full shadow-sm"
                disabled={(wallet?.approved_earnings || 0) < 100}
              >
                Request Withdrawal <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Earnings</p>
                <h3 className="text-2xl font-bold flex items-center">
                  <IndianRupee className="w-5 h-5 mr-1 text-muted-foreground" />
                  {(wallet?.total_earnings || 0).toLocaleString()}
                </h3>
              </div>
              <div className="p-3 bg-muted rounded-xl">
                <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4 pt-4 border-t">Lifetime earnings from approved news</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-amber-600/80 dark:text-amber-500/80 mb-1">Pending Approval</p>
                <h3 className="text-2xl font-bold flex items-center">
                  <IndianRupee className="w-5 h-5 mr-1 opacity-50" />
                  {(wallet?.pending_earnings || 0).toLocaleString()}
                </h3>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-xl">
                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-500" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4 pt-4 border-t">Earnings awaiting admin approval</p>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            <CardTitle>Withdrawal History</CardTitle>
          </div>
          <CardDescription>Recent payout requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <div className="text-center py-10 bg-muted/30 rounded-lg border border-dashed">
              <Wallet className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No withdrawal requests yet</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Requested Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Processed Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium text-sm">
                        {new Date(request.requested_at || request.created).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span className="font-bold flex items-center">
                          <IndianRupee className="w-3 h-3 mr-0.5" />{request.amount}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(request.status)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {request.processed_at ? new Date(request.processed_at).toLocaleDateString() : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdrawal Request Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleWithdrawRequest}>
            <DialogHeader>
              <DialogTitle>Request Withdrawal</DialogTitle>
              <DialogDescription>
                Transfer earnings directly to your bank account. Minimum amount is ₹100.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="amount">Withdrawal Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="100"
                  max={wallet?.approved_earnings || 0}
                  placeholder="Enter amount"
                  value={withdrawData.amount}
                  onChange={(e) => setWithdrawData({...withdrawData, amount: e.target.value})}
                  disabled={isSubmitting}
                  className="text-lg font-bold font-mono"
                  required
                />
                <p className="text-xs text-muted-foreground text-right">
                  Available: ₹{(wallet?.approved_earnings || 0).toLocaleString()}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bank">Bank Details</Label>
                <Textarea
                  id="bank"
                  placeholder="Account Holder Name&#10;Account Number&#10;IFSC Code&#10;Bank Name"
                  value={withdrawData.bank_details}
                  onChange={(e) => setWithdrawData({...withdrawData, bank_details: e.target.value})}
                  disabled={isSubmitting}
                  className="min-h-[100px] text-sm"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                ) : 'Submit Request'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletSection;