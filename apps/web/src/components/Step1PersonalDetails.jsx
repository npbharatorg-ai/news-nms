import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Eye, EyeOff, Loader2, AlertCircle, Check, X } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';

const parseFlexibleDate = (dateStr) => {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  
  if (/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.test(trimmed)) {
    const parts = trimmed.split(/[-/.]/);
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    if (d.getFullYear() === year && d.getMonth() === month && d.getDate() === day) {
      return d;
    }
    return null;
  }
  
  if (/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.test(trimmed)) {
    const parts = trimmed.split(/[-/.]/);
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    if (d.getFullYear() === year && d.getMonth() === month && d.getDate() === day) {
      return d;
    }
    return null;
  }

  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? null : d;
};

const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required").regex(/^[a-zA-Z\s]+$/, "Full name must contain only text"),
  phoneNumber: z.string().min(1, "Phone number is required").regex(/^[0-9]{10}$/, "Phone number must be 10 digits"),
  dateOfBirth: z.string().min(1, "Date of birth is required").refine((val) => {
    return parseFlexibleDate(val) !== null;
  }, "Please enter a valid date"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email"),
  fatherName: z.string().optional(),
  fullAddress: z.string().optional(),
  password: z.string().optional(),
  passwordConfirm: z.string().optional()
}).refine((data) => {
  if (data.password && data.password.length > 0 && data.password.length < 6) return false;
  return true;
}, {
  message: "Password must be at least 6 characters",
  path: ["password"]
}).refine((data) => {
  if (data.password && data.password !== data.passwordConfirm) return false;
  return true;
}, {
  message: "Passwords do not match",
  path: ["passwordConfirm"]
});

const Step1PersonalDetails = ({ onNext, initialData }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: initialData?.fullName || '',
      phoneNumber: initialData?.phoneNumber || '',
      dateOfBirth: initialData?.dateOfBirth || '',
      email: initialData?.email || '',
      fatherName: initialData?.fatherName || '',
      fullAddress: initialData?.fullAddress || '',
      password: initialData?.password || '',
      passwordConfirm: initialData?.passwordConfirm || ''
    },
    mode: "onChange"
  });

  const passwordValue = form.watch("password") || "";

  const getPasswordStrength = (pw) => {
    if (!pw) return { strength: 0, requirements: {} };
    const requirements = {
      length: pw.length >= 6,
      uppercase: /[A-Z]/.test(pw),
      number: /[0-9]/.test(pw),
      special: /[^A-Za-z0-9]/.test(pw)
    };
    
    let strength = 0;
    if (requirements.length) strength++;
    if (requirements.uppercase) strength++;
    if (requirements.number) strength++;
    if (requirements.special) strength++;
    
    return { strength, requirements };
  };

  const { strength, requirements } = getPasswordStrength(passwordValue);

  const onSubmit = async (values) => {
    setApiError(null);
    try {
      const payload = {
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        dateOfBirth: values.dateOfBirth,
        email: values.email
      };

      if (values.fatherName) payload.fatherName = values.fatherName;
      if (values.fullAddress) payload.fullAddress = values.fullAddress;
      if (values.password) payload.password = values.password;

      const res = await apiServerClient.fetch('/new-registration/step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.details) {
          Object.keys(result.details).forEach(key => {
            form.setError(key, { type: 'server', message: result.details[key] });
          });
          throw new Error('Field validation failed');
        }
        throw new Error(result.message || result.error || 'Failed to save personal details');
      }
      
      onNext({ ...values, registrationId: result.registrationId });
      
    } catch (error) {
      console.error("Submission error:", error);
      if (error.message !== 'Field validation failed') {
        setApiError(error.message);
      }
    }
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit)} 
        className="space-y-6 animate-fade-in"
        onChange={() => setApiError(null)}
      >
        {apiError && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3 text-destructive">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{apiError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} className="form-input" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="9876543210" maxLength={10} {...field} className="form-input" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input type="text" placeholder="DD-MM-YYYY or YYYY-MM-DD" {...field} className="form-input" />
                </FormControl>
                <FormDescription>Any valid format (e.g. 15-03-1990)</FormDescription>
                <FormMessage />
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
                  <Input type="email" placeholder="john@example.com" {...field} className="form-input" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fatherName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Father's / Husband's Name <span className="text-muted-foreground font-normal ml-1">(Optional)</span></FormLabel>
                <FormControl>
                  <Input placeholder="Enter name" {...field} className="form-input" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fullAddress"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Full Address <span className="text-muted-foreground font-normal ml-1">(Optional)</span></FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter your complete residential address" 
                    {...field}
                    className="min-h-[80px] form-input"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="space-y-4 md:col-span-2 p-5 bg-muted/30 rounded-xl border border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
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
                          placeholder="Leave empty to skip" 
                          {...field} 
                          className="form-input pr-10"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                    
                    {passwordValue && passwordValue.length > 0 && (
                      <div className="pt-2 space-y-2">
                        <div className="flex gap-1 h-1.5">
                          {[1, 2, 3, 4].map((level) => (
                            <div 
                              key={level} 
                              className={`flex-1 rounded-full transition-colors duration-300 ${
                                strength >= level ? 'bg-primary' : 'bg-muted'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="passwordConfirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password <span className="text-muted-foreground font-normal ml-1">(Optional)</span></FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showConfirmPassword ? "text" : "password"} 
                          placeholder="Re-type password if set" 
                          {...field} 
                          className="form-input pr-10"
                          disabled={!passwordValue}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          disabled={!passwordValue}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>

            {passwordValue && passwordValue.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm pt-2">
                <div className={`flex items-center gap-2 ${requirements.length ? 'text-primary' : 'text-muted-foreground'}`}>
                  {requirements.length ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  <span>At least 6 characters</span>
                </div>
                <div className={`flex items-center gap-2 ${requirements.uppercase ? 'text-primary' : 'text-muted-foreground'}`}>
                  {requirements.uppercase ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  <span>At least 1 uppercase letter</span>
                </div>
                <div className={`flex items-center gap-2 ${requirements.number ? 'text-primary' : 'text-muted-foreground'}`}>
                  {requirements.number ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  <span>At least 1 number</span>
                </div>
                <div className={`flex items-center gap-2 ${requirements.special ? 'text-primary' : 'text-muted-foreground'}`}>
                  {requirements.special ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  <span>At least 1 special character</span>
                </div>
              </div>
            )}
          </div>

        </div>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            size="lg" 
            className="w-full sm:w-auto"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Continue to Documents'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default Step1PersonalDetails;