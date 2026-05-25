import { useState, useEffect, useCallback } from 'react';
import apiServerClient from '@/lib/apiServerClient.js';

export const useWalletData = (userId) => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWallet = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await apiServerClient.fetch(`/wallet/user/${userId}?limit=100`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch wallet data');
      }
      
      const data = await response.json();
      setWallet({
        current_balance: data.current_balance || 0,
        total_earned: data.total_earned || 0,
        total_paid_out: data.total_paid_out || 0,
      });
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Error fetching wallet:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  return { wallet, transactions, loading, error, refetch: fetchWallet };
};