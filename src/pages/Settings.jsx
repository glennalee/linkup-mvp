import { useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";

export default function Settings() {
  const navigate = useNavigate();

  const handleLogout = () => {
  logout();
  navigate("/", { replace: true });
};

  return (
    <div className="page">
      <h2>Settings</h2>

      <div className="card">
        <h3>General</h3>
        <p>Basic preferences</p>
      </div>

      <button className="btn danger" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}
