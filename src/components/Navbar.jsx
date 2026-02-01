import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentUser } from "../utils/auth";

const USERS_API_URL = "http://localhost:5050/users";

export default function Navbar() {
  const [user, setUser] = useState(getCurrentUser());
  const isTutor = user?.role === "tutor";

  // ✅ refresh user from DB (so role changes are reflected)
  useEffect(() => {
    const refreshUser = async () => {
      const local = getCurrentUser();
      if (!local?._id) return;

      try {
        const res = await fetch(`${USERS_API_URL}/${local._id}`);
        if (!res.ok) return;

        const freshUser = await res.json();
        localStorage.setItem("currentUser", JSON.stringify(freshUser));
        setUser(freshUser);
      } catch (e) {
        // ignore refresh errors
      }
    };

    refreshUser();
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-left">
        <h1 className="logo">LinkUp</h1>
      </div>

      <div className="nav-right">
        {/* ✅ hide when already tutor */}
        {user && !isTutor && (
          <Link to="/register-tutor" className="be-tutor">
            Be a Tutor!
          </Link>
        )}

        <Link to="/home" title="Home" className="icon">
          <i className="bi bi-house"></i>
        </Link>

        <Link to="/bookings" title="My Bookings" className="icon">
          <i className="bi bi-calendar-event"></i>
        </Link>

        <Link to="/profile" title="Profile" className="icon">
          <i className="bi bi-person-circle"></i>
        </Link>

        <Link to="/settings" title="Settings" className="icon">
          <i className="bi bi-gear"></i>
        </Link>
      </div>
    </nav>
  );
}
