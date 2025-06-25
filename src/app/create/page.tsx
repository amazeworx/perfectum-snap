'use client';

import PhotoProcessor from '@/components/PhotoProcessor';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export default function CreatePage() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className={cn(
      "relative min-h-dvh bg-black text-white transition-opacity duration-500",
      isMounted ? 'opacity-100' : 'opacity-0'
    )}>
      <PhotoProcessor />
    </div>
  );
}
