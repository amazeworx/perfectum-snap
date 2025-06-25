"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/moving-border";
import { Zap } from 'lucide-react';
import { cn } from "@/lib/utils";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";

export default function HomePage() {

  return (
    <div className="max-w-screen-sm mx-auto overflow-hidden">
      <div className="relative flex flex-col min-h-dvh bg-white text-muted-foreground p-4">
        <header className="mt-12 mb-12 flex space-x-4 items-end relative z-10">
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
          <div className="inline-block border text-white px-4 py-1 rounded-full bg-gradient-to-r from-red-500 via-violet-500 to-blue-500 animate-fade-up animate-once animate-duration-1000 animate-ease-in-out animate-delay-[1250ms]">
            <h1 className="text-sm text-white font-bold flex space-x-2 items-center">
              <span>Grand Launching</span> <span className='animate-bounce-slow text-base'>🚀</span>
            </h1>
          </div>
        </header>
        <main>
          <div className='mt-12 relative z-10'>
            <p className="text-xl text-muted-foreground font-semibold max-w-md mb-6 animate-fade-up animate-once animate-duration-1000 animate-ease-in-out animate-delay-[1500ms]">
              Capture and share your perfect moments with <span className='text-primary font-bold'>Perfectum</span>.
            </p>
            <div className="animate-fade-up animate-once animate-duration-1000 animate-ease-in-out animate-delay-[1750ms]">
              <Button
                borderRadius="5rem"
                className="bg-gradient-to-br from-primary to-accent text-primary-foreground border-transparent px-8"
                containerClassName="w-auto shadow-md p-0.5"
                borderClassName="border-accent"
              >
                <Link href="/create" className='flex space-x-2 font-semibold text-lg'>
                  <span className='whitespace-nowrap'>Get Started</span>
                  <Zap className="mt-1 h-5 w-5 animate-pulse" />
                </Link>
              </Button>
            </div>
          </div>
        </main>
        <div className="mt-auto mb-12 border rounded-xl overflow-clip shadow-md relative z-10 animate-fade-up animate-once animate-duration-1000 animate-ease-in-out animate-delay-[2000ms]">
          <div className="flex space-x-4 items-center justify-center p-4 bg-white">
            <h2 className="text-xs font-bold">Sponsored by:</h2>
            <div className="flex space-x-4">
              <Image
                src="/images/logo-perfectum.png"
                alt="Perfectum"
                width={290}
                height={390}
                className="h-16 w-auto"
                data-ai-hint="logo perfectum"
              />
              <Image
                src="/images/logo-ootb.png"
                alt="OOTB"
                width={290}
                height={390}
                className="h-16 w-auto"
                data-ai-hint="logo ootb"
              />
            </div>
          </div>
          <div className="text-center border-t py-2 bg-slate-200"><span className='text-xs font-semibold'><em>Don't forget to follow and tag our Instagram</em></span> <span>👌</span></div>
        </div>
        <AnimatedGridPattern
          width={40}
          height={40}
          x={-1}
          y={-1}
          strokeDasharray={5}
          numSquares={40}
          maxOpacity={0.2}
          duration={4}
          repeatDelay={0.5}
          className={cn(
            "[mask-image:radial-gradient(420px_circle_at_center,white,transparent)]",
            "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12 stroke-slate-500/30 fill-slate-400/30 animate-fade animate-once animate-duration-1000 animate-delay-0 animate-ease-in-out",
          )}
        />
      </div>
    </div>
  );
}
