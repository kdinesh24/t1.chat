'use client';

export const DocumentSkeleton = () => (
  <div className="flex flex-col gap-4 w-full">
    <div className="animate-pulse rounded-lg bg-black size-96" />
    <div className="flex flex-col gap-2">
      <div className="animate-pulse rounded-lg h-12 bg-black w-1/2" />
      <div className="animate-pulse rounded-lg h-4 bg-black w-3/4" />
      <div className="animate-pulse rounded-lg h-4 bg-black w-1/2" />
    </div>
  </div>
);

export const InlineDocumentSkeleton = () => (
  <div className="flex flex-col gap-2 w-full">
    <div className="animate-pulse rounded-lg h-4 bg-black w-48" />
    <div className="animate-pulse rounded-lg h-4 bg-black w-32" />
    <div className="animate-pulse rounded-lg h-4 bg-black w-40" />
  </div>
);
