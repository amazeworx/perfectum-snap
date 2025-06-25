"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/moving-border";
import { Zap } from 'lucide-react';
import { cn } from "@/lib/utils";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";

export default function HomePage() {

  return (
    <div className="relative h-dvh flex bg-white text-muted-foreground">
      <div className="flex flex-col justify-end p-4 mt-auto">
        <header className="pt-8 flex space-x-4 items-end relative z-10">
          <div>
            <Image
              src="/images/logo-bni-titans.png"
              alt="BNI Titans"
              width={300}
              height={216}
              className="h-16 w-auto animate-fade-up animate-once animate-duration-1000 animate-ease-in-out animate-delay-1000"
              data-ai-hint="logo bni titans"
            />
          </div>
          <div className="inline-flex gap-x-1">
            <div className="text-white flex items-center justify-center px-5 py-1 rounded-full bg-gradient-to-r from-red-600 via-violet-600 to-blue-500 animate-fade-up animate-once animate-duration-1000 animate-ease-in-out animate-delay-[1250ms]">
              <h1 className="text-sm text-white font-semibold flex space-x-2 items-center">
                <span>Grand Launching</span>
              </h1>
            </div>
            <div className='animate-fade-up animate-once animate-duration-1000 animate-ease-in-out animate-delay-[1350ms]'><span className='inline-block animate-bounce-slow text-3xl'>🚀</span></div>
          </div>
        </header>
        <main className='py-16 relative z-10'>
          <div>
            <p className="text-xl text-muted-foreground font-semibold max-w-md mb-6 animate-fade-up animate-once animate-duration-1000 animate-ease-in-out animate-delay-[1500ms]">
              Capture and share your perfect moments with <span className='text-primary font-bold'>Perfectum</span>.
            </p>
            <div className="animate-fade-up animate-once animate-duration-1000 animate-ease-in-out animate-delay-[1750ms]">
              <Button
                borderRadius="5rem"
                className="bg-gradient-to-tl from-primary to-accent text-primary-foreground border-none px-10 [&_svg]:size-5 active:bg-gradient-to-bl"
                containerClassName="w-auto shadow-xl shadow-primary/80 p-0.5"
                borderClassName="border-accent"
              >
                <Link href="/create" className='flex space-x-3 font-bold text-lg'>
                  <span className='whitespace-nowrap'>Get Started</span>
                  <Zap className="mt-1 h-5 w-5 animate-pulse" />
                </Link>
              </Button>
            </div>
          </div>
        </main>
        <footer className="mt-auto mb-6 border rounded-xl overflow-clip shadow-md relative z-10 animate-fade-up animate-once animate-duration-1000 animate-ease-in-out animate-delay-[2000ms]">
          <div className="flex space-x-4 items-center justify-center p-4 bg-white">
            <h2 className="text-xs font-bold">Sponsored by:</h2>
            <div className="flex space-x-4">
              <Image
                src="/images/logo-perfectum.png"
                alt="Perfectum"
                width={290}
                height={390}
                className="h-[72px] w-auto"
                data-ai-hint="logo perfectum"
              />
              <Image
                src="/images/logo-ootb.png"
                alt="OOTB"
                width={290}
                height={390}
                className="h-[72px] w-auto"
                data-ai-hint="logo ootb"
              />
            </div>
          </div>
          <div className="text-center border-t py-2 bg-slate-200"><span className='text-xs font-semibold'><em>Don't forget to follow and tag our Instagram</em></span> <span className='text-xl'>👌</span></div>
        </footer>
      </div>
      <AnimatedGridPattern
        width={50}
        height={50}
        x={-1}
        y={-1}
        strokeDasharray={5}
        numSquares={20}
        maxOpacity={0.5}
        duration={4}
        repeatDelay={0.3}
        className={cn(
          "[mask-image:radial-gradient(800px_circle_at_top,white,transparent)]",
          "inset-x-0 inset-y-[-10%] h-[100%] -skew-y-[20deg]  stroke-slate-500/25 fill-slate-400/70 text-accent animate-fade animate-once animate-duration-1000 animate-delay-0 animate-ease-in-out",
        )}
      />
    </div>
  );
}
