import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./profile.css";

function Profile() {
  const navigate = useNavigate();
  const [fetchError, setFetchError] = useState("");
  const storedUser = localStorage.getItem("user");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const userId = parsedUser?.id;

  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState(null);

  const [userState, setUserState] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    upiId: "",
    isVerified: false,
    joined: "",
  });

  const [editFields, setEditFields] = useState({ username: "", name: "" });
  const [profileError, setProfileError] = useState("");
  const [profileUpdated, setProfileUpdated] = useState(false);

  const [passwordData, setPasswordData] = useState({ old: "", new: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [feedback, setFeedback] = useState({ type: "Help", message: "" });
  const [submitted, setSubmitted] = useState(false);

useEffect(() => {
  if (!parsedUser || !userId) {
    navigate("/login");
    return;
  }

  fetch(`http://localhost:5000/api/profile?userId=${userId}`)
    .then(res => {
      if (!res.ok) throw new Error("Server error");
      return res.json();
    })
    .then(data => {
      setUserState({
        name: data.name ?? "",
        username: data.username ?? "",
        email: data.email ?? "—",
        phone: data.phone ?? "—",
        upiId: data.upiId ?? "—",
        isVerified: data.isVerified ?? false,
        joined: data.createdAt ? new Date(data.createdAt).toDateString() : "—",
      });
    })
    .catch(err => {
      console.error("Profile fetch error:", err);
      setFetchError("Could not load profile. Please try again.");
    })
    .finally(() => setLoading(false));
}, [userId]);

  const handleSaveProfile = async () => {
    setProfileError("");
    if (!editFields.username.trim()) {
      setProfileError("Username cannot be empty");
      return;
    }

    const res = await fetch("http://localhost:5000/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        username: editFields.username,
        name: editFields.name,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setProfileError(data.message || "Update failed");
      return;
    }

    setUserState(prev => ({
      ...prev,
      username: editFields.username,
      name: editFields.name || prev.name,
    }));

    const stored = JSON.parse(localStorage.getItem("user"));
    localStorage.setItem("user", JSON.stringify({ ...stored, username: editFields.username }));

    setProfileUpdated(true);
    setTimeout(() => {
      setProfileUpdated(false);
      setPopup(null);
    }, 1500);
  };

  const handlePasswordChange = async () => {
    setPasswordError("");

    if (!passwordData.old || !passwordData.new || !passwordData.confirm) {
      setPasswordError("All fields are required");
      return;
    }

    const hasLetter = /[a-zA-Z]/.test(passwordData.new);
    const hasNumber = /\d/.test(passwordData.new);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(passwordData.new);

    if (!hasLetter || !hasNumber || !hasSpecial) {
      setPasswordError("Password must contain a letter, a number, and a special character");
      return;
    }

    if (passwordData.new !== passwordData.confirm) {
      setPasswordError("Passwords do not match");
      return;
    }

    const res = await fetch("http://localhost:5000/api/profile/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        oldPassword: passwordData.old,
        newPassword: passwordData.new,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setPasswordError(data.message || "Failed to update password");
      return;
    }

    setPasswordSuccess(true);
    setTimeout(() => {
      setPasswordSuccess(false);
      setPasswordData({ old: "", new: "", confirm: "" });
      setPopup(null);
    }, 1500);
  };

  const handleFeedbackSubmit = () => {
    if (!feedback.message.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFeedback({ type: "Help", message: "" });
      setPopup(null);
    }, 1200);
  };

if (loading) {
  return (
    <div className="profile-overlay">
      <div className="profile-popup" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "white", fontSize: "1rem" }}>Loading profile…</p>
      </div>
    </div>
  );
}

if (fetchError) {
  return (
    <div className="profile-overlay" onClick={() => navigate(-1)}>
      <div className="profile-popup" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
        <p style={{ color: "#ff4d4d", fontSize: "1rem" }}>{fetchError}</p>
        <button className="edit-profile-btn" onClick={() => window.location.reload()}>Retry</button>
      </div>
    </div>
  );
}

  return (
    <>
      <div
        className="profile-overlay"
        onClick={() => (popup ? setPopup(null) : navigate(-1))}
      >
        <div className="profile-popup" onClick={e => e.stopPropagation()}>
          <div className="profile-left">
            <div className="profile-placeholder">👤</div>
            <h2>{userState.name}</h2>
            <p className="profile-username">@{userState.username}</p>
            <p className="profile-email">{userState.email}</p>
            {userState.isVerified && (
              <span className="profile-verified">✔ Verified</span>
            )}
            <button
              className="edit-profile-btn"
              onClick={() => {
                setEditFields({ username: userState.username, name: userState.name });
                setProfileError("");
                setPopup("edit");
              }}
            >
              Edit Profile
            </button>
          </div>

          <div className="profile-right">
            <div className="profile-section">
              <h3>Account Information</h3>
              <p>Email: {userState.email}</p>
              <p>Phone: {userState.phone}</p>
              <p>UPI ID: {userState.upiId}</p>
              <p>Joined: {userState.joined}</p>
            </div>

            <div className="profile-section profile-clickable" onClick={() => setPopup("manage")}>
              Account Type
            </div>

            <div className="profile-section profile-clickable" onClick={() => setPopup("password")}>
              Change Password
            </div>

            <div className="profile-section">
              <h3>Preferences</h3>
              <div className="profile-row">
                <span>Currency</span>
                <span>INR (₹)</span>
              </div>
            </div>

            <div className="profile-section profile-clickable" onClick={() => setPopup("about")}>
              About FinSight
            </div>

            <div className="profile-section profile-clickable" onClick={() => setPopup("feedback")}>
              Get Help & Feedback
            </div>

            <div
              className="profile-section profile-clickable profile-logout"
              onClick={() => {
                localStorage.clear();
                navigate("/signup", { replace: true });
                window.location.reload();
              }}
            >
              Logout
            </div>
          </div>
        </div>
      </div>

      {popup && (
        <div className="profile-modal-overlay" onClick={() => setPopup(null)}>
          <div className="profile-modal-box" onClick={e => e.stopPropagation()}>

            {popup === "edit" && (
              <>
                <h3>Edit Profile</h3>
                <input
                  value={editFields.name}
                  placeholder="Full Name"
                  onChange={e => setEditFields({ ...editFields, name: e.target.value })}
                />
                <label style={{ color: "#ccc", fontSize: "0.9rem" }}>Full Name</label>

                <input
                  value={editFields.username}
                  placeholder="Username"
                  onChange={e => setEditFields({ ...editFields, username: e.target.value })}
                  style={{ marginTop: "10px" }}
                />
                <label style={{ color: "#ccc", fontSize: "0.9rem" }}>Username</label>

                <input value={userState.email} disabled style={{ marginTop: "10px" }} />
                <label style={{ color: "#777", fontSize: "0.8rem" }}>Email (cannot be changed)</label>

                {profileError && <p style={{ color: "#ff4d4d", marginTop: "8px" }}>{profileError}</p>}
                {profileUpdated && <p style={{ color: "#2ea44f", marginTop: "8px" }}>Profile updated successfully ✔</p>}

                <button className="profile-save-btn" onClick={handleSaveProfile}>Save Changes</button>
              </>
            )}

            {popup === "password" && (
              <>
                <h3>Change Password</h3>
                <input placeholder="Old Password" type="password"
                  value={passwordData.old}
                  onChange={e => setPasswordData({ ...passwordData, old: e.target.value })} />
                <input placeholder="New Password" type="password"
                  value={passwordData.new}
                  onChange={e => setPasswordData({ ...passwordData, new: e.target.value })} />
                <input placeholder="Confirm New Password" type="password"
                  value={passwordData.confirm}
                  onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })} />
                {passwordError && <p style={{ color: "#ff4d4d", marginTop: "8px" }}>{passwordError}</p>}
                {passwordSuccess && <p style={{ color: "#2ea44f", marginTop: "8px" }}>Password updated successfully ✔</p>}
                <button className="profile-save-btn" onClick={handlePasswordChange}>Update Password</button>
              </>
            )}

            {popup === "about" && (
              <>
                <h3>About FinSight</h3>
                <p><strong>FinSight</strong> is a personal finance management platform designed to help users understand and control their spending habits.</p>
                <p>The application provides simple tools to track expenses, manage shared spending, and gain meaningful insights into daily and monthly finances.</p>
                <ul>
                  <li>Track income and expenses</li>
                  <li>Manage shared and split payments</li>
                  <li>Monitor spending patterns</li>
                  <li>View financial summaries and insights</li>
                </ul>
                <p><strong>Version:</strong> 1.0.0</p>
              </>
            )}

            {popup === "manage" && (
              <>
                <h3>Account Type</h3>
                <p>Standard Account</p>
                <p>Status: {userState.isVerified ? "✔ Verified & Active" : "⚠ Unverified"}</p>
              </>
            )}

            {popup === "feedback" && (
              <>
                <h3>Get Help & Feedback</h3>
                {submitted ? (
                  <p className="success">Thanks for your feedback! ✔</p>
                ) : (
                  <>
                    <select
                      value={feedback.type}
                      onChange={e => setFeedback({ ...feedback, type: e.target.value })}
                    >
                      <option>Help</option>
                      <option>Feedback</option>
                    </select>
                    <textarea
                      placeholder="Describe your issue or feedback..."
                      value={feedback.message}
                      onChange={e => setFeedback({ ...feedback, message: e.target.value })}
                    />
                    <button className="profile-save-btn" onClick={handleFeedbackSubmit}>Submit</button>
                  </>
                )}
              </>
            )}

            <button className="profile-close-btn" onClick={() => setPopup(null)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Profile;