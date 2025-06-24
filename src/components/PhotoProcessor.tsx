"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, Camera, Share2, Download, RotateCcw, AlertTriangle, ArrowLeft, SwitchCamera, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 640;

const TEMPLATES = [
  {
    template: 'https://placehold.co/360x640.png',
    frame: 'https://placehold.co/360x640.png',
    hint: 'abstract modern'
  },
  {
    template: 'https://placehold.co/360x640.png',
    frame: 'https://placehold.co/360x640.png',
    hint: 'vintage classic'
  },
  {
    template: 'https://placehold.co/360x640.png',
    frame: 'https://placehold.co/360x640.png',
    hint: 'nature floral'
  },
  {
    template: 'https://placehold.co/360x640.png',
    frame: 'https://placehold.co/360x640.png',
    hint: 'geometric pattern'
  },
];


type Step = 'frame-selection' | 'camera' | 'preview';

export default function PhotoProcessor() {
  const [step, setStep] = useState<Step>('frame-selection');
  const [userImageSrc, setUserImageSrc] = useState<string | null>(null);
  const [processedImageSrc, setProcessedImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const [selectedFrameIndex, setSelectedFrameIndex] = useState<number | null>(null);
  const [isFrameExpanded, setIsFrameExpanded] = useState(false);
  const [selectedFrameUrl, setSelectedFrameUrl] = useState<string>('');
  const [frameImage, setFrameImage] = useState<HTMLImageElement | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (!selectedFrameUrl) {
      setFrameImage(null);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = selectedFrameUrl;
    img.onload = () => setFrameImage(img);
    img.onerror = () => {
      toast({
        title: 'Error',
        description: `Failed to load frame: ${selectedFrameUrl}`,
        variant: 'destructive',
      });
    };
  }, [selectedFrameUrl, toast]);

  const handleFrameSelect = (index: number) => {
    setSelectedFrameIndex(index);
    setSelectedFrameUrl(TEMPLATES[index].frame);
    setIsFrameExpanded(true);
  };
  
  const handleCloseExpandedFrame = () => {
    setIsFrameExpanded(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = `https://placehold.co/${CANVAS_WIDTH}x${CANVAS_HEIGHT}.png`;
    e.currentTarget.alt = 'Error loading image';
     toast({
        title: 'Image Display Error',
        description: 'There was an issue displaying the image.',
        variant: 'destructive',
      });
  };

  const processImage = useCallback(async () => {
    if (!userImageSrc || !frameImage) {
      if (!frameImage) {
         toast({ title: "Frame Error", description: "Frame image not loaded yet.", variant: "destructive" });
      }
      return;
    }

    setIsProcessing(true);
    setProcessedImageSrc(null);

    setTimeout(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) {
          toast({ title: "Canvas Error", description: "Could not get canvas context.", variant: "destructive" });
          setIsProcessing(false);
          return;
        }

        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;

        const userImg = new window.Image();
        userImg.crossOrigin = 'anonymous';
        userImg.src = userImageSrc;

        userImg.onload = () => {
          const hRatio = CANVAS_WIDTH / userImg.width;
          const vRatio = CANVAS_HEIGHT / userImg.height;
          const ratio = Math.max(hRatio, vRatio);
          const centerShift_x = (CANVAS_WIDTH - userImg.width * ratio) / 2;
          const centerShift_y = (CANVAS_HEIGHT - userImg.height * ratio) / 2;

          ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          ctx.drawImage(userImg, 0, 0, userImg.width, userImg.height, centerShift_x, centerShift_y, userImg.width * ratio, userImg.height * ratio);
          
          ctx.drawImage(frameImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          
          setProcessedImageSrc(canvas.toDataURL('image/png'));
          setIsProcessing(false);
        };

        userImg.onerror = () => {
          toast({ title: "Image Load Error", description: "Failed to load user image for processing.", variant: "destructive" });
          setIsProcessing(false);
        };
    }, 50);

  }, [userImageSrc, frameImage, toast]);

  useEffect(() => {
    if (userImageSrc && frameImage && step === 'preview') {
      processImage();
    }
  }, [userImageSrc, frameImage, processImage, step]);


  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserImageSrc(e.target?.result as string);
        setStep('preview');
      };
      reader.readAsDataURL(file);
    }
  };

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const reset = useCallback(() => {
    stopCamera();
    setUserImageSrc(null);
    setProcessedImageSrc(null);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setStep('frame-selection');
    setSelectedFrameIndex(null);
    setIsFrameExpanded(false);
    setSelectedFrameUrl('');
    setFrameImage(null);
  }, [stopCamera]);

  useEffect(() => {
    const enableCamera = async (mode: 'user' | 'environment') => {
      try {
        const constraints = { video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: { exact: mode } } };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("Exact facing mode failed, falling back.", err);
        try {
            const fallbackConstraints = { video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: mode } };
            const stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (finalErr) {
            toast({
                title: 'Camera Error',
                description: 'Could not access the selected camera. Please ensure permissions are granted.',
                variant: 'destructive',
            });
            reset();
        }
      }
    };
    
    if (step === 'camera') {
      enableCamera(facingMode);
    }

    return () => {
        stopCamera();
    }
  }, [step, facingMode, toast, reset, stopCamera]);


  const startCamera = () => {
    setStep('camera');
  };

  const toggleCameraFacingMode = useCallback(() => {
    setFacingMode(prevMode => prevMode === 'user' ? 'environment' : 'user');
  }, []);

  const capturePhoto = () => {
    const video = videoRef.current;
    if (video) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = video.videoWidth;
      tempCanvas.height = video.videoHeight;
      const ctx = tempCanvas.getContext('2d');
      if (ctx) {
        if (facingMode === 'user') {
          ctx.translate(video.videoWidth, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      }
      setUserImageSrc(tempCanvas.toDataURL('image/png'));
      setStep('preview');
    }
  };

  const handleDownload = () => {
    if (processedImageSrc) {
      const link = document.createElement('a');
      link.href = processedImageSrc;
      link.download = 'perfectum_snap.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = async () => {
    if (!processedImageSrc) return;

    try {
      const response = await fetch(processedImageSrc);
      const blob = await response.blob();
      const file = new File([blob], 'perfectum_snap.png', { type: 'image/png' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Perfectum Snap!',
          text: 'Check out this photo I created with Perfectum Snap!',
        });
      } else {
        toast({ title: "Cannot Share", description: "Direct sharing is not supported on your browser/device. Please download the image.", variant: "default" });
      }
    } catch (error) {
      console.error('Share error:', error);
      toast({ title: "Share Error", description: "Could not share the image. Please try downloading it.", variant: "destructive" });
    }
  };

  if (step === 'camera') {
    return (
      <div className="fixed inset-0 bg-black">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className={cn(
              "w-full h-full object-cover", 
              facingMode === 'user' && "scale-x-[-1]"
          )} 
          aria-label="Camera feed">
        </video>
        {frameImage && (
          <Image
            src={frameImage.src}
            alt="Frame Overlay"
            fill
            style={{ objectFit: 'contain' }}
            className="pointer-events-none z-10"
            priority
          />
        )}
        <Button
          onClick={reset}
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-20 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70"
          aria-label="Go Back"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="fixed bottom-[30px] left-0 right-0 flex justify-center z-20 pointer-events-none">
            <div className="flex items-center gap-x-8 pointer-events-auto">
              <div className="w-12 h-12" />
              <Button
                onClick={capturePhoto}
                className="w-16 h-16 rounded-full bg-white hover:bg-gray-200 border-4 border-white/50 ring-2 ring-black/20 text-black shadow-lg flex items-center justify-center"
                aria-label="Capture Photo"
              >
                <Camera className="h-10 w-10" />
              </Button>
              <Button
                onClick={toggleCameraFacingMode}
                variant="ghost"
                size="icon"
                className="w-12 h-12 rounded-full bg-black/50 text-white hover:bg-black/70"
                aria-label="Switch Camera"
              >
                <SwitchCamera className="h-6 w-6" />
              </Button>
            </div>
        </div>
      </div>
    );
  }

  if (step === 'preview') {
    return (
        <div className="relative w-full h-dvh animate-fade-in bg-black">
          {isProcessing && (
            <div className="flex flex-col items-center justify-center h-full text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-3"></div>
              <p className="text-muted-foreground">Processing your image...</p>
            </div>
          )}

          {!isProcessing && processedImageSrc && (
            <>
              <Image
                src={processedImageSrc}
                alt="Your final snap"    
                fill            
                className="object-contain"
                onError={handleImageError}
                priority
              />
              <div className="fixed bottom-4 right-4 z-20 flex flex-row-reverse items-center gap-2">
                <Button
                  onClick={handleShare}
                  className="h-14 w-14 rounded-full bg-accent text-accent-foreground shadow-lg transition-transform transform hover:scale-105 hover:bg-accent/90"
                  aria-label="Share Image"
                >
                  <Share2 className="h-10 w-10" />
                </Button>
                <Button
                  onClick={handleDownload}
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70"
                  aria-label="Download Image"
                >
                  <Download className="h-6 w-6" />
                </Button>
                 <Button
                  onClick={reset}
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70"
                  aria-label="Start Over"
                >
                  <RotateCcw className="h-6 w-6" />
                </Button>
              </div>
            </>
          )}

          {!isProcessing && !processedImageSrc && userImageSrc && (
            <div className="flex flex-col items-center justify-center h-full text-white p-4 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mb-3" />
              <p className="text-muted-foreground">
                There was an issue applying the frame.
                <br/>
                Please try again.
              </p>
               <Button onClick={reset} variant="outline" className="w-full max-w-xs mt-6 transition-colors duration-300" aria-label="Start Over">
                <RotateCcw className="mr-2 h-5 w-5" /> Start Over
              </Button>
            </div>
          )}
        </div>
      );
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center p-4 bg-black/50 backdrop-blur-sm">
        <Link href="/" passHref>
          <Button variant="ghost" size="icon" className="mr-2 text-white hover:bg-white/20">
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">Choose your frame</h1>
      </header>

      <main className="pt-24 p-4">
        <div className="grid grid-cols-2 gap-4">
          {TEMPLATES.map((item, index) => (
            <div
              key={index}
              className="aspect-[9/16] rounded-lg overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95 shadow-md border border-gray-700"
              onClick={() => handleFrameSelect(index)}
            >
              <Image
                src={item.template}
                alt={`Template ${index + 1}`}
                width={180}
                height={320}
                className="w-full h-full object-cover"
                data-ai-hint={item.hint}
              />
            </div>
          ))}
        </div>
      </main>

      <div className={cn(
        "fixed inset-0 z-[60] flex items-center justify-center transition-all duration-300",
        isFrameExpanded ? "opacity-100 bg-black/80 backdrop-blur-sm" : "opacity-0 pointer-events-none"
      )}>
        <div 
            className={cn(
                "relative transition-all duration-300 ease-out",
                isFrameExpanded ? "scale-100 opacity-100" : "scale-95 opacity-0"
            )}
            style={{ width: `${CANVAS_WIDTH}px`, height: `${CANVAS_HEIGHT}px` }}
        >
            {selectedFrameIndex !== null && (
                <Image
                    src={TEMPLATES[selectedFrameIndex].template}
                    alt="Selected Template"
                    fill
                    className="object-contain pointer-events-none rounded-lg"
                    priority
                />
            )}
            <Button
              onClick={handleCloseExpandedFrame}
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 h-10 w-10 rounded-full bg-black/40 text-white hover:bg-black/60"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </Button>

            <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-4 px-4 z-10">
                <Button onClick={startCamera} size="lg" className="w-full py-4 text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                    <Camera className="mr-2 h-5 w-5" /> Use Camera
                </Button>              
                <Button onClick={() => fileInputRef.current?.click()} size="lg" className="w-full py-4 text-base bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg">
                    <UploadCloud className="mr-2 h-5 w-5" /> Upload Photo
                </Button>
                <Input type="file" accept="image/*" onChange={handleFileUpload} ref={fileInputRef} className="hidden" />
            </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden"></canvas>
    </>
  );
}
