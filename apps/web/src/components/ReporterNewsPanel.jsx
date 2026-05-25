import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PenSquare, FileText, Wallet, User as UserIcon } from 'lucide-react';
import NewsUploadForm from './NewsUploadForm.jsx';
import MyNewsList from './MyNewsList.jsx';
import WalletSection from './WalletSection.jsx';

const ReporterNewsPanel = ({ profileData }) => {
  const [activeTab, setActiveTab] = useState('list');
  const [editItem, setEditItem] = useState(null);

  const handleEditNews = (newsItem) => {
    setEditItem(newsItem);
    setActiveTab('upload');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUploadSuccess = () => {
    setEditItem(null);
    setActiveTab('list');
  };

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <TabsList className="w-full flex-wrap h-auto p-1 bg-muted/50 gap-1 sm:grid sm:grid-cols-4 justify-start">
          <TabsTrigger value="list" className="flex-1 sm:flex-none data-[state=active]:shadow-sm">
            <FileText className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">My News</span>
            <span className="sm:hidden">News</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex-1 sm:flex-none data-[state=active]:shadow-sm">
            <PenSquare className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">{editItem ? 'Edit Draft' : 'Upload News'}</span>
            <span className="sm:hidden">{editItem ? 'Edit' : 'Upload'}</span>
          </TabsTrigger>
          <TabsTrigger value="wallet" className="flex-1 sm:flex-none data-[state=active]:shadow-sm">
            <Wallet className="w-4 h-4 mr-2" />
            Wallet
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex-1 sm:flex-none data-[state=active]:shadow-sm">
            <UserIcon className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-0 outline-none">
          <NewsUploadForm 
            editItem={editItem} 
            onSuccess={handleUploadSuccess} 
            onCancelEdit={() => { setEditItem(null); setActiveTab('list'); }}
          />
        </TabsContent>

        <TabsContent value="list" className="mt-0 outline-none">
          <MyNewsList onEditItem={handleEditNews} />
        </TabsContent>

        <TabsContent value="wallet" className="mt-0 outline-none">
          <WalletSection />
        </TabsContent>

        <TabsContent value="profile" className="mt-0 outline-none">
          <div className="bg-card text-card-foreground rounded-2xl shadow-sm border p-6 sm:p-8 space-y-6">
            <h3 className="text-xl font-semibold border-b pb-4">Reporter Profile</h3>
            
            <div className="flex flex-col sm:flex-row gap-6 sm:items-center bg-muted/30 p-6 rounded-xl border">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border-4 border-background shadow-sm">
                <UserIcon className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="text-2xl font-bold">{profileData?.full_name || profileData?.name}</h4>
                <p className="text-muted-foreground font-medium">{profileData?.reporter_id || 'ID Pending'}</p>
                <div className="pt-2 flex gap-2">
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-600 border-emerald-200">
                    Status: {profileData?.status || 'Unknown'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12 pt-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                <p className="font-medium">{profileData?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Phone</p>
                <p className="font-medium">{profileData?.phone_number || profileData?.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Working Area</p>
                <p className="font-medium">{profileData?.working_area || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Joined On</p>
                <p className="font-medium">{new Date(profileData?.created_at || profileData?.created || Date.now()).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReporterNewsPanel;