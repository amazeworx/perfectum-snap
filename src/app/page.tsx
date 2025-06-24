"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground items-center justify-center p-4 sm:p-6 md:p-8 text-center animate-fade-in">
      <header className="flex flex-col items-center mb-8">
        <Image 
          src="https://placehold.co/100x100.png"
          alt="Perfectum Snap Logo" 
          width={100}
          height={100}
          className="mb-4 rounded-full shadow-lg"
          data-ai-hint="logo camera" 
        />
        <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary">
          Perfectum Snap
        </h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-md">
          Capture and share your perfect moments with Perfectum.
        </p>
      </header>
      <main>
        <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 py-7 px-10 text-xl rounded-full shadow-lg transition-transform transform hover:scale-105">
          <Link href="/create">
            Get Started
            <ArrowRight className="ml-2 h-6 w-6" />
          </Link>
        </Button>
      </main>
    </div>
  );
}
