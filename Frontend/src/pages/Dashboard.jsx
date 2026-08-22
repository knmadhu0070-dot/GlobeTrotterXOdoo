import { useEffect, useState } from "react";
import { getTrips } from "../services/trips";


const inspirationTrips = [
    {
        id: "demo-1",
        title: "Himachal Escape",
        location: "Manali • Kasol",
        duration: "5 days",
        budget: 25000,
        emoji: "🏔️",
    },
    {
        id: "demo-2",
        title: "Rajasthan Heritage",
        location: "Jaipur • Jodhpur • Udaipur",
        duration: "6 days",
        budget: 40000,
        emoji: "🏰",
    },
    {
        id: "demo-3",
        title: "Goa Getaway",
        location: "North Goa • South Goa",
        duration: "4 days",
        budget: 30000,
        emoji: "🏝️",
    },
];


function formatDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date =
        new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}


function Dashboard({
    user,
    onLogout,
    onCreateTrip,
    onMyTrips,
    onOpenTrip,
    onExplore,
}) {

    const [nextTrip, setNextTrip] = useState(null);
    const [loadingTrip, setLoadingTrip] = useState(true);


    useEffect(() => {

        async function loadNextTrip() {

            try {

                const data = await getTrips();

                const trips =
                    Array.isArray(data.trips)
                        ? data.trips
                        : [];


                const today =
                    new Date()
                        .toISOString()
                        .split("T")[0];


                const upcomingTrips =
                    trips
                        .filter(trip =>
                            trip.start_date >= today
                        )
                        .sort((a, b) =>
                            a.start_date.localeCompare(
                                b.start_date
                            )
                        );


                setNextTrip(
                    upcomingTrips.length > 0
                        ? upcomingTrips[0]
                        : null
                );

            } catch (error) {

                console.error(
                    "Failed to load dashboard trips:",
                    error
                );

                setNextTrip(null);

            } finally {

                setLoadingTrip(false);

            }

        }


        loadNextTrip();

    }, []);


    return (

        <div className="dashboard">

            {/* =================================================
                NAVBAR
            ================================================= */}

            <nav className="navbar">

                <div className="brand">

                    <span className="brand-icon">
                        ✈
                    </span>

                    <span>
                        GlobeTrotter
                    </span>

                </div>


                <div className="nav-actions">

                    <button
                        className="nav-link-button"
                        type="button"
                        onClick={onMyTrips}
                    >
                        My Trips
                    </button>


                    <button
                        className="logout-button"
                        type="button"
                        onClick={onLogout}
                    >
                        Logout
                    </button>

                </div>

            </nav>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="dashboard-content">

                <p className="eyebrow">
                    YOUR JOURNEY STARTS HERE
                </p>


                <h1>
                    Welcome back,{" "}
                    {user?.name || "Traveler"} 👋
                </h1>


                <p className="dashboard-subtitle">
                    Ready to plan your next adventure?
                </p>


                <div className="dashboard-actions">

                    <button
                        className="primary-button new-trip-button"
                        type="button"
                        onClick={onCreateTrip}
                    >
                        + Plan a New Trip
                    </button>


                    <button
                        className="nav-link-button dashboard-my-trips"
                        type="button"
                        onClick={onMyTrips}
                    >
                        View My Trips
                    </button>

                </div>


                {/* =================================================
                    NEXT TRIP
                ================================================= */}

                <section className="next-trip-section">

                    <div className="section-heading">

                        <div>

                            <p className="eyebrow">
                                YOUR NEXT ADVENTURE
                            </p>

                            <h2>
                                Upcoming Trip
                            </h2>

                        </div>

                    </div>


                    {loadingTrip ? (

                        <div className="next-trip-card loading-trip-card">

                            <p>
                                Loading your next trip...
                            </p>

                        </div>

                    ) : nextTrip ? (

                        <div className="next-trip-card">

                            <div className="next-trip-info">

                                <div className="next-trip-icon">
                                    ✈️
                                </div>


                                <div className="next-trip-details">

                                    <h2>
                                        {nextTrip.name}
                                    </h2>


                                    <p className="next-trip-dates">

                                        📅{" "}
                                        {formatDate(
                                            nextTrip.start_date
                                        )}

                                        {" — "}

                                        {formatDate(
                                            nextTrip.end_date
                                        )}

                                    </p>


                                    {nextTrip.description && (

                                        <p className="next-trip-description">
                                            {nextTrip.description}
                                        </p>

                                    )}


                                    <div className="next-trip-meta">

                                        <span>
                                            💰 ₹
                                            {Number(
                                                nextTrip.budget || 0
                                            ).toLocaleString(
                                                "en-IN"
                                            )}
                                        </span>

                                        <span>
                                            Saved trip
                                        </span>

                                    </div>

                                </div>

                            </div>


                            <button
                                className="secondary-button"
                                type="button"
                                onClick={() =>
                                    onOpenTrip &&
                                    onOpenTrip(
                                        nextTrip.id
                                    )
                                }
                            >
                                Open Trip →
                            </button>

                        </div>

                    ) : (

                        <div className="next-trip-card empty-next-trip">

                            <div className="next-trip-icon">
                                🗺️
                            </div>


                            <div>

                                <h2>
                                    No upcoming trips yet
                                </h2>

                                <p>
                                    Start planning your next
                                    unforgettable journey.
                                </p>

                            </div>


                            <button
                                className="primary-button"
                                type="button"
                                onClick={onCreateTrip}
                            >
                                Plan a Trip
                            </button>

                        </div>

                    )}

                </section>


                {/* =================================================
                    INSPIRATION
                ================================================= */}

                <section className="inspiration-section">

                    <div className="explore-section-heading">

                        <div>

                            <p className="eyebrow">
                                GET INSPIRED
                            </p>

                            <h2>
                                Explore Trip Ideas
                            </h2>

                            <p>
                                Discover journeys that might
                                inspire your next adventure.
                            </p>

                        </div>


                        <button
                            className="dashboard-explore-button"
                            type="button"
                            onClick={onExplore}
                        >
                            View All →
                        </button>

                    </div>


                    <div className="inspiration-grid">

                        {inspirationTrips.map(trip => (

                            <article
                                className="inspiration-card"
                                key={trip.id}
                            >

                                <div className="inspiration-image">

                                    <span>
                                        {trip.emoji}
                                    </span>

                                </div>


                                <div className="inspiration-content">

                                    <h3>
                                        {trip.title}
                                    </h3>


                                    <p className="inspiration-location">
                                        {trip.location}
                                    </p>


                                    <div className="inspiration-meta">

                                        <span>
                                            📅 {trip.duration}
                                        </span>

                                        <span>
                                            💰 ₹
                                            {trip.budget.toLocaleString(
                                                "en-IN"
                                            )}
                                        </span>

                                    </div>


                                    <button
                                        className="secondary-button inspiration-button"
                                        type="button"
                                        onClick={onExplore}
                                    >
                                        Explore
                                    </button>

                                </div>

                            </article>

                        ))}

                    </div>

                </section>

            </main>

        </div>

    );
}


export default Dashboard;