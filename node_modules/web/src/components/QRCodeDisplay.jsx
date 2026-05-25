import React from 'react';
import { Download, QrCode } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const QRCodeDisplay = ({ qrCodeUrl, upiId }) => {
  const handleDownload = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'payment-qr-code.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      // Fallback for cross-origin issues
      window.open(qrCodeUrl, '_blank');
    }
  };

  return (
    <Card className="shadow-md border-slate-200 h-full flex flex-col">
      <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <QrCode className="h-5 w-5 text-primary" /> Scan to Pay
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 flex-1 flex flex-col items-center justify-center">
        <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-slate-200 mb-6">
          <img 
            src={qrCodeUrl} 
            alt="Payment QR Code" 
            className="w-48 h-48 object-contain rounded-lg"
          />
        </div>
        
        {upiId && (
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-1">UPI ID</p>
            <p className="font-mono font-medium bg-slate-100 px-4 py-1.5 rounded-full text-slate-800">
              {upiId}
            </p>
          </div>
        )}

        <Button 
          variant="outline" 
          onClick={handleDownload}
          className="w-full gap-2 mt-auto"
        >
          <Download className="h-4 w-4" /> Download QR Code
        </Button>
      </CardContent>
    </Card>
  );
};

export default QRCodeDisplay;