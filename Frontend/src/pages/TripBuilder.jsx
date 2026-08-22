import { useEffect, useState } from "react";

import {
    getTrip,
    getCities,
    createCity,
    deleteCity,
    createActivity,
    deleteActivity,
} from "../services/trips";


function formatDate(dateString) {
    if (!dateString) {
        return "";
    }

    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}


function TripBuilder({ tripId, onBack }) {

    const [trip, setTrip] = useState(null);
    const [cities, setCities] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showCityForm, setShowCityForm] = useState(false);
    const [savingCity, setSavingCity] = useState(false);

    const [cityForm, setCityForm] = useState({
        name: "",
        arrival_date: "",
        departure_date: "",
        notes: "",
    });

    const [activityForms, setActivityForms] = useState({});
    const [savingActivity, setSavingActivity] = useState(null);


    // =========================================================
    // LOAD TRIP
    // =========================================================

    useEffect(() => {

        async function loadTrip() {

            if (!tripId) {
                setError("No trip selected.");
                setLoading(false);
                return;
            }

            try {

                setLoading(true);
                setError("");

                const tripResponse = await getTrip(tripId);
                const citiesResponse = await getCities(tripId);

                setTrip(tripResponse.trip);

                setCities(
                    Array.isArray(citiesResponse.cities)
                        ? citiesResponse.cities
                        : []
                );

            } catch (error) {

                console.error(
                    "Trip Builder error:",
                    error
                );

                setError(
                    error.message ||
                    "Failed to load trip."
                );

            } finally {

                setLoading(false);

            }
        }

        loadTrip();

    }, [tripId]);


    // =========================================================
    // CITY FORM
    // =========================================================

    function handleCityChange(event) {

        const { name, value } = event.target;

        setCityForm({
            ...cityForm,
            [name]: value,
        });

    }


    function resetCityForm() {

        setCityForm({
            name: "",
            arrival_date: "",
            departure_date: "",
            notes: "",
        });

    }


    async function handleCreateCity(event) {

        event.preventDefault();

        setError("");

        if (!cityForm.name.trim()) {
            setError("City name is required.");
            return;
        }

        if (
            !cityForm.arrival_date ||
            !cityForm.departure_date
        ) {
            setError(
                "Arrival date and departure date are required."
            );
            return;
        }

        if (
            cityForm.departure_date <
            cityForm.arrival_date
        ) {
            setError(
                "Departure date cannot be before arrival date."
            );
            return;
        }


        // City must be inside trip dates.

        if (
            cityForm.arrival_date <
            trip.start_date
        ) {
            setError(
                "Arrival date must be within the trip dates."
            );
            return;
        }

        if (
            cityForm.departure_date >
            trip.end_date
        ) {
            setError(
                "Departure date must be within the trip dates."
            );
            return;
        }


        // Prevent overlapping cities.

        const overlap = cities.find(city => {

            return (
                cityForm.arrival_date <
                    city.departure_date &&
                city.arrival_date <
                    cityForm.departure_date
            );

        });


        if (overlap) {

            setError(
                `City dates overlap with ${overlap.name} ` +
                `(${formatDate(
                    overlap.arrival_date
                )} — ${formatDate(
                    overlap.departure_date
                )}).`
            );

            return;
        }


        setSavingCity(true);

        try {

            const response =
                await createCity(
                    tripId,
                    cityForm
                );

            if (!response.city) {
                throw new Error(
                    "City was not returned by the server."
                );
            }

            setCities([
                ...cities,
                response.city,
            ]);

            resetCityForm();

            setShowCityForm(false);

        } catch (error) {

            console.error(
                "Create city error:",
                error
            );

            setError(
                error.message ||
                "Failed to create city."
            );

        } finally {

            setSavingCity(false);

        }

    }


    // =========================================================
    // DELETE CITY
    // =========================================================

    async function handleDeleteCity(city) {

        const confirmed =
            window.confirm(
                `Delete "${city.name}"?`
            );

        if (!confirmed) {
            return;
        }

        try {

            setError("");

            await deleteCity(city.id);

            setCities(
                cities.filter(
                    item =>
                        item.id !== city.id
                )
            );

        } catch (error) {

            console.error(
                "Delete city error:",
                error
            );

            setError(
                error.message ||
                "Failed to delete city."
            );

        }

    }


    // =========================================================
    // ACTIVITY FORM
    // =========================================================

    function openActivityForm(cityId) {

        setActivityForms({
            ...activityForms,

            [cityId]: {
                name: "",
                date: "",
                time: "",
                location: "",
                notes: "",
                estimated_cost: "",
            },

        });

    }


    function closeActivityForm(cityId) {

        const updated = {
            ...activityForms,
        };

        delete updated[cityId];

        setActivityForms(updated);

    }


    function handleActivityChange(
        cityId,
        event
    ) {

        const {
            name,
            value,
        } = event.target;

        setActivityForms({
            ...activityForms,

            [cityId]: {
                ...activityForms[cityId],
                [name]: value,
            },

        });

    }


    // =========================================================
    // CREATE ACTIVITY
    // =========================================================

    async function handleCreateActivity(
        city,
        event
    ) {

        event.preventDefault();

        setError("");

        const form =
            activityForms[city.id];

        if (!form.name.trim()) {

            setError(
                "Activity name is required."
            );

            return;
        }


        if (
            form.date &&
            (
                form.date <
                    city.arrival_date ||
                form.date >
                    city.departure_date
            )
        ) {

            setError(
                "Activity date must be within the city dates."
            );

            return;
        }


        const cost =
            form.estimated_cost === ""
                ? 0
                : Number(
                    form.estimated_cost
                );


        if (
            Number.isNaN(cost) ||
            cost < 0
        ) {

            setError(
                "Estimated cost cannot be negative."
            );

            return;
        }


        setSavingActivity(city.id);

        try {

            const response =
                await createActivity(
                    city.id,
                    {
                        name:
                            form.name.trim(),

                        date:
                            form.date || null,

                        time:
                            form.time,

                        location:
                            form.location.trim(),

                        notes:
                            form.notes.trim(),

                        estimated_cost:
                            cost,
                    }
                );


            if (!response.activity) {

                throw new Error(
                    "Activity was not returned by the server."
                );

            }


            // Add activity locally.

            setCities(
                cities.map(item => {

                    if (
                        item.id !== city.id
                    ) {
                        return item;
                    }

                    return {
                        ...item,

                        activities: [
                            ...(item.activities || []),
                            response.activity,
                        ],
                    };

                })
            );


            closeActivityForm(
                city.id
            );

        } catch (error) {

            console.error(
                "Create activity error:",
                error
            );

            setError(
                error.message ||
                "Failed to create activity."
            );

        } finally {

            setSavingActivity(null);

        }

    }


    // =========================================================
    // DELETE ACTIVITY
    // =========================================================

    async function handleDeleteActivity(
        city,
        activity
    ) {

        const confirmed =
            window.confirm(
                `Delete "${activity.name}"?`
            );

        if (!confirmed) {
            return;
        }

        try {

            setError("");

            await deleteActivity(
                activity.id
            );

            setCities(
                cities.map(item => {

                    if (
                        item.id !== city.id
                    ) {
                        return item;
                    }

                    return {
                        ...item,

                        activities:
                            (
                                item.activities ||
                                []
                            ).filter(
                                existing =>
                                    existing.id !==
                                    activity.id
                            ),
                    };

                })
            );

        } catch (error) {

            console.error(
                "Delete activity error:",
                error
            );

            setError(
                error.message ||
                "Failed to delete activity."
            );

        }

    }


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (
            <div className="page-loading">
                Loading trip builder...
            </div>
        );

    }


    // =========================================================
    // TRIP NOT FOUND
    // =========================================================

    if (!trip) {

        return (
            <div className="form-page">

                <div className="form-container">

                    <button
                        className="back-button"
                        onClick={onBack}
                        type="button"
                    >
                        ← Back to My Trips
                    </button>

                    <div className="error-message">
                        {error ||
                            "Trip not found."}
                    </div>

                </div>

            </div>
        );

    }


    // =========================================================
    // MAIN PAGE
    // =========================================================

    return (

        <div className="trips-page">

            {/* Back */}

            <button
                className="back-button"
                onClick={onBack}
                type="button"
            >
                ← Back to My Trips
            </button>


            {/* Header */}

            <div className="trips-header">

                <div>

                    <p className="eyebrow">
                        TRIP BUILDER
                    </p>

                    <h1>
                        {trip.name}
                    </h1>

                    <p className="page-subtitle">
                        📅{" "}
                        {formatDate(
                            trip.start_date
                        )}
                        {" — "}
                        {formatDate(
                            trip.end_date
                        )}
                    </p>

                </div>


                <button
                    className="primary-button"
                    type="button"
                    onClick={() => {

                        setError("");

                        if (
                            showCityForm
                        ) {

                            setShowCityForm(
                                false
                            );

                            resetCityForm();

                        } else {

                            setShowCityForm(
                                true
                            );

                        }

                    }}
                >

                    {showCityForm
                        ? "✕ Cancel"
                        : "+ Add City"}

                </button>

            </div>


            {/* Error */}

            {error && (

                <div className="error-message">
                    {error}
                </div>

            )}


            {/* =================================================
                ADD CITY
            ================================================= */}

            {showCityForm && (

                <div className="form-container">

                    <p className="eyebrow">
                        NEW DESTINATION
                    </p>

                    <h2>
                        Add a city
                    </h2>

                    <form
                        className="trip-form"
                        onSubmit={
                            handleCreateCity
                        }
                    >

                        <div className="form-group">

                            <label>
                                City name *
                            </label>

                            <input
                                type="text"
                                name="name"
                                placeholder="e.g. Jaipur"
                                value={
                                    cityForm.name
                                }
                                onChange={
                                    handleCityChange
                                }
                            />

                        </div>


                        <div className="date-grid">

                            <div className="form-group">

                                <label>
                                    Arrival date *
                                </label>

                                <input
                                    type="date"
                                    name="arrival_date"
                                    min={
                                        trip.start_date
                                    }
                                    max={
                                        trip.end_date
                                    }
                                    value={
                                        cityForm.arrival_date
                                    }
                                    onChange={
                                        handleCityChange
                                    }
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Departure date *
                                </label>

                                <input
                                    type="date"
                                    name="departure_date"
                                    min={
                                        trip.start_date
                                    }
                                    max={
                                        trip.end_date
                                    }
                                    value={
                                        cityForm.departure_date
                                    }
                                    onChange={
                                        handleCityChange
                                    }
                                />

                            </div>

                        </div>


                        <div className="form-group">

                            <label>
                                Optional notes
                            </label>

                            <textarea
                                name="notes"
                                rows="4"
                                placeholder="Anything important about this stop..."
                                value={
                                    cityForm.notes
                                }
                                onChange={
                                    handleCityChange
                                }
                            />

                        </div>


                        <button
                            className="primary-button"
                            type="submit"
                            disabled={
                                savingCity
                            }
                        >

                            {savingCity
                                ? "Adding city..."
                                : "Add City"}

                        </button>

                    </form>

                </div>

            )}


            {/* =================================================
                CITIES
            ================================================= */}

            {cities.length === 0 ? (

                <div className="empty-state">

                    <div className="empty-icon">
                        🗺️
                    </div>

                    <h2>
                        Start building your journey
                    </h2>

                    <p>
                        Add your first city to this trip.
                    </p>

                    <button
                        className="primary-button empty-button"
                        type="button"
                        onClick={() => {

                            setError("");
                            setShowCityForm(
                                true
                            );

                        }}
                    >
                        + Add City
                    </button>

                </div>

            ) : (

                <div className="trips-grid">

                    {cities.map(city => {

                        const activities =
                            Array.isArray(
                                city.activities
                            )
                                ? city.activities
                                : [];

                        const activityForm =
                            activityForms[
                                city.id
                            ];


                        return (

                            <div
                                className="trip-card"
                                key={city.id}
                            >

                                <div className="trip-card-content">

                                    {/* City header */}

                                    <div className="city-header">

                                        <div>

                                            <h2>
                                                📍{" "}
                                                {city.name}
                                            </h2>

                                            <p className="trip-dates">

                                                📅{" "}

                                                {formatDate(
                                                    city.arrival_date
                                                )}

                                                {" — "}

                                                {formatDate(
                                                    city.departure_date
                                                )}

                                            </p>

                                        </div>


                                        <button
                                            className="delete-button"
                                            type="button"
                                            onClick={() =>
                                                handleDeleteCity(
                                                    city
                                                )
                                            }
                                        >
                                            🗑️ Delete
                                        </button>

                                    </div>


                                    {/* City notes */}

                                    {city.notes && (

                                        <div className="city-notes">

                                            📝{" "}

                                            {city.notes}

                                        </div>

                                    )}


                                    {/* Activities */}

                                    <div className="activities-section">

                                        <div className="activities-header">

                                            <h3>
                                                Activities
                                            </h3>

                                            {!activityForm && (

                                                <button
                                                    className="secondary-button"
                                                    type="button"
                                                    onClick={() =>
                                                        openActivityForm(
                                                            city.id
                                                        )
                                                    }
                                                >
                                                    + Add Activity
                                                </button>

                                            )}

                                        </div>


                                        {/* Activity form */}

                                        {activityForm && (

                                            <form
                                                className="activity-form"
                                                onSubmit={event =>
                                                    handleCreateActivity(
                                                        city,
                                                        event
                                                    )
                                                }
                                            >

                                                <div className="form-group">

                                                    <label>
                                                        Activity name *
                                                    </label>

                                                    <input
                                                        type="text"
                                                        name="name"
                                                        placeholder="e.g. Amber Fort"
                                                        value={
                                                            activityForm.name
                                                        }
                                                        onChange={event =>
                                                            handleActivityChange(
                                                                city.id,
                                                                event
                                                            )
                                                        }
                                                    />

                                                </div>


                                                <div className="date-grid">

                                                    <div className="form-group">

                                                        <label>
                                                            Date
                                                        </label>

                                                        <input
                                                            type="date"
                                                            name="date"
                                                            min={
                                                                city.arrival_date
                                                            }
                                                            max={
                                                                city.departure_date
                                                            }
                                                            value={
                                                                activityForm.date
                                                            }
                                                            onChange={event =>
                                                                handleActivityChange(
                                                                    city.id,
                                                                    event
                                                                )
                                                            }
                                                        />

                                                    </div>


                                                    <div className="form-group">

                                                        <label>
                                                            Time
                                                        </label>

                                                        <input
                                                            type="time"
                                                            name="time"
                                                            value={
                                                                activityForm.time
                                                            }
                                                            onChange={event =>
                                                                handleActivityChange(
                                                                    city.id,
                                                                    event
                                                                )
                                                            }
                                                        />

                                                    </div>

                                                </div>


                                                <div className="form-group">

                                                    <label>
                                                        Location
                                                    </label>

                                                    <input
                                                        type="text"
                                                        name="location"
                                                        placeholder="e.g. Amer Road"
                                                        value={
                                                            activityForm.location
                                                        }
                                                        onChange={event =>
                                                            handleActivityChange(
                                                                city.id,
                                                                event
                                                            )
                                                        }
                                                    />

                                                </div>


                                                <div className="form-group">

                                                    <label>
                                                        Estimated cost
                                                    </label>

                                                    <input
                                                        type="number"
                                                        min="0"
                                                        name="estimated_cost"
                                                        placeholder="1000"
                                                        value={
                                                            activityForm.estimated_cost
                                                        }
                                                        onChange={event =>
                                                            handleActivityChange(
                                                                city.id,
                                                                event
                                                            )
                                                        }
                                                    />

                                                </div>


                                                <div className="form-group">

                                                    <label>
                                                        Notes
                                                    </label>

                                                    <textarea
                                                        name="notes"
                                                        rows="3"
                                                        placeholder="Activity notes..."
                                                        value={
                                                            activityForm.notes
                                                        }
                                                        onChange={event =>
                                                            handleActivityChange(
                                                                city.id,
                                                                event
                                                            )
                                                        }
                                                    />

                                                </div>


                                                <div className="form-actions">

                                                    <button
                                                        className="primary-button"
                                                        type="submit"
                                                        disabled={
                                                            savingActivity ===
                                                            city.id
                                                        }
                                                    >

                                                        {savingActivity ===
                                                        city.id
                                                            ? "Adding..."
                                                            : "Add Activity"}

                                                    </button>


                                                    <button
                                                        className="secondary-button"
                                                        type="button"
                                                        onClick={() =>
                                                            closeActivityForm(
                                                                city.id
                                                            )
                                                        }
                                                    >
                                                        Cancel
                                                    </button>

                                                </div>

                                            </form>

                                        )}


                                        {/* Existing activities */}

                                        {activities.length === 0 ? (

                                            !activityForm && (

                                                <div className="no-activities">

                                                    <p>
                                                        No activities added yet.
                                                    </p>

                                                </div>

                                            )

                                        ) : (

                                            <div className="activities-list">

                                                {activities.map(
                                                    activity => (

                                                        <div
                                                            className="activity-card"
                                                            key={
                                                                activity.id
                                                            }
                                                        >

                                                            <div className="activity-content">

                                                                <h4>
                                                                    {
                                                                        activity.name
                                                                    }
                                                                </h4>


                                                                <div className="activity-meta">

                                                                    {activity.date && (

                                                                        <span>
                                                                            📅{" "}
                                                                            {formatDate(
                                                                                activity.date
                                                                            )}
                                                                        </span>

                                                                    )}


                                                                    {activity.time && (

                                                                        <span>
                                                                            🕐{" "}
                                                                            {
                                                                                activity.time
                                                                            }
                                                                        </span>

                                                                    )}


                                                                    {activity.location && (

                                                                        <span>
                                                                            📍{" "}
                                                                            {
                                                                                activity.location
                                                                            }
                                                                        </span>

                                                                    )}

                                                                </div>


                                                                {activity.notes && (

                                                                    <p className="activity-notes">
                                                                        📝{" "}
                                                                        {
                                                                            activity.notes
                                                                        }
                                                                    </p>

                                                                )}

                                                            </div>


                                                            <div className="activity-actions">

                                                                <span className="activity-cost">

                                                                    ₹
                                                                    {Number(
                                                                        activity.estimated_cost ||
                                                                        0
                                                                    ).toLocaleString(
                                                                        "en-IN"
                                                                    )}

                                                                </span>


                                                                <button
                                                                    className="delete-button"
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleDeleteActivity(
                                                                            city,
                                                                            activity
                                                                        )
                                                                    }
                                                                >
                                                                    🗑️ Delete
                                                                </button>

                                                            </div>

                                                        </div>

                                                    )
                                                )}

                                            </div>

                                        )}

                                    </div>

                                </div>

                            </div>

                        );

                    })}

                </div>

            )}

        </div>
    );
}


export default TripBuilder;
