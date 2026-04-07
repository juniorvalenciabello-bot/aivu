import { useEffect, useRef, useState } from 'react';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';

const MODEL_PATH = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

export const usePoseDetection = (videoRef, canvasRef, active) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const poseLandmarker = useRef(null);
  const requestRef = useRef(null);

  useEffect(() => {
    const initDetector = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.20/wasm"
        );
        
        poseLandmarker.current = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_PATH,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numPoses: 1
        });
        
        setIsLoaded(true);
      } catch (err) {
        console.error("MediaPipe initialization error:", err);
        setError(err.message);
      }
    };

    initDetector();

    return () => {
      if (poseLandmarker.current) {
        poseLandmarker.current.close();
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!active || !isLoaded || !videoRef.current || !canvasRef.current || !poseLandmarker.current) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const drawingUtils = new DrawingUtils(ctx);

    let lastVideoTime = -1;

    const renderLoop = () => {
      if (!videoRef.current || videoRef.current.readyState !== 4) {
        requestRef.current = requestAnimationFrame(renderLoop);
        return;
      }

      const startTimeMs = performance.now();
      if (lastVideoTime !== videoRef.current.currentTime) {
        lastVideoTime = videoRef.current.currentTime;
        
        const results = poseLandmarker.current.detectForVideo(videoRef.current, startTimeMs);
        
        // Clear and draw
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (results.landmarks && results.landmarks.length > 0) {
          for (const landmarks of results.landmarks) {
            // Draw skeleton landmarks
            drawingUtils.drawLandmarks(landmarks, {
              radius: (data) => DrawingUtils.lerp(data.from.z, -0.15, 0.1, 5, 1),
              color: '#00f2ff',
              lineWidth: 2
            });
            drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, {
              color: '#00f2ff',
              lineWidth: 2
            });
          }
          
          // Emit event or update ref for posture analysis
          window.dispatchEvent(new CustomEvent('pose-update', { detail: results.landmarks[0] }));
        }
        ctx.restore();
      }
      
      requestRef.current = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [active, isLoaded, videoRef, canvasRef]);

  return { isLoaded, error };
};
