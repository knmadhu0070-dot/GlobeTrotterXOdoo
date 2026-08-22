import { logout } from "../services/auth";


function Dashboard({
    user,
    onLogout,
    onCreateTrip,
    onMyTrips
}) {

    async function handleLogout() {

        try {

            await logout();

            onLogout();

        } catch (error) {

            console.error(error);

        }
    }


    return (

        <div className="dashboard">

            <nav className="navbar">

                <div className="brand">

                    <span className="brand-icon">
                        ✈
                    </span>

                    GlobeTrotter

                </div>


                <div className="nav-actions">

                    <button
                        className="nav-link-button"
                        onClick={onMyTrips}
                    >
                        My Trips
                    </button>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </nav>


            <main className="dashboard-content">

                <p className="eyebrow">
                    YOUR JOURNEY STARTS HERE
                </p>

                <h1>
                    Welcome back, {user.name} 👋
                </h1>

                <p className="dashboard-subtitle">
                    Ready to plan your next adventure?
                </p>


                <button
                    className="primary-button new-trip-button"
                    onClick={onCreateTrip}
                >
                    + Plan a New Trip
                </button>


                <button
                    className="secondary-dashboard-button"
                    onClick={onMyTrips}
                >
                    View My Trips
                </button>


                <div className="empty-state">

                    <div className="empty-icon">
                        🗺️
                    </div>

                    <h2>
                        Your adventures await
                    </h2>

                    <p>
                        Create a trip to start building
                        your next unforgettable journey.
                    </p>

                </div>

            </main>

        </div>
    );
}


export default Dashboard;