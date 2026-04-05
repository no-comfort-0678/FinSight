import { useState } from "react"; // 1. Added missing import
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";


const Navbar = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();


  // Unified Handler
  const handleAuthAction = () => {
    if (user) {
      setShowConfirm(true); // Open Modal
    } else {
      navigate("/login"); // Go to Login
    }
  };


  const confirmLogout = () => {
    logout();
    setShowConfirm(false);
    navigate("/login");
  };


  return (
    <div>
      <nav>
        {/* Brand/Logo Section */}
        <div
          className="title"
          style={{ cursor: "pointer" }}
          onClick={() => navigate(user ? "/dashboard" : "/login")}
        >
          <img src="/2.png" alt="FinSight Icon" />
          <div id="text">
            <h1>FinSight</h1>
            <h2>Your Personal Expense Tracker</h2>
          </div>
        </div>


        {/* Navigation Links */}
        {user && (
          <div className="functions">
            <button onClick={() => navigate("/transactions/payments")}>
              Transactions
            </button>
            <button onClick={() => navigate("/dashboard")}>
              Dashboard
            </button>
            <button onClick={() => navigate("/split")}>
              Split Expenses
            </button>
            <button onClick={() => navigate("/notifications")}>
              Notifications & Reminders
            </button>
          </div>
        )}


        <div className="nav-right-section">
          {user && (
            <button
              className="profile-avatar-btn"
              onClick={() => navigate("/profile")}
              title="View Profile"
            >
              {user.profilePic ? (
                <img src={user.profilePic} alt="Profile" className="profile-img" />
              ) : (
                <span className="profile-fallback">
                  {user.name?.charAt(0) || "U"}
                </span>
              )}
            </button>
          )}


          {/* 2. Changed handleAuthClick to handleAuthAction */}
          <button id="cred" onClick={handleAuthAction}>
            {user ? "Logout" : "Login"}
          </button>
        </div>
      </nav>


      {/* Logout Confirmation Modal */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="fs-glass modal-content">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to sign out of FinSight?</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowConfirm(false)}>
                Stay Logged In
              </button>
              <button className="btn-danger" onClick={confirmLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default Navbar;