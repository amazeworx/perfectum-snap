"use client";

import { useState } from 'react';
import Image from 'next/image';
import PhotoProcessor from '@/components/PhotoProcessor';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const [isCameraActive, setIsCameraActive] = useState(false);

  return (
    <div className={cn(
        "flex flex-col min-h-screen bg-background text-foreground",
        !isCameraActive && "items-center p-4 sm:p-6 md:p-8"
    )}>
      {!isCameraActive && (
        <header className="flex flex-col items-center text-center mb-8 w-full max-w-2xl">
          <Image 
            src="/images/perfectum-icon.png" 
            alt="Perfectum Snap Logo" 
            width={100}
            height={100}
            className="mb-4 rounded-full shadow-lg"
            data-ai-hint="logo camera" 
          />
          <h1 className="text-4xl sm:text-5xl font-headline font-bold text-primary">
            Perfectum Snap
          </h1>
          <p className="text-lg text-muted-foreground mt-2 max-w-md">
            Capture, frame, and share your perfect moments. Start by selecting a photo source below.
          </p>
        </header>
      )}
      <main className={cn(
          "w-full flex-grow flex flex-col",
          !isCameraActive && "max-w-2xl"
      )}>
        <PhotoProcessor onCameraToggle={setIsCameraActive} />
      </main>
    </div>
  );
}
