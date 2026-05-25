import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';

const PayoutModal = ({ isOpen, onClose, user, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setAmount(user.current_balance.toString());
    }
  }, [user, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payoutAmount = parseFloat(amount);

    if (isNaN(payoutAmount) || payoutAmount <= 0) {
      toast.error('Please enter a valid amount greater than 0.');
      return;
    }

    if (payoutAmount > user.current_balance) {
      toast.error('Payout amount cannot exceed current balance.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiServerClient.fetch('/wallet/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.user_id,
          amount: payoutAmount
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to process payout');
      }

      toast.success(`Payout of ₹${payoutAmount} completed successfully`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Payout error:', error);
      toast.error(error.message || 'Failed to process payout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Process Payout</DialogTitle>
          <DialogDescription>
            Record a manual payout for this reporter. This will deduct from their current balance.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Reporter:</span>
                <span className="font-semibold text-foreground">{user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">Available Balance:</span>
                <span className="font-bold text-emerald-600">₹{user.current_balance}</span>
              </div>
            </div>

            {user.current_balance <= 0 && (
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-md text-sm border border-amber-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                This reporter has no available balance to withdraw.
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-foreground">Payout Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={user.current_balance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading || user.current_balance <= 0}
                className="text-lg bg-background text-foreground"
                placeholder="0.00"
                required
              />
              <p className="text-xs text-muted-foreground">
                Enter the amount to deduct from the reporter's wallet.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || user.current_balance <= 0 || !amount}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Confirm Payout
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PayoutModal;