import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import pb from '@/lib/pocketbaseClient';
const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const handleChange = e => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await pb.collection('contact_submissions').create({
        ...formData,
        status: 'new'
      }, {
        $autoCancel: false
      });
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error("Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Maya Chen" className={errors.name ? "border-destructive" : ""} />
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="maya@example.com" className={errors.email ? "border-destructive" : ""} />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="subject">Subject <span className="text-destructive">*</span></Label>
          <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} placeholder="How can we help you?" className={errors.subject ? "border-destructive" : ""} />
          {errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message <span className="text-destructive">*</span></Label>
        <Textarea id="message" name="message" rows={6} value={formData.message} onChange={handleChange} placeholder="Write your message here..." className={`resize-none ${errors.message ? "border-destructive" : ""}`} />
        {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
      </div>

      <Button type="submit" className="w-full md:w-auto px-8 h-12 text-base gap-2" disabled={isSubmitting}>
        {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</> : <><Send className="w-5 h-5" /> Send Message</>}
      </Button>
    </form>;
};
export default ContactForm;