import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import PhotoProcessor from '@/components/PhotoProcessor';

export default function CreationPage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background text-foreground p-4">
      <header className="w-full max-w-2xl mb-6 flex items-center justify-between">
        <Link href="/" passHref>
          <Button variant="ghost" className="text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Home
          </Button>
        </Link>
        <h1 className="text-2xl font-headline font-semibold text-primary">
          Perfectum Snap
        </h1>
      </header>
      <main className="w-full max-w-2xl flex-grow">
        <PhotoProcessor />
      </main>
       <footer className="w-full max-w-2xl mt-8 py-4 text-center text-sm text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} Perfectum Snap. Frame your moments.</p>
      </footer>
    </div>
  );
}
