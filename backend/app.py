import base64

import cv2
import numpy as np
from flask import Flask, jsonify, request

from pose_detection import detect_and_analyze

app = Flask(__name__)


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response


@app.route("/")
def home():
    return "FitPose Backend is Running"


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "service": "FitPose Backend"})


@app.route("/detect_pose", methods=["POST", "OPTIONS"])
def detect_pose_endpoint():
    if request.method == "OPTIONS":
        return ("", 204)

    image_file = request.files.get("image") or request.files.get("frame")
    exercise = request.form.get("exercise") or request.args.get("exercise")
    if image_file:
        image_bytes = image_file.read()
    else:
        payload = request.get_json(silent=True) or {}
        exercise = exercise or payload.get("exercise")
        encoded_image = payload.get("image") or payload.get("frame")
        if not encoded_image:
            return jsonify({"error": "Send an image file as 'image' or a base64 image in JSON."}), 400
        if "," in encoded_image:
            encoded_image = encoded_image.split(",", 1)[1]
        try:
            image_bytes = base64.b64decode(encoded_image, validate=True)
        except (ValueError, TypeError):
            return jsonify({"error": "The supplied base64 image is invalid."}), 400

    frame = cv2.imdecode(np.frombuffer(image_bytes, dtype=np.uint8), cv2.IMREAD_COLOR)
    if frame is None:
        return jsonify({"error": "The supplied file is not a valid image."}), 400

    _, _, analysis = detect_and_analyze(frame, exercise=exercise)
    return jsonify(analysis)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
