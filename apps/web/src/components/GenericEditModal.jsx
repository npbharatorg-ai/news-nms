import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import pb from '@/lib/pocketbaseClient.js';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const GenericEditModal = ({ isOpen, onClose, item, collectionName, fields, onSuccess, title }) => {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: {}
  });

  useEffect(() => {
    if (isOpen) {
      if (item) {
        form.reset(item);
      } else {
        const initial = {};
        fields.forEach(f => {
          initial[f.name] = f.type === 'number' ? 0 : '';
        });
        form.reset(initial);
      }
    }
  }, [isOpen, item, fields, form]);

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const submitData = { ...values };
      fields.forEach(f => {
        if (f.type === 'number') {
          submitData[f.name] = Number(submitData[f.name]) || 0;
        }
      });

      if (item?.id) {
        await pb.collection(collectionName).update(item.id, submitData, { $autoCancel: false });
        toast.success('Record updated successfully');
      } else {
        await pb.collection(collectionName).create(submitData, { $autoCancel: false });
        toast.success('Record created successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? `Edit ${title}` : `Add New ${title}`}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            {fields.map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>{field.label}</FormLabel>
                    <FormControl>
                      {field.type === 'select' ? (
                        <Select 
                          value={formField.value || ''} 
                          onValueChange={formField.onChange}
                        >
                          <SelectTrigger className="bg-background text-foreground">
                            <SelectValue placeholder={`Select ${field.label}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options.map(opt => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type={field.type === 'number' ? 'number' : 'text'}
                          step={field.type === 'number' ? 'any' : undefined}
                          className="bg-background text-foreground"
                          {...formField}
                        />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {item ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default GenericEditModal;