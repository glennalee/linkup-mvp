import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../utils/auth";

const BOOKINGS_API_URL = "http://localhost:5050/bookings";
const REVIEWS_API_URL = "http://localhost:5050/reviews";

export default function MyBookings() {
  const user = getCurrentUser();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("student");
  const [error, setError] = useState("");

  const [myReviews, setMyReviews] = useState([]);

  useEffect(() => {
    if (!user?._id) return;

    fetchBookings();

    if (activeTab === "student") {
      fetchMyReviews();
    } else {
      setMyReviews([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user?._id]);

  const fetchBookings = async () => {
    try {
      setError("");

      const query =
        activeTab === "student"
          ? `?studentId=${user._id}`
          : `?tutorId=${user._id}`;

      const res = await fetch(`${BOOKINGS_API_URL}${query}`);
      const data = await res.json().catch(() => []);

      if (!res.ok) throw new Error(data?.message || "Failed to fetch bookings");

      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to fetch bookings");
      setBookings([]);
    }
  };

  const fetchMyReviews = async () => {
    try {
      const res = await fetch(`${REVIEWS_API_URL}?studentId=${user._id}`);
      const data = await res.json().catch(() => []);

      if (!res.ok) {
        setMyReviews([]);
        return;
      }

      setMyReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch my reviews:", err);
      setMyReviews([]);
    }
  };

  const safeBookings = useMemo(() => {
    return (bookings || []).filter((b) => b?.student?._id && b?.tutor?._id);
  }, [bookings]);

  const reviewedBookingIds = useMemo(() => {
    return new Set((myReviews || []).map((r) => String(r.booking)));
  }, [myReviews]);

  const isReviewed = (bookingId) => reviewedBookingIds.has(String(bookingId));

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${BOOKINGS_API_URL}/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to update booking");

      await fetchBookings();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const markCompleted = async (id) => {
    try {
      const res = await fetch(`${BOOKINGS_API_URL}/${id}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: activeTab }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to mark as completed");

      await fetchBookings();

      if (activeTab === "student") {
        await fetchMyReviews();
      }

      alert(
        data.status === "completed"
          ? "Booking marked completed by both parties!"
          : "Marked completed. Waiting for the other party."
      );
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const cancelBooking = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;

    try {
      const res = await fetch(`${BOOKINGS_API_URL}/${id}`, { method: "DELETE" });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to cancel booking");

      setBookings((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (!user?._id) {
    return <p className="page">Please log in to view bookings.</p>;
  }

  // =========================
  // UI helpers (inline styles)
  // =========================
  const styles = {
    tabWrap: {
      display: "flex",
      gap: "10px",
      margin: "14px 0 18px",
      flexWrap: "wrap",
    },
    tabBtn: (active) => ({
      padding: "10px 14px",
      borderRadius: "999px",
      border: active ? "1px solid #1e5eff" : "1px solid #b7ccff",
      background: active ? "#1e5eff" : "#ffffff",
      color: active ? "#ffffff" : "#1e5eff",
      fontWeight: 700,
      cursor: "pointer",
      transition: "0.15s ease",
    }),
    list: {
      display: "flex",
      flexDirection: "column",
      gap: "14px", // ✅ spacing between bookings
      marginTop: "10px",
    },
    card: {
      background: "#fff",
      border: "1px solid #e6ecff",
      borderRadius: "14px",
      padding: "14px 16px",
      boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
    },
    headerRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "12px",
      marginBottom: "10px",
      flexWrap: "wrap",
    },
    statusPill: (status) => {
      const base = {
        padding: "6px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.4px",
      };

      if (status === "completed") return { ...base, background: "#e7f7ee", color: "#1b7a43" };
      if (status === "accepted") return { ...base, background: "#eaf2ff", color: "#1e5eff" };
      if (status === "rejected") return { ...base, background: "#ffecec", color: "#b42318" };
      return { ...base, background: "#fff6e5", color: "#9a6b00" }; // pending
    },
    row: { margin: "6px 0" },
    actions: { display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "12px" },
    btn: {
      padding: "10px 12px",
      borderRadius: "10px",
      border: "1px solid #1e5eff",
      background: "#1e5eff",
      color: "#fff",
      fontWeight: 700,
      cursor: "pointer",
    },
    btnOutline: {
      padding: "10px 12px",
      borderRadius: "10px",
      border: "1px solid #1e5eff",
      background: "#ffffff",
      color: "#1e5eff",
      fontWeight: 700,
      cursor: "pointer",
    },
    btnDanger: {
      padding: "10px 12px",
      borderRadius: "10px",
      border: "1px solid #d92d20",
      background: "#d92d20",
      color: "#fff",
      fontWeight: 700,
      cursor: "pointer",
    },
    btnDisabled: {
      opacity: 0.6,
      cursor: "not-allowed",
    },
    subtle: { color: "#667085" },
  };

  return (
    <div className="page">
      <h2>My Bookings</h2>

      {/* ✅ nicer blue tabs */}
      <div style={styles.tabWrap}>
        <button
          style={styles.tabBtn(activeTab === "student")}
          onClick={() => setActiveTab("student")}
          type="button"
        >
          As Student
        </button>

        <button
          style={styles.tabBtn(activeTab === "tutor")}
          onClick={() => setActiveTab("tutor")}
          type="button"
        >
          As Tutor
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {safeBookings.length === 0 ? (
        <p style={styles.subtle}>No bookings yet.</p>
      ) : (
        <div style={styles.list}>
          {safeBookings.map((b) => {
            const reviewed = activeTab === "student" ? isReviewed(b._id) : false;

            const alreadyConfirmed =
              activeTab === "student" ? b.completedByStudent : b.completedByTutor;

            const otherPartyName =
              activeTab === "student" ? b.tutor?.name : b.student?.name;

            return (
              <div style={styles.card} key={b._id}>
                {/* ✅ header row: name + status */}
                <div style={styles.headerRow}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "16px" }}>
                      {activeTab === "student" ? "Tutor" : "Student"}:{" "}
                      {otherPartyName || "—"}
                    </div>
                    <div style={{ marginTop: "4px", ...styles.subtle }}>
                      {new Date(b.sessionDate).toLocaleString()}
                    </div>
                  </div>

                  <div style={styles.statusPill(b.status)}>{b.status}</div>
                </div>

                {/* ✅ details */}
                <div style={styles.row}>
                  <strong>Module:</strong> {b.moduleCode || "—"}
                </div>

                {b.remarks && (
                  <div style={styles.row}>
                    <strong>Remarks:</strong> {b.remarks}
                  </div>
                )}

                {/* ✅ actions */}
                <div style={styles.actions}>
                  {/* Tutor actions */}
                  {activeTab === "tutor" && b.status === "pending" && (
                    <>
                      <button
                        style={styles.btn}
                        onClick={() => updateStatus(b._id, "accepted")}
                        type="button"
                      >
                        Accept
                      </button>

                      <button
                        style={styles.btnDanger}
                        onClick={() => updateStatus(b._id, "rejected")}
                        type="button"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {/* Mark completed */}
                  {(b.status === "accepted" || b.status === "completed") && (
                    <button
                      style={{
                        ...styles.btnOutline,
                        ...(alreadyConfirmed ? styles.btnDisabled : {}),
                      }}
                      onClick={() => markCompleted(b._id)}
                      disabled={alreadyConfirmed}
                      type="button"
                    >
                      {alreadyConfirmed ? "Completed (You)" : "Mark as Completed"}
                    </button>
                  )}

                  {/* Student review */}
                  {activeTab === "student" && b.status === "completed" && (
                    reviewed ? (
                      <button style={{ ...styles.btnOutline, ...styles.btnDisabled }} disabled type="button">
                        Reviewed
                      </button>
                    ) : (
                      <button
                        style={styles.btn}
                        onClick={() => navigate(`/reviews/${b._id}`)}
                        type="button"
                      >
                        Write Review
                      </button>
                    )
                  )}

                  {/* Student cancel */}
                  {activeTab === "student" && b.status === "pending" && (
                    <button
                      style={styles.btnDanger}
                      onClick={() => cancelBooking(b._id)}
                      type="button"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
