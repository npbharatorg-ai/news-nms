import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ArrowLeft, CreditCard, RefreshCw, Download, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const PaymentDetailsPage = () => {
  const { currentUser, getReporterFromStorage } = useAuth();
  const navigate = useNavigate();
  
  const [reporter, setReporter] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    const userData = getReporterFromStorage() || currentUser;
    if (!userData?.id) {
      navigate('/reporter-login');
      return;
    }

    try {
      // Fetch latest reporter data to get current status
      const reporterData = await pb.collection('reporters').getOne(userData.id, { $autoCancel: false });
      setReporter(reporterData);

      // Fetch payment history, filtering out any legacy free plans
      const paymentsData = await pb.collection('payments').getList(1, 50, {
        filter: `reporter_id="${userData.id}" && plan_type="premium"`,
        sort: '-created',
        $autoCancel: false
      });
      setPayments(paymentsData.items);
    } catch (error) {
      console.error("Error fetching payment details:", error);
      toast.error("Failed to load payment details.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser, navigate]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'completed':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'rejected':
        return 'bg-red-500 hover:bg-red-600 text-white';
      case 'pending_approval':
      case 'pending':
        return 'bg-amber-500 hover:bg-amber-600 text-white';
      default:
        return 'bg-slate-500 hover:bg-slate-600 text-white';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'pending_approval':
      case 'pending':
        return <Clock className="w-5 h-5 text-amber-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Helmet>
        <title>Payment Details - Navdhriti Manawadhikar</title>
      </Helmet>
      
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" onClick={() => navigate('/reporter-dashboard')} className="gap-2 text-slate-500">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Button>
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh Status
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Current Status Card */}
            <Card className="md:col-span-1 shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" /> Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Current Plan</p>
                  <p className="text-xl font-bold capitalize">Premium</p>
                </div>
                
                <div>
                  <p className="text-sm text-slate-500 mb-2">Approval Status</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(reporter?.payment_status)}
                    <Badge className={getStatusColor(reporter?.payment_status)}>
                      {(reporter?.payment_status || 'Unknown').replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {reporter?.payment_status === 'pending_approval' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                    Your account is currently under review by our admin team. This usually takes 24-48 hours.
                  </div>
                )}

                {reporter?.payment_status === 'rejected' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                    Your application or payment was rejected. Please check the notes in your payment history below.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card className="md:col-span-2 shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-lg">Payment History</CardTitle>
                <CardDescription>Record of your Premium plan transactions.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {payments.length === 0 ? (
                  <div className="p-8 text-center text-slate-500">
                    No payment records found.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Receipt</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <React.Fragment key={payment.id}>
                          <TableRow>
                            <TableCell className="font-medium">
                              {new Date(payment.created).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="capitalize">{payment.payment_method}</TableCell>
                            <TableCell>
                              ₹{payment.payment_amount || 999}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={
                                payment.payment_status === 'completed' ? 'border-green-500 text-green-600' :
                                payment.payment_status === 'rejected' ? 'border-red-500 text-red-600' :
                                'border-amber-500 text-amber-600'
                              }>
                                {payment.payment_status.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {payment.payment_status === 'completed' && (
                                <Button variant="ghost" size="sm" className="h-8 text-primary" onClick={() => toast.info("Receipt download coming soon")}>
                                  <Download className="h-4 w-4 mr-1" /> PDF
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                          {payment.admin_notes && (
                            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                              <TableCell colSpan={5} className="py-2 px-4 text-sm text-slate-600 border-l-2 border-l-primary">
                                <span className="font-semibold mr-2">Admin Note:</span>
                                {payment.admin_notes}
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentDetailsPage;