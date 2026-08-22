import { useMemo, useState } from "react";


const exploreTrips = [
    {
        id: 1,
        title: "Himachal Escape",
        destinations: "Manali • Kasol",
        duration: "5 days",
        budget: 25000,
        category: "Mountains",
        emoji: "🏔️",
        description:
            "A peaceful mountain escape filled with valleys, cafés and scenic views.",
    },
    {
        id: 2,
        title: "Rajasthan Heritage",
        destinations: "Jaipur • Jodhpur • Udaipur",
        duration: "6 days",
        budget: 40000,
        category: "Heritage",
        emoji: "🏰",
        description:
            "Explore royal forts, colourful markets and the rich heritage of Rajasthan.",
    },
    {
        id: 3,
        title: "Goa Getaway",
        destinations: "North Goa • South Goa",
        duration: "4 days",
        budget: 30000,
        category: "Beach",
        emoji: "🏝️",
        description:
            "A relaxed coastal trip with beaches, sunsets and unforgettable evenings.",
    },
    {
        id: 4,
        title: "Kerala Backwaters",
        destinations: "Kochi • Alleppey • Munnar",
        duration: "6 days",
        budget: 35000,
        category: "Nature",
        emoji: "🌴",
        description:
            "Experience peaceful backwaters, lush landscapes and Kerala's unique culture.",
    },
    {
        id: 5,
        title: "Kashmir Escape",
        destinations: "Srinagar • Gulmarg • Pahalgam",
        duration: "7 days",
        budget: 45000,
        category: "Mountains",
        emoji: "🏔️",
        description:
            "Discover lakes, mountains and some of India's most beautiful landscapes.",
    },
    {
        id: 6,
        title: "Tamil Nadu Trail",
        destinations: "Chennai • Madurai • Ooty",
        duration: "6 days",
        budget: 32000,
        category: "Culture",
        emoji: "🛕",
        description:
            "A cultural journey through temples, food, history and hill stations.",
    },
];


const categories = [
    "All",
    "Mountains",
    "Beach",
    "Heritage",
    "Nature",
    "Culture",
];


function Explore({ onBack, onMyTrips }) {

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");


    const filteredTrips = useMemo(() => {

        const query =
            search.trim().toLowerCase();


        return exploreTrips.filter(trip => {

            const matchesCategory =
                category === "All" ||
                trip.category === category;


            const matchesSearch =
                !query ||
                trip.title
                    .toLowerCase()
                    .includes(query) ||
                trip.destinations
                    .toLowerCase()
                    .includes(query) ||
                trip.category
                    .toLowerCase()
                    .includes(query);


            return (
                matchesCategory &&
                matchesSearch
            );

        });

    }, [search, category]);


    return (

        <div className="explore-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="explore-header">

                <button
                    className="back-button"
                    type="button"
                    onClick={onBack}
                >
                    ← Back to Dashboard
                </button>


                <p className="eyebrow">
                    DISCOVER YOUR NEXT ADVENTURE
                </p>


                <h1>
                    Explore
                </h1>


                <p className="explore-subtitle">
                    Find trip ideas, destinations and
                    experiences for your next journey.
                </p>


                {/* Search */}

                <div className="explore-search">

                    <span>
                        🔎
                    </span>

                    <input
                        type="text"
                        placeholder="Search destinations or trips..."
                        value={search}
                        onChange={event =>
                            setSearch(
                                event.target.value
                            )
                        }
                    />

                </div>

            </header>


            {/* =================================================
                CATEGORIES
            ================================================= */}

            <div className="explore-categories">

                {categories.map(item => (

                    <button
                        key={item}
                        type="button"
                        className={
                            category === item
                                ? "explore-category active"
                                : "explore-category"
                        }
                        onClick={() =>
                            setCategory(item)
                        }
                    >
                        {item}
                    </button>

                ))}

            </div>


            {/* =================================================
                TRIPS
            ================================================= */}

            <main className="explore-content">

                <div className="explore-results-header">

                    <div>

                        <p className="eyebrow">
                            TRIP IDEAS
                        </p>

                        <h2>
                            Featured journeys
                        </h2>

                    </div>


                    <span className="explore-result-count">
                        {filteredTrips.length}{" "}
                        {filteredTrips.length === 1
                            ? "trip"
                            : "trips"}
                    </span>

                </div>


                {filteredTrips.length === 0 ? (

                    <div className="explore-empty">

                        <div className="explore-empty-icon">
                            🔎
                        </div>

                        <h2>
                            No trips found
                        </h2>

                        <p>
                            Try another destination or category.
                        </p>

                    </div>

                ) : (

                    <div className="explore-grid">

                        {filteredTrips.map(trip => (

                            <article
                                className="explore-card"
                                key={trip.id}
                            >

                                <div className="explore-card-image">

                                    <span>
                                        {trip.emoji}
                                    </span>

                                    <span className="explore-category-badge">
                                        {trip.category}
                                    </span>

                                </div>


                                <div className="explore-card-content">

                                    <h3>
                                        {trip.title}
                                    </h3>


                                    <p className="explore-destinations">
                                        📍 {trip.destinations}
                                    </p>


                                    <p className="explore-description">
                                        {trip.description}
                                    </p>


                                    <div className="explore-card-meta">

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
                                        className="secondary-button explore-card-button"
                                        type="button"
                                    >
                                        View Trip
                                    </button>

                                </div>

                            </article>

                        ))}

                    </div>

                )}

            </main>


            {/* =================================================
                FOOTER ACTION
            ================================================= */}

            <div className="explore-footer">

                <p>
                    Found something you like?
                </p>

                <button
                    className="primary-button"
                    type="button"
                    onClick={onMyTrips}
                >
                    View My Trips
                </button>

            </div>

        </div>

    );
}


export default Explore;