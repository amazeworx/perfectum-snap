import Image from 'next/image';
import PhotoProcessor from '@/components/PhotoProcessor';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
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
      <main className="w-full max-w-2xl flex-grow">
        <PhotoProcessor />
      </main>
    </div>
  );
}
