import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../utils/auth";

const TUTORS_API_URL = "http://localhost:5050/tutors";

export default function Home() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser(); // { _id, name, role } or null

  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchName, setSearchName] = useState("");
  const [selectedModule, setSelectedModule] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  

  // NEW: rating filter (minimum rating)
  const [minRating, setMinRating] = useState("all");

  // =========================
  // Fetch tutor profiles
  // =========================
  useEffect(() => {
    const fetchTutors = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(TUTORS_API_URL);
        const data = await res.json().catch(() => []);

        if (!res.ok) throw new Error(data?.message || "Failed to fetch tutors");

        setTutors(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err?.message || "Failed to fetch tutors");
        setTutors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, []);

  // =========================
  // Derived data
  // =========================

  // Remove orphaned tutor profiles (deleted users => populated tutor becomes null)
  const cleanTutors = useMemo(() => {
    return (tutors || []).filter((p) => p?.tutor?._id);
  }, [tutors]);

  // Build module dropdown from moduleCodes array
  const allModules = useMemo(() => {
    const modules = cleanTutors
      .flatMap((p) => p?.moduleCodes || [])
      .filter(Boolean);

    return [...new Set(modules)].sort();
  }, [cleanTutors]);

  // Apply filters (including rating)
  const filteredTutors = useMemo(() => {
    const query = searchName.trim().toLowerCase();
    const min = minRating === "all" ? null : Number(minRating);

    return cleanTutors
      // hide current user's own tutor profile
      .filter((p) => {
        if (!currentUser?._id) return true;
        return p.tutor._id !== currentUser._id;
      })
      // search by tutor name
      .filter((p) => {
        if (!query) return true;
        const name = (p?.tutor?.name || "").toLowerCase();
        return name.includes(query);
      })
      // module filter
      .filter((p) => {
        if (selectedModule === "all") return true;
        return (p?.moduleCodes || []).includes(selectedModule);
      })
      // year filter
      .filter((p) => {
        if (selectedYear === "all") return true;
        return p?.year === Number(selectedYear);
      })
      // rating filter (min rating)
      .filter((p) => {
        if (min === null) return true;
        const rating = Number(p?.avgRating || 0);
        return rating >= min;
      });
  }, [cleanTutors, currentUser?._id, searchName, selectedModule, selectedYear, minRating]);

  // =========================
  // Helpers
  // =========================
  const renderStars = (rating = 0) => {
    const rounded = Math.round(Number(rating) || 0);
    return [1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        style={{
          fontSize: "16px",
          color: star <= rounded ? "#f5c518" : "#ccc",
          marginRight: "2px",
        }}
      >
        ★
      </span>
    ));
  };

  // =========================
  // UI states
  // =========================
  if (loading) return <p>Loading tutors...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  // =========================
  // UI
  // =========================
  return (
    <div className="page">
      <h2>Available Tutors</h2>

      {/* Search */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search tutor by name..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
      </div>

      {/* Filters */}
      <div className="filters">
        <select value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)}>
          <option value="all">All Modules</option>
          {allModules.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
          <option value="all">All Years</option>
          <option value="1">Year 1</option>
          <option value="2">Year 2</option>
          <option value="3">Year 3</option>
        </select>

        {/* NEW: rating filter */}
        <select value={minRating} onChange={(e) => setMinRating(e.target.value)}>
          <option value="all">All Ratings</option>
          <option value="4.5">4.5★ & up</option>
          <option value="4">4★ & up</option>
          <option value="3">3★ & up</option>
          <option value="2">2★ & up</option>
          <option value="1">1★ & up</option>
        </select>
      </div>

      {/* Tutor cards */}
      <div className="grid">
        {filteredTutors.length === 0 && <p>No tutors match your criteria.</p>}

        {filteredTutors.map((profile) => {
          const avgRating = Number(profile?.avgRating || 0);
          const reviewCount = Number(profile?.reviewCount || 0);

          return (
            <div className="card" key={profile._id}>
              <h3>{profile?.tutor?.name || "Tutor"}</h3>

              <p>Year {profile.year}</p>

              <p>
                Modules:{" "}
                {profile?.moduleCodes?.length ? profile.moduleCodes.join(", ") : "—"}
              </p>

              {/* NEW: rating display */}
              <p style={{ marginTop: "8px" }}>
                <strong>Rating:</strong>{" "}
                {reviewCount > 0 ? (
                  <>
                    {avgRating.toFixed(1)} / 5{" "}
                    <span style={{ marginLeft: "6px" }}>{renderStars(avgRating)}</span>
                    <span style={{ color: "#777", marginLeft: "6px" }}>
                      ({reviewCount})
                    </span>
                  </>
                ) : (
                  <span style={{ color: "#777" }}>No reviews yet</span>
                )}
              </p>

              <button className="btn" onClick={() => navigate(`/tutors/${profile._id}`)}>
                View Tutor
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
