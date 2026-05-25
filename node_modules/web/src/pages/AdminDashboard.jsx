import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import pb from '@/lib/pocketbaseClient.js';
import apiServerClient from '@/lib/apiServerClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, RefreshCw, Edit2, Trash2, Shield, LogOut, CheckCircle, XCircle, Eye, FileText, Users, ArchiveX, Globe, AlertCircle, Plus, Activity, Cloud, Sparkles, LineChart, CreditCard, Calendar, Megaphone, Radio, UserCheck, MonitorPlay, Share2, Wallet, FileCheck, CheckSquare, ShieldAlert, Newspaper } from 'lucide-react';
import { toast } from 'sonner';
import EditReporterModal from '@/components/EditReporterModal.jsx';
import EditNewsModal from '@/components/EditNewsModal.jsx';
import ViewNewsModal from '@/components/ViewNewsModal.jsx';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog.jsx';
import GenericEditModal from '@/components/GenericEditModal.jsx';
import PopUpAdsManagement from '@/components/PopUpAdsManagement.jsx';
import LiveChannelsManagement from '@/components/LiveChannelsManagement.jsx';
import PaymentApprovalModal from '@/components/PaymentApprovalModal.jsx';
import RejectionReasonModal from '@/components/RejectionReasonModal.jsx';
import AdsManagement from '@/components/AdsManagement.jsx';
import AdsDisplay from '@/components/AdsDisplay.jsx';
import SocialMediaPublishingTab from '@/components/SocialMediaPublishingTab.jsx';
import WalletManagementTab from '@/components/WalletManagementTab.jsx';
import PaymentVerificationTab from '@/components/PaymentVerificationTab.jsx';
import NewsApprovalTab from '@/components/NewsApprovalTab.jsx';
import ReportsTab from '@/components/ReportsTab.jsx';
import NewsManagementTab from '@/components/NewsManagementTab.jsx';

const AdminDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [adminVerified, setAdminVerified] = useState(false);
  const [verifyingAdmin, setVerifyingAdmin] = useState(true);

  useEffect(() => {
    const verifyAdminAccess = async () => {
      if (!currentUser || currentUser.collectionName !== 'admin_users') {
        toast.error('Access denied. Admin authentication required.');
        navigate('/admin-login', { state: { from: { pathname: '/admin' } } });
        return;
      }

      try {
        const adminRecord = await pb.collection('admin_users').getOne(currentUser.id, {
          $autoCancel: false
        });

        if (!adminRecord.role || (adminRecord.role !== 'admin' && adminRecord.role !== 'super_admin')) {
          toast.error('Unauthorized. Admin role required.');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        setAdminVerified(true);
      } catch (error) {
        console.error('Admin verification failed:', error);
        toast.error('Failed to verify admin access.');
        setTimeout(() => navigate('/'), 3000);
      } finally {
        setVerifyingAdmin(false);
      }
    };

    verifyAdminAccess();
  }, [currentUser, navigate]);

  const [activeTab, setActiveTab] = useState('news_approval');
  const [data, setData] = useState([]);
  const [reporterMap, setReporterMap] = useState({});
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [showEditReporterModal, setShowEditReporterModal] = useState(false);
  const [showEditNewsModal, setShowEditNewsModal] = useState(false);
  const [showViewNewsModal, setShowViewNewsModal] = useState(false);
  const [showGenericModal, setShowGenericModal] = useState(false);
  
  const [showPaymentApprovalModal, setShowPaymentApprovalModal] = useState(false);
  const [showRejectionReasonModal, setShowRejectionReasonModal] = useState(false);

  const [showExtendExpiryModal, setShowExtendExpiryModal] = useState(false);
  const [newExpiryDate, setNewExpiryDate] = useState('');

  const [deleteTarget, setDeleteTarget] = useState({ collection: null, id: null });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [rejectTargetId, setRejectTargetId] = useState(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  const [unpublishTargetId, setUnpublishTargetId] = useState(null);
  const [showUnpublishConfirm, setShowUnpublishConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const fetchReporterMap = useCallback(async () => {
    try {
      const reporters = await pb.collection('reporters').getFullList({ $autoCancel: false });
      if (reporters && Array.isArray(reporters)) {
        const map = {};
        reporters.forEach(r => { map[r.id] = r; });
        setReporterMap(map);
      }
    } catch (err) {
      console.error('Failed to fetch reporter map', err);
    }
  }, []);

  const fetchData = useCallback(async (tab) => {
    if (!tab || typeof tab !== 'string' || ['popups', 'live_channels', 'ads', 'social_media', 'wallet', 'payment_verification', 'news_approval', 'reports', 'news_management'].includes(tab)) return;

    setLoading(true);
    setError(null);
    try {
      let result = [];
      if (tab === 'pending_approvals') {
        const res = await pb.collection('reporters').getList(1, 50, {
          filter: 'approval_status="pending"',
          sort: '-created_at',
          $autoCancel: false
        });
        if (res && Array.isArray(res.items)) result = res.items;
      } else if (tab === 'reporters') {
        const res = await pb.collection('reporters').getList(1, 500, {
          sort: '-created_at',
          $autoCancel: false
        });
        if (res && Array.isArray(res.items)) result = res.items;
      } else if (tab === 'pending') {
        const res = await pb.collection('news').getList(1, 500, {
          filter: 'status="pending"',
          sort: '-created_at',
          $autoCancel: false
        });
        if (res && Array.isArray(res.items)) result = res.items;
      } else if (tab === 'all') {
        const res = await pb.collection('news').getList(1, 500, {
          sort: '-created_at',
          $autoCancel: false
        });
        if (res && Array.isArray(res.items)) result = res.items;
      } else if (tab === 'published') {
        const res = await pb.collection('news').getList(1, 500, {
          filter: 'status="published"',
          sort: '-created_at',
          $autoCancel: false
        });
        if (res && Array.isArray(res.items)) result = res.items;
      } else if (tab === 'rejected') {
        const res = await pb.collection('news').getList(1, 500, {
          filter: 'status="rejected"',
          sort: '-created_at',
          $autoCancel: false
        });
        if (res && Array.isArray(res.items)) result = res.items;
      } else if (tab === 'payments') {
        const res = await pb.collection('payments').getList(1, 100, {
          sort: '-created_at',
          $autoCancel: false
        });
        if (res && Array.isArray(res.items)) result = res.items;
      } else if (['live_scores', 'weather', 'astrology', 'market_updates'].includes(tab)) {
        const res = await pb.collection(tab).getList(1, 100, {
          sort: '-created',
          $autoCancel: false
        });
        if (res && Array.isArray(res.items)) result = res.items;
      }
      setData(result);
    } catch (err) {
      console.error(`Error fetching data for ${tab}:`, err);
      setError(err.message || `Failed to load ${tab} data.`);
      toast.error(`Failed to load ${tab} data.`);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefreshAll = async () => {
    if (['popups', 'live_channels', 'ads', 'social_media', 'wallet', 'payment_verification', 'news_approval', 'reports', 'news_management'].includes(activeTab)) return;
    await fetchReporterMap();
    await fetchData(activeTab);
    toast.success('Data refreshed successfully');
  };

  useEffect(() => {
    fetchReporterMap();
  }, [fetchReporterMap]);

  useEffect(() => {
    if (!['popups', 'live_channels', 'ads', 'social_media', 'wallet', 'payment_verification', 'news_approval', 'reports', 'news_management'].includes(activeTab)) {
      fetchData(activeTab);
    }
  }, [activeTab, fetchData]);

  const confirmDelete = (collection, id) => {
    if (!collection || !id) return;
    setDeleteTarget({ collection, id });
    setShowDeleteConfirm(true);
  };

  const executeDelete = async () => {
    if (!deleteTarget.id || !deleteTarget.collection) return;
    setActionLoading(true);
    try {
      await pb.collection(deleteTarget.collection).delete(deleteTarget.id, { $autoCancel: false });
      toast.success('Record deleted successfully!');
      setShowDeleteConfirm(false);
      setDeleteTarget({ collection: null, id: null });
      fetchData(activeTab);
    } catch (err) {
      console.error("Failed to delete:", err);
      toast.error('Failed to delete record');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveNews = async (newsItem) => {
    if (!newsItem?.id) return;
    setActionLoading(true);
    try {
      await pb.collection('news').update(newsItem.id, { status: 'published' }, { $autoCancel: false });
      
      const baseUrl = window.location.origin;
      
      apiServerClient.fetch('/social-media/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: newsItem.id,
          news_data: {
            title: newsItem.title || newsItem.headline,
            description: newsItem.description || newsItem.excerpt || '',
            image: newsItem.photo1 || newsItem.image ? pb.files.getUrl(newsItem, newsItem.photo1 || newsItem.image) : '',
            category: newsItem.category || 'News',
            link: `${baseUrl}/news/${newsItem.id}`
          }
        })
      }).catch(e => console.error('[SM Publish Error]:', e));

      if (newsItem.reporter_id) {
        apiServerClient.fetch('/wallet/credit-reward', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: newsItem.reporter_id,
            post_id: newsItem.id,
            amount: 10
          })
        }).catch(e => console.error('[Wallet Credit Error]:', e));
      }

      toast.success('Post approved! Publishing to social media and crediting wallet...');
      fetchData(activeTab);
    } catch (err) {
      console.error("Failed to approve news:", err);
      toast.error('Failed to approve news');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectNews = async () => {
    if (!rejectTargetId) return;
    setActionLoading(true);
    try {
      await pb.collection('news').update(rejectTargetId, { status: 'rejected' }, { $autoCancel: false });
      toast.success('News rejected successfully!');
      setShowRejectConfirm(false);
      setRejectTargetId(null);
      fetchData(activeTab);
    } catch (err) {
      console.error("Failed to reject news:", err);
      toast.error('Failed to reject news');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnpublishNews = async () => {
    if (!unpublishTargetId) return;
    setActionLoading(true);
    try {
      await pb.collection('news').update(unpublishTargetId, { status: 'pending' }, { $autoCancel: false });
      toast.success('News unpublished successfully!');
      setShowUnpublishConfirm(false);
      setUnpublishTargetId(null);
      fetchData(activeTab);
    } catch (err) {
      console.error("Failed to unpublish news:", err);
      toast.error('Failed to unpublish news');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReporterApproval = async (reporterId, action) => {
    setActionLoading(true);
    try {
      const today = new Date().toISOString();
      const updates = action === 'approve' 
        ? { approval_status: 'approved', approval_date: today, status: 'ACTIVE' }
        : { approval_status: 'rejected', approval_date: today, status: 'REJECTED' };
        
      await pb.collection('reporters').update(reporterId, updates, { $autoCancel: false });
      toast.success(`Reporter ${action}d successfully!`);
      fetchData(activeTab);
    } catch (err) {
      console.error(`Failed to ${action} reporter:`, err);
      toast.error(`Failed to ${action} reporter`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprovePayment = async () => {
    if (!selectedItem) return;
    setActionLoading(true);
    try {
      const today = new Date().toISOString();
      
      await pb.collection('payments').update(selectedItem.id, {
        payment_status: 'completed',
        approval_status: 'approved',
        approval_date: today
      }, { $autoCancel: false });

      await pb.collection('reporters').update(selectedItem.reporter_id, {
        status: 'ACTIVE',
        payment_status: 'completed',
        approval_status: 'approved',
        activation_date: today
      }, { $autoCancel: false });

      toast.success('Payment approved successfully! Reporter is now active.');
      setShowPaymentApprovalModal(false);
      setSelectedItem(null);
      fetchData(activeTab);
    } catch (err) {
      console.error('Failed to approve payment:', err);
      toast.error('Failed to approve payment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectPayment = async (reason) => {
    if (!selectedItem) return;
    setActionLoading(true);
    try {
      const today = new Date().toISOString();
      
      await pb.collection('payments').update(selectedItem.id, {
        payment_status: 'rejected',
        approval_status: 'rejected',
        approval_date: today,
        rejection_reason: reason
      }, { $autoCancel: false });

      await pb.collection('reporters').update(selectedItem.reporter_id, {
        status: 'REJECTED',
        payment_status: 'rejected',
        approval_status: 'rejected'
      }, { $autoCancel: false });

      toast.success('Payment rejected successfully. Notification sent to reporter.');
      setShowRejectionReasonModal(false);
      setShowPaymentApprovalModal(false);
      setSelectedItem(null);
      fetchData(activeTab);
    } catch (err) {
      console.error('Failed to reject payment:', err);
      toast.error('Failed to reject payment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExtendExpiry = async () => {
    if (!selectedItem || !newExpiryDate) return;
    setActionLoading(true);
    try {
      await pb.collection('reporters').update(selectedItem.id, {
        expiry_date: new Date(newExpiryDate).toISOString(),
        status: 'ACTIVE',
        payment_status: 'active'
      }, { $autoCancel: false });
      
      toast.success('Expiry date extended successfully!');
      setShowExtendExpiryModal(false);
      setSelectedItem(null);
      setNewExpiryDate('');
      fetchData(activeTab);
    } catch (err) {
      console.error("Failed to extend expiry:", err);
      toast.error('Failed to extend expiry date');
    } finally {
      setActionLoading(false);
    }
  };

  const getGenericModalConfig = () => {
    switch (activeTab) {
      case 'live_scores':
        return {
          collectionName: 'live_scores',
          title: 'Live Score',
          fields: [
            { name: 'sport', label: 'Sport', type: 'text', required: true },
            { name: 'team1', label: 'Team 1', type: 'text', required: true },
            { name: 'team2', label: 'Team 2', type: 'text', required: true },
            { name: 'score1', label: 'Score 1', type: 'number' },
            { name: 'score2', label: 'Score 2', type: 'number' },
            { name: 'status', label: 'Status', type: 'select', options: ['Live', 'Upcoming', 'Completed'] },
            { name: 'time_overs', label: 'Time/Overs', type: 'text' }
          ]
        };
      case 'weather':
        return {
          collectionName: 'weather',
          title: 'Weather',
          fields: [
            { name: 'location', label: 'Location', type: 'text', required: true },
            { name: 'temperature', label: 'Temperature (°C)', type: 'number', required: true },
            { name: 'condition', label: 'Condition', type: 'text', required: true },
            { name: 'humidity', label: 'Humidity (%)', type: 'number' },
            { name: 'wind_speed', label: 'Wind Speed (km/h)', type: 'number' },
            { name: 'forecast', label: 'Forecast', type: 'text' }
          ]
        };
      case 'astrology':
        return {
          collectionName: 'astrology',
          title: 'Astrology',
          fields: [
            { name: 'zodiac_sign', label: 'Zodiac Sign', type: 'text', required: true },
            { name: 'prediction', label: 'Prediction', type: 'text', required: true },
            { name: 'lucky_number', label: 'Lucky Number', type: 'number' },
            { name: 'lucky_color', label: 'Lucky Color', type: 'text' },
            { name: 'mood', label: 'Mood', type: 'text' }
          ]
        };
      case 'market_updates':
        return {
          collectionName: 'market_updates',
          title: 'Market Update',
          fields: [
            { name: 'symbol', label: 'Symbol', type: 'text', required: true },
            { name: 'price', label: 'Price', type: 'number', required: true },
            { name: 'change', label: 'Change', type: 'number' },
            { name: 'percentage', label: 'Percentage (%)', type: 'number' },
            { name: 'status', label: 'Status', type: 'select', options: ['Open', 'Closed'] }
          ]
        };
      default:
        return null;
    }
  };

  const renderTable = () => {
    if (activeTab === 'news_approval') return <NewsApprovalTab />;
    if (activeTab === 'reports') return <ReportsTab />;
    if (activeTab === 'news_management') return <NewsManagementTab />;
    if (activeTab === 'popups') return <PopUpAdsManagement />;
    if (activeTab === 'live_channels') return <LiveChannelsManagement />;
    if (activeTab === 'ads') return <AdsManagement />;
    if (activeTab === 'social_media') return <SocialMediaPublishingTab />;
    if (activeTab === 'wallet') return <WalletManagementTab />;
    if (activeTab === 'payment_verification') return <PaymentVerificationTab />;

    if (loading) {
      return (
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-center mb-4 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="font-medium">Loading data...</span>
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="py-16 flex flex-col items-center justify-center text-destructive bg-destructive/5 rounded-xl border border-destructive/20 border-dashed">
          <AlertCircle className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium mb-4">Failed to load data. Please try again.</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button variant="outline" onClick={() => fetchData(activeTab)} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Retry
          </Button>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="py-16 flex flex-col items-center justify-center text-muted-foreground bg-slate-50 rounded-xl border border-dashed">
          <FileText className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">No records found.</p>
        </div>
      );
    }

    if (activeTab === 'pending_approvals') {
      return (
        <div className="rounded-md border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold">Payment Method</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((rep) => (
                <TableRow key={rep.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">
                    <div>{rep.name || '-'}</div>
                    <div className="text-xs text-muted-foreground">{rep.reporter_id || 'No ID'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{rep.email || '-'}</div>
                    <div className="text-xs text-muted-foreground">{rep.phone || '-'}</div>
                  </TableCell>
                  <TableCell className="capitalize">
                    <Badge variant="outline" className={rep.payment_method === 'online' ? 'border-blue-500 text-blue-600' : 'border-amber-500 text-amber-600'}>
                      {rep.payment_method || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {rep.created ? new Date(rep.created).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-amber-500 text-amber-600">
                      {rep.approval_status?.toUpperCase() || 'PENDING'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleReporterApproval(rep.id, 'approve')} title="Approve">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleReporterApproval(rep.id, 'reject')} title="Reject">
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    if (activeTab === 'reporters') {
      return (
        <div className="rounded-md border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Expiry Date</TableHead>
                <TableHead className="font-semibold">Days Left</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((rep) => {
                const status = rep.status || 'PENDING';
                let daysRemaining = null;
                let isExpired = false;
                
                if (rep.expiry_date) {
                  const expiry = new Date(rep.expiry_date);
                  const now = new Date();
                  daysRemaining = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
                  isExpired = daysRemaining <= 0;
                }

                return (
                  <TableRow key={rep.id} className={`hover:bg-muted/30 transition-colors ${isExpired ? 'bg-red-50/50' : ''}`}>
                    <TableCell className="font-medium">
                      <div>{rep.name || '-'}</div>
                      <div className="text-xs text-muted-foreground">{rep.reporter_id || 'No ID'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{rep.email || '-'}</div>
                      <div className="text-xs text-muted-foreground">{rep.phone || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        status === 'ACTIVE' ? 'border-green-500 text-green-600' :
                        status === 'INACTIVE' ? 'border-red-500 text-red-600' :
                        status === 'REJECTED' ? 'border-red-500 text-red-600' :
                        'border-amber-500 text-amber-600'
                      }>
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {rep.expiry_date ? new Date(rep.expiry_date).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      {daysRemaining !== null ? (
                        <span className={`font-medium ${isExpired ? 'text-red-600' : daysRemaining < 30 ? 'text-amber-600' : 'text-green-600'}`}>
                          {isExpired ? 'Expired' : `${daysRemaining} days`}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { 
                          setSelectedItem(rep); 
                          setNewExpiryDate(rep.expiry_date ? rep.expiry_date.split('T')[0] : '');
                          setShowExtendExpiryModal(true); 
                        }} title="Extend Expiry">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedItem(rep); setShowEditReporterModal(true); }} title="Edit">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => confirmDelete('reporters', rep.id)} title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      );
    }

    if (activeTab === 'payments') {
      return (
        <div className="rounded-md border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Reporter</TableHead>
                <TableHead className="font-semibold">Contact</TableHead>
                <TableHead className="font-semibold">Method</TableHead>
                <TableHead className="font-semibold">Amount</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((payment) => {
                const reporter = reporterMap[payment.reporter_id];
                const isPending = payment.approval_status === 'pending' || payment.payment_status === 'pending';
                
                return (
                  <TableRow key={payment.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium">{reporter?.name || 'Unknown'}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{reporter?.email || '-'}</div>
                        <div className="text-muted-foreground">{reporter?.phone || '-'}</div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{payment.payment_method}</TableCell>
                    <TableCell>₹{payment.payment_amount || 0}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        payment.approval_status === 'approved' ? 'border-green-500 text-green-600' :
                        payment.approval_status === 'rejected' ? 'border-red-500 text-red-600' :
                        'border-amber-500 text-amber-600'
                      }>
                        {payment.approval_status?.toUpperCase() || 'PENDING'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(payment.created).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {payment.payment_proof && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => {
                              setSelectedItem(payment);
                              setShowPaymentApprovalModal(true);
                            }} 
                            title="View Proof & Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {isPending && (
                          <>
                            <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => {
                              setSelectedItem(payment);
                              setShowPaymentApprovalModal(true);
                            }} title="Review & Approve">
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => confirmDelete('payments', payment.id)} title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      );
    }

    if (['live_scores', 'weather', 'astrology', 'market_updates'].includes(activeTab)) {
      const config = getGenericModalConfig();
      return (
        <div className="rounded-md border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                {config.fields.map(f => (
                  <TableHead key={f.name} className="font-semibold">{f.label}</TableHead>
                ))}
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                  {config.fields.map(f => (
                    <TableCell key={f.name} className="max-w-[200px] truncate">
                      {item[f.name] !== undefined && item[f.name] !== null ? String(item[f.name]) : '-'}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedItem(item); setShowGenericModal(true); }} title="Edit">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => confirmDelete(activeTab, item.id)} title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );
    }

    return (
      <div className="rounded-md border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[80px] font-semibold">Photo</TableHead>
              <TableHead className="font-semibold">Title</TableHead>
              <TableHead className="font-semibold">Reporter Name</TableHead>
              <TableHead className="font-semibold">Category</TableHead>
              {activeTab === 'all' && <TableHead className="font-semibold">Status</TableHead>}
              {activeTab === 'published' && <TableHead className="font-semibold">Views</TableHead>}
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => {
              const title = item.title || item.headline || '-';
              const image = item.photo1 || item.image;
              const isValidImage = image && typeof image === 'string';
              const reporterName = reporterMap[item.reporter_id]?.name || 'Unknown';
              const date = item.created_at || item.created;
              
              return (
                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="w-14 h-10 rounded overflow-hidden bg-muted border">
                      {isValidImage ? (
                        <img src={pb.files.getUrl(item, image)} alt="thumbnail" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">No img</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-[250px] truncate" title={title}>{title}</TableCell>
                  <TableCell>{reporterName}</TableCell>
                  <TableCell><Badge variant="outline">{item.category || '-'}</Badge></TableCell>
                  
                  {activeTab === 'all' && (
                    <TableCell>
                      <Badge variant={
                        item.status === 'published' || item.status === 'approved' ? 'default' : 
                        item.status === 'rejected' ? 'destructive' : 'secondary'
                      } className={item.status === 'published' || item.status === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}>
                        {item.status?.toUpperCase() || 'UNKNOWN'}
                      </Badge>
                    </TableCell>
                  )}
                  
                  {activeTab === 'published' && <TableCell>{item.views || 0}</TableCell>}
                  
                  <TableCell className="text-muted-foreground text-sm">{date ? new Date(date).toLocaleDateString() : '-'}</TableCell>
                  
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedItem(item); setShowViewNewsModal(true); }} title="View Details">
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {activeTab === 'pending' && (
                        <>
                          <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleApproveNews(item)} title="Approve">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => { setRejectTargetId(item.id); setShowRejectConfirm(true); }} title="Reject">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      {activeTab === 'published' && (
                        <Button variant="ghost" size="icon" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50" onClick={() => { setUnpublishTargetId(item.id); setShowUnpublishConfirm(true); }} title="Unpublish">
                          <ArchiveX className="h-4 w-4" />
                        </Button>
                      )}

                      {activeTab === 'rejected' && (
                        <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleApproveNews(item)} title="Approve">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}

                      <Button variant="ghost" size="icon" onClick={() => { setSelectedItem(item); setShowEditNewsModal(true); }} title="Edit">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => confirmDelete('news', item.id)} title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  if (verifyingAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Verifying admin access...</p>
      </div>
    );
  }

  if (!adminVerified) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/20 p-4">
        <div className="bg-card text-card-foreground max-w-md w-full p-8 rounded-2xl shadow-lg border text-center space-y-6">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">Unauthorized Access</h2>
            <p className="text-muted-foreground text-sm">
              You do not have admin privileges. Redirecting to home page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <Helmet>
        <title>Admin Portal - Navdhriti Manawadhikar</title>
      </Helmet>

      <div className="bg-brand-blue text-white border-b border-brand-blue/80 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img 
                src="https://horizons-cdn.hostinger.com/7a26f45c-f82c-40d2-8cdd-8c9eef29992b/20be51816882891787f931475df292ab.jpg" 
                alt="Navdhriti Manavadhikar Foundation" 
                className="h-14 w-14 md:h-16 md:w-16 rounded-xl object-cover shadow-lg border-2 border-white/20"
              />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Portal</h1>
                <p className="text-blue-100 mt-1 font-medium">Logged in as {currentUser?.name || 'Admin User'}</p>
              </div>
            </div>
            <Button variant="secondary" onClick={handleLogout} className="gap-2 bg-white text-brand-blue hover:bg-blue-50 font-bold">
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <AdsDisplay />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-9">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6 bg-white border shadow-sm p-1 h-auto flex-wrap justify-start gap-1">
                <TabsTrigger value="news_approval" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white py-2.5 px-4">
                  <CheckSquare className="w-4 h-4 mr-2" /> News Approval
                </TabsTrigger>
                <TabsTrigger value="news_management" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white py-2.5 px-4">
                  <Newspaper className="w-4 h-4 mr-2" /> News Management
                </TabsTrigger>
                <TabsTrigger value="reports" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white py-2.5 px-4">
                  <ShieldAlert className="w-4 h-4 mr-2" /> Reports
                </TabsTrigger>
                <TabsTrigger value="payment_verification" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white py-2.5 px-4">
                  <FileCheck className="w-4 h-4 mr-2" /> New Registrations
                </TabsTrigger>
                <TabsTrigger value="pending_approvals" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white py-2.5 px-4">
                  <UserCheck className="w-4 h-4 mr-2" /> Pending Approvals
                </TabsTrigger>
                <TabsTrigger value="pending" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white py-2.5 px-4">
                  <FileText className="w-4 h-4 mr-2" /> Pending News
                </TabsTrigger>
                <TabsTrigger value="reporters" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white py-2.5 px-4">
                  <Users className="w-4 h-4 mr-2" /> Reporters
                </TabsTrigger>
                <TabsTrigger value="payments" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white py-2.5 px-4">
                  <CreditCard className="w-4 h-4 mr-2" /> Payment Approvals
                </TabsTrigger>
                
                <TabsTrigger value="social_media" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white py-2.5 px-4">
                  <Share2 className="w-4 h-4 mr-2" /> Social Media Publishing
                </TabsTrigger>
                <TabsTrigger value="wallet" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white py-2.5 px-4">
                  <Wallet className="w-4 h-4 mr-2" /> Wallet Management
                </TabsTrigger>

                <TabsTrigger value="all" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white py-2.5 px-4">
                  <Globe className="w-4 h-4 mr-2" /> All News
                </TabsTrigger>
                <TabsTrigger value="published" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white py-2.5 px-4">
                  <CheckCircle className="w-4 h-4 mr-2" /> Published News
                </TabsTrigger>
                <TabsTrigger value="rejected" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white py-2.5 px-4">
                  <XCircle className="w-4 h-4 mr-2" /> Rejected News
                </TabsTrigger>
                
                <TabsTrigger value="popups" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white py-2.5 px-4">
                  <Megaphone className="w-4 h-4 mr-2" /> Pop-up Ads
                </TabsTrigger>

                <TabsTrigger value="ads" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white py-2.5 px-4">
                  <MonitorPlay className="w-4 h-4 mr-2" /> Ads Management
                </TabsTrigger>

                <TabsTrigger value="live_channels" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white py-2.5 px-4">
                  <Radio className="w-4 h-4 mr-2" /> Live Channels
                </TabsTrigger>

                <TabsTrigger value="live_scores" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white py-2.5 px-4">
                  <Activity className="w-4 h-4 mr-2" /> Live Scores
                </TabsTrigger>
                <TabsTrigger value="weather" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white py-2.5 px-4">
                  <Cloud className="w-4 h-4 mr-2" /> Weather
                </TabsTrigger>
                <TabsTrigger value="astrology" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white py-2.5 px-4">
                  <Sparkles className="w-4 h-4 mr-2" /> Astrology
                </TabsTrigger>
                <TabsTrigger value="market_updates" className="data-[state=active]:bg-brand-blue data-[state=active]:text-white py-2.5 px-4">
                  <LineChart className="w-4 h-4 mr-2" /> Market Updates
                </TabsTrigger>
              </TabsList>
              
              <div className="bg-white rounded-xl shadow-sm p-6 border">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground capitalize">
                    {activeTab.replace('_', ' ')} Management
                  </h2>
                  {!['popups', 'live_channels', 'ads', 'social_media', 'wallet', 'payment_verification', 'news_approval', 'reports', 'news_management'].includes(activeTab) && (
                    <div className="flex gap-2">
                      {['live_scores', 'weather', 'astrology', 'market_updates'].includes(activeTab) && (
                        <Button onClick={() => { setSelectedItem(null); setShowGenericModal(true); }} className="gap-2">
                          <Plus className="w-4 h-4" /> Add New
                        </Button>
                      )}
                      <Button variant="outline" onClick={handleRefreshAll} disabled={loading || actionLoading} className="gap-2">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                      </Button>
                    </div>
                  )}
                </div>
                {renderTable()}
              </div>
            </Tabs>
          </div>

          <aside className="lg:col-span-3 space-y-8">
            <div className="sticky top-24">
              <h3 className="text-lg font-bold mb-4 text-muted-foreground uppercase tracking-wider">Sponsored</h3>
              <AdsDisplay />
            </div>
          </aside>
        </div>

        <div className="mt-12">
          <AdsDisplay />
        </div>
      </div>

      <EditReporterModal 
        isOpen={showEditReporterModal} 
        onClose={() => { setShowEditReporterModal(false); setSelectedItem(null); }} 
        reporter={selectedItem}
        onSuccess={() => fetchData(activeTab)}
      />

      <EditNewsModal 
        isOpen={showEditNewsModal} 
        onClose={() => { setShowEditNewsModal(false); setSelectedItem(null); }} 
        newsItem={selectedItem}
        onSuccess={() => fetchData(activeTab)}
      />

      <ViewNewsModal 
        isOpen={showViewNewsModal} 
        onClose={() => { setShowViewNewsModal(false); setSelectedItem(null); }} 
        newsItem={selectedItem}
        reporterName={selectedItem ? reporterMap[selectedItem.reporter_id]?.name : ''}
      />

      {getGenericModalConfig() && (
        <GenericEditModal
          isOpen={showGenericModal}
          onClose={() => { setShowGenericModal(false); setSelectedItem(null); }}
          item={selectedItem}
          collectionName={getGenericModalConfig().collectionName}
          fields={getGenericModalConfig().fields}
          title={getGenericModalConfig().title}
          onSuccess={() => fetchData(activeTab)}
        />
      )}

      <PaymentApprovalModal
        isOpen={showPaymentApprovalModal}
        onClose={() => { setShowPaymentApprovalModal(false); setSelectedItem(null); }}
        payment={selectedItem}
        reporter={selectedItem ? reporterMap[selectedItem.reporter_id] : null}
        onApprove={handleApprovePayment}
        onReject={() => setShowRejectionReasonModal(true)}
        isSubmitting={actionLoading}
      />

      <RejectionReasonModal
        isOpen={showRejectionReasonModal}
        onClose={() => setShowRejectionReasonModal(false)}
        onSubmit={handleRejectPayment}
        isSubmitting={actionLoading}
        reporterName={selectedItem ? reporterMap[selectedItem.reporter_id]?.name : ''}
      />

      <Dialog open={showExtendExpiryModal} onOpenChange={setShowExtendExpiryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Expiry Date</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-slate-600">
              Manually update the expiry date for <strong>{selectedItem?.name}</strong>. This will also set their status to ACTIVE.
            </p>
            <div className="space-y-2">
              <Label>New Expiry Date</Label>
              <Input 
                type="date" 
                value={newExpiryDate}
                onChange={(e) => setNewExpiryDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExtendExpiryModal(false)}>Cancel</Button>
            <Button onClick={handleExtendExpiry} disabled={actionLoading || !newExpiryDate}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setDeleteTarget({ collection: null, id: null }); }}
        onConfirm={executeDelete}
        loading={actionLoading}
        title="Delete Record"
        description="Are you sure you want to delete this record? This action cannot be undone."
      />

      <DeleteConfirmationDialog
        isOpen={showRejectConfirm}
        onClose={() => { setShowRejectConfirm(false); setRejectTargetId(null); }}
        onConfirm={handleRejectNews}
        loading={actionLoading}
        title="Reject News Article"
        description="Are you sure you want to reject this news article? It will be marked as rejected and sent back to the reporter."
      />

      <DeleteConfirmationDialog
        isOpen={showUnpublishConfirm}
        onClose={() => { setShowUnpublishConfirm(false); setUnpublishTargetId(null); }}
        onConfirm={handleUnpublishNews}
        loading={actionLoading}
        title="Unpublish News Article"
        description="Are you sure you want to unpublish this news article? It will be moved back to pending status and removed from the public website."
      />
    </div>
  );
};

export default AdminDashboard;