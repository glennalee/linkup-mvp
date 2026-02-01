import { useEffect, useState } from "react";
import { getCurrentUser } from "../utils/auth";

const REVIEWS_API_URL = "http://localhost:5050/reviews";

export default function Profile() {
  const user = getCurrentUser(); // { _id, name, email, role }

  const [ratingStats, setRatingStats] = useState({
    avgRating: 0,
    reviewCount: 0,
  });

  useEffect(() => {
    const fetchTutorStats = async () => {
      try {
        if (!user?._id || user.role !== "tutor") return;

        const res = await fetch(`${REVIEWS_API_URL}/stats?tutorId=${user._id}`);
        const data = await res.json().catch(() => ({
          avgRating: 0,
          reviewCount: 0,
        }));

        if (!res.ok) return;

        setRatingStats({
          avgRating: data.avgRating ?? 0,
          reviewCount: data.reviewCount ?? 0,
        });
      } catch (e) {
        // optional UI, ignore errors silently
      }
    };

    fetchTutorStats();
  }, [user?._id, user?.role]);

  if (!user) {
    return <p className="page">Not logged in.</p>;
  }

  return (
    <div className="page">
      <h2>My Profile</h2>

      <div className="profile-card">
        <div className="form-group">
          <label>Name</label>
          <input value={user.name} disabled />
        </div>

        <div className="form-group">
          <label>School Email</label>
          <input value={user.email} disabled />
        </div>

        <div className="form-group">
          <label>Account Type</label>
          <input
            value={user.role === "tutor" ? "Tutor & Student" : "Student"}
            disabled
          />
        </div>

        {/* ✅ Tutor Rating block */}
        {user.role === "tutor" && (
          <div className="profile-card" style={{ marginTop: 16 }}>
            <h3 style={{ marginBottom: 8 }}>Tutor Rating</h3>

            <p style={{ fontSize: 18, fontWeight: 800 }}>
              ⭐{" "}
              {ratingStats.avgRating > 0
                ? ratingStats.avgRating.toFixed(2)
                : "No ratings yet"}
              <span style={{ marginLeft: 8, color: "#667085", fontWeight: 600 }}>
                ({ratingStats.reviewCount} reviews)
              </span>
            </p>
          </div>
        )}

        {user.role === "student" && (
          <p style={{ marginTop: "1rem", color: "#555" }}>
            You may apply to become a tutor from the Tutor Application page.
          </p>
        )}
      </div>
    </div>
  );
}
