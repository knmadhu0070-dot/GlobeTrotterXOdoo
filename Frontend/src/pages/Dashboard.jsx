import { logout } from "../services/auth";

function Dashboard({ user, onLogout }) {

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
                    <span className="brand-icon">✈</span>
                    GlobeTrotter
                </div>

                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </nav>

            <main className="dashboard-content">

                <p className="eyebrow">YOUR JOURNEY STARTS HERE</p>

                <h1>
                    Welcome back, {user.name} 👋
                </h1>

                <p className="dashboard-subtitle">
                    Ready to plan your next adventure?
                </p>

                <button className="primary-button new-trip-button">
                    + Plan a New Trip
                </button>

                <div className="empty-state">

                    <div className="empty-icon">🗺️</div>

                    <h2>No trips yet</h2>

                    <p>
                        Your future adventures will appear here.
                    </p>

                </div>

            </main>

        </div>
    );
}

export default Dashboard;