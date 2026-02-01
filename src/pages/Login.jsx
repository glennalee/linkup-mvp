import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { getCurrentUser } from "../utils/auth";
import { API_BASE_URL } from "../config";
const USERS_API_URL = `${API_BASE_URL}/users`;


export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // =========================
  // Auto-redirect if logged in
  // =========================
  const existingUser = getCurrentUser();
  if (existingUser) {
    return <Navigate to="/home" replace />;
  }

  // =========================
  // Login handler
  // =========================
  const handleLogin = async () => {
    if (!email.endsWith("@tp.edu.sg")) {
      alert("Please use your TP school email.");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Try to find user
      const res = await fetch(`${USERS_API_URL}?email=${email}`);
      if (!res.ok) throw new Error("Failed to fetch user");

      const users = await res.json();
      let user = users[0];

      // 2️⃣ Auto-create if not found
      if (!user) {
        const createRes = await fetch(USERS_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            role: "student"
          })
        });

        if (!createRes.ok) {
          throw new Error("Failed to create user");
        }

        user = await createRes.json();
      }

      // 3️⃣ Save user + redirect
      localStorage.setItem("currentUser", JSON.stringify(user));
      navigate("/home", { replace: true });

    } catch (err) {
      console.error("Login failed:", err);
      alert("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="center">
      <h2>LinkUp Login</h2>

      <input
        type="email"
        placeholder="TP school email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button
        className="btn"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <p style={{ marginTop: "12px" }}>
        New here?{" "}
        <Link to="/signup">
          Sign up
        </Link>
      </p>
    </div>
  );
}
