import { useNavigate } from "react-router-dom";
import "./notfound.css";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-page">
      <div className="notfound-card">
        <div className="notfound-code">404</div>
        <h1 className="notfound-title">Page Not Found</h1>
        <p className="notfound-sub">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>
        <button className="notfound-btn" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
        <div className="notfound-links">
          <button className="notfound-link" onClick={() => navigate("/login")}>
            Login
          </button>
          <div className="notfound-divider" />
          <button className="notfound-link" onClick={() => navigate("/")}>
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
