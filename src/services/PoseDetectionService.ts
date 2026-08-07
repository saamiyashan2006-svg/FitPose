import type { DetectionResult } from '@/types';

type BackendPoseResponse = {
  rep_count: number;
  posture_status: 'Correct posture' | 'Incorrect posture' | 'No pose detected';
  accuracy: number;
  feedback: string;
  detected_issues: string[];
  joint_angles: Record<string, number>;
  confidence_score: number;
  personalized_correction: string;
  landmarks: DetectionResult['landmarks'];
};

type BackendHealthResponse = {
  status: 'ok' | 'error';
  service?: string;
};

const DEFAULT_PRODUCTION_API_BASE_URL = 'https://fitpose-1.onrender.com';
const DEFAULT_LOCAL_API_BASE_URL = 'http://127.0.0.1:5000';

function buildApiUrl(baseUrl: string, endpoint: 'detect_pose' | 'health') {
  const trimmedBaseUrl = baseUrl.trim().replace(/\/+$/, '');
  return `${trimmedBaseUrl}/${endpoint}`;
}

const configuredApiUrl = import.meta.env.VITE_POSE_API_URL?.trim();
const isProduction = import.meta.env.PROD;
const apiBaseUrl = configuredApiUrl
  ? (configuredApiUrl.endsWith('/detect_pose') ? configuredApiUrl.replace(/\/detect_pose$/, '') : configuredApiUrl)
  : (isProduction ? DEFAULT_PRODUCTION_API_BASE_URL : DEFAULT_LOCAL_API_BASE_URL);

const API_URL = buildApiUrl(apiBaseUrl, 'detect_pose');
const HEALTH_URL = buildApiUrl(apiBaseUrl, 'health');

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
  async healthCheck(): Promise<boolean> {
    const urls = isProduction ? [HEALTH_URL] : [HEALTH_URL, buildApiUrl(DEFAULT_PRODUCTION_API_BASE_URL, 'health')];
    for (const url of urls) {
      try {
        const response = await fetch(url, { method: 'GET' });
        const payload = (await response.json().catch(() => ({}))) as BackendHealthResponse | Record<string, unknown>;
        if (response.ok && payload.status === 'ok') return true;
      } catch {
        // try next endpoint
      }
    }
    return false;
  },

  async fullDetection(video: HTMLVideoElement, exercise = 'squats'): Promise<DetectionResult> {
    const image = await captureFrame(video);
    const formData = new FormData();
    formData.append('image', image, 'camera-frame.jpg');
    formData.append('exercise', exercise);

    let response: Response | null = null;
    let payload: BackendPoseResponse | { error: string } = { error: 'Pose AI is offline. Please try again later.' };
    const endpoints = isProduction ? [API_URL] : [API_URL, buildApiUrl(DEFAULT_PRODUCTION_API_BASE_URL, 'detect_pose')];
    for (const endpoint of endpoints) {
      try {
        response = await fetch(endpoint, { method: 'POST', body: formData });
        payload = (await response.json().catch(() => ({
          error: 'Pose AI is offline. Please try again later.',
        }))) as BackendPoseResponse | { error: string };
        if (response.ok && !('error' in payload)) break;
      } catch {
        response = null;
      }
    }
    if (!response || !response.ok || 'error' in payload) {
      throw new Error('error' in payload ? payload.error : 'Pose detection request failed.');
    }

    return {
      landmarks: payload.landmarks,
      jointAngles: payload.joint_angles,
      postureStatus: postureStatus(payload.posture_status),
      accuracy: payload.accuracy,
      repCount: payload.rep_count,
      calories: Math.round(payload.rep_count * 0.25 * 10) / 10,
      feedback: payload.feedback,
      detectedIssues: payload.detected_issues ?? [],
      confidenceScore: payload.confidence_score ?? 0,
      personalizedCorrection: payload.personalized_correction ?? payload.feedback,
      timestamp: Date.now(),
    };
  },
};


