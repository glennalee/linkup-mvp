import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const TUTORS_API_URL = "http://localhost:5050/tutors";
const REVIEWS_API_URL = "http://localhost:5050/reviews";

export default function TutorProfile() {
  const { id: tutorProfileId } = useParams(); // THIS IS TutorProfile._id
  const navigate = useNavigate();

  const [tutorProfile, setTutorProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTutorAndReviews = async () => {
      setLoading(true);
      setError("");

      try {
        // 1) Fetch tutor profile by PROFILE id
        const tutorRes = await fetch(`${TUTORS_API_URL}/${tutorProfileId}`);
        if (!tutorRes.ok) throw new Error("Tutor profile not found");

        const profile = await tutorRes.json();
        setTutorProfile(profile);

        // 2) Fetch reviews by tutorId = USER id
        const tutorUserId = profile?.tutor?._id || profile?.tutor;
        const reviewsRes = await fetch(`${REVIEWS_API_URL}?tutorId=${tutorUserId}`);

        if (reviewsRes.ok) {
          const data = await reviewsRes.json();
          setReviews(Array.isArray(data) ? data : []);
        } else {
          setReviews([]);
        }
      } catch (err) {
        setError(err.message || "Something went wrong");
        setTutorProfile(null);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    if (tutorProfileId) fetchTutorAndReviews();
  }, [tutorProfileId]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return Number((sum / reviews.length).toFixed(1));
  }, [reviews]);

  const renderStars = (rating = 0) =>
    [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        style={{
          fontSize: "20px",
          color: star <= rating ? "#f5c518" : "#ccc",
          marginRight: "4px",
        }}
      >
        ★
      </span>
    ));

  if (loading) return <p className="page">Loading tutor profile...</p>;
  if (error) return <p className="page">{error}</p>;
  if (!tutorProfile) return <p className="page">Tutor profile not found.</p>;

  const tutorUserId = tutorProfile?.tutor?._id || tutorProfile?.tutor;

  return (
    <div className="page">
      <h2>{tutorProfile?.tutor?.name || "Tutor"}</h2>

      <p><strong>Year:</strong> {tutorProfile.year}</p>
      <p><strong>Modules:</strong> {tutorProfile.moduleCodes.join(", ")}</p>
      <p><strong>Bio:</strong> {tutorProfile.bio || "No bio provided."}</p>
      <p><strong>Availability:</strong> {tutorProfile.availability || "Not stated."}</p>

      <p>
        <strong>Rating:</strong>{" "}
        {reviews.length ? (
          <>
            {averageRating} / 5 ({reviews.length} review{reviews.length > 1 ? "s" : ""})
            <span style={{ marginLeft: "10px" }}>
              {renderStars(Math.round(averageRating))}
            </span>
          </>
        ) : (
          "No ratings yet"
        )}
      </p>

      <button className="btn" onClick={() => navigate(`/book/${tutorProfileId}`)}>
        Request Slot
      </button>

      <hr style={{ margin: "24px 0" }} />

      <h3>Reviews</h3>

      {reviews.length === 0 && <p>No reviews yet.</p>}

      {reviews.map((review, idx) => (
        <div key={idx} style={{ padding: "12px 0", borderBottom: "1px solid #eee" }}>
          <div>{renderStars(Number(review.rating) || 0)}</div>
          {review.comment && <p>“{review.comment}”</p>}
        </div>
      ))}
    </div>
  );
}
