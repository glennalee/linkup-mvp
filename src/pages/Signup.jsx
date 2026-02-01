import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../config";
const USERS_API_URL = `${API_BASE_URL}/users`;


export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

const signup = async () => {
  const cleanedName = name.trim();
  const cleanedEmail = email.trim().toLowerCase();

  if (!cleanedName) {
    alert("Please enter your name.");
    return;
  }

  if (!cleanedEmail.endsWith("@tp.edu.sg")) {
    alert("Please use your Temasek Polytechnic email.");
    return;
  }

  try {
    setLoading(true);

    // Check if user already exists
    const checkRes = await fetch(`${USERS_API_URL}?email=${encodeURIComponent(cleanedEmail)}`);
    if (!checkRes.ok) throw new Error("Failed to check user");

    const existingUsers = await checkRes.json();
    if (existingUsers.length > 0) {
      alert("Account already exists. Please log in.");
      navigate("/login");
      return;
    }

    // Create new user
    const createRes = await fetch(USERS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: cleanedName,
        email: cleanedEmail,
        role: "student",
      }),
    });

    const data = await createRes.json();

    if (!createRes.ok) {
      alert(data.message || "Failed to create account");
      return;
    }

    localStorage.setItem("currentUser", JSON.stringify(data));
    navigate("/");
  } catch (error) {
    alert(error.message || "Signup failed. Please try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="center">
      <h2>Create Account</h2>

      <input
        placeholder="Full name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="TP email (e.g. john@tp.edu.sg)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button className="btn" onClick={signup} disabled={loading}>
        {loading ? "Creating account..." : "Sign Up"}
      </button>

      <p style={{ marginTop: "1rem" }}>
        Already have an account?{" "}
        <Link to="/">Log in</Link>
      </p>
    </div>
  );
}
