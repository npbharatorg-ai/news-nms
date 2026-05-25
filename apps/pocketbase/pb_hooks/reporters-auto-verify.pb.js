/// <reference path="../pb_data/types.d.ts" />
onRecordCreate((e) => {
  // Auto-set verified to true for new reporter signups
  e.record.set("verified", true);
  e.next();
}, "reporters");