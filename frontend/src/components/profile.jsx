import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./profile.css";

function Profile() {
  const navigate = useNavigate();
  const isStrongPassword = (password) => {
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return hasLetter && hasNumber && hasSpecial;
  };
  const [editName, setEditName] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileUpdated, setProfileUpdated] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");
 
  const storedUser = localStorage.getItem("user");
  const parsedUser = storedUser ? JSON.parse(storedUser) : null;

  const userId = parsedUser?.id; 

  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState(null);

  const [userState, setUserState] = useState({
    name: "",
    email: "",
    joined: "",
    lastLogin: "Recently",
  });

  const [passwordData, setPasswordData] = useState({
    old: "",
    new: "",
    confirm: "",
  });

  const [feedback, setFeedback] = useState({
    type: "Help",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

 
  useEffect(() => {
    if (!parsedUser || !userId) {
      alert("User not logged in");
      navigate("/login");
      return;
    }

    fetch(`http://localhost:5000/api/profile?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        setUserState({
          name: data.username,
          email: data.email,
          joined: new Date(data.created_at).toDateString(),
          lastLogin: "Recently",
        });
      })
      .catch(err => {
        console.error(err);
        alert("Failed to load profile");
      })
      .finally(() => setLoading(false));
  }, [userId, parsedUser, navigate]);

 
  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      setProfileError("Username cannot be empty");
      return;
    }

    const res = await fetch("http://localhost:5000/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        username: editName,
        email: userState.email,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.message || "Update failed");
      return;
    }
    setUserState({ ...userState, name: editName });
    const storedUser = JSON.parse(localStorage.getItem("user"));
    localStorage.setItem(
      "user",
      JSON.stringify({ ...storedUser, username: editName })
    );

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
      setPasswordError(
        "Password must contain a letter, a number, and a special character"
      );
      return;
    }

    if (passwordData.new !== passwordData.confirm) {
      setPasswordError("Passwords do not match");
      return;
    }

    await fetch("http://localhost:5000/api/profile/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        oldPassword: passwordData.old,
        newPassword: passwordData.new,
      }),
    });

    setPasswordSuccess(true);

    setTimeout(() => {
      setPasswordSuccess(false);
      setPasswordData({ old: "", new: "", confirm: "" });
      setPopup(null);
    }, 1500);
  };



  const handleFeedbackSubmit = () => {
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
        <p style={{ color: "white" }}>Loading profile…</p>
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
            <p className="profile-email">{userState.email}</p>
            <button className="edit-profile-btn" onClick={() => {setEditName(userState.name);setPopup("edit")}}>
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
            value={editName}
            onChange={(e) =>
              setEditName(e.target.value)
            }
          />
          <label style={{ color: "#ccc", fontSize: "0.9rem" }}>Username</label>

          
          <input value={userState.email} disabled />
            <label style={{ color: "#777", fontSize: "0.8rem", marginTop: "8px" }}>
            Email (cannot be changed)
          </label>
          {profileError && (
            <p style={{ color: "#ff4d4d", marginTop: "8px" }}>
            {profileError}
            </p>
            )}

          {profileUpdated && (
              <p style={{ color: "#2ea44f", marginTop: "10px" }}>
            Profile updated successfully ✔
            </p>
          )}

          <button className="profile-save-btn" onClick={handleSaveProfile}>
            Save Username
          </button>
        </>
      )}


      {popup === "password" && (
        <>
          <h3>Change Password</h3>
          <input placeholder="Old Password" type="password"
            onChange={e => setPasswordData({ ...passwordData, old: e.target.value })} />
          <input placeholder="New Password" type="password"
            onChange={e => setPasswordData({ ...passwordData, new: e.target.value })} />
          <input placeholder="Confirm Password" type="password"
            onChange={e => setPasswordData({ ...passwordData, confirm: e.target.value })} />
            {passwordError && (
              <p style={{ color: "#ff4d4d", marginTop: "8px" }}>
                {passwordError}
              </p>
              )}

          {/* ✅ SUCCESS MESSAGE */}
          {passwordSuccess && (
            <p style={{ color: "#2ea44f", marginTop: "8px" }}>
              Password updated successfully ✔
            </p>
          )}
          <button className="profile-save-btn" onClick={handlePasswordChange}>
            Update Password
          </button>
        </>
      )}

      {popup === "about" && (
        <>
          <h3>About FinSight</h3>
          <p>
            <strong>FinSight</strong> is a personal finance management platform designed
            to help users understand and control their spending habits.
          </p>

          <p>
            The application provides simple tools to track expenses, manage shared
            spending, and gain meaningful insights into daily and monthly finances.
          </p>

          <ul>
            <li>Track income and expenses</li>
            <li>Manage shared and split payments</li>
            <li>Monitor spending patterns</li>
            <li>View financial summaries and insights</li>
          </ul>

          <p>
            <strong>Version:</strong> 1.0.0
          </p>
        </>
      )}


      {popup === "manage" && (
        <>
          <h3>Account Type</h3>
          <p>Standard Account</p>
          <p>Status: Active</p>
        </>
      )}

      {popup === "feedback" && (
        <>
          <h3>Get Help & Feedback</h3>
          {submitted ? (
            <p>Thanks for your feedback!</p>
          ) : (
            <>
              <select
                value={feedback.type}
                onChange={e => setFeedback({ ...feedback, type: e.target.value })}
              >
                <option color="black">Help</option>
                <option color="black">Feedback</option>
              </select>
              <textarea
                value={feedback.message}
                onChange={e => setFeedback({ ...feedback, message: e.target.value })}
              />
              <button className="profile-save-btn" onClick={handleFeedbackSubmit}>
                Submit
              </button>
            </>
          )}
        </>
      )}

      <button className="profile-close-btn" onClick={() => setPopup(null)}>
        Close
      </button>
    </div>
  </div>
      )}
    </>
  );
}

export default Profile;
