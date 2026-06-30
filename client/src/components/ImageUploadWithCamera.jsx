import React, { useState, useRef, useEffect } from 'react';
import { FaCamera, FaUpload, FaRedo, FaCheck, FaTimes } from 'react-icons/fa';

const ImageUploadWithCamera = ({ onImageCaptured, imagePreview, isRequired = false }) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Cleanup camera stream when component unmounts or camera closes
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startCamera = async () => {
    setCameraError('');
    setCapturedImage(null);
    setIsCameraOpen(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError('Unable to access camera. Please check permissions.');
    }
  };

  const closeCamera = () => {
    stopCamera();
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(dataUrl);
      stopCamera(); // Stop live feed while showing preview
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera(); // Restart live feed
  };

  const acceptPhoto = () => {
    if (capturedImage && canvasRef.current) {
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `camera_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
          onImageCaptured(file);
        }
      }, 'image/jpeg', 0.9);
      
      closeCamera();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onImageCaptured(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      {!isCameraOpen ? (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                required={isRequired && !imagePreview}
                ref={fileInputRef}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-accent hover:file:bg-amber-100 border border-gray-300 rounded-lg p-1.5 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white" 
              />
            </div>
            
            <button 
              type="button" 
              onClick={startCamera}
              className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors flex-shrink-0"
            >
              <FaCamera /> Take Photo
            </button>
          </div>
          
          {imagePreview && (
            <div className="mt-2 relative w-32 h-32 rounded-lg overflow-hidden border border-border">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-700 relative flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center p-3 bg-slate-800 text-white">
            <h3 className="font-semibold text-sm">Take Photo</h3>
            <button type="button" onClick={closeCamera} className="text-slate-400 hover:text-white transition-colors">
              <FaTimes />
            </button>
          </div>
          
          {/* Viewport */}
          <div className="relative bg-black w-full aspect-[4/3] flex items-center justify-center">
            {cameraError ? (
              <p className="text-red-400 text-sm text-center px-4">{cameraError}</p>
            ) : capturedImage ? (
              <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
            ) : (
              <video 
                ref={videoRef} 
                className="w-full h-full object-cover" 
                autoPlay 
                playsInline 
                muted 
              />
            )}
            
            <canvas ref={canvasRef} className="hidden" />
          </div>
          
          {/* Controls */}
          <div className="p-4 bg-slate-800 flex justify-center gap-4">
            {!cameraError && !capturedImage && (
              <button 
                type="button" 
                onClick={capturePhoto}
                className="w-14 h-14 bg-white rounded-full border-4 border-slate-400 hover:bg-gray-200 transition-colors flex items-center justify-center shadow-lg"
                aria-label="Capture"
              />
            )}
            
            {capturedImage && (
              <>
                <button 
                  type="button" 
                  onClick={retakePhoto}
                  className="flex items-center gap-2 bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  <FaRedo /> Retake
                </button>
                <button 
                  type="button" 
                  onClick={acceptPhoto}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-md"
                >
                  <FaCheck /> Use Photo
                </button>
              </>
            )}
            
            {cameraError && (
              <button 
                type="button" 
                onClick={closeCamera}
                className="bg-slate-600 hover:bg-slate-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Go Back
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadWithCamera;
