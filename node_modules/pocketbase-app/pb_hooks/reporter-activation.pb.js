/// <reference path="../pb_data/types.d.ts" />
onRecordUpdate((e) => {
  const newStatus = e.record.get("status");
  
  // Check if status is being set to 'ACTIVE'
  if (newStatus === "ACTIVE") {
    const original = e.record.original();
    const oldStatus = original.get("status");
    
    // Only process if status is changing TO 'ACTIVE'
    if (oldStatus !== "ACTIVE") {
      // Set activation_date to current date if not already set
      const currentActivationDate = e.record.get("activation_date");
      if (!currentActivationDate) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayString = year + '-' + month + '-' + day;
        e.record.set("activation_date", todayString);
      }
      
      // Calculate expiry_date = activation_date + 365 days
      const activationDate = e.record.get("activation_date");
      if (activationDate) {
        const date = new Date(activationDate);
        date.setDate(date.getDate() + 365);
        const expiryYear = date.getFullYear();
        const expiryMonth = String(date.getMonth() + 1).padStart(2, '0');
        const expiryDay = String(date.getDate()).padStart(2, '0');
        const expiryString = expiryYear + '-' + expiryMonth + '-' + expiryDay;
        e.record.set("expiry_date", expiryString);
      }
    }
  }
  
  e.next();
}, "reporters");