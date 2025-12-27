import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./logsignin.css";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [conf, setConf] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [isValid, setIsValid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let pErr = "";
    let cErr = "";
    let eErr = "";

    if (password.length > 0) {
      const hasLetter = /[a-zA-Z]/.test(password);
      const hasNumber = /\d/.test(password);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      if (!hasLetter || !hasNumber || !hasSpecial) {
        pErr = "Password must have a letter, number, special character.";
      }
    }

    if (conf.length > 0) {
      if (password !== conf) {
        cErr = "Passwords do not match.";
      }
    }

    if (email.length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        eErr = "Please enter a valid email address.";
      }
    }

    setPasswordError(pErr);
    setConfirmError(cErr);
    setEmailError(eErr);

    if (username && email && password && conf && !pErr && !cErr && !eErr) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [username, email, password, conf]);

  const handleSignup = async () => {
    if (isValid) {
      try {
        const response = await fetch('http://localhost:5000/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: username, email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          alert("Account Created! Please log in.");
          navigate("/login");
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error("Connection error:", error);
        alert("Unable to connect to server");
      }
    }
  };

  return (
    <div id="inp-box">
      <h2>Sign Up</h2>
      <div id="info">
        <div className="row">
          <span className="conf">Username :</span>
          <div className="input-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>

        <div className="row">
          <span className="conf">Email :</span>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {emailError && <span className="error-msg">{emailError}</span>}
          </div>
        </div>

        <div className="row">
          <span className="conf">New Password :</span>
          <div className="input-group">
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {passwordError && (
              <span className="error-msg">{passwordError}</span>
            )}
          </div>
        </div>
        <div className="row">
          <span className="conf">Confirm Password :</span>
          <div className="input-group">
            <input
              type="password"
              placeholder="Confirm Password"
              value={conf}
              onChange={(e) => setConf(e.target.value)}
            />
            {confirmError && <span className="error-msg">{confirmError}</span>}
          </div>
        </div>
      </div>
      <button id="submit" onClick={handleSignup} disabled={!isValid}>
        Sign Up
      </button>
    </div>
  );
}

export default Signup;