import { useState } from "react";
import { createTrip } from "../services/trips";

function CreateTrip({ onBack, onCreated }) {

    const [form, setForm] = useState({
        name: "",
        startDate: "",
        endDate: "",
        description: "",
        budget: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    function handleChange(event) {
        setForm({
            ...form,
            [event.target.name]: event.target.value,
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");

        // Trip name validation
        if (!form.name.trim()) {
            setError("Trip name is required.");
            return;
        }

        // Date validation
        if (!form.startDate || !form.endDate) {
            setError("Start date and end date are required.");
            return;
        }

        // Date order validation
        if (form.endDate < form.startDate) {
            setError("End date cannot be before start date.");
            return;
        }

        // Budget validation
        if (form.budget !== "" && Number(form.budget) < 0) {
            setError("Budget cannot be negative.");
            return;
        }

        setLoading(true);

        try {
            // Convert frontend camelCase fields
            // to backend snake_case fields.
            const data = await createTrip({
                name: form.name,
                start_date: form.startDate,
                end_date: form.endDate,
                description: form.description,
                budget: form.budget === ""
                    ? 0
                    : Number(form.budget),
            });

            onCreated(data.trip);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="form-page">

            <div className="form-container">

                <button
                    className="back-button"
                    onClick={onBack}
                    type="button"
                >
                    ← Back
                </button>

                <p className="eyebrow">
                    PLAN YOUR JOURNEY
                </p>

                <h1>Create a new trip</h1>

                <p className="page-subtitle">
                    Start with the basics. You can add destinations
                    and activities next.
                </p>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form
                    className="trip-form"
                    onSubmit={handleSubmit}
                >

                    <div className="form-group">
                        <label>Trip name *</label>

                        <input
                            type="text"
                            name="name"
                            placeholder="e.g. Rajasthan Explorer"
                            value={form.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="date-grid">

                        <div className="form-group">
                            <label>Start date *</label>

                            <input
                                type="date"
                                name="startDate"
                                value={form.startDate}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>End date *</label>

                            <input
                                type="date"
                                name="endDate"
                                value={form.endDate}
                                onChange={handleChange}
                            />
                        </div>

                    </div>

                    <div className="form-group">
                        <label>Budget</label>

                        <div className="budget-input">
                            <span>₹</span>

                            <input
                                type="number"
                                min="0"
                                name="budget"
                                placeholder="30000"
                                value={form.budget}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description</label>

                        <textarea
                            name="description"
                            placeholder="Tell us a little about this trip..."
                            value={form.description}
                            onChange={handleChange}
                            rows="5"
                        />
                    </div>

                    <button
                        className="primary-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating trip..."
                            : "Create Trip"
                        }
                    </button>

                </form>

            </div>

        </div>
    );
}

export default CreateTrip;