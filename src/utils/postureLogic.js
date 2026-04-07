/**
 * Posture analysis utilities for aivU 2.0
 * Includes Repetition Counting and Exercise-Awareness (Snake Case for DB)
 */

/**
 * Calculates the angle between three 3D points
 */
export const calculateAngle = (a, b, c) => {
  if (!a || !b || !c) return 0;
  const ab = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  const cb = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };
  const dotProduct = ab.x * cb.x + ab.y * cb.y + ab.z * cb.z;
  const magAB = Math.sqrt(ab.x * ab.x + ab.y * ab.y + ab.z * ab.z);
  const magCB = Math.sqrt(cb.x * cb.x + cb.y * cb.y + cb.z * cb.z);
  const angleRad = Math.acos(Math.max(-1, Math.min(1, dotProduct / (magAB * magCB))));
  return (angleRad * 180.0) / Math.PI;
};

// State for repetition counting
let repState = 'START'; // START, MID
let repCount = 0;

/**
 * Resets the repetition counter
 */
export const resetReps = () => {
  repCount = 0;
  repState = 'START';
};

/**
 * Analyzes posture based on the selected exercise
 */
export const analyzePosture = (landmarks, exercise) => {
  if (!landmarks || !exercise) return { status: 'idle', message: 'Esperando detección...', reps: repCount };

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
  
  // Dynamic joint selection based on exercise (using database fields: target_joint)
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

  const currentAngle = calculateAngle(jointA, jointB, jointC);
  const confidence = jointB?.visibility || 0;

  // Repetition Counting Logic (State Machine)
  const minAngle = exercise.min_angle || exercise.minAngle || 45;
  const maxAngle = exercise.max_angle || exercise.maxAngle || 150;

  const thresholdEnd = maxAngle - 10;
  const thresholdStart = minAngle + 10;

  if (repState === 'START' && currentAngle < thresholdStart) {
    repState = 'MID';
  } else if (repState === 'MID' && currentAngle > thresholdEnd) {
    repState = 'START';
    repCount++;
    window.dispatchEvent(new CustomEvent('rep-complete', { detail: repCount }));
  }

  // Quality check
  const isCorrect = currentAngle >= minAngle && currentAngle <= maxAngle;

  return {
    angle: Math.round(currentAngle),
    confidence: Math.round(confidence * 100),
    reps: repCount,
    status: isCorrect ? 'correct' : 'warning',
    message: isCorrect ? '¡Excelente forma!' : 'Ajusta el rango de movimiento',
    progress: Math.min(100, Math.max(0, ((currentAngle - minAngle) / (maxAngle - minAngle)) * 100))
  };
};
