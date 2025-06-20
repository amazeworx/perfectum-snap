"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, Camera, Share2, Download, RotateCcw, CheckCircle, AlertTriangle, Image as ImageIcon } from 'lucide-react';

const FRAME_IMAGE_URL = '/perfectum-frame.png'; // Ensure this image exists in public/images
const CANVAS_WIDTH = 360; // For 9:16 aspect ratio
const CANVAS_HEIGHT = 640;

type Step = 'initial' | 'camera' | 'preview';

export default function PhotoProcessor() {
  const [step, setStep] = useState<Step>('initial');
  const [userImageSrc, setUserImageSrc] = useState<string | null>(null);
  const [processedImageSrc, setProcessedImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); // For processing
  const frameImageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  useEffect(() => {
    // Preload the frame image
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.src = FRAME_IMAGE_URL;
    img.onload = () => {
      frameImageRef.current = img;
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
    if (!userImageSrc || !frameImageRef.current) {
      if (!frameImageRef.current) {
         toast({ title: "Frame Error", description: "Frame image not loaded yet.", variant: "destructive" });
      }
      return;
    }

    setIsProcessing(true);
    setProcessedImageSrc(null); // Clear previous processed image

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
      if (frameImageRef.current) {
        ctx.drawImage(frameImageRef.current, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }
      
      setProcessedImageSrc(canvas.toDataURL('image/png'));
      setIsProcessing(false);
      toast({ title: "Success", description: "Image processed successfully!", className: "bg-green-500 text-white" });
    };

    userImg.onerror = () => {
      toast({ title: "Image Load Error", description: "Failed to load user image for processing.", variant: "destructive" });
      setIsProcessing(false);
    };

  }, [userImageSrc, toast]);

  useEffect(() => {
    if (userImageSrc && frameImageRef.current && step === 'preview') {
      processImage();
    }
  }, [userImageSrc, processImage, step]);


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

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setStep('camera');
    } catch (err) {
      toast({
        title: 'Camera Error',
        description: 'Could not access camera. Please ensure permissions are granted.',
        variant: 'destructive',
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (video) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = video.videoWidth;
      tempCanvas.height = video.videoHeight;
      const ctx = tempCanvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      setUserImageSrc(tempCanvas.toDataURL('image/png'));
      stopCamera();
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

  const reset = () => {
    stopCamera();
    setUserImageSrc(null);
    setProcessedImageSrc(null);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
    setStep('initial');
  };

  useEffect(() => {
    // Cleanup camera on unmount
    return () => stopCamera();
  }, []);

  return (
    <Card className="w-full shadow-xl rounded-lg overflow-hidden bg-card">
      <CardHeader className="bg-muted/50">
        <CardTitle className="text-center text-xl font-headline text-primary flex items-center justify-center">
          <ImageIcon className="mr-2 h-6 w-6" /> Create Your Snap
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

        {step === 'initial' && (
          <div className="animate-fade-in space-y-4">
            <p className="text-center text-muted-foreground">Choose how to add your photo:</p>
            <div className="flex space-x-4">
            <Button onClick={startCamera} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 transform hover:scale-105 py-5 text-base" aria-label="Use Camera">
              <Camera className="mr-2 h-6 w-6" /> Use Camera
            </Button>              
            <Button onClick={() => fileInputRef.current?.click()} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 transform hover:scale-105 py-5 text-base" aria-label="Upload a Photo">
              <UploadCloud className="mr-2 h-6 w-6" /> Upload a Photo
            </Button>
            <Input type="file" accept="image/*" onChange={handleFileUpload} ref={fileInputRef} className="hidden" />
            </div>
          </div>
        )}

        {step === 'camera' && (
          <div className="animate-fade-in space-y-4">
            <div className="bg-muted rounded-lg overflow-hidden aspect-[9/16] w-full max-w-xs mx-auto shadow-inner">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" aria-label="Camera feed"></video>
            </div>
            <Button onClick={capturePhoto} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground transition-all duration-300 transform hover:scale-105 py-3 text-base" aria-label="Capture Photo">
              <CheckCircle className="mr-2 h-6 w-6" /> Capture Photo
            </Button>
            <Button onClick={reset} variant="outline" className="w-full transition-colors duration-300" aria-label="Cancel Camera">
              Cancel
            </Button>
          </div>
        )}

        {step === 'preview' && (
          <div className="animate-fade-in space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-center text-primary">Your Masterpiece</h3>
              {isProcessing && (
                <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-3"></div>
                  <p className="text-muted-foreground">Processing your image...</p>
                </div>
              )}
              {!isProcessing && processedImageSrc && (
                <div className="bg-muted rounded-lg overflow-hidden aspect-[9/16] w-full max-w-xs mx-auto shadow-lg border border-primary/30">
                  <Image src={processedImageSrc} alt="Processed Snap" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="w-full h-full object-contain" onError={handleImageError} priority />
                </div>
              )}
               {!isProcessing && !processedImageSrc && userImageSrc && (
                 <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-lg">
                  <AlertTriangle className="h-12 w-12 text-destructive mb-3" />
                  <p className="text-muted-foreground">Could not process image. Frame might be missing.</p>
                </div>
               )}
            </div>
            
            {!isProcessing && processedImageSrc && (
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={handleDownload} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 transform hover:scale-105" aria-label="Download Image">
                  <Download className="mr-2 h-5 w-5" /> Download
                </Button>
                <Button onClick={handleShare} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground transition-all duration-300 transform hover:scale-105" aria-label="Share Image">
                  <Share2 className="mr-2 h-5 w-5" /> Share
                </Button>
              </div>
            )}
             <Button onClick={reset} variant="outline" className="w-full transition-colors duration-300" aria-label="Start Over">
              <RotateCcw className="mr-2 h-5 w-5" /> Start Over
            </Button>
          </div>
        )}
      </CardContent>
      { (step === 'preview' && userImageSrc && !processedImageSrc && !isProcessing) &&
        <CardFooter className="p-4 bg-destructive/10 border-t border-destructive/30">
             <p className="text-sm text-destructive text-center w-full">
                <AlertTriangle className="inline mr-1 h-4 w-4" />
                There was an issue applying the frame. The frame image might be missing or corrupted. Please try refreshing.
             </p>
        </CardFooter>
      }
    </Card>
  );
}
