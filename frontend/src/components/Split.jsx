import { useState, useEffect } from "react";
import './split.css';

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
  const [currentUser, setCurrentUser] = useState("");

  useEffect(() => {
    const loggedInData = localStorage.getItem("user");
    if (loggedInData) {
      const foundUser = JSON.parse(loggedInData);
      setCurrentUser(foundUser.username); 
    }
  }, []);

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

    if (currentUser && value.toLowerCase() === currentUser.toLowerCase()) {
      setErrorMessage("You cannot add yourself!");
      setUserError(true);
      setTimeout(() => setUserError(false), 3000);
      return;
    }

    if (splitMode === "Manual") {
      const entryAmt = parseFloat(manualAmount) || 0;
      if (entryAmt <= 0 || (currentSplitTotal + entryAmt > totalAmount)) {
        setErrorMessage(entryAmt <= 0 ? "Invalid Amount!" : "Amount Exceeded!");
        setAmountError(true);
        setTimeout(() => setAmountError(false), 3000);
        return;
      }
    }

    try {
      const res = await fetch(API);
      const data = await res.json();
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

  const closeModal = () => {
    setUserExists(false);
    setUserError(false);
    setAmountError(false);
  }

  return (
    <div className="scroll-container">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;500;700;800&family=Orbitron:wght@500;700&display=swap');
      </style>

      <div className={!userExists ? "main-wrapper" : "main-wrapper blurred"}>
        
        <div className="banner-card">
            <h2 className="banner-title">
              Split Expenses <span className="thunder-icon">⚡</span>
            </h2>
            <p className="banner-welcome">Welcome back, {currentUser || "Guest"}</p>
        </div>

        <div className="controls-glass-box">
          <div className="control-group">
            <label className="fancy-label">Total Bill</label>
            <div className="input-field-wrapper">
              <span className="currency-symbol">₹</span>
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

          <div className="control-group center-align">
            <label className="fancy-label">Action</label>
            <button className="add-user-btn" onClick={() => setUserExists(true)}>
              + Add User
            </button>
          </div>

          <div className="control-group">
            <label className="fancy-label">Split Method</label>
            <div className="split-type-toggle">
              <button 
                className={splitMode === "Equal" ? "toggle-btn active" : "toggle-btn"} 
                onClick={() => { setSplitMode("Equal"); setFriendsList([]); }}
              >
                Equal
              </button>
              <button 
                className={splitMode === "Manual" ? "toggle-btn active" : "toggle-btn"} 
                onClick={() => { setSplitMode("Manual"); setFriendsList([]); }}
              >
                Manual
              </button>
            </div>
          </div>
        </div>

        <div className="display-ui-section">
          <h3 className="display-title">Split Records ({splitMode})</h3>
          <div className="display-table">
            <div className="display-header">
              <span>Member</span>
              <span>Owe You</span>
              <span>You Owe Them</span>
              <span>Status</span>
            </div>
            <div className="display-body">
              {friendsList.length === 0 ? (
                <div className="display-row empty">
                   <span>No members added</span>
                   <span>₹0.00</span>
                   <span>₹0.00</span>
                   <span>-</span>
                </div>
              ) : (
                friendsList.map((friend, i) => (
                  <div key={i} className="display-row">
                    <span className="name-col">{friend.username}</span>
                    <span className="owed-by-col">₹{getOwedAmount(friend)}</span>
                    <span className="owed-to-col">₹0.00</span>
                    <span className="status-col">Pending</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {userExists && (
          <div className="modal-overlay">
            <div className="split_amount_card big-ui interactive-card">
                <button className="modal-close-x" onClick={closeModal}>&times;</button>
                
                <div className="modal-header">
                  <h2 className="modal-title-big">
                    {splitMode === "Equal" ? "Add Friend" : "Manual Entry"}
                  </h2>
                  <p className="modal-subtext-big">Splitting ₹{totalAmount}</p>
                </div>

                <div className="modal-body-big">
                  <label className={`modal-label-fancy-big ${userError ? "label-error" : ""}`}>
                    {userError ? errorMessage : "FRIEND USERNAME"}
                  </label>
                  <div className={`input-field-wrapper-big ${userError ? "vibrate-error" : ""}`}>
                    <input 
                      className="split_userchecking_big" 
                      type="text" 
                      placeholder="Type username..." 
                      autoFocus
                      value={username} 
                      onKeyDown={(e) => { if (e.key === 'Enter' && splitMode === "Equal") { checkuser(username); } }}  
                      onChange={takename} 
                    />
                  </div>

                  {splitMode === "Manual" && (
                    <div style={{marginTop: '30px'}}>
                      <label className={`modal-label-fancy-big ${amountError ? "label-error" : ""}`}>
                        {amountError ? errorMessage : "AMOUNT (₹)"}
                      </label>
                      <div className={`input-field-wrapper-big ${amountError ? "vibrate-error" : ""}`}>
                         <input 
                            className="split_userchecking_big" 
                            type="number" 
                            placeholder="0.00"
                            value={manualAmount}
                            onChange={(e) => setManualAmount(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { checkuser(username); } }}
                         />
                      </div>
                    </div>
                  )}
                </div>

                <div className="modal-footer-big">
                  <button className="confirm-btn-big" onClick={() => checkuser(username)}>
                    CONFIRM ENTRY
                  </button>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}