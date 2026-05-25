import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import pb from '@/lib/pocketbaseClient';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { toast } from 'sonner';

const SubmissionsTable = ({ refreshTrigger }) => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const fetchSubmissions = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const records = await pb.collection('news_submissions').getList(1, 50, {
        filter: `reporter_id = "${user.id}"`,
        sort: '-created',
        $autoCancel: false
      });
      
      // Validate returned data
      if (records && Array.isArray(records.items)) {
        setSubmissions(records.items);
      } else {
        setSubmissions([]);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error("Failed to load submissions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [user?.id, refreshTrigger]);

  const handleDelete = async (id) => {
    if (!id || typeof id !== 'string') return;
    
    if (window.confirm("Are you sure you want to delete this submission?")) {
      try {
        await pb.collection('news_submissions').delete(id, { $autoCancel: false });
        toast.success("Submission deleted");
        fetchSubmissions();
      } catch (error) {
        console.error('Error deleting submission:', error);
        toast.error("Failed to delete submission");
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white">Pending</Badge>;
    }
  };

  if (isLoading) return <div className="py-8 text-center text-muted-foreground">Loading submissions...</div>;

  // Validate image URL string
  const isValidImage = selectedArticle?.image && typeof selectedArticle.image === 'string';

  return (
    <div>
      {submissions.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
          <p className="text-muted-foreground">You haven't submitted any news yet.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Headline</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium max-w-[300px] truncate" title={sub.headline}>
                    {sub.headline || 'Untitled'}
                  </TableCell>
                  <TableCell>{sub.category || '-'}</TableCell>
                  <TableCell>{sub.created ? new Date(sub.created).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>{getStatusBadge(sub.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => { setSelectedArticle(sub); setIsViewModalOpen(true); }}
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {sub.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="icon" title="Edit" onClick={() => toast.info("Edit feature coming soon")}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(sub.id)} title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedArticle?.headline || 'Untitled'}</DialogTitle>
            <DialogDescription>
              Submitted on {selectedArticle?.created ? new Date(selectedArticle.created).toLocaleDateString() : 'Unknown date'} • {selectedArticle?.category || 'Uncategorized'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedArticle && (
            <div className="mt-4 space-y-6">
              {isValidImage && (
                <img 
                  src={pb.files.getUrl(selectedArticle, selectedArticle.image)} 
                  alt="Article" 
                  className="w-full h-64 object-cover rounded-lg"
                />
              )}
              
              <div>
                <h4 className="font-semibold mb-2">Excerpt</h4>
                <p className="text-muted-foreground italic border-l-4 border-primary pl-4 py-1">
                  {selectedArticle.excerpt || 'No excerpt provided.'}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Content</h4>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {selectedArticle.content || 'No content provided.'}
                </div>
              </div>

              {selectedArticle.admin_notes && (
                <div className="bg-muted p-4 rounded-lg mt-6">
                  <h4 className="font-semibold text-sm mb-1">Admin Notes:</h4>
                  <p className="text-sm">{selectedArticle.admin_notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubmissionsTable;