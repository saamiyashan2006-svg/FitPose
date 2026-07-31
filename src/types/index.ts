export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type BodyPart = 'Full Body' | 'Legs' | 'Shoulders' | 'Arms' | 'Neck' | 'Hips';
export type Gender = 'Male' | 'Female' | 'Other' | 'Prefer not to say';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  durationSec: number;
  bodyPart: BodyPart;
  targetReps: number;
  caloriesPerRep: number;
  imageQuery: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  age: number;
  heightCm: number;
  weightKg: number;
  gender: Gender;
  medicalCondition: string;
  goal: string;
  createdAt: number;
}

export interface SessionRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  reps: number;
  accuracy: number;
  calories: number;
  durationSec: number;
  date: number;
}

export interface FeedbackEntry {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  timestamp: number;
}

export interface PoseLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface PoseFrame {
  landmarks: PoseLandmark[];
  jointAngles: Record<string, number>;
  postureStatus: 'Good' | 'Adjusting' | 'Poor';
  timestamp: number;
}

export interface DetectionResult {
  landmarks: PoseLandmark[];
  jointAngles: Record<string, number>;
  postureStatus: PoseFrame['postureStatus'];
  accuracy: number;
  repCount: number;
  calories: number;
  feedback: string;
  timestamp: number;
}
