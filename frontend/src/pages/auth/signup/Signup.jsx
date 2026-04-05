import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./signup.css";


function Signup() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [upiId, setUpiId] = useState("");
  const [phone, setPhone] = useState("");
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


    if (conf.length > 0 && password !== conf) {
      cErr = "Passwords do not match.";
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


    if (
      name &&
      username &&
      upiId &&
      phone &&
      password &&
      conf &&
      !pErr &&
      !cErr &&
      !eErr
    ) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [name, username, upiId, phone, email, password, conf]);


  const handleSignup = async () => {
    if (!isValid) return;


    try {
      const response = await fetch(
        "http://localhost:5000/api/v1/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            username: username.trim(),
            upiId: upiId.trim(),
            phone: phone.trim(),
            email: email.trim(),
            password,
          }),
        }
      );


      const data = await response.json();


      if (response.ok) {
        alert("Account Created! Please log in.");
        navigate("/login");
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Connection error:", error);
      alert("Unable to connect to server");
    }
  };


  return (
    <div className="auth-page-container">
  <div className="auth-sidebar">
     <div className="brand-pill">FinSight Ecosystem</div>
     <h1>Join the <span>Future</span> of Finance.</h1>
     {/* Add Value Tiles here */}
  </div>
  <div className="auth-form-section">
     <div id="inp-box" className="signup-box">
        {/* Your Sign-up Form */}
        <h2>Sign Up</h2>
      <div id="info">


        <div className="row">
          <span className="conf">Full Name :</span>
          <div className="input-group">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>


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
          <span className="conf">UPI ID :</span>
          <div className="input-group">
            <input
              type="text"
              placeholder="yourname@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
          </div>
        </div>


        <div className="row">
          <span className="conf">Phone :</span>
          <div className="input-group">
            <input
              type="tel"
              placeholder="10 digit phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
            {confirmError && (
              <span className="error-msg">{confirmError}</span>
            )}
          </div>
        </div>


      </div>


      <button id="submit" onClick={handleSignup} disabled={!isValid}>
        Sign Up
      </button>
     </div>
  </div>
</div>
  );
}


export default Signup;
