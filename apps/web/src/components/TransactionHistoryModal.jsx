import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowUpRight, ArrowDownRight, ArrowUpDown } from 'lucide-react';
import { useWalletData } from '@/hooks/useWalletData.js';
import { Button } from '@/components/ui/button';

const TransactionHistoryModal = ({ isOpen, onClose, userId, userName }) => {
  const { transactions, loading, error } = useWalletData(isOpen ? userId : null);
  const [sortOrder, setSortOrder] = useState('desc'); // desc = newest first

  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const sortedTransactions = [...(transactions || [])].sort((a, b) => {
    const dateA = new Date(a.created_at || a.created).getTime();
    const dateB = new Date(b.created_at || b.created).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  const getTransactionDescription = (tx) => {
    const date = new Date(tx.created_at || tx.created).toLocaleDateString();
    if (tx.transaction_type === 'payout') {
      return `Payout of ₹${tx.amount} processed on ${date}`;
    }
    return `You earned ₹${tx.amount} for post approval on ${date}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Transaction History</DialogTitle>
          <DialogDescription>
            Detailed earning and payout history {userName ? `for ${userName}` : 'for your account'}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 mt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading transactions...</p>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-center">
              Failed to load history: {error}
            </div>
          ) : sortedTransactions.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
              <p className="text-muted-foreground font-medium">No transactions found.</p>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead>
                      <Button variant="ghost" onClick={toggleSort} className="h-8 px-2 font-semibold -ml-2">
                        Date <ArrowUpDown className="ml-2 w-3 h-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold text-right">Amount (₹)</TableHead>
                    <TableHead className="font-semibold text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTransactions.map((tx) => {
                    const isCredit = tx.transaction_type === 'post_approved_reward';
                    return (
                      <TableRow key={tx.id || tx.log_id} className="hover:bg-muted/30">
                        <TableCell className="text-sm">
                          {new Date(tx.created_at || tx.created).toLocaleDateString('en-IN', {
                            year: 'numeric', month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell className="text-sm">
                          <span className="font-medium text-foreground">{getTransactionDescription(tx)}</span>
                          {tx.post_id && <div className="text-xs text-muted-foreground mt-0.5">Ref: {tx.post_id}</div>}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`gap-1 ${isCredit ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-blue-600 border-blue-200 bg-blue-50'}`}>
                            {isCredit ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                            {isCredit ? 'Credit' : 'Payout'}
                          </Badge>
                        </TableCell>
                        <TableCell className={`text-right font-bold ${isCredit ? 'text-emerald-600' : 'text-foreground'}`}>
                          {isCredit ? '+' : '-'}₹{tx.amount}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={
                            tx.status === 'completed' ? 'border-emerald-500 text-emerald-600' : 'border-amber-500 text-amber-600'
                          }>
                            {tx.status || 'completed'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionHistoryModal;