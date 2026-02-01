import { Link } from "react-router-dom";

export default function TutorCard({ profile }) {
  return (
    <div className="card">
      <div className="avatar" />

      <h3>{profile?.tutor?.name || "Tutor"}</h3>
      <p>Year {profile.year}</p>

      <p>
        Modules: {(profile.moduleCodes && profile.moduleCodes.length)
          ? profile.moduleCodes.join(", ")
          : "—"}
      </p>

      <Link to={`/tutors/${profile._id}`} className="btn">
        View Profile
      </Link>
    </div>
  );
}
