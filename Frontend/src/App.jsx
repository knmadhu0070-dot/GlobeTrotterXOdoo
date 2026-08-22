import { useEffect, useState } from "react";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CreateTrip from "./pages/CreateTrip";
import MyTrips from "./pages/MyTrips";

import { getCurrentUser } from "./services/auth";


function App() {

    const [page, setPage] = useState("login");
    const [user, setUser] = useState(null);
    const [checkingSession, setCheckingSession] = useState(true);


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


    if (page === "my-trips") {

        return (
            <MyTrips

                onBack={() =>
                    setPage("dashboard")
                }

                onCreateTrip={() =>
                    setPage("create-trip")
                }

            />
        );

    }


    if (page === "dashboard" && user) {

        return (
            <Dashboard

                user={user}

                onLogout={() => {

                    setUser(null);
                    setPage("login");

                }}

                onCreateTrip={() =>
                    setPage("create-trip")
                }

                onMyTrips={() =>
                    setPage("my-trips")
                }

            />
        );

    }


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
