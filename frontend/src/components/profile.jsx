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
  const [activeTab, setActiveTab] = useState("info");

  const [userState, setUserState] = useState({
    name: "", username: "", email: "", phone: "", upiId: "", isVerified: false, joined: "",
  });

  const [editFields, setEditFields] = useState({ username: "", name: "" });
  const [profileError, setProfileError] = useState("");
  const [profileUpdated, setProfileUpdated] = useState(false);

  const [passwordData, setPasswordData] = useState({ old: "", new: "", confirm: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [feedback, setFeedback] = useState({ type: "Help", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const [notifPrefs, setNotifPrefs] = useState({
    emailAlerts: true, spendingAlerts: true, weeklyReport: false,
  });
  const [notifSaved, setNotifSaved] = useState(false);
  const [copyMsg, setCopyMsg] = useState(false);

  const avatarColors = ["#5865f2", "#2ea44f", "#e0c600", "#e05c5c", "#00b4d8", "#f77f00"];
  const [avatarColor, setAvatarColor] = useState(
    localStorage.getItem("avatarColor") || "#5865f2"
  );

  const getPasswordStrength = (pwd) => {
    if (!pwd) return null;
    const score = [
      pwd.length >= 8, /[A-Z]/.test(pwd), /[a-z]/.test(pwd),
      /\d/.test(pwd), /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    ].filter(Boolean).length;
    if (score <= 2) return { label: "Weak",   color: "#ff4d4d", width: "30%" };
    if (score <= 3) return { label: "Fair",   color: "#e0c600", width: "55%" };
    if (score === 4) return { label: "Good",  color: "#00b4d8", width: "75%" };
    return             { label: "Strong", color: "#2ea44f", width: "100%" };
  };
  const strength = getPasswordStrength(passwordData.new);

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  };

  useEffect(() => {
    if (!parsedUser || !userId) { navigate("/login"); return; }
    fetch(`http://localhost:5000/api/profile?userId=${userId}`)
      .then(res => { if (!res.ok) throw new Error("Server error"); return res.json(); })
      .then(data => {
        setUserState({
          name: data.name ?? "", username: data.username ?? "",
          email: data.email ?? "—", phone: data.phone ?? "—",
          upiId: data.upiId ?? "—", isVerified: data.isVerified ?? false,
          joined: data.createdAt ? new Date(data.createdAt).toDateString() : "—",
        });
      })
      .catch(err => { console.error(err); setFetchError("Could not load profile. Please try again."); })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleSaveProfile = async () => {
    setProfileError("");
    if (!editFields.username.trim()) { setProfileError("Username cannot be empty"); return; }
    const res = await fetch("http://localhost:5000/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, username: editFields.username, name: editFields.name }),
    });
    const data = await res.json();
    if (!res.ok) { setProfileError(data.message || "Update failed"); return; }
    setUserState(prev => ({ ...prev, username: editFields.username, name: editFields.name || prev.name }));
    const stored = JSON.parse(localStorage.getItem("user"));
    localStorage.setItem("user", JSON.stringify({ ...stored, username: editFields.username }));
    setProfileUpdated(true);
    setTimeout(() => { setProfileUpdated(false); setPopup(null); }, 1500);
  };

  const handlePasswordChange = async () => {
    setPasswordError("");
    if (!passwordData.old || !passwordData.new || !passwordData.confirm) {
      setPasswordError("All fields are required"); return;
    }
    if (!/[a-zA-Z]/.test(passwordData.new) || !/\d/.test(passwordData.new) || !/[!@#$%^&*(),.?":{}|<>]/.test(passwordData.new)) {
      setPasswordError("Password must contain a letter, a number, and a special character"); return;
    }
    if (passwordData.new !== passwordData.confirm) { setPasswordError("Passwords do not match"); return; }
    const res = await fetch("http://localhost:5000/api/profile/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, oldPassword: passwordData.old, newPassword: passwordData.new }),
    });
    const data = await res.json();
    if (!res.ok) { setPasswordError(data.message || "Failed to update password"); return; }
    setPasswordSuccess(true);
    setTimeout(() => { setPasswordSuccess(false); setPasswordData({ old: "", new: "", confirm: "" }); setPopup(null); }, 1500);
  };
  const closePopup = () => {
  setPopup(null);
  setPasswordData({ old: "", new: "", confirm: "" });
  setPasswordError("");
  setPasswordSuccess(false);
  setShowOld(false);
  setShowNew(false);
  setShowConfirm(false);
};

  const handleFeedbackSubmit = () => {
    if (!feedback.message.trim()) return;
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setFeedback({ type: "Help", message: "" }); setPopup(null); }, 1200);
  };

  const handleAvatarColor = (color) => {
    setAvatarColor(color); localStorage.setItem("avatarColor", color);
  };

  const copyUpi = () => {
    navigator.clipboard.writeText(userState.upiId);
    setCopyMsg(true); setTimeout(() => setCopyMsg(false), 1500);
  };

  if (loading) {
    return (
      <div className="profile-overlay">
        <div className="profile-popup profile-popup--center">
          <div className="profile-spinner" />
          <p style={{ color: "#aaa", marginTop: "14px" }}>Loading profile…</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="profile-overlay" onClick={() => navigate(-1)}>
        <div className="profile-popup profile-popup--center" onClick={e => e.stopPropagation()}>
          <div style={{ fontSize: "2.5rem" }}>⚠️</div>
          <p style={{ color: "#ff4d4d", margin: "10px 0" }}>{fetchError}</p>
          <button className="edit-profile-btn" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="profile-overlay" onClick={() => (popup ? closePopup() : navigate(-1))}>
        <div className="profile-popup" onClick={e => e.stopPropagation()}>

          {/* LEFT PANEL */}
          <div className="profile-left">
            <div className="profile-avatar" style={{ background: avatarColor }}>
              {getInitials(userState.name)}
            </div>
            <h2 className="profile-name">{userState.name}</h2>
            <p className="profile-username">@{userState.username}</p>
            <p className="profile-email">{userState.email}</p>
            <div className="profile-stat-row">
              <div className="profile-stat">
                <span className="profile-stat__label">Member since</span>
                <span className="profile-stat__value">{userState.joined.split(" ").slice(3).join("") || "—"}</span>
              </div>
            </div>
            <button className="edit-profile-btn" onClick={() => {
              setEditFields({ username: userState.username, name: userState.name });
              setProfileError(""); setPopup("edit");
            }}>✏️ Edit Profile</button>
          </div>

          {/* RIGHT PANEL */}
          <div className="profile-right">
            <div className="profile-tabs">
              {["info", "settings"].map(tab => (
                <button key={tab}
                  className={`profile-tab ${activeTab === tab ? "profile-tab--active" : ""}`}
                  onClick={() => setActiveTab(tab)}>
                  {tab === "info" ? "👤 Account" : "⚙️ Settings"}
                </button>
              ))}
            </div>

            {activeTab === "info" && (
              <>
                <div className="profile-section">
                  <h3>Account Information</h3>
                  <div className="profile-info-grid">
                    {[
                      { icon: "", label: "Email",  value: userState.email },
                      { icon: "", label: "Phone",  value: userState.phone },
                      { icon: "", label: "Joined", value: userState.joined },
                    ].map(({ icon, label, value }) => (
                      <div className="profile-info-item" key={label}>
                        <span className="info-label">{icon} {label}</span>
                        <span className="info-value">{value}</span>
                      </div>
                    ))}
                    <div className="profile-info-item">
                      <span className="info-label">UPI ID</span>
                      <span className="info-value info-value--copy" onClick={copyUpi} title="Click to copy">
                        {userState.upiId} <span className="copy-icon">⎘</span>
                        {copyMsg && <span className="copy-toast">Copied!</span>}
                      </span>
                    </div>
                  </div>
                </div>

                {[
                  { key: "manage",   icon: "🏷️", label: "Account Type" },
                  { key: "about",    icon: "ℹ️",  label: "About FinSight" },
                  { key: "feedback", icon: "💬", label: "Get Help & Feedback" },
                ].map(({ key, icon, label }) => (
                  <div key={key} className="profile-section profile-clickable" onClick={() => setPopup(key)}>
                    <div className="profile-row-icon">
                      <span>{icon} {label}</span>
                      <span className="profile-arrow">›</span>
                    </div>
                  </div>
                ))}

                <div className="profile-section profile-clickable profile-logout"
                  onClick={() => { localStorage.clear(); navigate("/signup", { replace: true }); window.location.reload(); }}>
                  <div className="profile-row-icon">
                    <span>🚪 Logout</span>
                    <span className="profile-arrow">›</span>
                  </div>
                </div>
              </>
            )}

            {activeTab === "settings" && (
              <>
                {[
                  { key: "password",      icon: "🔒", label: "Change Password" },
                  // { key: "notifications", icon: "🔔", label: "Notification Preferences" },
                  { key: "avatar",        icon: "🎨", label: "Customize Avatar Color" },
                ].map(({ key, icon, label }) => (
                  <div key={key} className="profile-section profile-clickable" onClick={() => setPopup(key)}>
                    <div className="profile-row-icon">
                      <span>{icon} {label}</span>
                      <span className="profile-arrow">›</span>
                    </div>
                  </div>
                ))}
                <div className="profile-section">
                  <h3>Preferences</h3>
                  <div className="profile-row">
                    <span>💰 Currency</span>
                    <span className="info-value">INR (₹)</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

     
      {popup && (
        <div className="profile-modal-overlay" onClick={() => closePopup()}>
          <div className="profile-modal-box" onClick={e => e.stopPropagation()}>

            {popup === "edit" && (
              <>
                <h3>✏️ Edit Profile</h3>
                {[{ field: "name", label: "Full Name" }, { field: "username", label: "Username" }].map(({ field, label }) => (
                  <div className="input-group" key={field}>
                    <input value={editFields[field]} placeholder=" "
                      onChange={e => setEditFields({ ...editFields, [field]: e.target.value })} />
                    <label>{label}</label>
                  </div>
                ))}
                <div className="input-group">
                  <input value={userState.email} disabled placeholder=" " />
                  <label style={{ color: "#666" }}>Email (cannot be changed)</label>
                </div>
                {profileError && <p className="msg-error">{profileError}</p>}
                {profileUpdated && <p className="msg-success">Profile updated successfully ✔</p>}
                <button className="profile-save-btn" onClick={handleSaveProfile}>Save Changes</button>
              </>
            )}

            {popup === "password" && (
              <>
                <h3>🔒 Change Password</h3>
                {[
                  { key: "old",     label: "Old Password",         show: showOld,     toggle: () => setShowOld(!showOld) },
                  { key: "new",     label: "New Password",         show: showNew,     toggle: () => setShowNew(!showNew) },
                  { key: "confirm", label: "Confirm New Password", show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
                ].map(({ key, label, show, toggle }) => (
                  <div className="input-group input-group--pw" key={key}>
                    <input type={show ? "text" : "password"} value={passwordData[key]} placeholder=" "
                      onChange={e => setPasswordData({ ...passwordData, [key]: e.target.value })} />
                    <label>{label}</label>
                    <button className="pw-toggle" onClick={toggle}>{show ? "🙈" : "👁️"}</button>
                  </div>
                ))}
                {passwordData.new && strength && (
                  <div className="strength-bar-wrap">
                    <div className="strength-track">
                      <div className="strength-bar" style={{ width: strength.width, background: strength.color }} />
                    </div>
                    <span style={{ color: strength.color, fontSize: "0.8rem" }}>{strength.label}</span>
                  </div>
                )}
                {passwordError && <p className="msg-error">{passwordError}</p>}
                {passwordSuccess && <p className="msg-success">Password updated successfully ✔</p>}
                <button className="profile-save-btn" onClick={handlePasswordChange}>Update Password</button>
              </>
            )}

            {popup === "notifications" && (
              <>
                <h3>🔔 Notification Preferences</h3>
                {[
                  { key: "emailAlerts",    label: "Email Alerts",    desc: "Receive alerts via email" },
                  { key: "spendingAlerts", label: "Spending Alerts", desc: "Alert when budget is exceeded" },
                  { key: "weeklyReport",   label: "Weekly Report",   desc: "Get a weekly financial summary" },
                ].map(({ key, label, desc }) => (
                  <div className="toggle-row" key={key}>
                    <div>
                      <p style={{ margin: 0, color: "#fff", fontSize: "0.95rem" }}>{label}</p>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "#888" }}>{desc}</p>
                    </div>
                    <div className={`toggle-switch ${notifPrefs[key] ? "toggle-switch--on" : ""}`}
                      onClick={() => setNotifPrefs(prev => ({ ...prev, [key]: !prev[key] }))}>
                      <div className="toggle-knob" />
                    </div>
                  </div>
                ))}
                {notifSaved && <p className="msg-success">Preferences saved ✔</p>}
                <button className="profile-save-btn" onClick={() => {
                  setNotifSaved(true);
                  setTimeout(() => { setNotifSaved(false); setPopup(null); }, 1500);
                }}>Save Preferences</button>
              </>
            )}

            {popup === "avatar" && (
              <>
                <h3>🎨 Avatar Color</h3>
                <div className="avatar-preview" style={{ background: avatarColor }}>
                  {getInitials(userState.name)}
                </div>
                <div className="color-grid">
                  {avatarColors.map(c => (
                    <div key={c}
                      className={`color-swatch ${avatarColor === c ? "color-swatch--active" : ""}`}
                      style={{ background: c }} onClick={() => handleAvatarColor(c)} />
                  ))}
                </div>
                <p className="msg-success" style={{ marginTop: "12px", textAlign: "center" }}>Color saved automatically ✔</p>
              </>
            )}

            {popup === "about" && (
              <>
                <h3>ℹ️ About FinSight</h3>
                <p><strong>FinSight</strong> is a personal finance management platform designed to help you understand and control your spending.</p>
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
                <h3>🏷️ Account Type</h3>
                <div className="account-type-card">
                  <span >Standard</span>
                  {/* <p>Status: {userState.isVerified
                    ? <span style={{ color: "#2ea44f" }}>✔ Verified & Active</span>
                    : <span style={{ color: "#e0c600" }}>⚠ Unverified</span>}
                  </p> */}
                </div>
              </>
            )}

            {popup === "feedback" && (
              <>
                <h3>💬 Get Help & Feedback</h3>
                {submitted ? (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <div style={{ fontSize: "2.5rem" }}>🎉</div>
                    <p className="msg-success">Thanks for your feedback!</p>
                  </div>
                ) : (
                  <>
                    <select value={feedback.type} onChange={e => setFeedback({ ...feedback, type: e.target.value })}>
                      <option>Help</option>
                      <option>Feedback</option>
                      <option>Bug Report</option>
                      <option>Feature Request</option>
                    </select>
                    <textarea placeholder="Describe your issue or feedback..."
                      value={feedback.message}
                      onChange={e => setFeedback({ ...feedback, message: e.target.value })} />
                    <button className="profile-save-btn" onClick={handleFeedbackSubmit}>Submit</button>
                  </>
                )}
              </>
            )}

            <button className="profile-close-btn" onClick={() => closePopup()}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Profile;