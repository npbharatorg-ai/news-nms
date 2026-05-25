import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const RegistrationFormStep1 = ({ formData, setFormData, onNext }) => {
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const calculateAge = (dobString) => {
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name || formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters long.";
    }
    
    const phoneRegex = /^\d{10}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits.";
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    }

    if (!formData.dob) {
      newErrors.dob = "Date of birth is required.";
    } else if (calculateAge(formData.dob) < 18) {
      newErrors.dob = "You must be at least 18 years old to register.";
    }

    if (!formData.father_name?.trim()) {
      newErrors.father_name = "Father's Name is required.";
    }

    if (!formData.address?.trim()) {
      newErrors.address = "Address is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input 
            id="name" 
            name="name" 
            value={formData.name || ''} 
            onChange={handleChange} 
            placeholder="e.g. Rajesh Kumar" 
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          <p className="text-xs text-muted-foreground">Enter your full legal name as per Aadhar.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input 
              id="phone" 
              name="phone" 
              value={formData.phone || ''} 
              onChange={handleChange} 
              placeholder="10-digit mobile number" 
              maxLength={10}
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input 
              id="dob" 
              name="dob" 
              type="date" 
              value={formData.dob || ''} 
              onChange={handleChange} 
              className={errors.dob ? "border-destructive" : ""}
            />
            {errors.dob && <p className="text-sm text-destructive">{errors.dob}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="father_name">Father's Name</Label>
          <Input 
            id="father_name" 
            name="father_name" 
            value={formData.father_name || ''} 
            onChange={handleChange} 
            placeholder="Enter father's full name" 
            className={errors.father_name ? "border-destructive" : ""}
          />
          {errors.father_name && <p className="text-sm text-destructive">{errors.father_name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Full Address</Label>
          <Textarea 
            id="address" 
            name="address" 
            value={formData.address || ''} 
            onChange={handleChange} 
            placeholder="Enter your complete residential address" 
            rows={3}
            className={errors.address ? "border-destructive" : ""}
          />
          {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            value={formData.email || ''} 
            onChange={handleChange} 
            placeholder="your.email@example.com" 
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            name="password" 
            type="password" 
            value={formData.password || ''} 
            onChange={handleChange} 
            placeholder="Create a strong password" 
            className={errors.password ? "border-destructive" : ""}
          />
          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          <p className="text-xs text-muted-foreground">Minimum 8 characters required.</p>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleNext} className="gap-2">
          Next Step <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default RegistrationFormStep1;