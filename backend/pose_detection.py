"""MediaPipe Tasks pose detection, exercise analysis, and landmark drawing."""

from __future__ import annotations

import math
import os
import threading
import time
from pathlib import Path

import cv2
import mediapipe as mp


MODEL_PATH = Path(
    os.environ.get(
        "POSE_LANDMARKER_MODEL",
        Path(__file__).with_name("models") / "pose_landmarker_lite.task",
    )
)

# Landmark index pairs from the 33-point BlazePose landmark layout.
POSE_CONNECTIONS = (
    (0, 1), (1, 2), (2, 3), (3, 7), (0, 4), (4, 5), (5, 6), (6, 8),
    (9, 10), (11, 12), (11, 13), (13, 15), (15, 17), (15, 19), (15, 21),
    (17, 19), (12, 14), (14, 16), (16, 18), (16, 20), (16, 22), (18, 20),
    (11, 23), (12, 24), (23, 24), (23, 25), (24, 26), (25, 27), (26, 28),
    (27, 29), (28, 30), (29, 31), (30, 32), (27, 31), (28, 32),
)

# MediaPipe pose landmark indices used for joint-angle analysis.
LEFT_SHOULDER, RIGHT_SHOULDER = 11, 12
LEFT_ELBOW, RIGHT_ELBOW = 13, 14
LEFT_WRIST, RIGHT_WRIST = 15, 16
LEFT_HIP, RIGHT_HIP = 23, 24
LEFT_KNEE, RIGHT_KNEE = 25, 26
LEFT_ANKLE, RIGHT_ANKLE = 27, 28
NOSE = 0


def _create_landmarker() -> mp.tasks.vision.PoseLandmarker:
    if not MODEL_PATH.is_file():
        raise FileNotFoundError(
            f"Pose model was not found at '{MODEL_PATH}'. "
            "Download pose_landmarker_lite.task into backend/models or set "
            "the POSE_LANDMARKER_MODEL environment variable."
        )

    options = mp.tasks.vision.PoseLandmarkerOptions(
        base_options=mp.tasks.BaseOptions(model_asset_path=str(MODEL_PATH)),
        running_mode=mp.tasks.vision.RunningMode.VIDEO,
        num_poses=1,
        min_pose_detection_confidence=0.5,
        min_pose_presence_confidence=0.5,
        min_tracking_confidence=0.5,
    )
    return mp.tasks.vision.PoseLandmarker.create_from_options(options)


class ExerciseAnalyzer:
    """Analyzes pose landmarks and produces exercise-specific feedback from joint angles."""

    def __init__(self) -> None:
        self.rep_count = 0
        self.phase = "up"
        self._exercise_confidence = 0
        self._active_exercise: str | None = None
        self._session_state = "idle"

    @staticmethod
    def _angle(first, vertex, third) -> float:
        """Return a 2D joint angle in degrees for three normalized landmarks."""
        first_vector = (first.x - vertex.x, first.y - vertex.y)
        third_vector = (third.x - vertex.x, third.y - vertex.y)
        first_length = math.hypot(*first_vector)
        third_length = math.hypot(*third_vector)
        if not first_length or not third_length:
            return 0.0
        cosine = (
            first_vector[0] * third_vector[0] + first_vector[1] * third_vector[1]
        ) / (first_length * third_length)
        return round(math.degrees(math.acos(max(-1.0, min(1.0, cosine)))), 1)

    @staticmethod
    def _midpoint(first, second):
        return type("Midpoint", (), {"x": (first.x + second.x) / 2, "y": (first.y + second.y) / 2, "z": (first.z + second.z) / 2, "visibility": (first.visibility + second.visibility) / 2})()

    def _joint_angles(self, landmarks) -> dict[str, float]:
        shoulder_mid = self._midpoint(landmarks[LEFT_SHOULDER], landmarks[RIGHT_SHOULDER])
        hip_mid = self._midpoint(landmarks[LEFT_HIP], landmarks[RIGHT_HIP])
        knee_mid = self._midpoint(landmarks[LEFT_KNEE], landmarks[RIGHT_KNEE])
        return {
            "left_elbow": self._angle(landmarks[LEFT_SHOULDER], landmarks[LEFT_ELBOW], landmarks[LEFT_WRIST]),
            "right_elbow": self._angle(landmarks[RIGHT_SHOULDER], landmarks[RIGHT_ELBOW], landmarks[RIGHT_WRIST]),
            "left_shoulder": self._angle(landmarks[LEFT_ELBOW], landmarks[LEFT_SHOULDER], landmarks[LEFT_HIP]),
            "right_shoulder": self._angle(landmarks[RIGHT_ELBOW], landmarks[RIGHT_SHOULDER], landmarks[RIGHT_HIP]),
            "left_hip": self._angle(landmarks[LEFT_SHOULDER], landmarks[LEFT_HIP], landmarks[LEFT_KNEE]),
            "right_hip": self._angle(landmarks[RIGHT_SHOULDER], landmarks[RIGHT_HIP], landmarks[RIGHT_KNEE]),
            "left_knee": self._angle(landmarks[LEFT_HIP], landmarks[LEFT_KNEE], landmarks[LEFT_ANKLE]),
            "right_knee": self._angle(landmarks[RIGHT_HIP], landmarks[RIGHT_KNEE], landmarks[RIGHT_ANKLE]),
            "back": self._angle(shoulder_mid, hip_mid, knee_mid),
            "neck": self._angle(shoulder_mid, landmarks[NOSE], hip_mid),
        }

    @staticmethod
    def _serialize_landmarks(landmarks) -> list[dict[str, float]]:
        return [
            {
                "x": round(landmark.x, 5),
                "y": round(landmark.y, 5),
                "z": round(landmark.z, 5),
                "visibility": round(landmark.visibility, 5),
            }
            for landmark in landmarks
        ]

    @staticmethod
    def _normalize_exercise(exercise: str | None) -> str:
        if not exercise:
            return "squats"
        normalized = str(exercise).strip().lower().replace(" ", "-")
        mapping = {
            "squat": "squats",
            "squats": "squats",
            "push-up": "push-up",
            "pushup": "push-up",
            "plank": "plank",
            "shoulder-raise": "shoulder-raise",
            "shoulder-raises": "shoulder-raise",
            "knee-bend": "knee-bend",
            "neck-stretch": "neck-stretch",
            "hip-rotation": "hip-rotation",
        }
        return mapping.get(normalized, "squats")

    def _confidence_score(self, landmarks, angles: dict[str, float]) -> float:
        relevant_visibility = [
            landmark.visibility
            for landmark in landmarks
            if getattr(landmark, "visibility", 0.0) is not None
        ]
        visibility_score = sum(relevant_visibility) / len(relevant_visibility) if relevant_visibility else 0.0
        asymmetry_penalty = (
            abs(angles["left_knee"] - angles["right_knee"]) / 90
            + abs(angles["left_elbow"] - angles["right_elbow"]) / 90
            + abs(angles["left_shoulder"] - angles["right_shoulder"]) / 90
        ) / 3
        return round(max(0.0, min(1.0, 0.6 * visibility_score + 0.4 * (1 - min(1.0, asymmetry_penalty)))), 2)

    def _detect_exercise(self, angles: dict[str, float], exercise: str | None = None) -> str | None:
        exercise_key = self._normalize_exercise(exercise)
        average_knee_angle = (angles["left_knee"] + angles["right_knee"]) / 2
        average_elbow_angle = (angles["left_elbow"] + angles["right_elbow"]) / 2
        average_shoulder_angle = (angles["left_shoulder"] + angles["right_shoulder"]) / 2

        if exercise_key == "squats":
            if average_knee_angle <= 130 and average_knee_angle >= 70:
                return "squats"
            return None

        if exercise_key == "push-up":
            if average_elbow_angle <= 130 and average_elbow_angle >= 70:
                return "push-up"
            return None

        if exercise_key == "plank":
            if angles["back"] <= 180 and angles["back"] >= 140 and average_shoulder_angle <= 180 and average_shoulder_angle >= 120:
                return "plank"
            return None

        if exercise_key == "shoulder-raise":
            if average_elbow_angle >= 120:
                return "shoulder-raise"
            return None

        return None

    def _update_active_exercise(self, detected_exercise: str | None) -> str | None:
        if detected_exercise is None:
            self._exercise_confidence = 0
            self._active_exercise = None
            self._session_state = "idle"
            return None

        if self._active_exercise == detected_exercise:
            self._exercise_confidence = min(3, self._exercise_confidence + 1)
        else:
            self._active_exercise = detected_exercise
            self._exercise_confidence = 1

        if self._exercise_confidence == 1:
            self._session_state = "starting"
        elif self._exercise_confidence == 2:
            self._session_state = "active"
        else:
            self._session_state = "active"

        return detected_exercise if self._exercise_confidence >= 3 else None

    def analyze(self, landmarks: list | None, exercise: str | None = None) -> dict:
        if not landmarks:
            return {
                "rep_count": self.rep_count,
                "posture_status": "No exercise detected",
                "accuracy": 0,
                "feedback": "No exercise detected.",
                "detected_issues": ["No exercise detected"],
                "joint_angles": {},
                "confidence_score": 0.0,
                "personalized_correction": "Stand still and begin the movement so exercise detection can start.",
                "session_state": "idle",
                "landmarks": [],
            }

        angles = self._joint_angles(landmarks)
        average_knee_angle = (angles["left_knee"] + angles["right_knee"]) / 2
        average_elbow_angle = (angles["left_elbow"] + angles["right_elbow"]) / 2
        knee_difference = abs(angles["left_knee"] - angles["right_knee"])
        shoulder_difference = abs(angles["left_shoulder"] - angles["right_shoulder"])
        detected_exercise = self._update_active_exercise(self._detect_exercise(angles, exercise=exercise))

        if detected_exercise == "squats":
            if average_knee_angle <= 110:
                self.phase = "down"
            elif self.phase == "down" and average_knee_angle >= 160:
                self.rep_count += 1
                self.phase = "up"

        issues: list[str] = []
        corrections: list[str] = []

        if detected_exercise == "squats":
            if average_knee_angle > 120:
                issues.append(f"Knee depth is too shallow ({average_knee_angle:.1f}°).")
                corrections.append(f"Lower until your knees bend to about 90°; your current knee angle is {average_knee_angle:.1f}°.")
            elif average_knee_angle < 70:
                issues.append(f"Knee depth is excessive ({average_knee_angle:.1f}°).")
                corrections.append(f"Reduce the depth slightly and keep your weight in your heels; your knee angle is {average_knee_angle:.1f}°.")
            if knee_difference > 10:
                issues.append("The knees are not tracking evenly.")
                corrections.append("Keep both knees moving in the same line over your feet.")
            if angles["back"] < 145:
                issues.append(f"The torso is leaning forward ({angles['back']:.1f}°).")
                corrections.append(f"Brace your core and keep your torso more upright; trunk angle is {angles['back']:.1f}°.")
        elif detected_exercise == "push-up":
            if average_elbow_angle > 125:
                issues.append(f"The elbows are not bending enough ({average_elbow_angle:.1f}°).")
                corrections.append(f"Lower until your elbows bend close to 90°; your current elbow angle is {average_elbow_angle:.1f}°.")
            elif average_elbow_angle < 70:
                issues.append(f"The elbows are bending too sharply ({average_elbow_angle:.1f}°).")
                corrections.append(f"Stop the descent sooner and keep the shoulders stacked over the wrists; current elbow angle is {average_elbow_angle:.1f}°.")
            if shoulder_difference > 10:
                issues.append("The shoulders are not level.")
                corrections.append("Keep your shoulders level and your hips square to the floor.")
        elif detected_exercise == "plank":
            if angles["back"] < 145:
                issues.append(f"The hips are sagging ({angles['back']:.1f}°).")
                corrections.append(f"Brace your core and raise your hips until your body forms a straight line; trunk angle is {angles['back']:.1f}°.")
            if angles["neck"] < 140:
                issues.append(f"The head is dropping forward ({angles['neck']:.1f}°).")
                corrections.append(f"Keep your neck neutral and look slightly forward; neck angle is {angles['neck']:.1f}°.")
        elif detected_exercise == "shoulder-raise":
            if average_elbow_angle > 145:
                issues.append(f"The elbows are too bent ({average_elbow_angle:.1f}°).")
                corrections.append(f"Keep a softer elbow bend and raise the arms with the shoulders; current elbow angle is {average_elbow_angle:.1f}°.")
            if shoulder_difference > 10:
                issues.append("The shoulders are hiking unevenly.")
                corrections.append("Keep the shoulders relaxed and avoid lifting them toward the ears.")

        if not detected_exercise:
            issues = []
            corrections = []
            accuracy = 0
            posture_status = "No exercise detected"
            feedback = "No exercise detected."
            personalized_correction = "Stand still and begin the movement so exercise detection can start."
        else:
            confidence_score = self._confidence_score(landmarks, angles)
            accuracy = round(max(0, min(100, 100 - len(issues) * 12 - (1 - confidence_score) * 20)))
            posture_status = "Correct posture" if not issues else "Incorrect posture"
            feedback = " ".join(issues) or "Good form. Keep your movement smooth and controlled."
            personalized_correction = corrections[0] if corrections else "Maintain your current alignment and keep the movement controlled."

        return {
            "rep_count": self.rep_count,
            "posture_status": posture_status,
            "accuracy": accuracy,
            "feedback": feedback,
            "detected_issues": issues if detected_exercise else ["No exercise detected"],
            "joint_angles": angles,
            "confidence_score": confidence_score if detected_exercise else 0.0,
            "personalized_correction": personalized_correction,
            "session_state": self._session_state,
            "landmarks": self._serialize_landmarks(landmarks),
        }


landmarker = None
analyzer = ExerciseAnalyzer()
_last_timestamp_ms = 0
_detection_lock = threading.Lock()


def _get_landmarker():
    global landmarker
    if landmarker is None:
        landmarker = _create_landmarker()
    return landmarker


def _draw_pose(frame, pose_landmarks) -> None:
    """Draw MediaPipe Tasks landmarks and skeleton connections using OpenCV."""
    height, width = frame.shape[:2]
    points = [(int(item.x * width), int(item.y * height)) for item in pose_landmarks]

    for start, end in POSE_CONNECTIONS:
        if start < len(points) and end < len(points):
            cv2.line(frame, points[start], points[end], (0, 255, 0), 2, cv2.LINE_AA)

    for index, (x, y) in enumerate(points):
        if pose_landmarks[index].visibility >= 0.5:
            cv2.circle(frame, (x, y), 3, (0, 0, 255), -1, cv2.LINE_AA)


def _run_detection(frame):
    global _last_timestamp_ms
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
    timestamp_ms = max(int(time.monotonic() * 1000), _last_timestamp_ms + 1)
    _last_timestamp_ms = timestamp_ms
    return _get_landmarker().detect_for_video(image, timestamp_ms)


def detect_and_analyze(frame, exercise: str | None = None):
    """Detect a pose, draw it on ``frame``, and return the analysis JSON data."""
    with _detection_lock:
        results = _run_detection(frame)
        landmarks = results.pose_landmarks[0] if results.pose_landmarks else None
        analysis = analyzer.analyze(landmarks, exercise=exercise)

    if landmarks:
        _draw_pose(frame, landmarks)
    return frame, results, analysis


def detect_pose(frame, exercise: str | None = None):
    """Backward-compatible landmark detection used by the webcam view."""
    frame, results, _ = detect_and_analyze(frame, exercise=exercise)
    return frame, results


def close_pose_detector() -> None:
    """Release the native MediaPipe Tasks resources."""
    if landmarker is not None:
        landmarker.close()
        landmarker = None





