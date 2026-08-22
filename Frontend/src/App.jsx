import { useEffect, useState } from "react";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CreateTrip from "./pages/CreateTrip";
import MyTrips from "./pages/MyTrips";
import TripBuilder from "./pages/TripBuilder";
import Explore from "./pages/Explore";

import { getCurrentUser } from "./services/auth";


function App() {

    const [page, setPage] = useState("login");
    const [user, setUser] = useState(null);
    const [checkingSession, setCheckingSession] = useState(true);

    // Trip currently opened in Trip Builder
    const [selectedTripId, setSelectedTripId] = useState(null);


    // ---------------------------------------------------------
    // Check existing login session
    // ---------------------------------------------------------

    useEffect(() => {

        async function checkSession() {

            try {

                const data = await getCurrentUser();

                setUser(data.user);
                setPage("dashboard");

            } catch {

                setUser(null);
                setPage("login");

            } finally {

                setCheckingSession(false);

            }
        }

        checkSession();

    }, []);


    // ---------------------------------------------------------
    // Loading
    // ---------------------------------------------------------

    if (checkingSession) {

        return (
            <div className="loading-screen">

                <div className="loading-logo">
                    ✈
                </div>

                <p>GlobeTrotter</p>

            </div>
        );

    }


    // ---------------------------------------------------------
    // Signup
    // ---------------------------------------------------------

    if (page === "signup") {

        return (
            <Signup

                onLogin={() =>
                    setPage("login")
                }

                onSuccess={(newUser) => {

                    setUser(newUser);
                    setPage("dashboard");

                }}

            />
        );

    }


    // ---------------------------------------------------------
    // Create Trip
    // ---------------------------------------------------------

    if (page === "create-trip") {

        return (
            <CreateTrip

                onBack={() =>
                    setPage("dashboard")
                }

                onCreated={() =>
                    setPage("my-trips")
                }

            />
        );

    }


    // ---------------------------------------------------------
    // My Trips
    // ---------------------------------------------------------

    if (page === "my-trips") {

        return (
            <MyTrips

                onBack={() =>
                    setPage("dashboard")
                }

                onCreateTrip={() =>
                    setPage("create-trip")
                }

                onOpenTrip={(tripId) => {

                    setSelectedTripId(tripId);
                    setPage("trip-builder");

                }}

            />
        );

    }


    // ---------------------------------------------------------
    // Trip Builder
    // ---------------------------------------------------------

    if (page === "trip-builder") {

        // Safety guard: never render TripBuilder without a trip.
        if (!selectedTripId) {

            setPage("my-trips");

            return null;
        }

        return (
            <TripBuilder

                tripId={selectedTripId}

                onBack={() =>
                    setPage("my-trips")
                }

            />
        );

    }

    // ---------------------------------------------------------
    // Explore
    // ---------------------------------------------------------

    if (page === "explore") {

        return (
            <Explore

                onBack={() =>
                    setPage("dashboard")
                }

                onMyTrips={() =>
                    setPage("my-trips")
                }

            />
        );

    }
    // ---------------------------------------------------------
    // Dashboard
    // ---------------------------------------------------------

    if (page === "dashboard" && user) {

        return (
            <Dashboard

                user={user}

                onLogout={() => {

                    setUser(null);
                    setSelectedTripId(null);
                    setPage("login");

                }}

                onCreateTrip={() =>
                    setPage("create-trip")
                }

                onMyTrips={() =>
                    setPage("my-trips")
                }
                onOpenTrip={(tripId) => {

                    setSelectedTripId(tripId);
                    setPage("trip-builder");

                }}
            />
        );

    }


    // ---------------------------------------------------------
    // Login
    // ---------------------------------------------------------

    return (
        <Login

            onSignup={() =>
                setPage("signup")
            }

            onSuccess={(loggedInUser) => {

                setUser(loggedInUser);
                setPage("dashboard");

            }}

        />
    );
}


export default App;