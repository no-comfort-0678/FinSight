import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; 
const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); 
  const navBtnText = user ? "Logout" : "Login";
  const handleAuthClick = () => {
    if (user) {
      logout();
      navigate("/login");
    } else {
      navigate("/login");
    }
  };
  return (
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

      {/* Navigation Links - Only visible if logged in */}
      {user && (
        <div className="functions">

          {/* <div className="dropdown">
            <button className="dropdown-trigger">Transactions</button>
            <div className="dropdown-content">
              <div 
                onClick={() => navigate("/transactions/entry")} 
                style={{ cursor: "pointer" }}
              >
                Manual Entry
              </div>
              <div 
                onClick={() => navigate("/transactions/payments")} 
                style={{ cursor: "pointer" }}
              >
                Make Payment
              </div>
            </div>
          </div> */}
          <button onClick={() => navigate("/transactions/payments")} style={{ cursor: "pointer" }}>
            Transactions
          </button>

          <button onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
            Dashboard
          </button>

          <button onClick={() => navigate("/split")} style={{ cursor: "pointer" }}>
            Split Expenses
          </button>

          <button onClick={() => navigate("/notifications")} style={{ cursor: "pointer" }}>
            Notifications & Reminders
          </button>
          <button onClick={() => navigate("/profile")} style={{ cursor: "pointer" }}>
           Profile
          </button>
        </div>
      )}

      {/* Auth Button */}
      <button id="cred" onClick={handleAuthClick} style={{ cursor: "pointer" }}>
        {navBtnText}
      </button>
    </nav>
  );
};

export default Navbar;