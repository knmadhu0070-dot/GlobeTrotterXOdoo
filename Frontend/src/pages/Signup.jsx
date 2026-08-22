import { useState } from "react";
import { signup } from "../services/auth";

function Signup({ onLogin, onSuccess }) {

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
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
            const data = await signup(form);

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

                <h1>Create your account</h1>

                <p className="auth-subtitle">
                    Start planning journeys you'll remember.
                </p>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <label>Full name</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Enter your name"
                        value={form.name}
                        onChange={handleChange}
                    />

                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="Minimum 8 characters"
                        value={form.password}
                        onChange={handleChange}
                    />

                    <label>Confirm password</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Enter password again"
                        value={form.confirmPassword}
                        onChange={handleChange}
                    />

                    <button
                        className="primary-button"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Creating account..." : "Create Account"}
                    </button>

                </form>

                <p className="switch-auth">
                    Already have an account?

                    <button onClick={onLogin}>
                        Log in
                    </button>
                </p>

            </div>

        </div>
    );
}

export default Signup;