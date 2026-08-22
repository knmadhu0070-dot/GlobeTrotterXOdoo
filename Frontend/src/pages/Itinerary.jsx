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


function sortActivities(activities) {

    return [...activities].sort((a, b) => {

        // Activities with a time come first,
        // sorted chronologically.

        if (a.time && b.time) {
            return a.time.localeCompare(b.time);
        }

        if (a.time && !b.time) {
            return -1;
        }

        if (!a.time && b.time) {
            return 1;
        }

        return 0;
    });
}


function buildItinerary(cities, tripStart, tripEnd) {

    const days = {};

    // ---------------------------------------------------------
    // Create every date of the trip.
    // This means even a day with no activity is visible.
    // ---------------------------------------------------------

    const current = new Date(
        `${tripStart}T00:00:00`
    );

    const last = new Date(
        `${tripEnd}T00:00:00`
    );


    while (current <= last) {

        const date =
            current.toISOString().split("T")[0];

        days[date] = [];

        current.setDate(
            current.getDate() + 1
        );

    }


    // ---------------------------------------------------------
    // Put every activity into its date.
    // Multiple activities on the same date are allowed.
    // ---------------------------------------------------------

    cities.forEach(city => {

        const activities =
            Array.isArray(city.activities)
                ? city.activities
                : [];


        activities.forEach(activity => {

            if (!activity.date) {
                return;
            }


            if (!days[activity.date]) {
                days[activity.date] = [];
            }


            days[activity.date].push({
                ...activity,
                cityName: city.name,
            });

        });

    });


    // ---------------------------------------------------------
    // Convert object into sorted array.
    // ---------------------------------------------------------

    return Object.entries(days)
        .sort(([dateA], [dateB]) =>
            dateA.localeCompare(dateB)
        )
        .map(([date, activities]) => ({

            date,

            activities:
                sortActivities(activities),

        }));

}


function Itinerary({
    cities,
    tripStart,
    tripEnd,
}) {

    const itinerary =
        buildItinerary(
            cities,
            tripStart,
            tripEnd
        );


    return (

        <section className="itinerary-section">

            <div className="itinerary-header">

                <p className="eyebrow">
                    ITINERARY
                </p>

                <h2>
                    Your day-by-day plan
                </h2>

                <p className="page-subtitle">
                    All activities organized by date.
                </p>

            </div>


            <div className="itinerary-list">

                {itinerary.map(day => (

                    <div
                        className="itinerary-day"
                        key={day.date}
                    >

                        {/* Date */}

                        <div className="itinerary-date">

                            <span className="itinerary-date-icon">
                                📅
                            </span>

                            <h3>
                                {formatDate(
                                    day.date
                                )}
                            </h3>

                        </div>


                        {/* Activities */}

                        {day.activities.length === 0 ? (

                            <div className="itinerary-empty">

                                No activities planned
                                for this day.

                            </div>

                        ) : (

                            <div className="itinerary-activities">

                                {day.activities.map(
                                    activity => (

                                        <div
                                            className="itinerary-activity"
                                            key={`${day.date}-${activity.id}`}
                                        >

                                            <div className="itinerary-activity-main">

                                                <h4>
                                                    {activity.name}
                                                </h4>


                                                <div className="itinerary-activity-meta">

                                                    <span>
                                                        📍{" "}
                                                        {activity.cityName}
                                                    </span>


                                                    {activity.time && (

                                                        <span>
                                                            🕐{" "}
                                                            {activity.time}
                                                        </span>

                                                    )}


                                                    {activity.location && (

                                                        <span>
                                                            📌{" "}
                                                            {activity.location}
                                                        </span>

                                                    )}

                                                </div>


                                                {activity.notes && (

                                                    <p className="itinerary-activity-notes">
                                                        {activity.notes}
                                                    </p>

                                                )}

                                            </div>


                                            <div className="itinerary-activity-cost">

                                                ₹
                                                {Number(
                                                    activity.estimated_cost ||
                                                    0
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </div>

                ))}

            </div>

        </section>

    );
}


export default Itinerary;