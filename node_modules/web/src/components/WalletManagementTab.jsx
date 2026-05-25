import React, { useState, useEffect, useCallback } from 'react';
import apiServerClient from '@/lib/apiServerClient.js';
import pb from '@/lib/pocketbaseClient.js';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Search, ArrowRightLeft, CreditCard, Wallet, TrendingUp, History } from 'lucide-react';
import { toast } from 'sonner';
import PayoutModal from './PayoutModal.jsx';
import TransactionHistoryModal from './TransactionHistoryModal.jsx';

const WalletManagementTab = () => {
  const [wallets, setWallets] = useState([]);
  const [filteredWallets, setFilteredWallets] = useState([]);
  const [userNames, setUserNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [payoutTarget, setPayoutTarget] = useState(null);
  const [historyTarget, setHistoryTarget] = useState(null);

  const fetchWalletsAndNames = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch wallets
      const res = await apiServerClient.fetch('/wallet/all-users?limit=500');
      const data = await res.json();
      
      const fetchedWallets = data.users || [];
      
      // 2. Map IDs to names
      const userIds = [...new Set(fetchedWallets.map(w => w.user_id))];
      const namesMap = {};
      
      if (userIds.length > 0) {
        const filter = userIds.map(id => `id="${id}"`).join(' || ');
        try {
          const reporters = await pb.collection('reporters').getFullList({ filter, $autoCancel: false });
          reporters.forEach(r => { namesMap[r.id] = r.name; });
        } catch (e) {
          console.error("Error fetching reporter names:", e);
        }
      }
      
      setUserNames(namesMap);
      setWallets(fetchedWallets);
      setFilteredWallets(fetchedWallets);
      
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWalletsAndNames();
  }, [fetchWalletsAndNames]);

  // Search Filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredWallets(wallets);
      return;
    }
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = wallets.filter(w => {
      const name = userNames[w.user_id] || '';
      return name.toLowerCase().includes(lowerSearch) || w.user_id.toLowerCase().includes(lowerSearch);
    });
    setFilteredWallets(filtered);
  }, [searchTerm, wallets, userNames]);

  // Totals
  const totalBalance = wallets.reduce((sum, w) => sum + (w.current_balance || 0), 0);
  const totalEarned = wallets.reduce((sum, w) => sum + (w.total_earned || 0), 0);
  const totalPaidOut = wallets.reduce((sum, w) => sum + (w.total_paid_out || 0), 0);

  if (loading && wallets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-medium">Loading wallet data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl p-6 border shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Pending Balance</p>
            <p className="text-2xl font-bold text-foreground">₹{totalBalance}</p>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 border shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Rewards Earned</p>
            <p className="text-2xl font-bold text-foreground">₹{totalEarned}</p>
          </div>
        </div>
        <div className="bg-card rounded-xl p-6 border shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
            <ArrowRightLeft className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Paid Out</p>
            <p className="text-2xl font-bold text-foreground">₹{totalPaidOut}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-muted/30 p-4 rounded-lg border">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by reporter name or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background text-foreground"
          />
        </div>
        <Button onClick={fetchWalletsAndNames} variant="outline" className="bg-background">
          Refresh Data
        </Button>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Reporter Name</TableHead>
              <TableHead className="text-right font-semibold">Current Balance (₹)</TableHead>
              <TableHead className="text-right font-semibold">Total Earned (₹)</TableHead>
              <TableHead className="text-right font-semibold">Total Paid Out (₹)</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredWallets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  No wallet records found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredWallets.map((wallet) => (
                <TableRow key={wallet.user_id} className="hover:bg-muted/30">
                  <TableCell className="font-medium">
                    <div className="text-foreground">{userNames[wallet.user_id] || 'Unknown User'}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">{wallet.user_id}</div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-emerald-600">
                    ₹{wallet.current_balance || 0}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    ₹{wallet.total_earned || 0}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    ₹{wallet.total_paid_out || 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 gap-2 bg-background hover:bg-muted"
                        onClick={() => setHistoryTarget({ id: wallet.user_id, name: userNames[wallet.user_id] })}
                      >
                        <History className="w-3 h-3" /> History
                      </Button>
                      <Button 
                        size="sm" 
                        className="h-8 gap-2"
                        onClick={() => setPayoutTarget({
                          user_id: wallet.user_id, 
                          name: userNames[wallet.user_id], 
                          current_balance: wallet.current_balance || 0
                        })}
                        disabled={!wallet.current_balance || wallet.current_balance <= 0}
                      >
                        <CreditCard className="w-3 h-3" /> Payout
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modals */}
      <PayoutModal 
        isOpen={!!payoutTarget} 
        onClose={() => setPayoutTarget(null)} 
        user={payoutTarget}
        onSuccess={fetchWalletsAndNames}
      />
      
      <TransactionHistoryModal
        isOpen={!!historyTarget}
        onClose={() => setHistoryTarget(null)}
        userId={historyTarget?.id}
        userName={historyTarget?.name}
      />
    </div>
  );
};

export default WalletManagementTab;