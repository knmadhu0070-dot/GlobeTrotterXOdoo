import { useEffect, useState } from "react";

import {
    getTrip,
    getCities,
    createCity,
    deleteCity,
    createActivity,
    deleteActivity,
} from "../services/trips";

import {
    ArrowLeft,
    Plus,
    X,
    MapPin,
    MapPinned,
    Trash2,
    CalendarDays,
    Clock3,
    MapPinHouse,
    Wallet,
} from "lucide-react";


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

    const [cityForm, setCityForm] = useState({
        name: "",
        arrival_date: "",
        departure_date: "",
        notes: "",
    });

    const [activityForms, setActivityForms] = useState({});

    const [savingCity, setSavingCity] = useState(false);
    const [savingActivity, setSavingActivity] = useState(null);


    // ---------------------------------------------------------
    // Load trip + cities
    // ---------------------------------------------------------

    async function loadTripBuilder() {

        try {

            setLoading(true);
            setError("");

            const tripData = await getTrip(tripId);
            const citiesData = await getCities(tripId);

            setTrip(tripData.trip);
            setCities(citiesData.cities);

        } catch (error) {

            setError(error.message);

        } finally {

            setLoading(false);

        }
    }


    useEffect(() => {

        loadTripBuilder();

    }, [tripId]);


    // ---------------------------------------------------------
    // City form
    // ---------------------------------------------------------

    function handleCityChange(event) {

        setCityForm({
            ...cityForm,
            [event.target.name]: event.target.value,
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

        setSavingCity(true);

        try {

            const data = await createCity(
                tripId,
                cityForm
            );

            setCities([
                ...cities,
                data.city
            ]);

            setCityForm({
                name: "",
                arrival_date: "",
                departure_date: "",
                notes: "",
            });

            setShowCityForm(false);
            setError("");

        } catch (error) {

            setError(error.message);

        } finally {

            setSavingCity(false);

        }
    }


    // ---------------------------------------------------------
    // Delete city
    // ---------------------------------------------------------

    async function handleDeleteCity(city) {

        const confirmed = window.confirm(
            `Delete ${city.name} and all its activities?`
        );

        if (!confirmed) {
            return;
        }

        try {

            await deleteCity(city.id);

            setCities(
                cities.filter(
                    item => item.id !== city.id
                )
            );

            // Clear stale errors, especially an old city-overlap message.
            setError("");

        } catch (error) {

            setError(error.message);

        }
    }


    // ---------------------------------------------------------
    // Activity form helpers
    // ---------------------------------------------------------

    function showActivityForm(cityId) {

        setActivityForms({
            ...activityForms,
            [cityId]: {
                visible: true,
                name: "",
                date: "",
                time: "",
                location: "",
                notes: "",
                estimated_cost: "",
            },
        });
    }


    function hideActivityForm(cityId) {

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

        setActivityForms({
            ...activityForms,
            [cityId]: {
                ...activityForms[cityId],
                [event.target.name]: event.target.value,
            },
        });
    }


    // ---------------------------------------------------------
    // Create activity
    // ---------------------------------------------------------

    async function handleCreateActivity(
        city,
        event
    ) {

        event.preventDefault();

        const form = activityForms[city.id];

        if (!form || !form.name.trim()) {
            setError("Activity name is required.");
            return;
        }

        if (
            form.date &&
            (
                form.date < city.arrival_date ||
                form.date > city.departure_date
            )
        ) {
            setError(
                "Activity date must be within the city dates."
            );
            return;
        }

        setSavingActivity(city.id);
        setError("");

        try {

            const data = await createActivity(
                city.id,
                {
                    name: form.name,
                    date: form.date || null,
                    time: form.time,
                    location: form.location,
                    notes: form.notes,
                    estimated_cost:
                        form.estimated_cost === ""
                            ? 0
                            : Number(form.estimated_cost),
                }
            );

            setCities(
                cities.map(item => {

                    if (item.id !== city.id) {
                        return item;
                    }

                    return {
                        ...item,
                        activities: [
                            ...(item.activities || []),
                            data.activity,
                        ],
                    };

                })
            );

            hideActivityForm(city.id);

        } catch (error) {

            setError(error.message);

        } finally {

            setSavingActivity(null);

        }
    }


    // ---------------------------------------------------------
    // Delete activity
    // ---------------------------------------------------------

    async function handleDeleteActivity(
        city,
        activity
    ) {

        const confirmed = window.confirm(
            `Delete "${activity.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {

            await deleteActivity(activity.id);

            setCities(
                cities.map(item => {

                    if (item.id !== city.id) {
                        return item;
                    }

                    return {
                        ...item,
                        activities:
                            (item.activities || []).filter(
                                existing =>
                                    existing.id !== activity.id
                            ),
                    };

                })
            );

        } catch (error) {

            setError(error.message);

        }
    }


    // ---------------------------------------------------------
    // Loading
    // ---------------------------------------------------------

    if (loading) {

        return (
            <div className="page-loading">
                Loading trip builder...
            </div>
        );

    }


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
                        {error || "Trip not found."}
                    </div>

                </div>

            </div>
        );

    }


    // ---------------------------------------------------------
    // Main UI
    // ---------------------------------------------------------

    return (
        <div className="trips-page">

            <button
                className="back-button"
                onClick={onBack}
                type="button"
            >
                <ArrowLeft size={18} strokeWidth={2} />
                <span>Back to My Trips</span>
            </button>


            <div className="trips-header">

                <div>

                    <p className="eyebrow">
                        TRIP BUILDER
                    </p>

                    <h1>{trip.name}</h1>

                    <p className="page-subtitle">

                        {formatDate(trip.start_date)}
                        {" — "}
                        {formatDate(trip.end_date)}

                    </p>

                </div>

                <button
                    className="primary-button"
                    type="button"
                    onClick={() => {
                        setError("");
                        setShowCityForm(!showCityForm);
                    }}
                >
                    {showCityForm ? (
                        <>
                            <X size={18} strokeWidth={2} />
                            <span>Cancel</span>
                        </>
                    ) : (
                        <>
                            <Plus size={18} strokeWidth={2} />
                            <span>Add City</span>
                        </>
                    )}
                </button>

            </div>


            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}


            {/* ------------------------------------------------
                Add City Form
            ------------------------------------------------ */}

            {showCityForm && (

                <div className="trip-builder-panel">

                    <h2>Add a city</h2>

                    <p className="page-subtitle">
                        Choose where you will stay during
                        this part of your journey.
                    </p>

                    <form
                        className="trip-form"
                        onSubmit={handleCreateCity}
                    >

                        <div className="form-group">

                            <label>
                                City name *
                            </label>

                            <input
                                type="text"
                                name="name"
                                placeholder="e.g. Jaipur"
                                value={cityForm.name}
                                onChange={handleCityChange}
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
                                    value={
                                        cityForm.arrival_date
                                    }
                                    min={trip.start_date}
                                    max={trip.end_date}
                                    onChange={handleCityChange}
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Departure date *
                                </label>

                                <input
                                    type="date"
                                    name="departure_date"
                                    value={
                                        cityForm.departure_date
                                    }
                                    min={trip.start_date}
                                    max={trip.end_date}
                                    onChange={handleCityChange}
                                />

                            </div>

                        </div>


                        <div className="form-group">

                            <label>
                                Notes
                            </label>

                            <textarea
                                name="notes"
                                placeholder="Optional notes about this city..."
                                value={cityForm.notes}
                                onChange={handleCityChange}
                                rows="4"
                            />

                        </div>


                        <button
                            className="primary-button"
                            type="submit"
                            disabled={savingCity}
                        >
                            <Plus size={18} strokeWidth={2} />
                            <span>
                                {savingCity ? "Adding city..." : "Add City"}
                            </span>
                        </button>

                    </form>

                </div>

            )}


            {/* ------------------------------------------------
                Cities
            ------------------------------------------------ */}

            {cities.length === 0 && !showCityForm ? (

                <div className="empty-state">

                    <div className="empty-icon">
                        <MapPinned size={40} strokeWidth={1.8} />
                    </div>

                    <h2>Add your first city</h2>

                    <p>
                        Start building your journey by
                        choosing the cities you want to visit.
                    </p>

                    <button
                        className="primary-button empty-button"
                        type="button"
                        onClick={() => {
                            setError("");
                            setShowCityForm(true);
                        }}
                    >
                        <Plus size={17} strokeWidth={2} />
                        <span>Add City</span>
                    </button>

                </div>

            ) : (

                <div className="city-list">

                    {cities.map(city => (

                        <div
                            className="city-card"
                            key={city.id}
                        >

                            <div className="city-card-header">

                                <div>

                                    <p className="eyebrow">
                                        CITY
                                    </p>

                                    <h2 className="city-title">
                                        <MapPin size={22} strokeWidth={2} />
                                        <span>{city.name}</span>
                                    </h2>

                                    <p className="trip-dates">

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
                                        handleDeleteCity(city)
                                    }
                                >
                                    <Trash2 size={16} strokeWidth={2} />
                                    <span>Delete</span>
                                </button>

                            </div>


                            {city.notes && (

                                <p className="city-notes">
                                    {city.notes}
                                </p>

                            )}


                            <div className="activities-section">

                                <div className="activities-header">

                                    <h3>
                                        Activities
                                    </h3>

                                    {!activityForms[city.id] && (

                                        <button
                                            className="secondary-button"
                                            type="button"
                                            onClick={() =>
                                                showActivityForm(
                                                    city.id
                                                )
                                            }
                                        >
                                            <Plus size={16} strokeWidth={2} />
                                            <span>Add Activity</span>
                                        </button>

                                    )}

                                </div>


                                {/* Activity Form */}

                                {activityForms[city.id] && (

                                    <form
                                        className="activity-form"
                                        onSubmit={(event) =>
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
                                                    activityForms[
                                                        city.id
                                                    ].name
                                                }
                                                onChange={(event) =>
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
                                                        activityForms[
                                                            city.id
                                                        ].date
                                                    }
                                                    onChange={(event) =>
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
                                                        activityForms[
                                                            city.id
                                                        ].time
                                                    }
                                                    onChange={(event) =>
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
                                                placeholder="e.g. Amer, Jaipur"
                                                value={
                                                    activityForms[
                                                        city.id
                                                    ].location
                                                }
                                                onChange={(event) =>
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

                                            <div className="budget-input">

                                                <span>₹</span>

                                                <input
                                                    type="number"
                                                    min="0"
                                                    name="estimated_cost"
                                                    placeholder="500"
                                                    value={
                                                        activityForms[
                                                            city.id
                                                        ].estimated_cost
                                                    }
                                                    onChange={(event) =>
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
                                                Notes
                                            </label>

                                            <textarea
                                                name="notes"
                                                placeholder="Optional notes..."
                                                value={
                                                    activityForms[
                                                        city.id
                                                    ].notes
                                                }
                                                onChange={(event) =>
                                                    handleActivityChange(
                                                        city.id,
                                                        event
                                                    )
                                                }
                                                rows="3"
                                            />

                                        </div>


                                        <div className="trip-card-actions">

                                            <button
                                                className="primary-button"
                                                type="submit"
                                                disabled={
                                                    savingActivity ===
                                                    city.id
                                                }
                                            >
                                                <Plus size={17} strokeWidth={2} />
                                                <span>
                                                    {savingActivity === city.id
                                                        ? "Adding..."
                                                        : "Add Activity"}
                                                </span>
                                            </button>

                                            <button
                                                className="secondary-button"
                                                type="button"
                                                onClick={() =>
                                                    hideActivityForm(
                                                        city.id
                                                    )
                                                }
                                            >
                                                <X size={16} strokeWidth={2} />
                                                <span>Cancel</span>
                                            </button>

                                        </div>

                                    </form>

                                )}


                                {/* Activities List */}

                                {city.activities &&
                                city.activities.length > 0 ? (

                                    <div className="activity-list">

                                        {city.activities.map(
                                            activity => (

                                                <div
                                                    className="activity-card"
                                                    key={
                                                        activity.id
                                                    }
                                                >

                                                    <div>

                                                        <h4>
                                                            {activity.name}
                                                        </h4>

                                                        <div className="activity-meta">

                                                            {activity.date && (
                                                                <span>
                                                                    <CalendarDays size={15} strokeWidth={2} />
                                                                    {formatDate(activity.date)}
                                                                </span>
                                                            )}

                                                            {activity.time && (
                                                                <span>
                                                                    <Clock3 size={15} strokeWidth={2} />
                                                                    {activity.time}
                                                                </span>
                                                            )}

                                                            {activity.location && (
                                                                <span>
                                                                    <MapPinHouse size={15} strokeWidth={2} />
                                                                    {activity.location}
                                                                </span>
                                                            )}

                                                        </div>

                                                        {activity.notes && (
                                                            <small>
                                                                {
                                                                    activity.notes
                                                                }
                                                            </small>
                                                        )}

                                                    </div>


                                                    <div>

                                                        {activity.estimated_cost >
                                                            0 && (
                                                            <span className="activity-cost">
                                                                <Wallet size={16} strokeWidth={2} />
                                                                <span>
                                                                    ₹{activity.estimated_cost.toLocaleString("en-IN")}
                                                                </span>
                                                            </span>
                                                        )}

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
                                                            <Trash2 size={16} strokeWidth={2} />
                                                            <span>Delete</span>
                                                        </button>

                                                    </div>

                                                </div>

                                            )
                                        )}

                                    </div>

                                ) : (

                                    !activityForms[city.id] && (

                                        <p className="empty-activities">
                                            No activities added yet.
                                        </p>

                                    )

                                )}

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}

export default TripBuilder;