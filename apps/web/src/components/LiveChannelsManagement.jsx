import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import pb from '@/lib/pocketbaseClient.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Plus, Edit2, Trash2, Radio, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog.jsx';

const formSchema = z.object({
  channel_name: z.string().min(2, 'Channel name is required'),
  platform: z.enum(['YouTube', 'Twitch', 'Facebook', 'Custom']),
  stream_url: z.string().url('Must be a valid URL'),
  description: z.string().optional(),
  is_active: z.boolean().default(false),
});

const LiveChannelsManagement = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      channel_name: '',
      platform: 'YouTube',
      stream_url: '',
      description: '',
      is_active: false,
    },
  });

  const fetchChannels = useCallback(async () => {
    setLoading(true);
    try {
      const records = await pb.collection('live_channels').getList(1, 100, {
        sort: '-created',
        $autoCancel: false
      });
      setChannels(records.items);
    } catch (error) {
      console.error('Error fetching live channels:', error);
      toast.error('Failed to load live channels');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const handleOpenModal = (channel = null) => {
    setEditingChannel(channel);
    setThumbnailFile(null);
    if (channel) {
      form.reset({
        channel_name: channel.channel_name,
        platform: channel.platform,
        stream_url: channel.stream_url,
        description: channel.description || '',
        is_active: channel.is_active,
      });
    } else {
      form.reset({
        channel_name: '',
        platform: 'YouTube',
        stream_url: '',
        description: '',
        is_active: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error('File size must be less than 20MB');
        e.target.value = '';
        return;
      }
      setThumbnailFile(file);
    }
  };

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('channel_name', values.channel_name);
      formData.append('platform', values.platform);
      formData.append('stream_url', values.stream_url);
      formData.append('description', values.description || '');
      formData.append('is_active', values.is_active);
      
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      if (editingChannel) {
        await pb.collection('live_channels').update(editingChannel.id, formData, { $autoCancel: false });
        toast.success('Channel updated successfully');
      } else {
        await pb.collection('live_channels').create(formData, { $autoCancel: false });
        toast.success('Channel created successfully');
      }
      
      setIsModalOpen(false);
      fetchChannels();
    } catch (error) {
      console.error('Error saving channel:', error);
      toast.error('Failed to save channel');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id, currentValue) => {
    try {
      await pb.collection('live_channels').update(id, { is_active: !currentValue }, { $autoCancel: false });
      toast.success(`Channel ${!currentValue ? 'activated' : 'deactivated'}`);
      fetchChannels();
    } catch (error) {
      console.error('Error toggling channel status:', error);
      toast.error('Failed to update status');
    }
  };

  const confirmDelete = (id) => {
    setDeleteTarget(id);
    setShowDeleteConfirm(true);
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await pb.collection('live_channels').delete(deleteTarget, { $autoCancel: false });
      toast.success('Channel deleted successfully');
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      fetchChannels();
    } catch (error) {
      console.error('Error deleting channel:', error);
      toast.error('Failed to delete channel');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'YouTube': return 'bg-[hsl(var(--platform-youtube))] text-white hover:bg-[hsl(var(--platform-youtube))/90]';
      case 'Twitch': return 'bg-[hsl(var(--platform-twitch))] text-white hover:bg-[hsl(var(--platform-twitch))/90]';
      case 'Facebook': return 'bg-[hsl(var(--platform-facebook))] text-white hover:bg-[hsl(var(--platform-facebook))/90]';
      default: return 'bg-slate-800 text-white hover:bg-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Live Channels</h3>
          <p className="text-sm text-muted-foreground">Manage live streaming channels and broadcasts.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="w-4 h-4" /> Add Channel
        </Button>
      </div>

      <div className="rounded-md border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[100px]">Thumbnail</TableHead>
              <TableHead>Channel Info</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-12 w-16 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[200px] mb-2" /><Skeleton className="h-3 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-12 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : channels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  <Radio className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  No live channels found. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              channels.map((channel) => (
                <TableRow key={channel.id}>
                  <TableCell>
                    <div className="w-16 h-12 rounded overflow-hidden bg-muted border flex items-center justify-center">
                      {channel.thumbnail ? (
                        <img 
                          src={pb.files.getUrl(channel, channel.thumbnail)} 
                          alt={channel.channel_name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{channel.channel_name}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[250px]" title={channel.stream_url}>
                      {channel.stream_url}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`border-transparent ${getPlatformColor(channel.platform)}`}>
                      {channel.platform}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={channel.is_active} 
                        onCheckedChange={() => handleToggleActive(channel.id, channel.is_active)}
                      />
                      <span className={`text-xs font-medium ${channel.is_active ? 'text-[hsl(var(--live-indicator))]' : 'text-muted-foreground'}`}>
                        {channel.is_active ? 'LIVE' : 'OFFLINE'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(channel)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => confirmDelete(channel.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingChannel ? 'Edit Live Channel' : 'Add Live Channel'}</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="channel_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Navdhriti News Live" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Platform</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select platform" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="YouTube">YouTube</SelectItem>
                          <SelectItem value="Twitch">Twitch</SelectItem>
                          <SelectItem value="Facebook">Facebook</SelectItem>
                          <SelectItem value="Custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-6">
                      <div className="space-y-0.5">
                        <FormLabel>Active Status</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="stream_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stream URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.youtube.com/watch?v=..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brief description of the broadcast..." className="resize-none" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Thumbnail Image (Optional)</FormLabel>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                  {thumbnailFile ? (
                    <p className="text-sm font-medium text-primary truncate px-4">{thumbnailFile.name}</p>
                  ) : editingChannel?.thumbnail ? (
                    <p className="text-sm text-slate-500">Click to replace current thumbnail</p>
                  ) : (
                    <p className="text-sm text-slate-500">Click to upload thumbnail</p>
                  )}
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingChannel ? 'Update Channel' : 'Add Channel'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => { setShowDeleteConfirm(false); setDeleteTarget(null); }}
        onConfirm={executeDelete}
        loading={isSubmitting}
        title="Delete Live Channel"
        description="Are you sure you want to delete this live channel? This action cannot be undone."
      />
    </div>
  );
};

export default LiveChannelsManagement;