import { useState, useEffect, useRef } from "react";
import './split.css';

const API = "http://localhost:5000/split";

export default function App() {
  const [userExists, setUserExists] = useState(false);
  const [showNewSplitModal, setShowNewSplitModal] = useState(false);
  const [splitName, setSplitName] = useState("");
  
  const [username, setUsername] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [userError, setUserError] = useState(false);
  const [amountError, setAmountError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [splitMode, setSplitMode] = useState("Equal"); 

  const[splitRecords,setSplitRecords]=useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [currentUser, setCurrentUser] = useState("");
  const[selectedSplit,setSelectedSplit]=useState(null);
  const billInputRef = useRef(null);

  useEffect(() => {
    const loggedInData = localStorage.getItem("user");
    if (loggedInData) {
      const foundUser = JSON.parse(loggedInData);
      setCurrentUser(foundUser.username); 
    }
  }, []);


  useEffect(() => {
    getsplitRecords(); // Runs once when the page is born
}, []);


  const confirmNewSplit = () => {
    if (!splitName.trim()) return;
    
    setFriendsList([]);

    setTotalAmount(0);
    setManualAmount("");
    setUsername("");
    setShowNewSplitModal(false);
    setTimeout(() => {
        if (billInputRef.current) billInputRef.current.focus();
    }, 100);
  };

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
      const res = await fetch(`${API}/users`);
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






  const finalizeSplit = async () => {
    if (friendsList.length === 0) return;

    const splitData = {
        description: splitName || `Group Split: ₹${totalAmount}`,
        totalAmount: totalAmount,
        paidBy: currentUser,
        friends: friendsList.map(f => ({
            username: f.username,
            amount: getOwedAmount(f)
        }))
    };

    try {
        const response = await fetch(`${API}/finalize`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(splitData)
        });
        const result = await response.json();

        alert(result.message);
        if(result.ok)
        await getsplitRecords(); 
  
        setFriendsList([]);
        setTotalAmount(0);
        setSplitName("");
    } 
    
    catch (err) {
        alert("Failed to connect to server.");
    }
  };


// This function is the "Source of Truth" getter
const getsplitRecords= async () => {
   try {
        const response = await fetch(`${API}/history`);
        const data = await response.json();
        
        // IMPORTANT: Because MySQL JSON_ARRAYAGG returns a string in some drivers, 
        // we make sure the 'friends' property is a real array.
        const formattedData = data.map(record => ({
            ...record,
            friends: typeof record.friends === 'string' ? JSON.parse(record.friends) : record.friends
        }));

        setSplitRecords(formattedData);
    } catch (err) {
        console.error("Error loading history:", err);
    }
}

  



  const closeModal = () => {
    setUserExists(false);
    setShowNewSplitModal(false);
    setUserError(false);
    setAmountError(false);
  }




  return (
    <div className="scroll-container">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;500;700;800&family=Orbitron:wght@500;700&display=swap');
      </style>

      <div className={(!userExists && !showNewSplitModal) ? "main-wrapper" : "main-wrapper blurred"}>
        
        <div className="banner-card">
            <h2 className="banner-title">Split Expenses <span className="thunder-icon">⚡</span></h2>
            <p className="banner-welcome">Welcome back, {currentUser || "Guest"}</p>
        </div>

        <div className="controls-glass-box">



          <div className="control-group">
            <label className="fancy-label">Total Bill</label>
            <div className="input-field-wrapper">
              <span className="currency-symbol">₹</span>
              <input 
                ref={billInputRef}
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
              {friendsList.length > 0 && <span className="user-count-badge">{friendsList.length}</span>}
            </button>
          </div>



          <div className="control-group">
            <label className="fancy-label">Split Method</label>
            <div className="split-type-toggle">
              <button 
                className={splitMode === "Equal" ? "toggle-btn active" : "toggle-btn"} 
                onClick={() => { setSplitMode("Equal"); setFriendsList([]); }}
              >Equal</button>
              <button 
                className={splitMode === "Manual" ? "toggle-btn active" : "toggle-btn"} 
                onClick={() => { setSplitMode("Manual"); setFriendsList([]); }}
              >Manual</button>
            </div>
          </div>



        </div>

        
        <div className="action-buttons-wrapper">
            <button className="grey-sync-btn" onClick={() => setShowNewSplitModal(true)}>New Split</button>
            <button className="grey-sync-btn" onClick={finalizeSplit}>Confirm Split</button>
        </div>





     
        {/* This is code for checking adding users (ui) */}
        {userExists && (
          <div className="modal-overlay">
            <div className="split_amount_card big-ui interactive-card">
                <button className="modal-close-x" onClick={closeModal}>&times;</button>
                <div className="modal-header">
                  <h2 className="modal-title-big">{splitMode === "Equal" ? "Add Friend" : "Manual Entry"}</h2>
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
                      onKeyDown={(e) => { if (e.key === 'Enter') { checkuser(username); } }}  
                      onChange={takename} 
                    />
                  </div>


                  {/* This is manual mode (ui) */}
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
                  <button className="confirm-btn-big" onClick={() => checkuser(username)}>CONFIRM ENTRY</button>
                </div>
            </div>
          </div>
        )}




        {/* This is ui for giving name to split */}
        {showNewSplitModal && (
          <div className="modal-overlay">
            <div className="split_amount_card big-ui interactive-card">
                <button className="modal-close-x" onClick={closeModal}>&times;</button>
                <div className="modal-header">
                  <h2 className="modal-title-big">New Split</h2>
                  <p className="modal-subtext-big">Enter a name for this group expense</p>
                </div>
                <div className="modal-body-big">
                  <label className="modal-label-fancy-big">EXPENSE DESCRIPTION</label>
                  <div className="input-field-wrapper-big">
                    <input 
                      className="split_userchecking_big" 
                      type="text" 
                      placeholder="e.g. Goa Trip, Dinner..." 
                      autoFocus
                      value={splitName} 
                      onChange={(e) => setSplitName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { confirmNewSplit(); } }}  
                    />
                  </div>
                </div>
                <div className="modal-footer-big">
                  <button className="confirm-btn-big" onClick={confirmNewSplit}>START SPLITTING</button>
                </div>
            </div>
          </div>
        )}



      

{/* SPLIT RECORDS TABLE */}
{/* --- UPDATED INTERACTIVE SPLIT RECORDS TABLE --- */}
<div className="split-records-section">
    <div className="glass-table-container">
        <table className="interactive-records-table">
            <thead>
                {/* Internal Title Row */}
                <tr>
                    <th colSpan="5" className="table-internal-title">
                        SPLIT RECORDS HISTORY
                    </th>
                </tr>
                {/* Column Headers */}
                <tr className="column-headers">
                    <th>#</th>
                    <th>DESCRIPTION / NAME</th>
                    <th>DATE & TIME</th>
                    <th>TOTAL AMOUNT</th>
                </tr>
            </thead>
            <tbody>
                {splitRecords.length > 0 ? (
                    splitRecords.map((split, index) => {
                        const dateObj = new Date(split.created_at);
                        return (
                            <tr key={split.id || index} onClick={() => setSelectedSplit(split)}>
                                <td className="index-col">{index + 1}</td>
                                <td className="desc-col">{split.description}</td>
                                <td className="datetime-col">
                                    {dateObj.toLocaleDateString()} | {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="amount-col">₹{split.total_amount}</td>
                            </tr>
                        );
                    })
                ) : (
                    <tr>
                        <td colSpan="4" className="empty-row">No records found. Start splitting!</td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
</div>

{/* 3. DETAIL VIEW MODAL (Add this next to your other modals) */}
{selectedSplit && (
    <div className="modal-overlay">
        <div className="split_amount_card big-ui interactive-card detail-view-card">
            <button className="modal-close-x" onClick={() => setSelectedSplit(null)}>&times;</button>
            <div className="modal-header">
                <h2 className="modal-title-big" style={{ fontSize: '1.5rem' }}>{selectedSplit.description}</h2>
                <p className="modal-subtext-big">Total Amount: ₹{selectedSplit.total_amount}</p>
            </div>
            <div className="modal-body-big">
                <table className="detail-table">
                    <thead>
                        <tr className="modal-label-fancy-big" style={{ borderBottom: '2px solid #eab308' }}>
                            <th style={{ textAlign: 'left', padding: '10px' }}>Friend</th>
                            <th style={{ textAlign: 'left', padding: '10px' }}>Amount</th>
                            <th style={{ textAlign: 'left', padding: '10px' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedSplit.friends && selectedSplit.friends.map((friend, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '12px', fontWeight: '600' }}>{friend.username}</td>
                                <td style={{ padding: '12px' }}>₹{friend.amount}</td>
                                <td style={{ padding: '12px' }}>
                                    <span className="status-badge-pending">Pending</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="modal-footer-big">
                <button className="confirm-btn-big" onClick={() => setSelectedSplit(null)}>CLOSE HISTORY</button>
            </div>
        </div>
    </div>
)}


      </div>

     

    </div>
  )
};