import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "4rem" }}>
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>

      <Link to="/" style={{ color: "#0d6efd" }}>
        Go back to Home
      </Link>
    </div>
  );
};

export default NotFound;
