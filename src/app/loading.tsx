import React from "react";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="h-32 bg-slate-100 rounded-2xl border border-slate-200" />

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-44 bg-slate-100 rounded-xl border border-slate-200"
          />
        ))}
      </div>
    </div>
  );
}
