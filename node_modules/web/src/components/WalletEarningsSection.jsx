import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, ArrowRightLeft, History, Loader2 } from 'lucide-react';
import { useWalletData } from '@/hooks/useWalletData.js';
import TransactionHistoryModal from './TransactionHistoryModal.jsx';

const WalletEarningsSection = ({ reporterId }) => {
  const { wallet, loading, error } = useWalletData(reporterId);
  const [showHistory, setShowHistory] = useState(false);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map(i => (
          <Card key={i} className="border-slate-200 shadow-sm bg-white animate-pulse">
            <CardContent className="p-6 h-[116px] flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6 mb-8 text-center text-destructive">
        <p className="font-medium">Unable to load wallet data</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-emerald-50 to-transparent pointer-events-none opacity-50" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-inner">
              <Wallet className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Current Balance</p>
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                ₹{wallet?.current_balance || 0}
              </h2>
            </div>
          </div>
          
          <div className="flex flex-wrap md:flex-nowrap gap-4 md:gap-8">
            <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-3 border border-slate-100 min-w-[140px]">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Earned</p>
                <p className="text-lg font-bold text-slate-900">₹{wallet?.total_earned || 0}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-3 border border-slate-100 min-w-[140px]">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Paid Out</p>
                <p className="text-lg font-bold text-slate-900">₹{wallet?.total_paid_out || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="shrink-0">
            <Button 
              variant="outline" 
              className="w-full md:w-auto gap-2 border-slate-300 hover:bg-slate-50 hover:text-slate-900 font-semibold h-11 px-6"
              onClick={() => setShowHistory(true)}
            >
              <History className="w-4 h-4" />
              View History
            </Button>
          </div>
        </div>
      </div>

      <TransactionHistoryModal 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
        userId={reporterId} 
      />
    </>
  );
};

export default WalletEarningsSection;