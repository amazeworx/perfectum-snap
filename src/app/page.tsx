import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <main className="flex flex-col items-center justify-center text-center w-full max-w-md">
        <Image 
          src="/images/perfectum-icon.png" 
          alt="Perfectum Snap Logo" 
          width={120} 
          height={120} 
          className="mb-8 rounded-full shadow-lg"
          data-ai-hint="logo camera" 
        />
        <h1 className="text-4xl sm:text-5xl font-headline font-bold mb-6 text-primary">
          Perfectum Snap
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xs sm:max-w-sm">
          Capture, frame, and share your perfect moments with Perfectum.
        </p>
        <Link href="/create" passHref>
          <Button 
            size="lg" 
            variant="default" 
            className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg sm:text-xl py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            aria-label="Create Your Photo"
          >
            Create Your Photo
          </Button>
        </Link>
      </main>
    </div>
  );
}
