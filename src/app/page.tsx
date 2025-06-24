"use client";

import { useState } from 'react';
import Image from 'next/image';
import PhotoProcessor from '@/components/PhotoProcessor';
import { cn } from '@/lib/utils';

export type ViewMode = 'home' | 'fullscreen';

export default function HomePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('home');

  return (
    <div className={cn(
        "flex flex-col min-h-dvh bg-background text-foreground",
        viewMode === 'home' && "items-center p-4 sm:p-6 md:p-8"
    )}>
      {viewMode === 'home' && (
        <header className="flex flex-col items-center text-center mb-8 pt-8 w-full max-w-2xl">
          <Image 
            src="/images/perfectum-icon.png" 
            alt="Perfectum Snap Logo" 
            width={100}
            height={100}
            className="mb-4 rounded-full shadow-lg"
            data-ai-hint="logo camera" 
          />
          <h1 className="text-[36px] font-headline font-bold text-primary">
            Perfectum Snap
          </h1>
          <p className="text-base text-muted-foreground mt-2 max-w-md">
            Capture and share your perfect moments with Perfectum.
          </p>
        </header>
      )}
      <main className={cn(
          "w-full flex-grow flex flex-col",
          viewMode === 'home' && "max-w-2xl"
      )}>
        <PhotoProcessor onViewModeChange={setViewMode} />
      </main>
    </div>
  );
}
