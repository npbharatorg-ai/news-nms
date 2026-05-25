import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Plus, Edit2, Trash2, ExternalLink, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';
import CustomAdForm from './CustomAdForm.jsx';
import DeleteConfirmationDialog from './DeleteConfirmationDialog.jsx';

const AdsManagement = () => {
  const [settings, setSettings] = useState(null);
  const [customAds, setCustomAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  
  const [showAdForm, setShowAdForm] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [adToDelete, setAdToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch settings
      const settingsRes = await pb.collection('ads_settings').getList(1, 1, { $autoCancel: false });
      if (settingsRes.items.length > 0) {
        setSettings(settingsRes.items[0]);
      } else {
        // Create default settings if none exist
        const newSettings = await pb.collection('ads_settings').create({
          google_ads_enabled: false,
          custom_ads_enabled: false,
          google_ads_code: ''
        }, { $autoCancel: false });
        setSettings(newSettings);
      }

      // Fetch custom ads
      const adsRes = await pb.collection('ads').getList(1, 100, {
        filter: 'ad_type="custom"',
        sort: '-created',
        $autoCancel: false
      });
      setCustomAds(adsRes.items);
    } catch (error) {
      console.error('Error fetching ads data:', error);
      toast.error('Failed to load ads configuration.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateSettings = async (updates) => {
    if (!settings?.id) return;
    setSavingSettings(true);
    try {
      const updated = await pb.collection('ads_settings').update(settings.id, updates, { $autoCancel: false });
      setSettings(updated);
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleAdStatus = async (ad, newStatus) => {
    try {
      await pb.collection('ads').update(ad.id, { is_enabled: newStatus }, { $autoCancel: false });
      setCustomAds(customAds.map(a => a.id === ad.id ? { ...a, is_enabled: newStatus } : a));
      toast.success(`Ad ${newStatus ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling ad status:', error);
      toast.error('Failed to update ad status');
    }
  };

  const confirmDelete = (ad) => {
    setAdToDelete(ad);
    setShowDeleteConfirm(true);
  };

  const executeDelete = async () => {
    if (!adToDelete) return;
    setIsDeleting(true);
    try {
      await pb.collection('ads').delete(adToDelete.id, { $autoCancel: false });
      setCustomAds(customAds.filter(a => a.id !== adToDelete.id));
      toast.success('Ad deleted successfully');
      setShowDeleteConfirm(false);
      setAdToDelete(null);
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast.error('Failed to delete ad');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Google Ads Section */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 p-1.5 rounded-md">
                  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>
                </span>
                Google AdSense
              </CardTitle>
              <CardDescription className="mt-1">Manage your Google AdSense integration</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="google-ads-toggle" className="text-sm font-medium cursor-pointer">
                {settings?.google_ads_enabled ? 'Enabled' : 'Disabled'}
              </Label>
              <Switch 
                id="google-ads-toggle"
                checked={settings?.google_ads_enabled || false}
                onCheckedChange={(checked) => handleUpdateSettings({ google_ads_enabled: checked })}
                disabled={savingSettings}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <Label htmlFor="google-code">Google AdSense Code Snippet</Label>
            <Textarea 
              id="google-code"
              placeholder="Paste your Google AdSense <script> or <ins> code here..."
              value={settings?.google_ads_code || ''}
              onChange={(e) => setSettings({ ...settings, google_ads_code: e.target.value })}
              className="font-mono text-sm min-h-[120px] bg-slate-50"
            />
            <div className="flex justify-end">
              <Button 
                onClick={() => handleUpdateSettings({ google_ads_code: settings.google_ads_code })}
                disabled={savingSettings}
                className="gap-2"
              >
                {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Save Code
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Ads Section */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="bg-purple-100 text-purple-700 p-1.5 rounded-md">
                  <ImageIcon className="h-4 w-4" />
                </span>
                Custom Banner Ads
              </CardTitle>
              <CardDescription className="mt-1">Manage your own promotional banners and links</CardDescription>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 bg-slate-100 px-3 py-1.5 rounded-lg">
                <Label htmlFor="custom-ads-toggle" className="text-sm font-medium cursor-pointer">
                  Show Custom Ads
                </Label>
                <Switch 
                  id="custom-ads-toggle"
                  checked={settings?.custom_ads_enabled || false}
                  onCheckedChange={(checked) => handleUpdateSettings({ custom_ads_enabled: checked })}
                  disabled={savingSettings}
                />
              </div>
              <Button onClick={() => { setSelectedAd(null); setShowAdForm(true); }} className="gap-2">
                <Plus className="h-4 w-4" /> Add New Ad
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 px-0">
          {customAds.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-muted-foreground">
              <ImageIcon className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-lg font-medium">No custom ads found</p>
              <p className="text-sm mt-1">Click "Add New Ad" to create your first banner.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                    <TableHead className="w-[100px]">Image</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="text-right w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customAds.map((ad) => (
                    <TableRow key={ad.id} className="hover:bg-slate-50/50">
                      <TableCell>
                        <div className="w-16 h-12 rounded-md overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                          {ad.image ? (
                            <img 
                              src={pb.files.getUrl(ad, ad.image)} 
                              alt={ad.title} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-slate-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-slate-900 line-clamp-1">{ad.title}</p>
                        {ad.description && (
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{ad.description}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        {ad.link ? (
                          <a 
                            href={ad.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1 max-w-[200px] truncate"
                            title={ad.link}
                          >
                            {ad.link} <ExternalLink className="h-3 w-3 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={ad.is_enabled}
                            onCheckedChange={(checked) => handleToggleAdStatus(ad, checked)}
                          />
                          <Badge variant={ad.is_enabled ? "default" : "secondary"} className={ad.is_enabled ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
                            {ad.is_enabled ? 'Active' : 'Hidden'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => { setSelectedAd(ad); setShowAdForm(true); }}
                            title="Edit Ad"
                          >
                            <Edit2 className="h-4 w-4 text-slate-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => confirmDelete(ad)}
                            title="Delete Ad"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CustomAdForm 
        isOpen={showAdForm}
        onClose={() => { setShowAdForm(false); setSelectedAd(null); }}
        ad={selectedAd}
        onSuccess={fetchData}
      />

      <DeleteConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setAdToDelete(null); }}
        onConfirm={executeDelete}
        loading={isDeleting}
        title="Delete Advertisement"
        description={`Are you sure you want to delete "${adToDelete?.title}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default AdsManagement;