import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import "./app.css";
import Login from "./components/Login";
import Signup from "./components/Signup";
import NotFound from "./components/NotFound";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import Transaction from "./components/Transaction";
import Split from "./components/Split";
import Notifs from "./components/Notifs";
import Profile from "./components/profile";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const isSignupPath = location.pathname === "/signup";
  let navBtnText;

  if (user) {
    navBtnText = "Logout";
  } else {
    navBtnText = isSignupPath ? "Go to Login" : "Go to Sign Up";
  }

  const handleAuthClick = () => {
    if (user) {
      handleLogout();
    } else {
      if (isSignupPath) {
        navigate("/login");
      } else {
        navigate("/signup");
      }
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <>
      <img src="/bgimg.png" alt="bg-img" id="bg-img" />
      <nav>
        <div
          className="title"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/home")}
        >
          <img src="/2.png" alt="FinSight Icon" />
          <div id="text">
            <h1>FinSight</h1>
            <h2>Your Personal Expense Tracker</h2>
          </div>
        </div>
        <div className="functions">
          <button
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/home")}
          >
            Home
          </button>
          <div className="dropdown">
            <button className="dropdown-trigger">Transactions</button>
            <div className="dropdown-content">
              <div onClick={() => navigate("/transactions/entry")}>
                Manual Entry
              </div>
              <div onClick={() => navigate("/transactions/payments")}>
                Make Payment
              </div>
            </div>
          </div>
          <button
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>
          <button
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/split")}
          >
            Split Expenses
          </button>
          <button
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/notifications")}
          >
            Notifications & Reminders
          </button>
          <button
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/profile")}
          >
            profile
          </button>
        </div>
        <button id="cred" onClick={handleAuthClick}>
          {navBtnText}
        </button>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/home"
          element={user ? <Home user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/transactions/entry"
          element={
            user ? <Transaction user={user} page="entry" /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/transactions/payments"
          element={
            user ? <Transaction user={user} page="payments" /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/split"
          element={user ? <Split user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/notifications"
          element={user ? <Notifs user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={user ? <Profile user={user} /> : <Navigate to="/profile" />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;