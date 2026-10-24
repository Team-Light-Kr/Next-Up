import React from "react";

export default function UpdateDetailLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      <div className="h-4 w-40 bg-slate-200 rounded" />
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-200 rounded-xl" />
          <div className="space-y-2 flex-1">
            <div className="h-5 w-48 bg-slate-200 rounded" />
            <div className="h-3 w-32 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="h-7 w-3/4 bg-slate-200 rounded" />
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
        <div className="h-4 w-full bg-slate-100 rounded" />
        <div className="h-4 w-5/6 bg-slate-100 rounded" />
        <div className="h-4 w-4/6 bg-slate-100 rounded" />
      </div>
    </div>
  );
}
