import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../utils/auth";

const TUTORS_API_URL = "http://localhost:5050/tutors";

export default function RegisterTutor() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser(); // { _id, name, email, role }

  const [year, setYear] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [selectedModules, setSelectedModules] = useState([]); // ✅ multi
  const [bio, setBio] = useState("");
  const [availability, setAvailability] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const moduleOptions = ["MBAP", "MLDP", "CYFUN", "FWEB", "DVOPS", "APSEC"];

  const cgpaValue = parseFloat(cgpa);
  const isEligible = !isNaN(cgpaValue) && cgpaValue >= 2.5;

  const toggleModule = (code) => {
    setSelectedModules((prev) =>
      prev.includes(code) ? prev.filter((m) => m !== code) : [...prev, code]
    );
  };

  const submitApplication = async () => {
    setError("");

    if (!year) {
      setError("Please select your year of study.");
      return;
    }

    if (selectedModules.length === 0) {
      setError("Please select at least one module.");
      return;
    }

    if (isNaN(cgpaValue) || cgpaValue < 0 || cgpaValue > 4) {
      setError("cGPA must be between 0.0 and 4.0.");
      return;
    }

    if (cgpaValue < 2.5) {
      setError("Minimum cGPA of 2.5 is required to apply.");
      return;
    }

    if (!bio.trim()) {
      setError("Please write a short bio.");
      return;
    }

    if (!availability.trim()) {
      setError("Please provide your availability (e.g. Weekdays after 7pm).");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(TUTORS_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutor: currentUser._id,
          year: Number(year),
          cgpa: cgpaValue,
          moduleCodes: selectedModules, // ✅ array
          bio: bio.trim(),
          availability: availability.trim(),
          status: "pending",
        }),
      });

const data = await res.json();

if (!res.ok) {
  throw new Error(data.message || "Failed to submit tutor application");
}

// ✅ update localStorage user immediately so navbar hides "Be a Tutor!"
if (data.user) {
  localStorage.setItem("currentUser", JSON.stringify(data.user));
}

alert("You are now an approved tutor!");
navigate("/home");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (currentUser.role === "tutor") {
    return (
      <div className="page">
        <p>You are already an approved tutor.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h2>Apply to Become a Tutor</h2>

      <div className="profile-card">
        <div className="form-group">
          <label>Name</label>
          <input value={currentUser.name} disabled />
        </div>

        <div className="form-group">
          <label>Year of Study</label>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="">Select year</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
          </select>
        </div>

        <div className="form-group">
          <label>cGPA (0.0 – 4.0)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="4"
            value={cgpa}
            onChange={(e) => setCgpa(e.target.value)}
          />
        </div>

        {cgpa && !isEligible && (
          <p style={{ color: "red" }}>Minimum cGPA of 2.5 required.</p>
        )}

        <div className="form-group">
          <label>Modules You Wish to Tutor (select one or more)</label>
          <div style={{ display: "grid", gap: "8px", marginTop: "8px" }}>
            {moduleOptions.map((m) => (
              <label key={m} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  checked={selectedModules.includes(m)}
                  onChange={() => toggleModule(m)}
                />
                {m}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell students what you can help with and your teaching style."
            rows={4}
          />
        </div>

        <div className="form-group">
          <label>Availability</label>
          <input
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            placeholder="e.g. Weekdays after 7pm, Sat 2–5pm"
          />
        </div>

        {error && <p style={{ color: "red", marginBottom: "12px" }}>{error}</p>}

        <button className="btn" onClick={submitApplication} disabled={!isEligible || loading}>
          {loading ? "Submitting..." : "Submit Application"}
        </button>
      </div>
    </div>
  );
}
