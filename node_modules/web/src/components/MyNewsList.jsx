import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Loader2, Search, Edit, Trash2, Eye, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';
import NewsDetailsView from './NewsDetailsView.jsx';

const MyNewsList = ({ onEditItem }) => {
  const { currentUser } = useAuth();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal
  const [selectedNews, setSelectedNews] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchNews = async () => {
    if (!currentUser) return;
    setLoading(true);
    
    try {
      let filterStr = `reporter_id = "${currentUser.id}"`;
      
      if (statusFilter !== 'all') {
        filterStr += ` && status = "${statusFilter}"`;
      }
      
      if (search) {
        filterStr += ` && title ~ "${search}"`;
      }

      const result = await pb.collection('reporter_news').getList(page, 10, {
        filter: filterStr,
        sort: '-created_at',
        $autoCancel: false
      });
      
      setNews(result.items);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Failed to fetch news:', error);
      toast.error('Failed to load news list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, currentUser]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchNews();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await pb.collection('reporter_news').delete(id, { $autoCancel: false });
      toast.success('News deleted successfully');
      fetchNews();
    } catch (error) {
      console.error('Failed to delete news:', error);
      toast.error('Failed to delete news');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <Badge className="bg-emerald-500 hover:bg-emerald-600">Approved</Badge>;
      case 'pending_approval': return <Badge className="bg-amber-500 hover:bg-amber-600 text-white">Pending</Badge>;
      case 'rejected': return <Badge variant="destructive">Rejected</Badge>;
      case 'draft': return <Badge variant="secondary" className="bg-slate-200 text-slate-700 hover:bg-slate-300">Draft</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
          <CardTitle className="text-xl">My Submissions</CardTitle>
          
          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search titles..." 
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_approval">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" variant="secondary">Search</Button>
          </form>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : news.length === 0 ? (
          <div className="py-12 text-center bg-muted/30 rounded-lg border border-dashed">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No news submissions found</p>
            <p className="text-sm text-muted-foreground/80 mt-1">Adjust your filters or upload a new story.</p>
          </div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead className="min-w-[200px]">Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {news.map((item) => (
                  <TableRow key={item.id} className="group hover:bg-muted/30 transition-colors">
                    <TableCell>
                      {item.image ? (
                        <img 
                          src={pb.files.getUrl(item, item.image, { thumb: '100x100' })} 
                          alt="Thumbnail" 
                          className="w-12 h-12 rounded object-cover border"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center border text-xs text-muted-foreground">
                          None
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="line-clamp-2 leading-tight">{item.title}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">{item.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        {getStatusBadge(item.status)}
                        {item.status === 'approved' && item.earnings > 0 && (
                          <span className="text-xs font-semibold text-emerald-600 flex items-center">
                            <IndianRupee className="w-3 h-3" />{item.earnings}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(item.created_at || item.created).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-primary"
                          onClick={() => { setSelectedNews(item); setIsDetailsOpen(true); }}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {(item.status === 'draft' || item.status === 'rejected') && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-amber-600"
                              onClick={() => onEditItem(item)}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive"
                              onClick={() => handleDelete(item.id)}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
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

        {totalPages > 1 && (
          <div className="mt-4 flex justify-end">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="text-sm font-medium px-4">Page {page} of {totalPages}</span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} 
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>

      {/* Details Modal */}
      <NewsDetailsView 
        news={selectedNews} 
        isOpen={isDetailsOpen} 
        onClose={() => setIsDetailsOpen(false)}
        onRefresh={fetchNews}
        onEdit={(item) => {
          setIsDetailsOpen(false);
          onEditItem(item);
        }}
      />
    </Card>
  );
};

export default MyNewsList;