import React from 'react';
import pb from '@/lib/pocketbaseClient.js';

const PressIDCard = ({ reporter }) => {
  if (!reporter) return null;

  const photoUrl = reporter.photo ? pb.files.getUrl(reporter, reporter.photo) : null;
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="w-[350px] h-[550px] bg-white rounded-xl shadow-2xl overflow-hidden relative border border-slate-200 flex flex-col font-sans mx-auto print:shadow-none print:border-none">
      
      {/* Top Red Stripe */}
      <div className="h-2 w-full bg-red-600"></div>
      
      {/* Header Section */}
      <div className="bg-[#0022B3] text-white text-center py-3 px-2 relative">
        <h1 className="text-xl font-extrabold tracking-wide leading-tight">NAVDHRITI MANAVADHIKAR</h1>
        <p className="text-[10px] font-medium tracking-widest mt-1 opacity-90">HEARD OFF:- JAIPUR RAJASTHAN</p>
      </div>

      {/* Bottom Blue Stripe (under header) */}
      <div className="h-1.5 w-full bg-red-600"></div>

      {/* Main Content Area */}
      <div className="flex-1 px-5 py-4 relative bg-white">
        
        {/* Background Watermark Logo (Optional, using a subtle circle) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <div className="w-48 h-48 rounded-full border-[10px] border-blue-900"></div>
        </div>

        {/* Photo Section */}
        <div className="flex justify-center mb-4 relative z-10">
          <div className="w-28 h-32 border-2 border-blue-900 p-1 bg-white shadow-sm">
            {photoUrl ? (
              <img src={photoUrl} alt="Reporter" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-xs text-slate-400 text-center">No Photo</div>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-2 text-[13px] relative z-10">
          <div className="flex border-b border-slate-100 pb-1">
            <span className="font-bold text-blue-900 w-24 shrink-0">ID No.</span>
            <span className="font-bold text-red-600">: {reporter.reporter_id || 'N/A'}</span>
          </div>
          
          <div className="flex border-b border-slate-100 pb-1">
            <span className="font-bold text-blue-900 w-24 shrink-0">Name</span>
            <span className="font-bold uppercase">: {reporter.name || 'N/A'}</span>
          </div>
          
          <div className="flex border-b border-slate-100 pb-1">
            <span className="font-bold text-blue-900 w-24 shrink-0">Designation</span>
            <span className="font-semibold uppercase">: {reporter.designation || 'To be assigned'}</span>
          </div>
          
          <div className="flex border-b border-slate-100 pb-1">
            <span className="font-bold text-blue-900 w-24 shrink-0">Working Area</span>
            <span className="font-semibold uppercase">: {reporter.working_area || 'To be assigned'}</span>
          </div>
          
          <div className="flex border-b border-slate-100 pb-1">
            <span className="font-bold text-blue-900 w-24 shrink-0">Father's Name</span>
            <span className="font-semibold uppercase">: {reporter.father_name || 'N/A'}</span>
          </div>
          
          <div className="flex border-b border-slate-100 pb-1">
            <span className="font-bold text-blue-900 w-24 shrink-0">Address</span>
            <span className="font-medium leading-tight line-clamp-2">: {reporter.address || 'N/A'}</span>
          </div>
          
          <div className="flex border-b border-slate-100 pb-1">
            <span className="font-bold text-blue-900 w-24 shrink-0">Mob. No.</span>
            <span className="font-bold">: {reporter.phone || 'N/A'}</span>
          </div>
          
          <div className="flex">
            <span className="font-bold text-blue-900 w-24 shrink-0">Valid up to</span>
            <span className="font-bold text-red-600">: {formatDate(reporter.expiry_date)}</span>
          </div>
        </div>

        {/* Stamp */}
        <div className="absolute bottom-6 right-4 w-16 h-16 border-2 border-blue-800 rounded-full flex items-center justify-center opacity-80 rotate-[-15deg] pointer-events-none z-0">
          <div className="text-center text-blue-800">
            <p className="text-[8px] font-bold leading-none">NMS</p>
            <p className="text-[10px] font-black leading-none">PRESS</p>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="bg-slate-100 px-4 py-2 text-center border-t border-slate-200">
        <p className="text-[9px] text-slate-600 leading-tight font-medium">
          यह कार्ड केवल समाचार संकलन के लिए है। इसका दुरुपयोग दंडनीय अपराध है।
        </p>
        <p className="text-[10px] font-bold text-blue-900 mt-1">
          HELPLINE NO. 9251120059
        </p>
      </div>

      {/* Bottom Red Stripe with PRESS text */}
      <div className="bg-red-600 text-white text-center py-1.5">
        <h2 className="text-xl font-black tracking-[0.3em]">PRESS</h2>
      </div>
    </div>
  );
};

export default PressIDCard;