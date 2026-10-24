import React from "react";

export default function GameDetailLoading() {
  return (
    <div className="pb-16 space-y-10 animate-pulse">
      {/* Banner Skeleton */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-slate-200" />
            <div className="space-y-3 flex-1">
              <div className="flex gap-2">
                <div className="w-20 h-5 bg-slate-200 rounded-full" />
                <div className="w-16 h-5 bg-slate-200 rounded-full" />
              </div>
              <div className="w-64 h-8 bg-slate-200 rounded-lg" />
              <div className="w-48 h-4 bg-slate-100 rounded" />
            </div>
            <div className="w-28 h-9 bg-slate-200 rounded-lg" />
          </div>
        </div>
      </section>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-6 w-32 bg-slate-200 rounded" />
            <div className="space-y-4">
              <div className="h-36 bg-white border border-slate-200 rounded-2xl p-6" />
              <div className="h-36 bg-white border border-slate-200 rounded-2xl p-6" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-64 bg-white border border-slate-200 rounded-2xl p-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
