import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import PopUpAdForm from './PopUpAdForm.jsx';
import DeleteConfirmationDialog from './DeleteConfirmationDialog.jsx';

const PopUpAdsManagement = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const records = await pb.collection('pop_up_ads').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      setAds(records);
    } catch (error) {
      console.error('Error fetching pop-up ads:', error);
      toast.error('Failed to load pop-up ads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleCreateNew = () => {
    setSelectedAd(null);
    setIsFormOpen(true);
  };

  const handleEdit = (ad) => {
    setSelectedAd(ad);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await pb.collection('pop_up_ads').delete(deleteTarget.id, { $autoCancel: false });
      toast.success('Pop-up ad deleted successfully');
      setDeleteTarget(null);
      fetchAds();
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast.error('Failed to delete pop-up ad');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    fetchAds();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Pop-up Ads</h3>
          <p className="text-sm text-muted-foreground">Manage promotional pop-ups shown to visitors.</p>
        </div>
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus className="w-4 h-4" /> Create New Ad
        </Button>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : ads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No pop-up ads found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              ads.map((ad) => {
                const imageUrl = ad.image ? pb.files.getUrl(ad, ad.image) : null;
                const isCurrentlyActive = ad.active && 
                  new Date() >= new Date(ad.start_date) && 
                  new Date() <= new Date(new Date(ad.end_date).setHours(23, 59, 59));

                return (
                  <TableRow key={ad.id}>
                    <TableCell>
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex items-center justify-center border">
                        {imageUrl ? (
                          <img src={imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{ad.title}</TableCell>
                    <TableCell>
                      <Badge variant={isCurrentlyActive ? 'default' : 'secondary'} className={isCurrentlyActive ? 'bg-green-600 hover:bg-green-700' : ''}>
                        {isCurrentlyActive ? 'Active Now' : ad.active ? 'Scheduled' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(ad.start_date).toLocaleDateString()} - {new Date(ad.end_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm capitalize">
                      {ad.display_frequency.replace(/_/g, ' ')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(ad)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteTarget(ad)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedAd ? 'Edit Pop-up Ad' : 'Create New Pop-up Ad'}</DialogTitle>
          </DialogHeader>
          <PopUpAdForm 
            ad={selectedAd} 
            onSuccess={handleFormSuccess} 
            onCancel={() => setIsFormOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={isDeleting}
        title="Delete Pop-up Ad"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default PopUpAdsManagement;