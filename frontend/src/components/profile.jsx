import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./profile.css";

function Profile({user}) {
  const navigate = useNavigate();

  const [userState, setUser] = useState({
    name: user?.name,
    email: user?.email,
    joined: "January 2025",
    lastLogin: "2 hours ago",
    notifications: true
  });

  const [popup, setPopup] = useState(null);
  const [feedback, setFeedback] = useState({
    type: "Help",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handlePassword = () => {
    alert("Password changed successfully (mock)");
    setPopup(null);
  };

  return (
    <div className="profile-page">
      <div className="profile-left">
        <div className="profile-placeholder">👤</div>
        <h2>{userState.name}</h2>
        <p className="profile-email">{userState.email}</p>
        <button
          className="edit-profile-btn"
          onClick={() => setPopup("edit")}
        >
          Edit Profile
        </button>
      </div>
      <div className="profile-right">

        <div className="profile-section">
          <h3>Account Information</h3>
          <p>Email: {userState.email}</p>
          <p>Joined: {userState.joined}</p>
          <p>Last Login: {userState.lastLogin}</p>
        </div>

        <div className="profile-section clickable" onClick={() => setPopup("manage")}>
          Manage Account
        </div>

        <div className="profile-section clickable" onClick={() => setPopup("password")}>
          Change Password
        </div>

        <div className="profile-section">
          <h3>Preferences</h3>
          <div className="row">
            <span>Currency</span>
            <span>INR</span>
          </div>
          <div className="row">
            <span>Notifications</span>
            <input
              type="checkbox"
              checked={userState.notifications}
              onChange={() =>
                setUser({ ...userState, notifications: !userState.notifications })
              }
            />
          </div>
        </div>

        <div className="profile-section clickable" onClick={() => navigate("/login")}>
          Switch Account
        </div>

        <div className="profile-section clickable" onClick={() => setPopup("about")}>
          About FinSight
        </div>

        <div className="profile-section clickable" onClick={() => setPopup("feedback")}>
          Get Help & Feedback
        </div>

        <div
          className="profile-section logout clickable"
          onClick={() => navigate("/signup")}
        >
          Logout
        </div>
      </div>
      {popup && (
        <div className="modal-overlay" onClick={() => setPopup(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            {popup === "edit" && (
              <>
                <h3>Edit Profile</h3>
                <input
                  className="input"
                  value={userState.name}
                  onChange={e => setUser({ ...userState, name: e.target.value })}
                />
                <input
                  className="input"
                  value={userState.email}
                  onChange={e => setUser({ ...userState, email: e.target.value })}
                />
                {/* <button className="save-btn" onClick={() => setPopup(null)}>
                  Save
                </button> */}
              </>
            )}
            {popup === "manage" && (
              <>
                <h3>Manage Account</h3>
                <p>Account Type: Standard</p>
                <p>Status: Active</p>
                <p>Active Sessions: 1</p>
              </>
            )}
            {popup === "password" && (
              <>
                <h3>Change Password</h3>
                <input className="input" placeholder="Old Password" />
                <input className="input" placeholder="New Password" />
                <input className="input" placeholder="Confirm Password" />
                <button className="save-btn" onClick={handlePassword}>
                  Save Password
                </button>
              </>
            )}
            {popup === "about" && (
              <>
                <h3>About FinSight</h3>
                <p>
                  <strong>FinSight</strong> is a personal finance management
                  application designed to help users track expenses, manage
                  shared spending, and gain meaningful financial insights.
                </p>
                <ul className="about-list">
                  <li>Expense Tracking</li>
                  <li>Split Expenses</li>
                  <li>Smart Notifications & Reminders</li>
                  <li>Financial Insights Dashboard</li>
                </ul>
                <p>Version: <strong>1.0.0</strong></p>
              </>
            )}

            {popup === "feedback" && (
              <>
                <h3>Get Help & Feedback</h3>

                {submitted ? (
                  <p>Your message has been submitted successfully.</p>
                ) : (
                  <>
                    <select
                      value={feedback.type}
                      onChange={(e) =>
                        setFeedback({ ...feedback, type: e.target.value })
                      }
                    >
                      <option>Help</option>
                      <option>Feedback</option>
                    </select>

                    <textarea
                      className="input textarea"
                      placeholder="Describe your issue or feedback..."
                      value={feedback.message}
                      onChange={(e) =>
                        setFeedback({ ...feedback, message: e.target.value })
                      }
                    />

                    <button
                      className="save-btn"
                      onClick={() => setSubmitted(true)}
                    >
                      Submit
                    </button>
                  </>
                )}
              </>
            )}

            <button className="close-btn" onClick={() => setPopup(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
