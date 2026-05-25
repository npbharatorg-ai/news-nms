import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, ExternalLink, User, Mail, Phone, Calendar } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';

const PaymentApprovalModal = ({ isOpen, onClose, payment, reporter, onApprove, onReject, isSubmitting }) => {
  if (!payment || !reporter) return null;

  const proofUrl = payment.payment_proof ? pb.files.getUrl(payment, payment.payment_proof) : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Review Offline Payment</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          {/* Reporter Details */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Reporter Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-slate-400" />
                <span className="font-medium">{reporter.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-slate-400" />
                <span>{reporter.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-slate-400" />
                <span>{reporter.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>Submitted: {new Date(payment.created).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/10">
            <div>
              <p className="text-sm text-slate-500 font-medium">Amount</p>
              <p className="text-2xl font-bold text-primary">₹{payment.payment_amount || 5000}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 font-medium mb-1">Status</p>
              <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">
                {payment.approval_status?.toUpperCase() || 'PENDING'}
              </Badge>
            </div>
          </div>

          {/* Proof Image */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Payment Proof</h4>
              {proofUrl && (
                <a href={proofUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                  Open full size <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            
            <div className="bg-slate-100 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center min-h-[200px]">
              {proofUrl ? (
                <img 
                  src={proofUrl} 
                  alt="Payment Proof" 
                  className="max-w-full max-h-[400px] object-contain"
                />
              ) : (
                <p className="text-muted-foreground text-sm">No proof image uploaded</p>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
            onClick={onReject}
            disabled={isSubmitting}
          >
            <XCircle className="h-4 w-4 mr-2" /> Reject Payment
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={onApprove}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
            Approve & Activate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentApprovalModal;