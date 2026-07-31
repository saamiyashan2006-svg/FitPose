import type { DetectionResult, PoseFrame, PoseLandmark } from '@/types';

const FEEDBACK_POOL = {
  success: ['Great posture!', 'Excellent repetition.', 'Perfect form!', 'Nice and steady.'],
  warning: ['Straighten your back.', 'Raise your arm higher.', 'Bend your knee more.', 'Slow down the movement.'],
  error: ['Adjust your stance.', 'Knee caving inward — correct it.', 'Shoulder dropping detected.'],
};

const LANDMARK_NAMES = [
  'nose', 'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
  'left_wrist', 'right_wrist', 'left_hip', 'right_hip', 'left_knee',
  'right_knee', 'left_ankle', 'right_ankle',
];

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateLandmarks(): PoseLandmark[] {
  return LANDMARK_NAMES.map(() => ({
    x: rand(0.2, 0.8),
    y: rand(0.1, 0.9),
    z: rand(-0.1, 0.1),
    visibility: rand(0.7, 1),
  }));
}

export const PoseDetectionService = {
  async startCamera(): Promise<{ ok: true; message: string }> {
    await new Promise((r) => setTimeout(r, 800));
    return { ok: true, message: 'Camera initialized' };
  },

  async detectPose(): Promise<PoseFrame> {
    await new Promise((r) => setTimeout(r, 40));
    const status = pick<PoseFrame['postureStatus']>(['Good', 'Good', 'Good', 'Adjusting', 'Poor']);
    return {
      landmarks: generateLandmarks(),
      jointAngles: {
        left_elbow: rand(70, 160),
        right_elbow: rand(70, 160),
        left_knee: rand(60, 170),
        right_knee: rand(60, 170),
        spine: rand(150, 180),
        left_shoulder: rand(20, 90),
        right_shoulder: rand(20, 90),
      },
      postureStatus: status,
      timestamp: Date.now(),
    };
  },

  calculateJointAngles(frame: PoseFrame): Record<string, number> {
    return frame.jointAngles;
  },

  countRepetitions(prevCount: number, frame: PoseFrame): number {
    if (frame.postureStatus === 'Good' && Math.random() < 0.18) {
      return prevCount + 1;
    }
    return prevCount;
  },

  calculateAccuracy(frame: PoseFrame, prev: number): number {
    const base = frame.postureStatus === 'Good' ? 95 : frame.postureStatus === 'Adjusting' ? 82 : 68;
    return Math.round(Math.min(100, Math.max(0, prev * 0.7 + base * 0.3)));
  },

  generateFeedback(frame: PoseFrame): { message: string; type: keyof typeof FEEDBACK_POOL } {
    if (frame.postureStatus === 'Good') return { message: pick(FEEDBACK_POOL.success), type: 'success' };
    if (frame.postureStatus === 'Adjusting') return { message: pick(FEEDBACK_POOL.warning), type: 'warning' };
    return { message: pick(FEEDBACK_POOL.error), type: 'error' };
  },

  async fullDetection(prevCount: number, prevAccuracy: number): Promise<DetectionResult> {
    const frame = await this.detectPose();
    const repCount = this.countRepetitions(prevCount, frame);
    const accuracy = this.calculateAccuracy(frame, prevAccuracy);
    const fb = this.generateFeedback(frame);
    return {
      landmarks: frame.landmarks,
      jointAngles: frame.jointAngles,
      postureStatus: frame.postureStatus,
      accuracy,
      repCount,
      calories: Math.round(repCount * 0.25 * 10) / 10,
      feedback: fb.message,
      timestamp: Date.now(),
    };
  },
};
