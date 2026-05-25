import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { ShieldAlert } from 'lucide-react';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const from = location.state?.from?.pathname || "/admin";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await adminLogin(formData.email, formData.password);
      toast.success("Admin logged in successfully");
      navigate(from, { replace: true });
    } catch (error) {
      console.error(error);
      toast.error("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Admin Login - Navdhriti Manawadhikar</title>
      </Helmet>
      
      <Card className="w-full max-w-md shadow-2xl border-slate-800 bg-slate-900 text-slate-100">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="https://horizons-cdn.hostinger.com/7a26f45c-f82c-40d2-8cdd-8c9eef29992b/20be51816882891787f931475df292ab.jpg" 
              alt="Navdhriti Manavadhikar Foundation" 
              className="h-20 w-20 rounded-xl object-cover shadow-lg border-2 border-slate-700"
            />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">Admin Portal</CardTitle>
          <CardDescription className="text-slate-400">
            Restricted access. Authorized personnel only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Admin Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                required 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="admin@navdhriti.com"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
                value={formData.password} 
                onChange={handleChange}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90 text-white mt-4" disabled={isLoading}>
              {isLoading ? "Authenticating..." : "Secure Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginPage;