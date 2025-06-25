"use client";

declare global {
  interface Window {
    dataLayer: any[];
  }
}

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, Camera, Share2, Download, RotateCcw, AlertTriangle, ArrowLeft, SwitchCamera, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 640;

const TEMPLATES = [
  {
    template: '/images/template-1.jpg',
    frame: '/images/frame-1.png',
    hint: 'Template 1'
  },
  {
    template: '/images/template-2.jpg',
    frame: '/images/frame-2.png',
    hint: 'Template 2'
  },
  {
    template: '/images/template-3.jpg',
    frame: '/images/frame-3.png',
    hint: 'Template 3'
  },
  {
    template: '/images/template-4.jpg',
    frame: '/images/frame-4.png',
    hint: 'Template 4'
  },
];


type Step = 'frame-selection' | 'camera' | 'preview';

export default function PhotoProcessor() {

  const [loadedImages, setLoadedImages] = useState<{ [key: number]: boolean }>({});
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

  const handleImageLoad = (index: number) => {
    setLoadedImages(prevState => ({
      ...prevState,
      [index]: true,
    }));
  };

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

        if (typeof window !== "undefined" && window.dataLayer && selectedFrameIndex !== null) {
          window.dataLayer.push({
            event: "template_processed",
            template_index: selectedFrameIndex,
            template_hint: TEMPLATES[selectedFrameIndex].hint
          });
        }
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
        if (typeof window !== "undefined" && window.dataLayer) {
          window.dataLayer.push({ event: "upload_photo" });
        }
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

  const resetCamera = useCallback(() => {
    stopCamera();
    setUserImageSrc(null);
    setProcessedImageSrc(null);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setStep('camera');
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

    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({ event: "capture_photo" });
    }
  };

  const handleDownload = () => {
    if (processedImageSrc) {
      const link = document.createElement('a');
      link.href = processedImageSrc;
      link.download = 'bni_x_perfectum_x_ootb.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({ event: "download_photo" });
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
          title: 'BNI Titans Grand Launching with Perfectum and OOTB',
          text: 'Check out this perfect moments with BNI Titans, Perfectum, and OOTB',
        });
        if (typeof window !== "undefined" && window.dataLayer) {
          window.dataLayer.push({ event: "share_photo" });
        }
      } else {
        toast({ title: "Cannot Share", description: "Direct sharing is not supported on your browser/device. Please download the image.", variant: "default" });
      }
    } catch (error) {
      console.error('Share error:', error);
      toast({ title: "Share Error", description: "Could not share the image. Please try downloading it.", variant: "destructive" });
    }
  };

  return (
    <>
      {step === 'camera' && (
        <div className="aspect-[9/16] mx-auto h-dvh">
          <div className="mx-auto">
            <div className="aspect-[9/16]">
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
            </div>
            <div className="bg-black absolute inset-0 [mask-image:linear-gradient(black,black),url('/images/template-1.jpg')] [mask-composite:subtract] [mask-size:contain,contain] [mask-position:center,center] [mask-repeat:no-repeat,no-repeat]"></div>
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
            <div className="absolute pb-6 top-0 left-0 right-0 p-4 flex z-20 bg-gradient-to-b from-black/90 to-transparent">
              <Button
                onClick={reset}
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70"
                aria-label="Go Back"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </div>
            <div className="absolute bottom-0 pb-6 left-0 right-0 flex justify-center z-20 bg-gradient-to-t from-black/90 to-transparent">
              <div className="flex items-center gap-x-16 pointer-events-auto">
                <div className="w-12 h-12" />
                <Button
                  onClick={capturePhoto}
                  className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-accent hover:bg-primary/80 border-2 border-white ring-2 ring-primary/20 text-white shadow-lg flex items-center justify-center [&_svg]:size-6"
                  size="icon"
                  aria-label="Capture Photo"
                >
                  <Camera className="h-16 w-16" />
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
        </div>
      )}

      {step === 'preview' && (
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
              <div className="absolute bottom-0 pb-6 left-0 px-4 right-0 z-20 flex flex-row-reverse items-center gap-3 bg-gradient-to-t from-black/90 to-transparent">
                <div className="relative">
                  <Button
                    onClick={handleShare}
                    className="relative z-50 h-14 w-14 rounded-full bg-gradient-to-tr from-primary to-accent border border-accent text-primary-foreground shadow-md transition-transform transform hover:scale-105 hover:bg-accent/90 [&_svg]:size-6 hover:text-white"
                    aria-label="Share Image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram-icon lucide-instagram w-10 h-10"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                  </Button>
                  <div className="absolute h-14 w-14 inset-0 bg-accent opacity-75 rounded-full animate-ping"></div>
                </div>
                <Button
                  onClick={handleDownload}
                  variant="ghost"
                  size="icon"
                  className="relative z-50 h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
                  aria-label="Download Image"
                >
                  <Download className="h-6 w-6" />
                </Button>
                <Button
                  onClick={resetCamera}
                  variant="ghost"
                  size="icon"
                  className="relative z-50 h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70 hover:text-white"
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
                <br />
                Please try again.
              </p>
              <Button onClick={reset} variant="outline" className="w-full max-w-xs mt-6 transition-colors duration-300" aria-label="Start Over">
                <RotateCcw className="mr-2 h-5 w-5" /> Start Over
              </Button>
            </div>
          )}
        </div>
      )}

      {step === 'frame-selection' && (
        <>
          <div className="h-dvh relative overflow-hidden">
            <header className="absolute top-0 left-0 right-0 z-50 flex items-center p-4">
              <Link href="/" passHref>
                <Button variant="ghost" size="icon" className="mr-2 text-white rounded-full hover:text-white active:text-white hover:bg-white/20 [&_svg]:size-5">
                  <ArrowLeft className="h-6 w-6" />
                </Button>
              </Link>
              <h1 className="text-xl font-semibold">Choose your frame</h1>
            </header>

            <main className="p-4 pt-[72px]">
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map((item, index) => (
                  <div
                    key={index}
                    className="relative rounded-lg overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-[1.02] active:scale-95 shadow-md border border-gray-700"
                    onClick={() => handleFrameSelect(index)}
                  >
                    {!loadedImages[index] && (
                      <Skeleton className="absolute top-0 left-0 w-full h-full" />
                    )}
                    <Image
                      src={item.template}
                      alt={`Template ${index + 1}`}
                      width={180}
                      height={320}
                      className={cn(
                        "w-full h-full object-cover transition-opacity duration-300",
                        loadedImages[index] ? "opacity-100" : "opacity-0"
                      )}
                      onLoad={() => handleImageLoad(index)}
                      data-ai-hint={item.hint}
                    />
                  </div>
                ))}
              </div>
            </main>

            <div className={cn(
              "absolute inset-0 z-[60] flex items-center justify-center transition-all duration-500",
              isFrameExpanded ? "opacity-100 bg-black backdrop-blur-sm" : "opacity-0 pointer-events-none"
            )}>
              <div
                className="relative w-full h-full">
                <header className="absolute top-0 left-0 right-0 z-50 flex items-center p-4">
                  <Button variant="ghost" size="icon" className="mr-2 text-white rounded-full hover:text-white active:text-white hover:bg-white/20 [&_svg]:size-5" onClick={handleCloseExpandedFrame}>
                    <ArrowLeft className="h-6 w-6" />
                  </Button>
                  <h1 className="text-xl font-semibold">Capture or upload your photo</h1>
                </header>
                <div className="pt-[72px] px-4 pb-24 w-full h-full flex flex-col justify-center items-center relative">
                  {selectedFrameIndex !== null && (
                    <div className="aspect-[9/16] max-w-[420px]">
                      <div className={cn("relative border-2 border-white rounded-lg overflow-clip h-full w-auto transition-all duration-300 ease-out",
                        isFrameExpanded ? "scale-100 opacity-100" : "scale-75 opacity-0")}>
                        {!loadedImages[selectedFrameIndex] && (
                          <Skeleton className="absolute top-0 left-0 w-full h-full" />
                        )}
                        <Image
                          src={TEMPLATES[selectedFrameIndex].template}
                          alt="Selected Template"
                          width={1080}
                          height={1920}
                          className={cn(
                            "object-contain pointer-events-none w-full h-full",
                            loadedImages[selectedFrameIndex] ? "opacity-100" : "opacity-0"
                          )}
                          priority
                          onLoad={() => handleImageLoad(selectedFrameIndex)}
                        />
                      </div>
                    </div>
                  )}
                  <div className={cn("relative w-full mt-6 flex items-center justify-center gap-4 z-10 transition-all duration-500 delay-500",
                    isFrameExpanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  )}>
                    <Button onClick={() => fileInputRef.current?.click()} size="lg" className="w-full py-3 px-4 rounded-full text-sm bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg">
                      <UploadCloud className="mr-1 h-6 w-6" /> Upload Photo
                    </Button>
                    <Input type="file" accept="image/*" onChange={handleFileUpload} ref={fileInputRef} className="hidden" />
                    <Button onClick={startCamera} size="lg" className="w-full py-3 px-4 rounded-full text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                      <Camera className="mr-1 h-6 w-6" /> Use Camera
                    </Button>
                  </div>
                </div>


              </div>
            </div>
          </div>
        </>
      )}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </>
  );
}
