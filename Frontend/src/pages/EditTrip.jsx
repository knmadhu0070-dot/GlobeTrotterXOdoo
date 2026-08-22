import { useState } from "react";
import { updateTrip } from "../services/trips";


function EditTrip({ trip, cities, onSaved, onCancel }) {

    const [form, setForm] = useState({
        name: trip.name || "",
        start_date: trip.start_date || "",
        end_date: trip.end_date || "",
        description: trip.description || "",
        budget: trip.budget ?? "",
    });

    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);


    function handleChange(event) {

        const {
            name,
            value,
        } = event.target;

        setForm({
            ...form,
            [name]: value,
        });

    }


    async function handleSubmit(event) {

        event.preventDefault();

        setError("");


        // -----------------------------------------------------
        // Basic validation
        // -----------------------------------------------------

        if (!form.name.trim()) {

            setError(
                "Trip name is required."
            );

            return;
        }


        if (
            !form.start_date ||
            !form.end_date
        ) {

            setError(
                "Start date and end date are required."
            );

            return;
        }


        if (
            form.end_date <
            form.start_date
        ) {

            setError(
                "End date cannot be before start date."
            );

            return;
        }


        if (
            form.budget !== "" &&
            Number(form.budget) < 0
        ) {

            setError(
                "Budget cannot be negative."
            );

            return;
        }


        // -----------------------------------------------------
        // Existing cities must remain inside trip dates
        // -----------------------------------------------------

        const invalidCity = cities.find(city => {

            return (
                city.arrival_date <
                    form.start_date ||
                city.departure_date >
                    form.end_date
            );

        });


        if (invalidCity) {

            setError(
                `Trip dates must contain the existing dates ` +
                `for ${invalidCity.name} ` +
                `(${invalidCity.arrival_date} — ` +
                `${invalidCity.departure_date}).`
            );

            return;
        }


        setSaving(true);

        try {

            const response =
                await updateTrip(
                    trip.id,
                    {
                        name:
                            form.name.trim(),

                        start_date:
                            form.start_date,

                        end_date:
                            form.end_date,

                        description:
                            form.description.trim(),

                        budget:
                            form.budget === ""
                                ? 0
                                : Number(
                                    form.budget
                                ),
                    }
                );


            if (!response.trip) {

                throw new Error(
                    "Updated trip was not returned by the server."
                );

            }


            onSaved(
                response.trip
            );

        } catch (error) {

            console.error(
                "Update trip error:",
                error
            );

            setError(
                error.message ||
                "Failed to update trip."
            );

        } finally {

            setSaving(false);

        }

    }


    return (

        <div className="form-page">

            <div className="form-container">

                <button
                    className="back-button"
                    onClick={onCancel}
                    type="button"
                >
                    ← Back to Trip Builder
                </button>


                <p className="eyebrow">
                    TRIP DETAILS
                </p>

                <h1>
                    Edit trip
                </h1>

                <p className="page-subtitle">
                    Update your trip information and budget.
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

                    {/* Trip name */}

                    <div className="form-group">

                        <label>
                            Trip name *
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="e.g. Rajasthan Explorer"
                        />

                    </div>


                    {/* Dates */}

                    <div className="date-grid">

                        <div className="form-group">

                            <label>
                                Start date *
                            </label>

                            <input
                                type="date"
                                name="start_date"
                                value={
                                    form.start_date
                                }
                                onChange={
                                    handleChange
                                }
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                End date *
                            </label>

                            <input
                                type="date"
                                name="end_date"
                                value={
                                    form.end_date
                                }
                                onChange={
                                    handleChange
                                }
                            />

                        </div>

                    </div>


                    {/* Budget */}

                    <div className="form-group">

                        <label>
                            Budget
                        </label>

                        <div className="budget-input">

                            <span>
                                ₹
                            </span>

                            <input
                                type="number"
                                min="0"
                                name="budget"
                                placeholder="30000"
                                value={
                                    form.budget
                                }
                                onChange={
                                    handleChange
                                }
                            />

                        </div>

                    </div>


                    {/* Description */}

                    <div className="form-group">

                        <label>
                            Description
                        </label>

                        <textarea
                            name="description"
                            rows="5"
                            placeholder="Tell us a little about this trip..."
                            value={
                                form.description
                            }
                            onChange={
                                handleChange
                            }
                        />

                    </div>


                    <div className="form-actions">

                        <button
                            className="primary-button"
                            type="submit"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "Save Changes"}
                        </button>


                        <button
                            className="secondary-button"
                            type="button"
                            onClick={onCancel}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                    </div>

                </form>

            </div>

        </div>

    );
}


export default EditTrip;