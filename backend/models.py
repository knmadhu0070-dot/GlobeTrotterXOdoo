from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(
        db.String(100),
        nullable=False
    )

    email = db.Column(
        db.String(150),
        unique=True,
        nullable=False,
        index=True
    )

    password_hash = db.Column(
        db.String(255),
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    trips = db.relationship(
        "Trip",
        backref="user",
        lazy=True,
        cascade="all, delete-orphan"
    )

    def to_dict(self):

        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at else None
            )
        }


class Trip(db.Model):
    __tablename__ = "trips"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    name = db.Column(
        db.String(150),
        nullable=False
    )

    description = db.Column(
        db.Text,
        nullable=True
    )

    start_date = db.Column(
        db.Date,
        nullable=False
    )

    end_date = db.Column(
        db.Date,
        nullable=False
    )

    budget = db.Column(
        db.Float,
        nullable=False,
        default=0
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    cities = db.relationship(
        "City",
        backref="trip",
        lazy=True,
        cascade="all, delete-orphan"
    )

    def to_dict(self):

        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "description": self.description,
            "start_date": self.start_date.isoformat(),
            "end_date": self.end_date.isoformat(),
            "budget": self.budget,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at else None
            )
        }


class City(db.Model):
    __tablename__ = "cities"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    trip_id = db.Column(
        db.Integer,
        db.ForeignKey("trips.id"),
        nullable=False
    )

    name = db.Column(
        db.String(150),
        nullable=False
    )

    arrival_date = db.Column(
        db.Date,
        nullable=False
    )

    departure_date = db.Column(
        db.Date,
        nullable=False
    )

    notes = db.Column(
        db.Text,
        nullable=True
    )

    activities = db.relationship(
        "Activity",
        backref="city",
        lazy=True,
        cascade="all, delete-orphan"
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    def to_dict(self):

        return {
            "id": self.id,
            "trip_id": self.trip_id,
            "name": self.name,
            "arrival_date": self.arrival_date.isoformat(),
            "departure_date": self.departure_date.isoformat(),
            "notes": self.notes,
            "activities": [
                activity.to_dict()
                for activity in self.activities
            ],
            "created_at": (
                self.created_at.isoformat()
                if self.created_at else None
            )
        }


class Activity(db.Model):
    __tablename__ = "activities"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    city_id = db.Column(
        db.Integer,
        db.ForeignKey("cities.id"),
        nullable=False
    )

    name = db.Column(
        db.String(200),
        nullable=False
    )

    date = db.Column(
        db.Date,
        nullable=True
    )

    time = db.Column(
        db.String(20),
        nullable=True
    )

    location = db.Column(
        db.String(200),
        nullable=True
    )

    notes = db.Column(
        db.Text,
        nullable=True
    )

    estimated_cost = db.Column(
        db.Float,
        nullable=False,
        default=0
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    def to_dict(self):

        return {
            "id": self.id,
            "city_id": self.city_id,
            "name": self.name,
            "date": (
                self.date.isoformat()
                if self.date else None
            ),
            "time": self.time,
            "location": self.location,
            "notes": self.notes,
            "estimated_cost": self.estimated_cost,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at else None
            )
        }