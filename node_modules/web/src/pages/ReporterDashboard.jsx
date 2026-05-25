import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, AlertCircle, RefreshCw, PenSquare, FileText, Wallet } from 'lucide-react';
import { toast } from 'sonner';

import NewsUploadForm from '@/components/NewsUploadForm.jsx';
import MyNewsList from '@/components/MyNewsList.jsx';
import WalletSection from '@/components/WalletSection.jsx';

const ReporterDashboard = () => {
  const { currentReporter, reporterLogout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);
  
  const [activeTab, setActiveTab] = useState('list');
  const [editItem, setEditItem] = useState(null);

  const fetchProfile = async () => {
    if (!currentReporter?.id) return;
    setLoading(true);
    setErrorState(null);
    try {
      const data = await pb.collection('reporter_registrations').getOne(currentReporter.id, {
        $autoCancel: false
      });
      
      if (data.approval_status !== 'approved') {
        setErrorState('not_approved');
        return;
      }
      
      setProfileData(data);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      if (error.status === 404) {
        setErrorState('not_found');
      } else {
        setErrorState('error');
        toast.error("Could not load latest profile data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentReporter]);

  const handleLogout = () => {
    reporterLogout();
    toast.success('Logged out successfully');
    navigate('/reporter-login');
  };

  const handleEditNews = (newsItem) => {
    setEditItem(newsItem);
    setActiveTab('upload');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUploadSuccess = () => {
    setEditItem(null);
    setActiveTab('list');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 py-10 space-y-6">
          <Skeleton className="h-12 w-[250px] mb-8" />
          <Skeleton className="h-[600px] w-full rounded-2xl" />
        </main>
      </div>
    );
  }

  if (errorState === 'not_approved') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground max-w-md w-full p-8 rounded-2xl shadow-lg border text-center space-y-6">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Pending Approval</h2>
              <p className="text-muted-foreground text-sm">
                Your account is pending admin approval. You will be notified once approved.
              </p>
            </div>
            <Button variant="outline" className="w-full gap-2" onClick={handleLogout}>
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (errorState === 'not_found') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground max-w-md w-full p-8 rounded-2xl shadow-lg border text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Record Not Found</h2>
              <p className="text-muted-foreground text-sm">
                Your registration record was not found. Please complete the registration process first.
              </p>
            </div>
            <div className="space-y-3 pt-4">
              <Button onClick={() => navigate('/new-reporter-registration')} className="w-full">
                Go to Registration
              </Button>
              <Button variant="outline" className="w-full" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (errorState === 'error') {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-card text-card-foreground max-w-md w-full p-8 rounded-2xl shadow-lg border text-center space-y-6">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
              <p className="text-muted-foreground text-sm">
                An error occurred while loading your dashboard. Please try again.
              </p>
            </div>
            <div className="space-y-3 pt-4">
              <Button onClick={fetchProfile} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" /> Retry
              </Button>
              <Button variant="outline" className="w-full" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-background">
      <Helmet>
        <title>Reporter Dashboard - Navdhriti</title>
      </Helmet>
      
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 py-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-card p-6 rounded-2xl border shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Welcome, {profileData?.name?.split(' ')[0] || 'Reporter'}!
            </h1>
            <p className="text-muted-foreground mt-1 font-medium">
              Reporter ID: <span className="text-primary">{profileData?.reporter_id || 'Pending'}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="destructive" onClick={handleLogout} className="shadow-sm">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>

        <div className="w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
            <TabsList className="w-full flex-wrap h-auto p-1 bg-muted/50 gap-1 sm:grid sm:grid-cols-3 justify-start max-w-2xl">
              <TabsTrigger value="list" className="flex-1 sm:flex-none data-[state=active]:shadow-sm py-2.5">
                <FileText className="w-4 h-4 mr-2" />
                My News
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex-1 sm:flex-none data-[state=active]:shadow-sm py-2.5">
                <PenSquare className="w-4 h-4 mr-2" />
                {editItem ? 'Edit Draft' : 'Upload News'}
              </TabsTrigger>
              <TabsTrigger value="wallet" className="flex-1 sm:flex-none data-[state=active]:shadow-sm py-2.5">
                <Wallet className="w-4 h-4 mr-2" />
                Wallet
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
              <NewsUploadForm 
                editItem={editItem} 
                onSuccess={handleUploadSuccess} 
                onCancelEdit={() => { setEditItem(null); setActiveTab('list'); }}
              />
            </TabsContent>

            <TabsContent value="list" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
              <MyNewsList onEditItem={handleEditNews} />
            </TabsContent>

            <TabsContent value="wallet" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
              <WalletSection />
            </TabsContent>
          </Tabs>
        </div>
        
      </main>

      <Footer />
    </div>
  );
};

export default ReporterDashboard;