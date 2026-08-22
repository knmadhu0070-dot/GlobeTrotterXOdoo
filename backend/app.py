from flask import Flask, request, jsonify, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import re
import os
from datetime import datetime

from models import db, User, Trip, City, Activity


app = Flask(__name__)

# -----------------------------
# Configuration
# -----------------------------

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DATABASE_PATH = os.path.join(BASE_DIR, "globetrotter.db")

app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{DATABASE_PATH}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = "globetrotter-hackathon-secret-key"

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


def parse_date(value):
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except (ValueError, TypeError):
        return None

def cities_overlap(arrival_a, departure_a, arrival_b, departure_b):
    # Same-day handoff is allowed: A 26-29 and B 29-31.
    return arrival_a < departure_b and arrival_b < departure_a


def find_overlapping_city(trip_id, arrival_date, departure_date, exclude_city_id=None):
    query = City.query.filter_by(trip_id=trip_id)

    if exclude_city_id is not None:
        query = query.filter(City.id != exclude_city_id)

    for existing_city in query.all():
        if cities_overlap(
            arrival_date,
            departure_date,
            existing_city.arrival_date,
            existing_city.departure_date
        ):
            return existing_city

    return None


# ============================================================
# AUTHENTICATION
# ============================================================

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

    if not name:
        return jsonify({
            "success": False,
            "message": "Name is required."
        }), 400

    if not email:
        return jsonify({
            "success": False,
            "message": "Email is required."
        }), 400

    if not valid_email(email):
        return jsonify({
            "success": False,
            "message": "Please enter a valid email address."
        }), 400

    if User.query.filter_by(email=email).first():
        return jsonify({
            "success": False,
            "message": "An account with this email already exists."
        }), 409

    if not password:
        return jsonify({
            "success": False,
            "message": "Password is required."
        }), 400

    if len(password) < 8:
        return jsonify({
            "success": False,
            "message": "Password must be at least 8 characters."
        }), 400

    if password != confirm_password:
        return jsonify({
            "success": False,
            "message": "Passwords do not match."
        }), 400

    new_user = User(
        name=name,
        email=email,
        password_hash=generate_password_hash(password)
    )

    db.session.add(new_user)
    db.session.commit()

    session["user_id"] = new_user.id

    return jsonify({
        "success": True,
        "message": "Account created successfully.",
        "user": new_user.to_dict()
    }), 201


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

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required."
        }), 400

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(
        user.password_hash,
        password
    ):
        return jsonify({
            "success": False,
            "message": "Invalid email or password."
        }), 401

    session["user_id"] = user.id

    return jsonify({
        "success": True,
        "message": "Login successful.",
        "user": user.to_dict()
    })


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
    start_date = parse_date(data.get("start_date"))
    end_date = parse_date(data.get("end_date"))

    if not name:
        return jsonify({
            "success": False,
            "message": "Trip name is required."
        }), 400

    if not start_date or not end_date:
        return jsonify({
            "success": False,
            "message": "Start date and end date are required."
        }), 400

    if end_date < start_date:
        return jsonify({
            "success": False,
            "message": "End date cannot be before start date."
        }), 400

    try:
        budget = float(data.get("budget", 0))
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
        date = parse_date(data["start_date"])

        if not date:
            return jsonify({
                "success": False,
                "message": "Invalid start date."
            }), 400

        trip.start_date = date

    if "end_date" in data:
        date = parse_date(data["end_date"])

        if not date:
            return jsonify({
                "success": False,
                "message": "Invalid end date."
            }), 400

        trip.end_date = date

    if trip.end_date < trip.start_date:
        return jsonify({
            "success": False,
            "message": "End date cannot be before start date."
        }), 400

    if "budget" in data:

        try:
            budget = float(data["budget"])
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

        trip.budget = budget

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Trip updated successfully.",
        "trip": trip.to_dict()
    })


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
# CITIES
# ============================================================

@app.route("/api/trips/<int:trip_id>/cities", methods=["POST"])
def create_city(trip_id):

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

    name = data.get("name", "").strip()
    arrival_date = parse_date(data.get("arrival_date"))
    departure_date = parse_date(data.get("departure_date"))
    notes = data.get("notes", "").strip()

    if not name:
        return jsonify({
            "success": False,
            "message": "City name is required."
        }), 400

    if not arrival_date or not departure_date:
        return jsonify({
            "success": False,
            "message": "Arrival date and departure date are required."
        }), 400

    if departure_date < arrival_date:
        return jsonify({
            "success": False,
            "message": "Departure date cannot be before arrival date."
        }), 400

    if arrival_date < trip.start_date or departure_date > trip.end_date:
        return jsonify({
            "success": False,
            "message": "City dates must be within the trip dates."
        }), 400

    overlapping_city = find_overlapping_city(
        trip.id,
        arrival_date,
        departure_date
    )

    if overlapping_city:
        return jsonify({
            "success": False,
            "message": (
                f"City dates overlap with {overlapping_city.name} "
                f"({overlapping_city.arrival_date.isoformat()} — "
                f"{overlapping_city.departure_date.isoformat()})."
            )
        }), 409

    city = City(
        trip_id=trip.id,
        name=name,
        arrival_date=arrival_date,
        departure_date=departure_date,
        notes=notes
    )

    db.session.add(city)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "City added successfully.",
        "city": city.to_dict()
    }), 201


@app.route("/api/trips/<int:trip_id>/cities", methods=["GET"])
def get_cities(trip_id):

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

    cities = City.query.filter_by(
        trip_id=trip.id
    ).order_by(
        City.arrival_date.asc()
    ).all()

    return jsonify({
        "success": True,
        "cities": [city.to_dict() for city in cities]
    })


@app.route("/api/cities/<int:city_id>", methods=["PUT"])
def update_city(city_id):

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Not authenticated."
        }), 401

    city = db.session.get(City, city_id)

    if not city or city.trip.user_id != user_id:
        return jsonify({
            "success": False,
            "message": "City not found."
        }), 404

    data = request.get_json()

    if "name" in data:
        name = data["name"].strip()

        if not name:
            return jsonify({
                "success": False,
                "message": "City name cannot be empty."
            }), 400

        city.name = name

    if "arrival_date" in data:
        date = parse_date(data["arrival_date"])

        if not date:
            return jsonify({
                "success": False,
                "message": "Invalid arrival date."
            }), 400

        city.arrival_date = date

    if "departure_date" in data:
        date = parse_date(data["departure_date"])

        if not date:
            return jsonify({
                "success": False,
                "message": "Invalid departure date."
            }), 400

        city.departure_date = date

    if city.departure_date < city.arrival_date:
        return jsonify({
            "success": False,
            "message": "Departure date cannot be before arrival date."
        }), 400

    if "notes" in data:
        city.notes = data["notes"].strip()

    if (
        city.arrival_date < city.trip.start_date
        or city.departure_date > city.trip.end_date
    ):
        return jsonify({
            "success": False,
            "message": "City dates must be within the trip dates."
        }), 400

    overlapping_city = find_overlapping_city(
        city.trip_id,
        city.arrival_date,
        city.departure_date,
        exclude_city_id=city.id
    )

    if overlapping_city:
        return jsonify({
            "success": False,
            "message": (
                f"City dates overlap with {overlapping_city.name} "
                f"({overlapping_city.arrival_date.isoformat()} — "
                f"{overlapping_city.departure_date.isoformat()})."
            )
        }), 409

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "City updated successfully.",
        "city": city.to_dict()
    })


@app.route("/api/cities/<int:city_id>", methods=["DELETE"])
def delete_city(city_id):

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Not authenticated."
        }), 401

    city = db.session.get(City, city_id)

    if not city or city.trip.user_id != user_id:
        return jsonify({
            "success": False,
            "message": "City not found."
        }), 404

    db.session.delete(city)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "City deleted successfully."
    })




# ============================================================
# ACTIVITIES
# ============================================================

@app.route("/api/cities/<int:city_id>/activities", methods=["POST"])
def create_activity(city_id):

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Not authenticated."
        }), 401

    city = db.session.get(City, city_id)

    if not city or city.trip.user_id != user_id:
        return jsonify({
            "success": False,
            "message": "City not found."
        }), 404

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "No data received."
        }), 400

    name = data.get("name", "").strip()
    date = parse_date(data.get("date")) if data.get("date") else None
    time = data.get("time", "").strip()
    location = data.get("location", "").strip()
    notes = data.get("notes", "").strip()

    if not name:
        return jsonify({
            "success": False,
            "message": "Activity name is required."
        }), 400

    if data.get("date") and not date:
        return jsonify({
            "success": False,
            "message": "Invalid activity date."
        }), 400

    if date and (date < city.arrival_date or date > city.departure_date):
        return jsonify({
            "success": False,
            "message": "Activity date must be within the city dates."
        }), 400

    try:
        estimated_cost = float(data.get("estimated_cost", 0))
    except (ValueError, TypeError):
        return jsonify({
            "success": False,
            "message": "Estimated cost must be a valid number."
        }), 400

    if estimated_cost < 0:
        return jsonify({
            "success": False,
            "message": "Estimated cost cannot be negative."
        }), 400

    activity = Activity(
        city_id=city.id,
        name=name,
        date=date,
        time=time,
        location=location,
        notes=notes,
        estimated_cost=estimated_cost
    )

    db.session.add(activity)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Activity added successfully.",
        "activity": activity.to_dict()
    }), 201


@app.route("/api/cities/<int:city_id>/activities", methods=["GET"])
def get_activities(city_id):

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Not authenticated."
        }), 401

    city = db.session.get(City, city_id)

    if not city or city.trip.user_id != user_id:
        return jsonify({
            "success": False,
            "message": "City not found."
        }), 404

    activities = Activity.query.filter_by(
        city_id=city.id
    ).order_by(
        Activity.date.asc(),
        Activity.time.asc()
    ).all()

    return jsonify({
        "success": True,
        "activities": [activity.to_dict() for activity in activities]
    })


@app.route("/api/activities/<int:activity_id>", methods=["PUT"])
def update_activity(activity_id):

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Not authenticated."
        }), 401

    activity = db.session.get(Activity, activity_id)

    if not activity or not activity.city or activity.city.trip.user_id != user_id:
        return jsonify({
            "success": False,
            "message": "Activity not found."
        }), 404

    data = request.get_json() or {}

    if "name" in data:
        name = data["name"].strip()

        if not name:
            return jsonify({
                "success": False,
                "message": "Activity name cannot be empty."
            }), 400

        activity.name = name

    if "date" in data:
        if data["date"]:
            date = parse_date(data["date"])

            if not date:
                return jsonify({
                    "success": False,
                    "message": "Invalid activity date."
                }), 400

            activity.date = date
        else:
            activity.date = None

    if activity.date and (
        activity.date < activity.city.arrival_date
        or activity.date > activity.city.departure_date
    ):
        return jsonify({
            "success": False,
            "message": "Activity date must be within the city dates."
        }), 400

    if "time" in data:
        activity.time = data["time"].strip()

    if "location" in data:
        activity.location = data["location"].strip()

    if "notes" in data:
        activity.notes = data["notes"].strip()

    if "estimated_cost" in data:
        try:
            estimated_cost = float(data["estimated_cost"])
        except (ValueError, TypeError):
            return jsonify({
                "success": False,
                "message": "Estimated cost must be a valid number."
            }), 400

        if estimated_cost < 0:
            return jsonify({
                "success": False,
                "message": "Estimated cost cannot be negative."
            }), 400

        activity.estimated_cost = estimated_cost

    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Activity updated successfully.",
        "activity": activity.to_dict()
    })


@app.route("/api/activities/<int:activity_id>", methods=["DELETE"])
def delete_activity(activity_id):

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Not authenticated."
        }), 401

    activity = db.session.get(Activity, activity_id)

    if not activity or not activity.city or activity.city.trip.user_id != user_id:
        return jsonify({
            "success": False,
            "message": "Activity not found."
        }), 404

    db.session.delete(activity)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Activity deleted successfully."
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


# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":
    app.run(debug=True, port=5000)