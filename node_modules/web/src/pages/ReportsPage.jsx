import React, { useState } from 'react';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { FileText, Download, Printer, Filter, Share2, Wallet, Users } from 'lucide-react';
import { toast } from 'sonner';

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const handleExport = (format) => {
    toast.success(`Report generated and downloading as ${format}...`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">Reporting Center</h1>
            <p className="text-muted-foreground mt-1">Generate, view, and export detailed system reports.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-2 rounded-xl border shadow-sm">
            <div className="flex items-center gap-2">
              <Input type="date" className="h-9 text-sm" value={dateRange.start} onChange={e => setDateRange(prev => ({...prev, start: e.target.value}))} />
              <span className="text-muted-foreground">to</span>
              <Input type="date" className="h-9 text-sm" value={dateRange.end} onChange={e => setDateRange(prev => ({...prev, end: e.target.value}))} />
            </div>
            <Button variant="secondary" size="sm" className="h-9"><Filter className="w-4 h-4" /></Button>
          </div>
        </div>

        <Tabs defaultValue="social" className="w-full">
          <TabsList className="mb-6 bg-white border shadow-sm p-1 h-auto flex-wrap">
            <TabsTrigger value="social" className="py-2.5 px-6 gap-2"><Share2 className="w-4 h-4" /> Social Media Report</TabsTrigger>
            <TabsTrigger value="wallet" className="py-2.5 px-6 gap-2"><Wallet className="w-4 h-4" /> Wallet & Payouts</TabsTrigger>
            <TabsTrigger value="users" className="py-2.5 px-6 gap-2"><Users className="w-4 h-4" /> User Performance</TabsTrigger>
          </TabsList>

          {['social', 'wallet', 'users'].map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue} className="animate-slide-up outline-none">
              <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white">
                <div className="bg-slate-900 text-white p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <FileText className="w-6 h-6 text-blue-400" />
                      {tabValue === 'social' ? 'Social Media Operations Report' : tabValue === 'wallet' ? 'Financial & Payout Report' : 'Reporter Performance Report'}
                    </h2>
                    <p className="text-slate-300 mt-1 text-sm">
                      {dateRange.start && dateRange.end ? `Period: ${dateRange.start} to ${dateRange.end}` : 'Period: All Time (Select dates above to filter)'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleExport('PDF')} className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white">
                      <Printer className="w-4 h-4 mr-2" /> PDF
                    </Button>
                    <Button variant="outline" onClick={() => handleExport('CSV')} className="bg-white text-slate-900 hover:bg-slate-100">
                      <Download className="w-4 h-4 mr-2" /> CSV
                    </Button>
                  </div>
                </div>
                <CardContent className="p-8 md:p-12 text-center min-h-[400px] flex flex-col items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                  <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl border shadow-lg max-w-md w-full">
                    <FileText className="w-16 h-16 mx-auto text-primary/40 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Report Ready for Generation</h3>
                    <p className="text-muted-foreground mb-6">The data has been compiled based on your selected parameters. Click below to download the full detailed report.</p>
                    <Button size="lg" className="w-full gap-2" onClick={() => handleExport('Excel')}>
                      <Download className="w-5 h-5" /> Download Full Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default ReportsPage;