import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./logsignin.css";

function Login() {
  const [view, setView] = useState("login");
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailLogin, setIsEmailLogin] = useState(true);

  const [resetUsername, setResetUsername] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passError, setPassError] = useState("");
  const [matchError, setMatchError] = useState("");
  const [isValid, setIsValid] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (view === "reset") {
      let pErr = "";
      let cErr = "";

      if (newPass.length > 0) {
        const hasLetter = /[a-zA-Z]/.test(newPass);
        const hasNumber = /\d/.test(newPass);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPass);
        if (!hasLetter || !hasNumber || !hasSpecial) {
          pErr = "Must have letter, number, & special char.";
        }
      }

      if (confirmPass.length > 0) {
        if (newPass !== confirmPass) {
          cErr = "Passwords do not match.";
        }
      }

      setPassError(pErr);
      setMatchError(cErr);

      if (newPass && confirmPass && !pErr && !cErr) {
        setIsValid(true);
      } else {
        setIsValid(false);
      }
    }
  }, [newPass, confirmPass, view]);

  const handleLogin = async () => {
    try {
      const payload = isEmailLogin
        ? { email: identifier, password }
        : { username: identifier, password };

      const response = await fetch("http://localhost:5000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
       login({ user: data.user, token: data.token });        
        navigate("/dashboard");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Login failed. Check server.");
    }
  };

  const handleVerify = async () => {
    try {
      const response = await fetch("http://localhost:5000/verify-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: resetUsername, email: resetEmail }),
      });
      if (response.ok) {
        setView("reset");
      } else {
        alert("Username and Email do not match our records.");
      }
    } catch (error) {
      console.error(error);
      alert("Connection error");
    }
  };

  const handleReset = async () => {
    if (isValid) {
      try {
        const response = await fetch("http://localhost:5000/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: resetEmail,
            newPassword: newPass,
          }),
        });

        if (response.ok) {
          alert("Password updated! Please login.");
          setView("login");
          setResetUsername("");
          setResetEmail("");
          setNewPass("");
          setConfirmPass("");
        } else {
          alert("Error updating password.");
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const toggleLoginMethod = () => {
    setIsEmailLogin(!isEmailLogin);
    setIdentifier("");
  };

  if (view === "login") {
    return (
      <div id="inp-box">
        <h2>Login</h2>
        <div id="info">
          <div className="row">
            <span className="conf">
              {isEmailLogin ? "Email:" : "Username :"}
            </span>
            <div className="input-group">
              <input
                type={isEmailLogin ? "email" : "text"}
                placeholder={
                  isEmailLogin ? "Enter your email" : "Enter your username"
                }
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
          </div>
          <div className="row">
            <span className="conf">Password :</span>
            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="forgot-pass" onClick={() => setView("verify")}>
                Forgot Password?
              </span>
            </div>
          </div>
        </div>

        <button id="submit" onClick={handleLogin}>
          Login
        </button>

        <div className="bottom-links">
          <p className="redirect-text">
            <span onClick={toggleLoginMethod}>
              {isEmailLogin ? "Login using Username" : "Login using Email"}
            </span>
          </p>
          <p className="redirect-text">
            Don't have an account?{" "}
            <span onClick={() => navigate("/signup")}>Sign Up</span>
          </p>
        </div>
      </div>
    );
  }

  if (view === "verify") {
    return (
      <div id="inp-box">
        <h2>Find Account</h2>
        <div id="info">
          <div className="row">
            <span className="conf">Username :</span>
            <div className="input-group">
              <input
                type="text"
                placeholder="Enter Username"
                value={resetUsername}
                onChange={(e) => setResetUsername(e.target.value)}
              />
            </div>
          </div>
          <div className="row">
            <span className="conf">Email :</span>
            <div className="input-group">
              <input
                type="email"
                placeholder="Enter Registered Email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button id="submit" onClick={handleVerify}>
          Verify
        </button>

        <div className="bottom-links">
          <p className="redirect-text">
            <span onClick={() => setView("login")}>Back to Login</span>
          </p>
        </div>
      </div>
    );
  }

  if (view === "reset") {
    return (
      <div id="inp-box">
        <h2>Reset Password</h2>
        <div id="info">
          <div className="row">
            <span className="conf">New Password:</span>
            <div className="input-group">
              <input
                type="password"
                placeholder="New Password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
              />
              {passError && <span className="error-msg">{passError}</span>}
            </div>
          </div>

          <div className="row">
            <span className="conf">Confirm Password:</span>
            <div className="input-group">
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
              />
              {matchError && <span className="error-msg">{matchError}</span>}
            </div>
          </div>
        </div>

        <button id="submit" onClick={handleReset} disabled={!isValid}>
          Update Password
        </button>

        <div className="bottom-links">
          <p className="redirect-text">
            <span onClick={() => setView("login")}>Cancel</span>
          </p>
        </div>
      </div>
    );
  }
}

export default Login;