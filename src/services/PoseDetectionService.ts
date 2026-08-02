import type { DetectionResult } from '@/types';

type BackendPoseResponse = {
  rep_count: number;
  posture_status: 'Correct posture' | 'Incorrect posture' | 'No pose detected';
  accuracy: number;
  feedback: string;
  joint_angles: Record<string, number>;
};

const API_URL = import.meta.env.VITE_POSE_API_URL ?? 'http://localhost:5000/detect_pose';

function postureStatus(status: BackendPoseResponse['posture_status']): DetectionResult['postureStatus'] {
  if (status === 'Correct posture') return 'Good';
  if (status === 'Incorrect posture') return 'Poor';
  return 'Adjusting';
}

function captureFrame(video: HTMLVideoElement): Promise<Blob> {
  if (!video.videoWidth || !video.videoHeight) {
    return Promise.reject(new Error('The camera stream is not ready yet.'));
  }

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext('2d');
  if (!context) return Promise.reject(new Error('Unable to capture the camera frame.'));

  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Unable to encode the camera frame.'));
    }, 'image/jpeg', 0.85);
  });
}

export const PoseDetectionService = {
  async fullDetection(video: HTMLVideoElement): Promise<DetectionResult> {
    const image = await captureFrame(video);
    const formData = new FormData();
    formData.append('image', image, 'camera-frame.jpg');

    const response = await fetch(API_URL, { method: 'POST', body: formData });
    const payload = (await response.json()) as BackendPoseResponse | { error: string };
    if (!response.ok || 'error' in payload) {
      throw new Error('error' in payload ? payload.error : 'Pose detection request failed.');
    }

    return {
      landmarks: [],
      jointAngles: payload.joint_angles,
      postureStatus: postureStatus(payload.posture_status),
      accuracy: payload.accuracy,
      repCount: payload.rep_count,
      calories: Math.round(payload.rep_count * 0.25 * 10) / 10,
      feedback: payload.feedback,
      timestamp: Date.now(),
    };
  },
};
