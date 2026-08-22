import { useEffect, useState } from "react";
import { deleteTrip, getTrips } from "../services/trips";

function formatDate(dateString) {

    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}


function calculateDays(start, end) {

    const startDate = new Date(`${start}T00:00:00`);
    const endDate = new Date(`${end}T00:00:00`);

    const difference =
        Math.round(
            (endDate - startDate) /
            (1000 * 60 * 60 * 24)
        ) + 1;

    return difference;
}


function MyTrips({ onBack, onCreateTrip }) {

    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadTrips() {

        try {

            setLoading(true);

            const data = await getTrips();

            setTrips(data.trips);

        } catch (error) {

            setError(error.message);

        } finally {

            setLoading(false);

        }
    }

    useEffect(() => {
        loadTrips();
    }, []);


    async function handleDelete(trip) {

        const confirmed = window.confirm(
            `Are you sure you want to delete "${trip.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {

            await deleteTrip(trip.id);

            setTrips(
                trips.filter(
                    item => item.id !== trip.id
                )
            );

        } catch (error) {

            setError(error.message);

        }
    }


    if (loading) {
        return (
            <div className="page-loading">
                Loading your trips...
            </div>
        );
    }


    return (
        <div className="trips-page">

            {/* Back to Dashboard */}

            <button
                className="back-button"
                onClick={onBack}
                type="button"
            >
                ← Back to Dashboard
            </button>


            <div className="trips-header">

                <div>
                    <p className="eyebrow">YOUR JOURNEYS</p>

                    <h1>My Trips</h1>

                    <p className="page-subtitle">
                        Your adventures, all in one place.
                    </p>
                </div>

                <button
                    className="primary-button create-trip-small"
                    onClick={onCreateTrip}
                >
                    + New Trip
                </button>

            </div>


            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}


            {trips.length === 0 ? (

                <div className="empty-state">

                    <div className="empty-icon">
                        🗺️
                    </div>

                    <h2>Your journey starts here</h2>

                    <p>
                        Create your first trip and start
                        building your itinerary.
                    </p>

                    <button
                        className="primary-button empty-button"
                        onClick={onCreateTrip}
                    >
                        Plan Your First Trip
                    </button>

                </div>

            ) : (

                <div className="trips-grid">

                    {trips.map(trip => (

                        <div
                            className="trip-card"
                            key={trip.id}
                        >

                            <div className="trip-card-image">
                                🏔️
                            </div>

                            <div className="trip-card-content">

                                <h2>{trip.name}</h2>

                                <p className="trip-dates">
                                    {formatDate(trip.start_date)}
                                    {" — "}
                                    {formatDate(trip.end_date)}
                                </p>

                                <div className="trip-meta">

                                    <span>
                                        📅{" "}
                                        {calculateDays(
                                            trip.start_date,
                                            trip.end_date
                                        )} days
                                    </span>

                                    <span>
                                        💰 ₹
                                        {trip.budget.toLocaleString(
                                            "en-IN"
                                        )}
                                    </span>

                                </div>

                                <div className="trip-card-actions">

                                    <button
                                        className="secondary-button"
                                    >
                                        Open Trip
                                    </button>

                                    <button
                                        className="delete-button"
                                        onClick={() =>
                                            handleDelete(trip)
                                        }
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}

export default MyTrips;