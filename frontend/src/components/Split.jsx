import { useState, useEffect } from "react";
import './split.css';

// Pointing to your Express endpoint
const API = "http://localhost:5000/split/users";

export default function App() {
  const [userExists, setUserExists] = useState(false);
  const [username, setUsername] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  
  const [userError, setUserError] = useState(false);
  const [amountError, setAmountError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const [totalAmount, setTotalAmount] = useState(0);
  const [splitMode, setSplitMode] = useState("Equal"); 
  const [friendsList, setFriendsList] = useState([]);

  // --- LOGIC TO GET LOGGED IN USER ---
  const [currentUser, setCurrentUser] = useState("");

  useEffect(() => {
    const loggedInData = localStorage.getItem("user");
    if (loggedInData) {
      const foundUser = JSON.parse(loggedInData);
      setCurrentUser(foundUser.username); // This sets "Vinod" or "Rohit"
    }
  }, []);
  // -----------------------------------

  const takename = (e) => {
    setUsername(e.target.value);
    if (userError) setUserError(false);
  }

  const handleAmountSubmit = (e) => {
    if (e.key === 'Enter' && totalAmount > 0) {
      setUserExists(true); 
    }
  }

  const currentSplitTotal = friendsList.reduce((acc, curr) => acc + parseFloat(curr.manualVal || 0), 0);

  const checkuser = async (value) => {
    if (!value.trim()) return;
    setUserError(false);
    setAmountError(false);

    // --- NEW LOGIC: PREVENT SELF ADDING ---
    if (currentUser && value.toLowerCase() === currentUser.toLowerCase()) {
      setErrorMessage("You cannot add yourself!");
      setUserError(true);
      setTimeout(() => setUserError(false), 3000);
      return;
    }
    // --------------------------------------

    if (splitMode === "Manual") {
      const entryAmt = parseFloat(manualAmount) || 0;
      if (entryAmt <= 0) {
        setErrorMessage("Invalid Amount!");
        setAmountError(true);
        setTimeout(() => setAmountError(false), 3000);
        return;
      }
      if (currentSplitTotal + entryAmt > totalAmount) {
        setErrorMessage("Amount Exceeded!");
        setAmountError(true);
        setTimeout(() => setAmountError(false), 3000);
        return;
      }
    }

    try {
      const res = await fetch(API);
      const data = await res.json();
      
      // Searching for 'username' in the database
      const found = data.find((user) => user.username === value);

      if (found) {
        if (!friendsList.find(f => f.username === found.username)) {
            setFriendsList([...friendsList, { 
              username: found.username, 
              manualVal: splitMode === "Equal" ? null : manualAmount 
            }]);
        }
        setUserExists(false); 
        setUsername("");
        setManualAmount("");
      } else {
        setErrorMessage("User Not Found!");
        setUserError(true);
        setTimeout(() => setUserError(false), 3000);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setErrorMessage("Server Offline!");
      setUserError(true);
      setTimeout(() => setUserError(false), 3000);
    }
  }

  const getOwedAmount = (friend) => {
    if (splitMode === "Equal") {
      return (totalAmount / (friendsList.length + 1)).toFixed(2);
    }
    return friend.manualVal || "0.00";
  }

  return (
    <>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Orbitron:wght@500;700;800&family=Plus+Jakarta+Sans:wght@300;500;700&family=Syne:wght@600;800&display=swap');
      </style>

      <div className={!userExists ? "main-wrapper" : "main-wrapper blurred"}>
        
        <header className="top-header">
          <div className="logo-container">
            <span className="logo-icon">⚡</span>
            <h1 className="fancy-title">SPLIT-EXPENSES</h1>
          </div>
          <nav className="nav-menu">
            <button className="nav-link">Home</button>
            <button className="nav-link">Dashboard</button>
            <button className="nav-link" style={{color: '#00f2ff'}}>User: {currentUser || "Guest"}</button>
          </nav>
        </header>

        <div className="main-controls-container">
          <div className="control-group">
            <label className="fancy-label">Enter Amount</label>
            <div className="input-glow-wrapper amount-wrapper">
              <span className="main-rupee-icon">₹</span>
              <input 
                type="number" 
                className="main-amount-input" 
                placeholder="0.00" 
                value={totalAmount || ""}
                onKeyDown={handleAmountSubmit}
                onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="control-group">
            <label className="fancy-label">Action</label>
            <button className="confirm-btn-neon" style={{padding: '12px 20px', fontSize: '0.9rem', width: 'auto'}} onClick={() => setUserExists(true)}>
              + Add User
            </button>
          </div>

          <div className="control-group">
            <label className="fancy-label">Split Method</label>
            <div className="split-type-toggle">
              <button 
                className={splitMode === "Equal" ? "confirm-btn-neon small" : "close-btn-ghost small"} 
                onClick={() => { setSplitMode("Equal"); setFriendsList([]); }}
              >
                Equal
              </button>
              <button 
                className={splitMode === "Manual" ? "confirm-btn-neon small" : "close-btn-ghost small"} 
                onClick={() => { setSplitMode("Manual"); setFriendsList([]); }}
              >
                Manual
              </button>
            </div>
          </div>
        </div>

        <p className="main-para stylish-para">
            {splitMode === "Manual" 
              ? `LIMIT: ₹${currentSplitTotal.toFixed(2)} / ₹${totalAmount}` 
              : "AUTO-DISTRIBUTION ENABLED"}
        </p>

        <div className="display-ui-section">
          <h3 className="display-title">Split Records ({splitMode})</h3>
          <div className="display-table">
            <div className="display-header">
              <span>Member</span>
              <span>Their Share</span>
              <span>Owed To You</span>
            </div>
            <div className="display-body">
              {friendsList.length === 0 ? (
                <div className="display-row empty">
                   <span>No members added</span>
                   <span>₹0.00</span>
                   <span>₹0.00</span>
                </div>
              ) : (
                friendsList.map((friend, i) => (
                  <div key={i} className="display-row">
                    <span className="name-col">{friend.username}</span>
                    <span className="owed-by-col">₹{getOwedAmount(friend)}</span>
                    <span className="status-col">₹0.00</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {userExists && (
          <div className="modal-overlay">
            <div className="split_amount_card">
                <div className="modal-header">
                  <h2 className="modal-title">
                    {splitMode === "Equal" ? "NEW ENTRY" : "MANUAL ENTRY"}
                  </h2>
                  <p className="modal-subtext">TOTAL BILL: ₹{totalAmount}</p>
                </div>

                <div className="modal-body">
                  <label className={`modal-label-fancy ${userError ? "label-error-vibe" : ""}`}>
                    {userError ? errorMessage : "FRIEND USERNAME"}
                  </label>
                  <div className={`input-glow-wrapper ${userError ? "vibrate-error" : ""}`} style={{marginBottom: splitMode === "Manual" ? '25px' : '0'}}>
                    <input 
                      className="split_userchecking" 
                      type="text" 
                      placeholder="e.g. Vicky_123" 
                      autoFocus
                      value={username} 
                      onKeyDown={(e) => { if (e.key === 'Enter' && splitMode === "Equal") { checkuser(username); } }}  
                      onChange={takename} 
                    />
                  </div>

                  {splitMode === "Manual" && (
                    <>
                      <label className={`modal-label-fancy ${amountError ? "label-error-vibe" : ""}`}>
                        {amountError ? errorMessage : "ASSIGNED AMOUNT"}
                      </label>
                      <div className={`input-glow-wrapper ${amountError ? "vibrate-error" : ""}`}>
                         <span style={{marginLeft: '12px', color: '#00f2ff', fontWeight: 'bold'}}>₹</span>
                         <input 
                            className="split_userchecking" 
                            type="number" 
                            placeholder="0.00"
                            value={manualAmount}
                            onChange={(e) => setManualAmount(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { checkuser(username); } }}
                         />
                      </div>
                    </>
                  )}
                </div>

                <div className="modal-footer">
                  <button className="confirm-btn-neon" onClick={() => checkuser(username)}>
                    CONFIRM
                  </button>
                  <button className="close-btn-ghost" onClick={() => {setUserExists(false); setUserError(false); setAmountError(false);}}>
                    CLOSE
                  </button>
                </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}