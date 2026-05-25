import React from 'react';
import { Copy, Building } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const BankDetailsCard = ({ details, amount }) => {
  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <Card className="shadow-md border-slate-200 h-full">
      <CardHeader className="bg-slate-50 border-b border-slate-100">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Building className="h-5 w-5 text-primary" /> Bank Transfer Details
        </CardTitle>
        <CardDescription>
          Transfer <span className="font-bold text-foreground">₹{amount}</span> to the account below.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {details.map((detail, index) => (
          <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-medium">{detail.label}</p>
              <p className="font-medium text-slate-900 mt-0.5">{detail.value}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleCopy(detail.value, detail.label)}
              className="text-slate-400 hover:text-primary hover:bg-primary/10"
              title={`Copy ${detail.label}`}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default BankDetailsCard;