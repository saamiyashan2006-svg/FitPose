import type { Exercise, SessionRecord, UserProfile } from '@/types';

export const EXERCISES: Exercise[] = [
  {
    id: 'squats',
    name: 'Squats',
    description: 'Lower-body strength builder focusing on quads, glutes and core stability.',
    difficulty: 'Intermediate',
    durationSec: 180,
    bodyPart: 'Legs',
    targetReps: 15,
    caloriesPerRep: 0.32,
    imageQuery: 'person doing squat exercise fitness',
  },
  {
    id: 'knee-bend',
    name: 'Knee Bend',
    description: 'Controlled knee flexion to improve joint mobility and post-surgery recovery.',
    difficulty: 'Beginner',
    durationSec: 120,
    bodyPart: 'Legs',
    targetReps: 12,
    caloriesPerRep: 0.22,
    imageQuery: 'knee rehabilitation exercise physical therapy',
  },
  {
    id: 'shoulder-raise',
    name: 'Shoulder Raise',
    description: 'Lateral raise to strengthen deltoids and restore shoulder range of motion.',
    difficulty: 'Beginner',
    durationSec: 150,
    bodyPart: 'Shoulders',
    targetReps: 14,
    caloriesPerRep: 0.18,
    imageQuery: 'shoulder raise exercise fitness',
  },
  {
    id: 'arm-stretch',
    name: 'Arm Stretch',
    description: 'Dynamic arm stretch to loosen tight muscles and boost upper-body flexibility.',
    difficulty: 'Beginner',
    durationSec: 90,
    bodyPart: 'Arms',
    targetReps: 10,
    caloriesPerRep: 0.12,
    imageQuery: 'arm stretching exercise wellness',
  },
  {
    id: 'neck-stretch',
    name: 'Neck Stretch',
    description: 'Gentle cervical stretches to relieve tension and reduce neck stiffness.',
    difficulty: 'Beginner',
    durationSec: 60,
    bodyPart: 'Neck',
    targetReps: 8,
    caloriesPerRep: 0.08,
    imageQuery: 'neck stretch relaxation wellness',
  },
  {
    id: 'hip-rotation',
    name: 'Hip Rotation',
    description: 'Circular hip movements to enhance pelvic mobility and core coordination.',
    difficulty: 'Intermediate',
    durationSec: 120,
    bodyPart: 'Hips',
    targetReps: 12,
    caloriesPerRep: 0.2,
    imageQuery: 'hip rotation mobility exercise',
  },
];

export const DEFAULT_PROFILE: Omit<UserProfile, 'uid' | 'name' | 'email' | 'photoURL'> = {
  age: 28,
  heightCm: 174,
  weightKg: 70,
  gender: 'Prefer not to say',
  medicalCondition: 'None',
  goal: 'Improve mobility & reduce back pain',
  createdAt: Date.now(),
};

export const RECENT_SESSIONS: SessionRecord[] = [
  { id: 's1', exerciseId: 'squats', exerciseName: 'Squats', reps: 14, accuracy: 92, calories: 4.5, durationSec: 180, date: Date.now() - 1000 * 60 * 60 * 4 },
  { id: 's2', exerciseId: 'shoulder-raise', exerciseName: 'Shoulder Raise', reps: 12, accuracy: 88, calories: 2.2, durationSec: 150, date: Date.now() - 1000 * 60 * 60 * 28 },
  { id: 's3', exerciseId: 'neck-stretch', exerciseName: 'Neck Stretch', reps: 8, accuracy: 95, calories: 0.6, durationSec: 60, date: Date.now() - 1000 * 60 * 60 * 52 },
  { id: 's4', exerciseId: 'knee-bend', exerciseName: 'Knee Bend', reps: 10, accuracy: 84, calories: 2.2, durationSec: 120, date: Date.now() - 1000 * 60 * 60 * 76 },
];

export const WEEKLY_DATA = [
  { day: 'Mon', sessions: 2, accuracy: 88, calories: 12 },
  { day: 'Tue', sessions: 1, accuracy: 91, calories: 7 },
  { day: 'Wed', sessions: 3, accuracy: 93, calories: 18 },
  { day: 'Thu', sessions: 0, accuracy: 0, calories: 0 },
  { day: 'Fri', sessions: 2, accuracy: 90, calories: 14 },
  { day: 'Sat', sessions: 4, accuracy: 95, calories: 22 },
  { day: 'Sun', sessions: 1, accuracy: 87, calories: 5 },
];

export const MONTHLY_DATA = [
  { week: 'W1', sessions: 9, accuracy: 86, calories: 58 },
  { week: 'W2', sessions: 12, accuracy: 89, calories: 74 },
  { week: 'W3', sessions: 7, accuracy: 91, calories: 44 },
  { week: 'W4', sessions: 14, accuracy: 93, calories: 88 },
];

export const ACHIEVEMENTS = [
  { id: 'a1', name: 'First Steps', description: 'Complete your first session', icon: 'Award', unlocked: true },
  { id: 'a2', name: '7-Day Streak', description: 'Exercise 7 days in a row', icon: 'Flame', unlocked: true },
  { id: 'a3', name: 'Form Master', description: 'Reach 95% accuracy', icon: 'Target', unlocked: true },
  { id: 'a4', name: 'Centurion', description: 'Complete 100 reps total', icon: 'Trophy', unlocked: false },
  { id: 'a5', name: 'Early Bird', description: 'Exercise before 7 AM', icon: 'Sunrise', unlocked: true },
  { id: 'a6', name: 'Iron Will', description: '30-day streak', icon: 'Medal', unlocked: false },
];
