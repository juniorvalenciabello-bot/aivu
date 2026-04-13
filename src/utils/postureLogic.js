/**
 * Posture analysis utilities for aivU 2.0
 * Includes Repetition Counting, Exercise-Awareness, and Cloud Analytics Precision
 */

/**
 * Calculates the 2D angle between three points to avoid 3D depth jitter
 */
export const calculateAngle = (a, b, c) => {
  if (!a || !b || !c) return 0;
  // Ignore Z (depth) for more stable 2D angle calculation on the camera plane
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  
  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  return angle;
};

// State for repetition counting and smoothing
let repState = 'START'; // START, MID
let repCount = 0;
let lastRepTime = 0;
const REP_COOLDOWN_MS = 500; // Mínimo medio segundo por repetición

// Variables para el filtro Exponential Moving Average (EMA)
let smoothedAngle = null;
const SMOOTHING_FACTOR = 0.2; // Menor = más suave pero con un ligero retraso

/**
 * Resets the repetition counter and state
 */
export const resetReps = () => {
  repCount = 0;
  repState = 'START';
  smoothedAngle = null;
  lastRepTime = 0;
};

/**
 * Analyzes posture based on the selected exercise
 */
export const analyzePosture = (landmarks, exercise) => {
  if (!landmarks || !exercise) return { status: 'idle', message: 'Esperando detección...', reps: repCount, progress: 0, angle: 0, confidence: 0 };

  // Map of joint indices
  const JOINTS = {
    SHOULDER_L: 11, SHOULDER_R: 12,
    ELBOW_L: 13, ELBOW_R: 14,
    WRIST_L: 15, WRIST_R: 16,
    HIP_L: 23, HIP_R: 24,
    KNEE_L: 25, KNEE_R: 26,
    ANKLE_L: 27, ANKLE_R: 28
  };

  let jointA, jointB, jointC;
  
  // Dynamic joint selection based on exercise
  const targetJoint = exercise.target_joint || exercise.targetJoint;

  switch (targetJoint) {
    case 'ELBOW':
      jointA = landmarks[JOINTS.SHOULDER_L];
      jointB = landmarks[JOINTS.ELBOW_L];
      jointC = landmarks[JOINTS.WRIST_L];
      break;
    case 'SHOULDER':
      jointA = landmarks[JOINTS.HIP_L];
      jointB = landmarks[JOINTS.SHOULDER_L];
      jointC = landmarks[JOINTS.ELBOW_L];
      break;
    case 'KNEE':
      jointA = landmarks[JOINTS.HIP_L];
      jointB = landmarks[JOINTS.KNEE_L];
      jointC = landmarks[JOINTS.ANKLE_L];
      break;
    default:
      jointA = landmarks[JOINTS.SHOULDER_L];
      jointB = landmarks[JOINTS.ELBOW_L];
      jointC = landmarks[JOINTS.WRIST_L];
  }

  const rawAngle = calculateAngle(jointA, jointB, jointC);
  const confidence = jointB?.visibility || 0;

  // EMA Filter: Suavizado de vibraciones y ruido de la cámara
  if (smoothedAngle === null) {
    smoothedAngle = rawAngle;
  } else {
    smoothedAngle = (rawAngle * SMOOTHING_FACTOR) + (smoothedAngle * (1 - SMOOTHING_FACTOR));
  }

  // Repetition Counting Logic (State Machine con Cooldown)
  const minAngle = exercise.min_angle || exercise.minAngle || 45;
  const maxAngle = exercise.max_angle || exercise.maxAngle || 150;

  const thresholdEnd = maxAngle - 10;
  const thresholdStart = minAngle + 10;
  
  const now = Date.now();

  if (repState === 'START' && smoothedAngle < thresholdStart) {
    repState = 'MID';
  } else if (repState === 'MID' && smoothedAngle > thresholdEnd) {
    if (now - lastRepTime > REP_COOLDOWN_MS) {
      repState = 'START';
      repCount++;
      lastRepTime = now;
      window.dispatchEvent(new CustomEvent('rep-complete', { detail: repCount }));
    }
  }

  // Quality check
  const isCorrect = smoothedAngle >= minAngle && smoothedAngle <= maxAngle;
  
  // Progress Calculation
  const progress = Math.min(100, Math.max(0, ((smoothedAngle - minAngle) / (maxAngle - minAngle)) * 100));

  return {
    angle: Math.round(smoothedAngle),
    confidence: Math.round(confidence * 100),
    reps: repCount,
    status: isCorrect ? 'correct' : 'warning',
    message: isCorrect ? '¡Excelente forma!' : 'Ajusta el rango de movimiento',
    progress: progress
  };
};
