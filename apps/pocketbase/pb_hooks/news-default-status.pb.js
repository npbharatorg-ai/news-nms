/// <reference path="../pb_data/types.d.ts" />
onRecordCreate((e) => {
  if (!e.record.get("status")) {
    e.record.set("status", "pending");
  }
  e.next();
}, "news");