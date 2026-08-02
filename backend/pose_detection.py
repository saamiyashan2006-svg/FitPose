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
    """Tracks squat repetitions and gives simple form feedback across frames."""

    def __init__(self) -> None:
        self.rep_count = 0
        self.phase = "up"

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

    def _joint_angles(self, landmarks) -> dict[str, float]:
        return {
            "left_elbow": self._angle(landmarks[LEFT_SHOULDER], landmarks[LEFT_ELBOW], landmarks[LEFT_WRIST]),
            "right_elbow": self._angle(landmarks[RIGHT_SHOULDER], landmarks[RIGHT_ELBOW], landmarks[RIGHT_WRIST]),
            "left_shoulder": self._angle(landmarks[LEFT_ELBOW], landmarks[LEFT_SHOULDER], landmarks[LEFT_HIP]),
            "right_shoulder": self._angle(landmarks[RIGHT_ELBOW], landmarks[RIGHT_SHOULDER], landmarks[RIGHT_HIP]),
            "left_hip": self._angle(landmarks[LEFT_SHOULDER], landmarks[LEFT_HIP], landmarks[LEFT_KNEE]),
            "right_hip": self._angle(landmarks[RIGHT_SHOULDER], landmarks[RIGHT_HIP], landmarks[RIGHT_KNEE]),
            "left_knee": self._angle(landmarks[LEFT_HIP], landmarks[LEFT_KNEE], landmarks[LEFT_ANKLE]),
            "right_knee": self._angle(landmarks[RIGHT_HIP], landmarks[RIGHT_KNEE], landmarks[RIGHT_ANKLE]),
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

    def analyze(self, landmarks: list | None) -> dict:
        if not landmarks:
            return {
                "rep_count": self.rep_count,
                "posture_status": "No pose detected",
                "accuracy": 0,
                "feedback": "Move your full body into the camera view.",
                "joint_angles": {},
                "landmarks": [],
            }

        angles = self._joint_angles(landmarks)
        average_knee_angle = (angles["left_knee"] + angles["right_knee"]) / 2
        if average_knee_angle <= 110:
            self.phase = "down"
        elif self.phase == "down" and average_knee_angle >= 160:
            self.rep_count += 1
            self.phase = "up"

        shoulder_difference = abs(angles["left_shoulder"] - angles["right_shoulder"])
        hip_difference = abs(angles["left_hip"] - angles["right_hip"])
        knee_difference = abs(angles["left_knee"] - angles["right_knee"])
        penalties = []
        feedback = []

        if shoulder_difference > 15 or hip_difference > 18:
            penalties.append(max(shoulder_difference, hip_difference))
            feedback.append("Keep your shoulders and hips level.")
        if knee_difference > 15:
            penalties.append(knee_difference)
            feedback.append("Keep both knees moving evenly.")
        if average_knee_angle < 65:
            penalties.append(20)
            feedback.append("Do not force an excessively deep knee bend.")

        accuracy = max(0, round(100 - sum(penalties)))
        posture_status = "Correct posture" if not feedback else "Incorrect posture"
        return {
            "rep_count": self.rep_count,
            "posture_status": posture_status,
            "accuracy": accuracy,
            "feedback": " ".join(feedback) or "Good form. Keep your movement controlled.",
            "joint_angles": angles,
            "landmarks": self._serialize_landmarks(landmarks),
        }


landmarker = _create_landmarker()
analyzer = ExerciseAnalyzer()
_last_timestamp_ms = 0
_detection_lock = threading.Lock()


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
    return landmarker.detect_for_video(image, timestamp_ms)


def detect_and_analyze(frame):
    """Detect a pose, draw it on ``frame``, and return the analysis JSON data."""
    with _detection_lock:
        results = _run_detection(frame)
        landmarks = results.pose_landmarks[0] if results.pose_landmarks else None
        analysis = analyzer.analyze(landmarks)

    if landmarks:
        _draw_pose(frame, landmarks)
    return frame, results, analysis


def detect_pose(frame):
    """Backward-compatible landmark detection used by the webcam view."""
    frame, results, _ = detect_and_analyze(frame)
    return frame, results


def close_pose_detector() -> None:
    """Release the native MediaPipe Tasks resources."""
    landmarker.close()





