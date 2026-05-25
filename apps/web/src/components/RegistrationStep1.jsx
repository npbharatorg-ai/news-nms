import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';

const parseFlexibleDate = (dateStr) => {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  
  // DD-MM-YYYY or DD/MM/YYYY
  let match = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (match) {
    let d = parseInt(match[1], 10);
    let m = parseInt(match[2], 10);
    let y = parseInt(match[3], 10);
    
    // Swap if MM-DD-YYYY
    if (m > 12 && d <= 12) {
      let temp = d; d = m; m = temp;
    }
    
    const dateObj = new Date(y, m - 1, d);
    if (dateObj.getFullYear() === y && dateObj.getMonth() === m - 1 && dateObj.getDate() === d) {
      return dateObj;
    }
  }
  
  // YYYY-MM-DD or YYYY/MM/DD
  match = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (match) {
    let y = parseInt(match[1], 10);
    let m = parseInt(match[2], 10);
    let d = parseInt(match[3], 10);
    const dateObj = new Date(y, m - 1, d);
    if (dateObj.getFullYear() === y && dateObj.getMonth() === m - 1 && dateObj.getDate() === d) {
      return dateObj;
    }
  }

  const fallback = new Date(trimmed);
  return isNaN(fallback.getTime()) ? null : fallback;
};

const formSchema = z.object({
  full_name: z.string().min(1, "Full Name is required").regex(/^[a-zA-Z\s]+$/, "Full Name must contain only text"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  phone_number: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  date_of_birth: z.string().min(1, "Date of Birth is required").refine((val) => parseFlexibleDate(val) !== null, "Please enter a valid date (e.g. DD-MM-YYYY)"),
  father_name: z.string().optional(),
  full_address: z.string().optional(),
  password: z.string().optional(),
});

const RegistrationStep1 = ({ data, onNext }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: data?.full_name || '',
      email: data?.email || '',
      phone_number: data?.phone_number || '',
      date_of_birth: data?.date_of_birth || '',
      father_name: data?.father_name || '',
      full_address: data?.full_address || '',
      password: data?.password || ''
    },
    mode: "onChange"
  });

  // Save to sessionStorage as user types
  useEffect(() => {
    const subscription = form.watch((value) => {
      sessionStorage.setItem('reporter_reg_step1', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Load from sessionStorage on mount if data not passed
  useEffect(() => {
    if (!data) {
      const saved = sessionStorage.getItem('reporter_reg_step1');
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.keys(parsed).forEach(key => {
          form.setValue(key, parsed[key]);
        });
      }
    }
  }, [data, form]);

  const onSubmit = async (values) => {
    setApiError(null);
    try {
      const dateObj = parseFlexibleDate(values.date_of_birth);
      // Convert to ISO string (YYYY-MM-DD)
      const isoDob = dateObj ? `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}` : values.date_of_birth;

      const payload = {
        name: values.full_name,
        email: values.email,
        phone: values.phone_number,
        dob: isoDob,
        father_name: values.father_name,
        address: values.full_address,
        password: values.password
      };

      const res = await apiServerClient.fetch('/registration/step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || result.message || 'Failed to proceed. Please check your information.');
      }
      
      toast.success('Personal details saved successfully');
      onNext(values, result.id);
      
    } catch (error) {
      console.error("Submission error:", error);
      setApiError(error.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2 mb-8">
        <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
          <span>Step 1 of 4</span>
          <span>25% Complete</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-500 w-[25%]" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mt-4">Personal Details</h2>
        <p className="text-muted-foreground">Provide your personal information to start your registration.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" onChange={() => setApiError(null)}>
          {apiError && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3 text-destructive">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{apiError}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} className="bg-background text-foreground" />
                  </FormControl>
                  <FormMessage className="text-destructive" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} className="bg-background text-foreground" />
                  </FormControl>
                  <FormMessage className="text-destructive" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="9876543210" maxLength={10} {...field} className="bg-background text-foreground" />
                  </FormControl>
                  <FormMessage className="text-destructive" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date_of_birth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input type="text" placeholder="DD-MM-YYYY or YYYY-MM-DD" {...field} className="bg-background text-foreground" />
                  </FormControl>
                  <FormMessage className="text-destructive" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="father_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Father's / Husband's Name <span className="text-muted-foreground font-normal ml-1">(Optional)</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} className="bg-background text-foreground" />
                  </FormControl>
                  <FormMessage className="text-destructive" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password <span className="text-muted-foreground font-normal ml-1">(Optional)</span></FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Leave empty to use passwordless auth" 
                        {...field} 
                        className="bg-background text-foreground pr-10"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-destructive" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="full_address"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Full Address <span className="text-muted-foreground font-normal ml-1">(Optional)</span></FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter your complete residential address" 
                      {...field}
                      className="min-h-[80px] bg-background text-foreground"
                    />
                  </FormControl>
                  <FormMessage className="text-destructive" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-border">
            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                'Next Step'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default RegistrationStep1;