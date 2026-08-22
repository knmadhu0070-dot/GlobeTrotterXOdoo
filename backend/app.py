from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import re
import os
from datetime import datetime
from models import db, User, Trip


app = Flask(__name__)

# -----------------------------
# Configuration
# -----------------------------

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, "globetrotter.db")

app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DATABASE_PATH}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Used for Flask sessions
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


# ============================================================
# AUTHENTICATION
# ============================================================

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
    if not user or not check_password_hash(
        user.password_hash,
        password
    ):
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


# ============================================================
# TRIPS
# ============================================================

# -----------------------------
# Create Trip
# -----------------------------

@app.route("/api/trips", methods=["POST"])
def create_trip():

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Not authenticated."
        }), 401

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No data received."
        }), 400

    name = data.get("name", "").strip()
    description = data.get("description", "").strip()
    start_date = data.get("start_date")
    end_date = data.get("end_date")
    budget = data.get("budget", 0)

    # Trip name required
    if not name:
        return jsonify({
            "success": False,
            "message": "Trip name is required."
        }), 400

    # Dates required
    if not start_date or not end_date:
        return jsonify({
            "success": False,
            "message": "Start date and end date are required."
        }), 400

    # Parse dates
    try:
        start_date = datetime.strptime(
            start_date,
            "%Y-%m-%d"
        ).date()

        end_date = datetime.strptime(
            end_date,
            "%Y-%m-%d"
        ).date()

    except ValueError:
        return jsonify({
            "success": False,
            "message": "Invalid date format."
        }), 400

    # End date cannot be before start date
    if end_date < start_date:
        return jsonify({
            "success": False,
            "message": "End date cannot be before start date."
        }), 400

    # Validate budget
    try:
        budget = float(budget)
    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "message": "Budget must be a valid number."
        }), 400

    if budget < 0:
        return jsonify({
            "success": False,
            "message": "Budget cannot be negative."
        }), 400

    trip = Trip(
        user_id=user_id,
        name=name,
        description=description,
        start_date=start_date,
        end_date=end_date,
        budget=budget
    )

    db.session.add(trip)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Trip created successfully.",
        "trip": trip.to_dict()
    }), 201


# -----------------------------
# Get user's trips
# -----------------------------

@app.route("/api/trips", methods=["GET"])
def get_trips():

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Not authenticated."
        }), 401

    trips = Trip.query.filter_by(
        user_id=user_id
    ).order_by(
        Trip.created_at.desc()
    ).all()

    return jsonify({
        "success": True,
        "trips": [trip.to_dict() for trip in trips]
    })


# -----------------------------
# Get single trip
# -----------------------------

@app.route("/api/trips/<int:trip_id>", methods=["GET"])
def get_trip(trip_id):

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Not authenticated."
        }), 401

    trip = Trip.query.filter_by(
        id=trip_id,
        user_id=user_id
    ).first()

    if not trip:
        return jsonify({
            "success": False,
            "message": "Trip not found."
        }), 404

    return jsonify({
        "success": True,
        "trip": trip.to_dict()
    })


# -----------------------------
# Update Trip
# -----------------------------

@app.route("/api/trips/<int:trip_id>", methods=["PUT"])
def update_trip(trip_id):

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Not authenticated."
        }), 401

    trip = Trip.query.filter_by(
        id=trip_id,
        user_id=user_id
    ).first()

    if not trip:
        return jsonify({
            "success": False,
            "message": "Trip not found."
        }), 404

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No data received."
        }), 400

    if "name" in data:

        name = data["name"].strip()

        if not name:
            return jsonify({
                "success": False,
                "message": "Trip name cannot be empty."
            }), 400

        trip.name = name

    if "description" in data:
        trip.description = data["description"].strip()

    if "start_date" in data:

        try:
            trip.start_date = datetime.strptime(
                data["start_date"],
                "%Y-%m-%d"
            ).date()

        except ValueError:
            return jsonify({
                "success": False,
                "message": "Invalid start date."
            }), 400

    if "end_date" in data:

        try:
            trip.end_date = datetime.strptime(
                data["end_date"],
                "%Y-%m-%d"
            ).date()

        except ValueError:
            return jsonify({
                "success": False,
                "message": "Invalid end date."
            }), 400

    if trip.end_date < trip.start_date:
        return jsonify({
            "success": False,
            "message": "End date cannot be before start date."
        }), 400

    if "budget" in data:

        try:
            trip.budget = float(data["budget"])

        except (ValueError, TypeError):
            return jsonify({
                "success": False,
                "message": "Budget must be a valid number."
            }), 400

        if trip.budget < 0:
            return jsonify({
                "success": False,
                "message": "Budget cannot be negative."
            }), 400

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Trip updated successfully.",
        "trip": trip.to_dict()
    })


# -----------------------------
# Delete Trip
# -----------------------------

@app.route("/api/trips/<int:trip_id>", methods=["DELETE"])
def delete_trip(trip_id):

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Not authenticated."
        }), 401

    trip = Trip.query.filter_by(
        id=trip_id,
        user_id=user_id
    ).first()

    if not trip:
        return jsonify({
            "success": False,
            "message": "Trip not found."
        }), 404

    db.session.delete(trip)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Trip deleted successfully."
    })


# ============================================================
# HEALTH CHECK
# ============================================================

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
    app.run(
        debug=True,
        port=5000
    )