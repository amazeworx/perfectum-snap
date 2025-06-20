"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, Camera, Share2, Download, RotateCcw, AlertTriangle, ArrowLeft, SwitchCamera } from 'lucide-react';
import { cn } from '@/lib/utils';

const FRAME_IMAGE_URL = '/images/perfectum-frame.png';
const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 640;

type Step = 'initial' | 'camera' | 'preview';

export default function PhotoProcessor({ onCameraToggle }: { onCameraToggle: (isActive: boolean) => void }) {
  const [step, setStep] = useState<Step>('initial');
  const [userImageSrc, setUserImageSrc] = useState<string | null>(null);
  const [processedImageSrc, setProcessedImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [frameImage, setFrameImage] = useState<HTMLImageElement | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); // For processing
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  useEffect(() => {
    // Preload the frame image
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = FRAME_IMAGE_URL;
    img.onload = () => {
      setFrameImage(img);
    };
    img.onerror = () => {
      toast({
        title: 'Error',
        description: 'Failed to load the frame image. Please try refreshing the page.',
        variant: 'destructive',
      });
    };
  }, [toast]);

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
    setProcessedImageSrc(null); // Clear previous processed image

    // Use a timeout to allow the UI to update to the loading state before the canvas operation
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
          // Calculate scaling to cover canvas while maintaining aspect ratio
          const hRatio = CANVAS_WIDTH / userImg.width;
          const vRatio = CANVAS_HEIGHT / userImg.height;
          const ratio = Math.max(hRatio, vRatio);
          const centerShift_x = (CANVAS_WIDTH - userImg.width * ratio) / 2;
          const centerShift_y = (CANVAS_HEIGHT - userImg.height * ratio) / 2;

          ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          // Draw user image (scaled and centered)
          ctx.drawImage(userImg, 0, 0, userImg.width, userImg.height, centerShift_x, centerShift_y, userImg.width * ratio, userImg.height * ratio);
          
          // Draw frame image on top
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
      onCameraToggle(true);
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
    setStep('initial');
    onCameraToggle(false);
  }, [stopCamera, onCameraToggle]);

  useEffect(() => {
    const enableCamera = async (mode: 'user' | 'environment') => {
      // stopCamera is called by the cleanup function of this effect when dependencies change.
      try {
        const constraints = { 
          video: { 
            width: { ideal: 1280 }, 
            height: { ideal: 720 }, 
            facingMode: { exact: mode } 
          } 
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn("Exact facing mode failed, falling back.", err);
        // Fallback for browsers that don't support 'exact' or if the camera is not available.
        try {
            const fallbackConstraints = { 
                video: { 
                    width: { ideal: 1280 }, 
                    height: { ideal: 720 }, 
                    facingMode: mode
                } 
            };
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

    // Cleanup function: stop the camera when the step changes or component unmounts.
    return () => {
        stopCamera();
    }
  }, [step, facingMode, toast, reset, stopCamera]);


  const startCamera = () => {
    setStep('camera');
    onCameraToggle(true);
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
        // Flip the image horizontally only if it's the front camera to correct the mirror effect
        if (facingMode === 'user') {
          ctx.translate(video.videoWidth, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      }
      setUserImageSrc(tempCanvas.toDataURL('image/png'));
      setStep('preview');
      onCameraToggle(true); // Keep the header hidden
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
      <>
        <div className="fixed inset-0 bg-black z-0">
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
          <Image
            src={FRAME_IMAGE_URL}
            alt="Frame Overlay"
            fill
            style={{ objectFit: 'contain' }}
            className="pointer-events-none z-10"
            priority
          />
        </div>
        <Button
          onClick={reset}
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-20 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70 pointer-events-auto"
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
      </>
    );
  }

  return (
    <Card className={cn(
      "w-full",
      step === 'initial'
        ? "shadow-xl rounded-lg overflow-hidden bg-card"
        : "w-full h-full flex-grow shadow-none rounded-none border-none bg-black flex flex-col"
    )}>
      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

      {step === 'initial' && (
        <CardContent className="p-6 space-y-6">
          <div className="animate-fade-in space-y-4">
            <p className="text-center text-muted-foreground">Choose how to add your photo:</p>
            <Button onClick={startCamera} size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 transform hover:shadow-lg hover:-translate-y-[2px] py-4 text-sm" aria-label="Use Camera">
              <Camera className="mr-1.5 h-8 w-8" /> Use Camera
            </Button>              
            <Button onClick={() => fileInputRef.current?.click()} size="lg" className="w-full bg-white hover:bg-white text-primary hover:text-primary border border-primary transition-all duration-300 transform hover:shadow-lg hover:-translate-y-[2px] py-4 text-sm" aria-label="Upload a Photo">
              <UploadCloud className="mr-1.5 h-10 w-10" /> Upload a Photo
            </Button>
            <Input type="file" accept="image/*" onChange={handleFileUpload} ref={fileInputRef} className="hidden" />
          </div>
        </CardContent>
      )}

      {step === 'preview' && (
        <div className="relative w-full h-full animate-fade-in">
          {isProcessing && (
            <div className="flex flex-col items-center justify-center h-full text-white bg-black">
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
            <div className="flex flex-col items-center justify-center h-full bg-black text-white p-4 text-center">
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
      )}
    </Card>
  );
}
