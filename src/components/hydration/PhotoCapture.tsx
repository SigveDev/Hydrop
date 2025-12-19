import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Camera, Check, RotateCcw, ImageIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface PhotoCaptureProps {
  open: boolean
  onClose: () => void
  onCapture: (base64: string) => void
}

export function PhotoCapture({ open, onClose, onCapture }: PhotoCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>(
    'environment',
  )
  const [cameraStarted, setCameraStarted] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Detect iOS
  useEffect(() => {
    const iOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    setIsIOS(iOS)
  }, [])

  const startCamera = useCallback(async () => {
    try {
      setError(null)

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError(
          'Camera not supported on this device. Please upload a photo instead.',
        )
        return
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)
      setCameraStarted(true)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        // Important for iOS - must call play() after setting srcObject
        try {
          await videoRef.current.play()
        } catch (playError) {
          console.error('Video play error:', playError)
        }
      }
    } catch (err) {
      console.error('Camera error:', err)

      const error = err as DOMException

      // Provide more specific error messages
      if (
        error.name === 'NotAllowedError' ||
        error.name === 'PermissionDeniedError'
      ) {
        setError(
          'Camera access denied. Please allow camera permissions in your browser settings, or upload a photo instead.',
        )
      } else if (
        error.name === 'NotFoundError' ||
        error.name === 'DevicesNotFoundError'
      ) {
        setError(
          'No camera found on this device. Please upload a photo instead.',
        )
      } else if (
        error.name === 'NotReadableError' ||
        error.name === 'TrackStartError'
      ) {
        setError(
          'Camera is in use by another app. Please close other apps using the camera, or upload a photo.',
        )
      } else if (error.name === 'OverconstrainedError') {
        // Try again with simpler constraints
        try {
          const simpleStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          })
          setStream(simpleStream)
          setCameraStarted(true)
          if (videoRef.current) {
            videoRef.current.srcObject = simpleStream
            await videoRef.current.play()
          }
          return
        } catch {
          setError('Could not access camera. Please upload a photo instead.')
        }
      } else {
        setError(
          'Could not access camera. Please allow camera permissions or upload a photo.',
        )
      }
    }
  }, [facingMode])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setCameraStarted(false)
  }, [stream])

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      stopCamera()
      setCapturedImage(null)
      setError(null)
      setCameraStarted(false)
      onClose()
    }
  }

  // Start camera when dialog opens (but not on iOS - they should use file input)
  useEffect(() => {
    if (open && !isIOS && !cameraStarted && !capturedImage) {
      // Small delay to ensure dialog is rendered
      const timer = setTimeout(() => {
        startCamera()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [open, isIOS, cameraStarted, capturedImage, startCamera])

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    // Set canvas size to video size
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0)

    // Compress and convert to base64
    const base64 = canvas.toDataURL('image/jpeg', 0.7)
    setCapturedImage(base64)
    stopCamera()
  }

  const retakePhoto = () => {
    setCapturedImage(null)
    if (!isIOS) {
      startCamera()
    }
  }

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage)
      handleOpenChange(false)
    }
  }

  const switchCamera = () => {
    stopCamera()
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
    setTimeout(startCamera, 100)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        // Resize to max 1280px while maintaining aspect ratio
        const maxSize = 1280
        let width = img.width
        let height = img.height

        if (width > height && width > maxSize) {
          height = (height * maxSize) / width
          width = maxSize
        } else if (height > maxSize) {
          width = (width * maxSize) / height
          height = maxSize
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.drawImage(img, 0, 0, width, height)
        const base64 = canvas.toDataURL('image/jpeg', 0.7)
        setCapturedImage(base64)
        stopCamera()
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)

    // Reset input so same file can be selected again
    e.target.value = ''
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  // For iOS, show file upload UI by default
  const showIOSUploadUI = isIOS && !capturedImage

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-black">
        <DialogHeader className="p-4 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 right-0 z-10">
          <DialogTitle className="text-white flex items-center justify-between">
            <span>Take a Photo of Your Drink</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleOpenChange(false)}
              className="text-white hover:bg-white/20 -mr-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="relative aspect-[3/4] bg-black">
          <canvas ref={canvasRef} className="hidden" />

          <AnimatePresence mode="wait">
            {capturedImage ? (
              <motion.img
                key="captured"
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            ) : showIOSUploadUI ? (
              <motion.div
                key="ios-upload"
                className="w-full h-full flex flex-col items-center justify-center p-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center mb-6">
                  <Camera className="w-12 h-12 text-white/50" />
                </div>
                <p className="text-white/90 text-lg font-medium mb-2">
                  Capture Your Drink
                </p>
                <p className="text-white/60 text-sm mb-6">
                  Take a photo to verify your water intake
                </p>
                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <Button
                    onClick={triggerFileInput}
                    className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white h-12"
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Take Photo
                  </Button>
                  <Button
                    variant="outline"
                    onClick={triggerFileInput}
                    className="border-white/30 text-white hover:bg-white/10 h-12"
                  >
                    <ImageIcon className="w-5 h-5 mr-2" />
                    Choose from Library
                  </Button>
                </div>
                {/* Hidden file input with capture attribute for iOS */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                className="w-full h-full flex flex-col items-center justify-center p-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Camera className="w-16 h-16 text-white/30 mb-4" />
                <p className="text-white/70 mb-4">{error}</p>
                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <Button
                    onClick={startCamera}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  <Button
                    onClick={triggerFileInput}
                    className="bg-white text-black hover:bg-white/90"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </motion.div>
            ) : (
              <motion.video
                key="video"
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            {capturedImage ? (
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={retakePhoto}
                  className="rounded-full w-14 h-14 p-0 border-white/30 bg-white/10 hover:bg-white/20"
                >
                  <RotateCcw className="w-6 h-6 text-white" />
                </Button>
                <Button
                  size="lg"
                  onClick={confirmPhoto}
                  className="rounded-full w-16 h-16 p-0 bg-green-500 hover:bg-green-600"
                >
                  <Check className="w-8 h-8 text-white" />
                </Button>
              </div>
            ) : !error && !showIOSUploadUI ? (
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={switchCamera}
                  className="rounded-full w-12 h-12 p-0 border-white/30 bg-white/10 hover:bg-white/20"
                >
                  <RotateCcw className="w-5 h-5 text-white" />
                </Button>
                <Button
                  size="lg"
                  onClick={capturePhoto}
                  className="rounded-full w-16 h-16 p-0 bg-white hover:bg-white/90"
                >
                  <div className="w-12 h-12 rounded-full border-4 border-black/20" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={triggerFileInput}
                  className="rounded-full w-12 h-12 p-0 border-white/30 bg-white/10 hover:bg-white/20"
                >
                  <ImageIcon className="w-5 h-5 text-white" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
