import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient.js';

const EditReporterModal = ({ isOpen, onClose, reporter, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      dob: '',
      father_name: '',
      address: '',
      designation: '',
      working_area: ''
    }
  });

  useEffect(() => {
    if (reporter && isOpen) {
      form.reset({
        name: reporter.name || '',
        email: reporter.email || '',
        phone: reporter.phone || '',
        dob: reporter.dob ? reporter.dob.split('T')[0] : '',
        father_name: reporter.father_name || '',
        address: reporter.address || '',
        designation: reporter.designation || '',
        working_area: reporter.working_area || ''
      });
    }
  }, [reporter, isOpen, form]);

  const onSubmit = async (values) => {
    if (!reporter) return;
    
    setLoading(true);
    try {
      await pb.collection('reporters').update(reporter.id, values, { $autoCancel: false });
      toast.success('Reporter details updated successfully');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to update reporter:', error);
      toast.error(error.message || 'Failed to update reporter details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Reporter Details</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-900 border-b pb-2">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="father_name"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Father's Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-900 border-b pb-2">Admin Assignments</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <FormField
                  control={form.control}
                  name="designation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designation</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Senior Reporter" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="working_area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Working Area</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Jaipur District" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-brand-blue hover:bg-brand-blue/90 text-white">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditReporterModal;