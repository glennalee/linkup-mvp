import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Modal from "../components/Modal";
import { getCurrentUser } from "../utils/auth";

import { API_BASE_URL } from "../config";
const TUTORS_API_URL = `${API_BASE_URL}/tutors`;
const BOOKINGS_API_URL = `${API_BASE_URL}/bookings`;

export default function BookSlot() {
  const { id: tutorProfileId } = useParams(); // /book/:id uses TutorProfile _id
  const navigate = useNavigate();
  const currentUser = getCurrentUser(); // { _id, name, role }

  // ✅ ALL HOOKS ARE ALWAYS CALLED — no conditional hooks
  const [profile, setProfile] = useState(null);
  const [sessionDate, setSessionDate] = useState("");
  const [moduleCode, setModuleCode] = useState(""); // NEW: student chooses module for this session
  const [remarks, setRemarks] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  // modules list shown in UI (profile.moduleCodes is array)
  const moduleOptions = useMemo(() => {
    return Array.isArray(profile?.moduleCodes) ? profile.moduleCodes : [];
  }, [profile]);

  // Fetch tutor profile
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${TUTORS_API_URL}/${tutorProfileId}`);
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(data?.message || "Failed to load tutor profile");
        }

        // Deleted tutor user => populated tutor becomes null
        if (!data?.tutor?._id) {
          throw new Error("This tutor account no longer exists.");
        }

        setProfile(data);

        // default module selection
        const first = Array.isArray(data?.moduleCodes) ? data.moduleCodes[0] : "";
        setModuleCode(first || "");
      } catch (err) {
        setProfile(null);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (tutorProfileId) fetchProfile();
    else {
      setLoading(false);
      setError("Missing tutor profile id");
    }
  }, [tutorProfileId]);

  const requestBooking = async () => {
    if (!currentUser?._id) {
      alert("Please log in first.");
      return;
    }

    if (!profile?.tutor?._id) {
      alert("Tutor profile not available.");
      return;
    }

    if (!sessionDate) {
      alert("Please select a session date and time.");
      return;
    }

    if (!moduleCode) {
      alert("Please select a module for this session.");
      return;
    }

    try {
      const res = await fetch(BOOKINGS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student: currentUser._id,
          tutor: profile.tutor._id, // USER id of tutor
          sessionDate,
          moduleCode,               // ✅ store module for this booking
          remarks,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to create booking");

      setShowModal(true);
    } catch (err) {
      alert(err.message || "Failed to create booking");
    }
  };

  // ✅ Early returns AFTER hooks are declared
  if (loading) return <p className="page">Loading tutor profile...</p>;
  if (error) return <p className="page" style={{ color: "red" }}>{error}</p>;
  if (!profile) return <p className="page">Tutor profile not found.</p>;

  return (
    <div className="page">
      <h2>Book a Session with {profile?.tutor?.name || "Tutor"}</h2>

      <p>
        <strong>Modules:</strong>{" "}
        {moduleOptions.length ? moduleOptions.join(", ") : "—"}
      </p>

      <p>
        <strong>Year:</strong> Year {profile.year}
      </p>

      {profile.bio && (
        <p>
          <strong>Bio:</strong> {profile.bio}
        </p>
      )}

      {profile.availability && (
        <p>
          <strong>Availability:</strong> {profile.availability}
        </p>
      )}

      {/* NEW: pick module for the booking */}
      <div className="form-group">
        <label>Module for this session</label>
        <select value={moduleCode} onChange={(e) => setModuleCode(e.target.value)}>
          {moduleOptions.length === 0 ? (
            <option value="">No modules listed</option>
          ) : (
            moduleOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))
          )}
        </select>
      </div>

      <div className="form-group">
        <label>Session Date & Time</label>
        <input
          type="datetime-local"
          value={sessionDate}
          onChange={(e) => setSessionDate(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Remarks (optional)</label>
        <textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="What do you need help with?"
        />
      </div>

      <button className="btn" onClick={requestBooking}>
        Request Session
      </button>

      {showModal && (
        <Modal
          message="Booking request sent successfully!"
          onClose={() => {
            setShowModal(false);
            navigate("/bookings");
          }}
        />
      )}
    </div>
  );
}
