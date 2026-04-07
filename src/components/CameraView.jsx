import React, { useRef, useEffect, useState } from 'react';
import { usePoseDetection } from '../hooks/usePoseDetection';
import { Camera, CameraOff, Loader2, AlertCircle } from 'lucide-react';
import './CameraView.css';

const CameraView = ({ active }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const { isLoaded, error } = usePoseDetection(videoRef, canvasRef, active);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, frameRate: { ideal: 30 } }
        });
        setStream(userStream);
        if (videoRef.current) {
          videoRef.current.srcObject = userStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    if (active) {
      startCamera();
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [active]);

  return (
    <div className="camera-container glass">
      {!active ? (
        <div className="camera-placeholder">
          <CameraOff size={64} color="var(--text-dim)" strokeWidth={1} />
          <p>La cámara está desactivada</p>
          <span>Presiona "Comenzar Sesión" para iniciar el análisis</span>
        </div>
      ) : (
        <>
          {!isLoaded && !error && (
            <div className="camera-overlay loading">
              <Loader2 className="animate-spin" size={48} color="var(--accent-cyan)" />
              <p>Inicializando IA...</p>
            </div>
          )}
          
          {error && (
            <div className="camera-overlay error">
              <AlertCircle size={48} color="var(--accent-danger)" />
              <p>Error de Inicialización</p>
              <span>{error}</span>
            </div>
          )}

          <video
            ref={videoRef}
            className="video-feed"
            autoPlay
            playsInline
            muted
          />
          <canvas
            ref={canvasRef}
            className="pose-overlay"
            width={1280}
            height={720}
          />

          <div className="camera-controls">
            <div className="control-badge glass">
              <Camera size={16} />
              <span>HD Live</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CameraView;
