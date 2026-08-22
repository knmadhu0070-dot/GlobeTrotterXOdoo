import { useState } from "react";
import { login } from "../services/auth";

function Login({ onSignup, onSuccess }) {

    const [form, setForm] = useState({
        email: "",
        password: "",
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
        setLoading(true);

        try {
            const data = await login(form);

            onSuccess(data.user);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">

            <div className="auth-card">

                <div className="brand">
                    <span className="brand-icon">✈</span>
                    <span>GlobeTrotter</span>
                </div>

                <h1>Welcome back</h1>

                <p className="auth-subtitle">
                    Your next adventure starts here.
                </p>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <label>Email</label>

                    <input
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                    />

                    <div className="password-label-row">
                        <label>Password</label>

                        <button
                            type="button"
                            className="forgot-button"
                            disabled
                            title="Coming later"
                        >
                            Forgot password?
                        </button>
                    </div>

                    <input
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        value={form.password}
                        onChange={handleChange}
                    />

                    <button
                        className="primary-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Log In"}
                    </button>

                </form>

                <p className="switch-auth">
                    Don't have an account?

                    <button onClick={onSignup}>
                        Create one
                    </button>
                </p>

            </div>

        </div>
    );
}

export default Login;