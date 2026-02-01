import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentUser } from "../utils/auth";
import StarRating from "../components/StarRating";
import { API_BASE_URL } from "../config";
const REVIEWS_API_URL = `${API_BASE_URL}/reviews`;
const BOOKINGS_API_URL = '${API_BASE_URL}/bookings';


export default function Reviews() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [booking, setBooking] = useState(null);
  const [existingReview, setExistingReview] = useState(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) return;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        // 1) Fetch booking
        const bookingRes = await fetch(`${BOOKINGS_API}/${bookingId}`);
        const bookingData = await bookingRes.json().catch(() => null);

        if (!bookingRes.ok) {
          throw new Error(bookingData?.message || "Failed to load booking");
        }

        // bookingData should have tutor populated
        if (bookingData.status !== "completed") {
          throw new Error("Session not completed yet");
        }

        setBooking(bookingData);

        // 2) Check if review already exists for this booking
        const reviewRes = await fetch(`${REVIEWS_API}?bookingId=${bookingId}`);
        const reviewData = await reviewRes.json().catch(() => []);

        if (reviewRes.ok && Array.isArray(reviewData) && reviewData.length > 0) {
          const r = reviewData[0];
          setExistingReview(r);
          setRating(Number(r.rating) || 5);
          setComment(r.comment || "");
        } else {
          setExistingReview(null);
          setRating(5);
          setComment("");
        }
      } catch (err) {
        setError(err.message || "Something went wrong");
        setBooking(null);
        setExistingReview(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [bookingId]);

  const submitReview = async () => {
    if (!currentUser?._id) {
      alert("Please log in first.");
      return;
    }
    if (existingReview) return;

    try {
      setSubmitting(true);

      const res = await fetch(REVIEWS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          rating,
          comment,
          studentId: currentUser._id, // ✅ important for backend security check
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to submit review");

      alert("Review submitted!");
      navigate("/bookings");
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="page">Loading...</p>;
  if (error) return <p className="page" style={{ color: "red" }}>{error}</p>;
  if (!booking) return <p className="page">Booking not found.</p>;

  return (
    <div className="page">
      <h2>Leave a Review</h2>

      <p>
        Reviewing <strong>{booking?.tutor?.name || "Tutor"}</strong>
      </p>

      {booking.moduleCode && (
        <p>
          <strong>Module:</strong> {booking.moduleCode}
        </p>
      )}

      {existingReview && (
        <p style={{ color: "#777" }}>
          You already reviewed this session. (Editing is disabled.)
        </p>
      )}

      <label>Rating</label>
      <StarRating
        value={rating}
        onChange={setRating}
        disabled={!!existingReview || submitting}
      />

      <label style={{ marginTop: "12px" }}>Comment</label>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={!!existingReview || submitting}
        placeholder="Optional feedback..."
      />

      <button
        className="btn"
        onClick={submitReview}
        disabled={!!existingReview || submitting}
        style={{ marginTop: "16px" }}
      >
        {submitting ? "Submitting..." : existingReview ? "Reviewed" : "Submit Review"}
      </button>
    </div>
  );
}
