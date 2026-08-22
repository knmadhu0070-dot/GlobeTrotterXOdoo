from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import re
import os

from models import db, User


app = Flask(__name__)

# -----------------------------
# Configuration
# -----------------------------

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, "globetrotter.db")

app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DATABASE_PATH}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Used for Flask sessions.
# We can move this to an environment variable before deployment.
app.config["SECRET_KEY"] = "globetrotter-hackathon-secret-key"

# Allow React frontend to communicate with Flask
CORS(
    app,
    origins=["http://localhost:5173"],
    supports_credentials=True
)

db.init_app(app)


# -----------------------------
# Database initialization
# -----------------------------

with app.app_context():
    db.create_all()


# -----------------------------
# Helper functions
# -----------------------------

def valid_email(email):
    pattern = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
    return re.match(pattern, email) is not None


# -----------------------------
# Signup
# -----------------------------

@app.route("/api/auth/signup", methods=["POST"])
def signup():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No data received."
        }), 400

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    confirm_password = data.get("confirmPassword", "")

    # R1 — Name required
    if not name:
        return jsonify({
            "success": False,
            "message": "Name is required."
        }), 400

    # R2 — Email required
    if not email:
        return jsonify({
            "success": False,
            "message": "Email is required."
        }), 400

    # R3 — Email format
    if not valid_email(email):
        return jsonify({
            "success": False,
            "message": "Please enter a valid email address."
        }), 400

    # R4 — Email uniqueness
    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return jsonify({
            "success": False,
            "message": "An account with this email already exists."
        }), 409

    # R5 — Password required
    if not password:
        return jsonify({
            "success": False,
            "message": "Password is required."
        }), 400

    # R6 — Minimum 8 characters
    if len(password) < 8:
        return jsonify({
            "success": False,
            "message": "Password must be at least 8 characters."
        }), 400

    # R7 — Password confirmation
    if password != confirm_password:
        return jsonify({
            "success": False,
            "message": "Passwords do not match."
        }), 400

    # R8 — Never store plain password
    password_hash = generate_password_hash(password)

    new_user = User(
        name=name,
        email=email,
        password_hash=password_hash
    )

    db.session.add(new_user)
    db.session.commit()

    # R9 — Automatically log the user in
    session["user_id"] = new_user.id

    return jsonify({
        "success": True,
        "message": "Account created successfully.",
        "user": new_user.to_dict()
    }), 201


# -----------------------------
# Login
# -----------------------------

@app.route("/api/auth/login", methods=["POST"])
def login():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No data received."
        }), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    # R10 — Both fields required
    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required."
        }), 400

    # R11 — Find user
    user = User.query.filter_by(email=email).first()

    # R12 + R13 — Verify credentials
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({
            "success": False,
            "message": "Invalid email or password."
        }), 401

    # R14 — Create session
    session["user_id"] = user.id

    return jsonify({
        "success": True,
        "message": "Login successful.",
        "user": user.to_dict()
    })


# -----------------------------
# Current logged-in user
# -----------------------------

@app.route("/api/auth/me", methods=["GET"])
def current_user():

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Not authenticated."
        }), 401

    user = db.session.get(User, user_id)

    if not user:
        session.clear()

        return jsonify({
            "success": False,
            "message": "User not found."
        }), 401

    return jsonify({
        "success": True,
        "user": user.to_dict()
    })


# -----------------------------
# Logout
# -----------------------------

@app.route("/api/auth/logout", methods=["POST"])
def logout():

    session.clear()

    return jsonify({
        "success": True,
        "message": "Logged out successfully."
    })


# -----------------------------
# Test route
# -----------------------------

@app.route("/api/health", methods=["GET"])
def health():

    return jsonify({
        "success": True,
        "message": "GlobeTrotter backend is running."
    })


# -----------------------------
# Run server
# -----------------------------

if __name__ == "__main__":
    app.run(debug=True, port=5000)