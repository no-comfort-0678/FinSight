/**
 * Comments: Full RoomSplitManager. No simplifications.
 * Refined: Added Room Creator display in header.
 * Added: Manage Participants Modal (Replacing inline dropdown).
 * Added: Download Button beside View Summary in Header.
 * Rules: Providing the whole code after changes [2026-03-09].
 */
import React, { useState, useEffect, useMemo } from "react";
import { 
  History, RefreshCw, ChevronLeft, DollarSign, 
  CheckCircle2, X, Users, PieChart, Banknote, AlertTriangle, RotateCcw, Save, Trash2, PlusCircle, Download
} from "lucide-react";

const API = "http://localhost:5000/split";

const RoomSplitManager = ({ activeRoom, user, onBack }) => {
  const [totalAmount, setTotalAmount] = useState("");
  const [splitName, setSplitName] = useState("");
  const [splitType, setSplitType] = useState("equal");
  const [splitRecords, setSplitRecords] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]); 
  
  // New States for the Modal logic
  const [showManageModal, setShowManageModal] = useState(false);
  const [tempMember, setTempMember] = useState("");
  const [tempAmount, setTempAmount] = useState("");

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showRevertModal, setShowRevertModal] = useState(false);
  const [summaryData, setSummaryData] = useState([]);
  const [targetSplit, setTargetSplit] = useState(null);
  const [manualDrafts, setManualDrafts] = useState({}); 
  const [errorId, setErrorId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);


/**
 * Comments: Fixed handleDownload with explicit Type Casting.
 * FIX: Using Number() to ensure roomId is an integer before API call.
 * FIX: Added detailed error logging for debugging.
 */
const handleDownload = async () => {
    try {
        const token = localStorage.getItem("token");
        // Use Number() to ensure "68" (string) becomes 68 (int)
        const roomId = activeRoom?.id ? Number(activeRoom.id) : null; 

        if (!roomId || isNaN(roomId)) {
            console.error("Invalid Room ID detected:", activeRoom?.id);
            return alert("Error: Room ID is invalid or missing.");
        }

        console.log(`Attempting PDF download for Room ID: ${roomId}`);

        const response = await fetch(`${API}/export-pdf/${roomId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Server Error: ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeRoom.roomName || 'Finsight'}_Report.pdf`;
        document.body.appendChild(a);
        a.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

    } catch (error) {
        console.error("Download Error:", error.message);
        alert(`Download failed: ${error.message}`);
    }
};
  // --- LOGIC: ADD MEMBER TO DRAFT ---
  const handleAddMember = () => {
    if (!tempMember) return;
    const alreadyAdded = selectedFriends.find(f => f.username === tempMember);
    if (alreadyAdded) {
      alert(`@${tempMember} is already added!`);
      setTempMember("");
      return;
    }

    if (splitType === 'manual') {
      if (!tempAmount || parseFloat(tempAmount) <= 0) return alert("Enter amount for this member.");
      setSelectedFriends([...selectedFriends, { username: tempMember, amount: tempAmount }]);
      setTempAmount("");
    } else {
      setSelectedFriends([...selectedFriends, { username: tempMember, amount: '' }]);
    }
    setTempMember("");
  };

  const removeFriend = (name) => {
    setSelectedFriends(selectedFriends.filter(f => f.username !== name));
  };

  const modalLeftover = useMemo(() => {
    if (!targetSplit) return "0.00";
    const gross = parseFloat(targetSplit.totalAmount) || 0;
    const sum = targetSplit.members.reduce((acc, m) => {
      const val = manualDrafts[m.username] !== undefined ? manualDrafts[m.username] : m.amount;
      return acc + (parseFloat(val) || 0);
    }, 0);
    return (gross - sum).toFixed(2);
  }, [targetSplit, manualDrafts]);

  const payerShare = useMemo(() => {
    const gross = parseFloat(totalAmount) || 0;
    const friendsSum = selectedFriends.reduce((acc, f) => acc + (parseFloat(f.amount) || 0), 0);
    return (gross - friendsSum).toFixed(2);
  }, [totalAmount, selectedFriends]);

  const getHistory = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`${API}/history?roomId=${activeRoom.id}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      setSplitRecords(Array.isArray(data) ? data : []);
      if (targetSplit) {
        const updated = data.find(s => s.id === targetSplit.id);
        if (updated) setTargetSplit(updated);
      }
    } catch (err) { setSplitRecords([]); } finally { setIsRefreshing(false); }
  };

  const handleDeleteSplit = async (id) => {
    if (!window.confirm("Permanent Delete: Are you sure?")) return;
    try {
      const res = await fetch(`${API}/delete-split/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if (res.ok) getHistory();
      else alert("Delete failed on server.");
    } catch (err) { alert("Network error during delete."); }
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API}/summary?currentUsername=${user.username}&roomId=${activeRoom.id}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      setSummaryData(data);
      setShowSummaryModal(true);
    } catch (err) { alert("Failed to load room summary"); }
  };

  const handleSettleDebt = async (targetUsername) => {
    try {
      const res = await fetch(`${API}/settle-debt`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ roomId: activeRoom.id, currentUsername: user.username, targetUsername: targetUsername })
      });
      if (res.ok) {
        alert(`Settled all debts with ${targetUsername}!`);
        fetchSummary();
        getHistory(); 
      }
    } catch (err) { alert("Settlement error"); }
  };

  useEffect(() => { if (activeRoom?.id) getHistory(); }, [activeRoom.id]);

  const handleUpdateAmount = async (targetUsername, newVal, splitId) => {
    if (newVal === "" || isNaN(newVal)) return;
    try {
      const res = await fetch(`${API}/update-amount`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ splitId, targetUsername, newAmount: newVal })
      });
      if (res.status === 403) { setShowRevertModal(true); return; }
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setManualDrafts({});
      getHistory();
    } catch (err) {
      setErrorId(targetUsername);
      setTimeout(() => setErrorId(null), 500);
      alert(err.message);
    }
  };

  const handleBulkSaveManual = async () => {
    if (parseFloat(modalLeftover) !== 0) {
      return alert(`Cannot save! Total sum must match the gross amount. Leftover: ${modalLeftover}`);
    }
    const updates = targetSplit.members.map(m => ({
      username: m.username,
      amount: manualDrafts[m.username] !== undefined ? manualDrafts[m.username] : m.amount
    }));

    try {
      const res = await fetch(`${API}/bulk-update-manual`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ splitId: targetSplit.id, updates })
      });
      if (res.ok) {
        alert("Manual changes saved successfully!");
        setManualDrafts({});
        getHistory();
      } else {
        const d = await res.json();
        alert(d.message);
      }
    } catch (err) { alert("Save failed"); }
  };

  const handleRevertAll = async () => {
    try {
      const res = await fetch(`${API}/revert-split`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ splitId: targetSplit.id })
      });
      if (res.ok) { setShowRevertModal(false); getHistory(); }
    } catch (err) { alert("Revert failed"); }
  };

  const handleToggleStatus = async (username, currentStatus, split) => {
    if (user.username !== split.paidBy) return alert("Only the Payer can confirm payments.");
    const nextStatus = currentStatus === 'pending' ? 'paid' : 'pending';
    try {
      await fetch(`${API}/toggle-status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ splitId: split.id, username, status: nextStatus })
      });
      getHistory();
    } catch (err) { alert("Update failed"); }
  };

  const handleCreateSplit = async () => {
    const gross = parseFloat(totalAmount);
    if (!gross || !splitName || selectedFriends.length === 0) return alert("Fill all details.");

    if (parseFloat(payerShare) < 0) {
       return alert("Wait! Total shares exceed the bill amount. The Payer's share cannot be negative.");
    }

    let finalShares = splitType === "equal" 
      ? selectedFriends.map(f => ({ ...f, amount: (gross / (selectedFriends.length + 1)).toFixed(2) }))
      : selectedFriends.map(f => ({ ...f, amount: parseFloat(f.amount || 0).toFixed(2) }));

    try {
      const res = await fetch(`${API}/finalize-split`, { 
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          description: splitName, totalAmount: gross,
          paidBy: user.username, roomId: activeRoom.id, friends: finalShares,
          splitType: splitType
        })
      });
      if (res.ok) { 
          setTotalAmount(""); setSplitName(""); setSelectedFriends([]); getHistory(); 
      } else {
          const d = await res.json();
          alert(d.message || "Failed to finalize split.");
      }
    } catch (err) { alert("Sync failed."); }
  };

  const handleJoinConfirm = async () => {
    try {
      const res = await fetch(`${API}/join-split`, { 
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ splitId: targetSplit.id, username: user.username, amount: 0 })
      });
      if (res.ok) { setShowJoinModal(false); getHistory(); }
    } catch (err) { alert("Join failed."); }
  };

  return (
    <div className="split-page-main">
      <div className="split-manager-container">
        <div className="manager-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div className="brand-stack">
            <button className="btn-yellow-outline" onClick={onBack}><ChevronLeft size={18}/> BACK TO LOBBY</button>
            <div style={{marginTop: '10px'}}>
               <h1 className="yellow-title" style={{marginBottom: '2px'}}>{activeRoom.roomName}</h1>
               <small style={{color: '#888', textTransform: 'uppercase', letterSpacing: '1px'}}>
                 Created by: @{activeRoom.createdBy || 'Unknown'}
               </small>
            </div>
          </div>
          <div className="header-utility" style={{display:'flex', gap: '12px', alignItems: 'center'}}>
            <button className="btn-yellow-solid" style={{padding: '8px 16px', fontSize: '12px', width:'auto'}} onClick={fetchSummary}>
              <PieChart size={16} style={{marginRight: '6px'}}/> VIEW SUMMARY
            </button>
            <button className="btn-yellow-outline" style={{padding: '8px 12px', fontSize: '12px', width:'auto'}} onClick={handleDownload}>
              <Download size={16} /> DOWNLOAD
            </button>
            <div className="member-count-badge"><Users size={16} /> {activeRoom.members.length} Members</div>
          </div>
        </div>

        <div className="split-main-grid">
          <div className="expense-form-card">
            <div className="card-header-row">
              <h3><DollarSign size={20}/> NEW SPLIT</h3>
              <div className="type-toggle-v3">
                <button className={splitType==='equal'?'active':''} onClick={()=>setSplitType('equal')}>EQUAL</button>
                <button className={splitType==='manual'?'active':''} onClick={()=>setSplitType('manual')}>MANUAL</button>
              </div>
            </div>
            <div className="input-group-v3"><label>DESCRIPTION</label><input className="split-input-v3" value={splitName} onChange={(e)=>setSplitName(e.target.value)} placeholder="Dinner, Rent, Movie..." /></div>
            <div className="input-group-v3"><label>TOTAL GROSS AMOUNT ($)</label><input type="number" className="split-input-v3" value={totalAmount} onChange={(e)=>setTotalAmount(e.target.value)} placeholder="0.00" /></div>
            
            {/* TRIGGER FOR MANAGE MODAL */}
            <button className="btn-yellow-outline full-w spacing-v" onClick={() => setShowManageModal(true)}>
              <PlusCircle size={16} style={{marginRight:'8px'}}/> 
              {selectedFriends.length > 0 ? `MANAGE PARTICIPANTS (${selectedFriends.length})` : "ADD MEMBERS TO SPLIT"}
            </button>

            <div className="payer-info-box"><small> SHARE ({user.username})</small><strong>${payerShare}</strong></div>
            <button className="btn-yellow-solid spacing-v" onClick={handleCreateSplit}>CONFIRM SPLIT</button>
          </div>

          <div className="history-list-card">
            <div className="card-header-row">
              <h3><History size={20}/> TRANSACTION LOG</h3>
              <RefreshCw size={18} className={`refresh-icon cursor-p ${isRefreshing ? 'spin' : ''}`} onClick={getHistory}/>
            </div>
            <div className="history-table-wrapper">
              <table className="history-table-v3">
                <thead><tr><th>DESCRIPTION</th><th>TYPE</th><th>PAID BY</th><th>TOTAL</th><th>ACTION</th></tr></thead>
                <tbody>
                  {splitRecords.length > 0 ? splitRecords.map(rec => {
                    const isMember = rec.members?.some(m => m.username === user.username) || rec.paidBy === user.username;
                    return (
                      <tr key={rec.id}>
                        <td className="yellow-bold cursor-p" onClick={() => {setTargetSplit(rec); setManualDrafts({}); setShowJoinModal(true);}}>{rec.description}</td>
                        <td style={{fontSize:'10px', textTransform: 'uppercase'}}>{rec.splitType || 'equal'}</td>
                        <td>@{rec.paidBy}</td>
                        <td className="yellow-text">${rec.totalAmount}</td>
                        <td>
                          <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                            <button className="btn-yellow-mini" onClick={() => {setTargetSplit(rec); setManualDrafts({}); setShowJoinModal(true);}}>
                              {isMember ? "DETAILS" : "JOIN"}
                            </button>
                            {rec.paidBy === user.username && (
                              <Trash2 size={18} className="cursor-p" style={{color: '#ff4444'}} onClick={() => handleDeleteSplit(rec.id)} />
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }) : <tr><td colSpan="5" style={{textAlign:'center', padding:'20px', color:'#555'}}>No activity in this room.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* --- MANAGE PARTICIPANTS MODAL --- */}
      {showManageModal && (
        <div className="split-modal-overlay">
          <div className="split-modal-box">
            <div className="modal-top card-header-row">
              <h3 className="yellow-text">{splitType.toUpperCase()} SPLIT SELECTION</h3>
              <X className="cursor-p" onClick={() => setShowManageModal(false)} size={24} />
            </div>

            <div className="spacing-v">
              <label className="input-group-v3">SELECT MEMBER FROM ROOM</label>
              <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                <select className="split-input-v3" style={{flex: 1, padding: '10px'}} value={tempMember} onChange={(e)=>setTempMember(e.target.value)}>
                  <option value="">-- Choose Name --</option>
                  {activeRoom.members.filter(m => m !== user.username).map(m => (
                    <option key={m} value={m}>@{m}</option>
                  ))}
                </select>
                {splitType === 'manual' && (
                  <input type="number" className="split-input-v3" style={{width: '100px', padding: '10px'}} placeholder="Amount" value={tempAmount} onChange={(e)=>setTempAmount(e.target.value)} />
                )}
                <button className="btn-yellow-mini" style={{padding:'0 15px'}} onClick={handleAddMember}>ADD</button>
              </div>
            </div>

            <div className="member-detail-list">
              <small style={{color: '#666', marginBottom: '10px', display: 'block'}}>LIST OF MEMBERS ADDED</small>
              {selectedFriends.map((f, i) => (
                <div key={i} className="detail-row-static split-chip">
                  <span>@{f.username}</span>
                  <span className="yellow-text">{splitType === 'manual' ? `$${f.amount}` : "Equal Share"}</span>
                  <Trash2 size={16} className="cursor-p" style={{color: '#ff4444', justifySelf: 'end'}} onClick={() => removeFriend(f.username)} />
                </div>
              ))}
            </div>
            <button className="btn-yellow-solid full-w spacing-v" onClick={() => setShowManageModal(false)}>FINALIZE SELECTION</button>
          </div>
        </div>
      )}

      {showJoinModal && targetSplit && (
        <div className="split-modal-overlay">
          <div className="split-modal-box">
            <div className="modal-top card-header-row">
              <h3 className="yellow-text">{targetSplit.description}</h3>
              <X className="cursor-p" onClick={() => setShowJoinModal(false)} size={24} />
            </div>
            
            <div className="modal-info-summary" style={{display:'flex', justifyContent:'space-between', background:'#111', padding:'10px', borderRadius:'8px', marginBottom:'15px'}}>
                <span>TOTAL: ${targetSplit.totalAmount}</span>
                <span style={{color: parseFloat(modalLeftover) === 0 ? '#00ff88' : '#ff4444', fontWeight:'bold'}}>
                    {parseFloat(modalLeftover) >= 0 ? 'REMAINING: ' : 'OVER LIMIT: '}${Math.abs(modalLeftover)}
                </span>
            </div>

            <div className="member-detail-list spacing-v">
              {targetSplit.members?.map((m) => (
                <div key={m.username} className={`detail-row-static ${errorId === m.username ? 'vibrate-error' : ''}`}>
                  <div className="name-col">
                      <span className={m.username === user.username ? "yellow-text" : ""}>@{m.username}</span>
                      {targetSplit.splitType === 'equal' && m.isLocked && <small className="lock-tag" style={{color: '#e0c600', marginLeft: '5px'}}> (LOCKED)</small>}
                      {m.username === targetSplit.paidBy && <small className="payer-tag">PAYER</small>}
                  </div>
                  <div className="edit-input-wrapper-v4">
                    <input 
                      className="dynamic-share-input" 
                      value={manualDrafts[m.username] !== undefined ? manualDrafts[m.username] : parseFloat(m.amount).toFixed(2)} 
                      onChange={(e) => setManualDrafts({...manualDrafts, [m.username]: e.target.value})}
                      onBlur={(e) => {
                        if(targetSplit.splitType === 'equal') {
                           handleUpdateAmount(m.username, e.target.value, targetSplit.id);
                        }
                      }}
                    />
                  </div>
                  <span className={`status-pill ${m.status} ${user.username === targetSplit.paidBy ? 'clickable' : ''}`} onClick={() => handleToggleStatus(m.username, m.status, targetSplit)}>{m.status}</span>
                </div>
              ))}
            </div>

            {targetSplit.splitType === 'manual' && (
                <button className="btn-yellow-solid full-w spacing-v" onClick={handleBulkSaveManual}>
                    <Save size={18} style={{marginRight:'8px'}}/> SAVE MANUAL CHANGES
                </button>
            )}

            {!targetSplit.members?.some(m => m.username === user.username) && (
                <button className="btn-yellow-solid full-w spacing-v" onClick={handleJoinConfirm}>JOIN THIS SPLIT</button>
            )}
          </div>
        </div>
      )}

      {showRevertModal && (
  <div className="split-modal-overlay">
    <div className="revert-modal-v4">
      <div className="revert-icon-circle">
        <AlertTriangle size={32} color="#000" />
      </div>
      
      <h2 className="revert-title">ALL SHARES ARE LOCKED</h2>
      
      <p className="revert-desc">
        To change this value, you must <strong>Reset All Manual Locks</strong>. 
        This will return the split to equal distribution.
      </p>

      <div className="revert-actions">
        <button className="btn-revert-confirm" onClick={handleRevertAll}>
          <RotateCcw size={18}/> RESET ALL LOCKS
        </button>
        <button className="btn-revert-cancel" onClick={() => setShowRevertModal(false)}>
          KEEP CURRENT
        </button>
      </div>
    </div>
  </div>
)}

      {showSummaryModal && (
        <div className="split-modal-overlay">
          <div className="split-modal-box" style={{maxWidth: '600px'}}>
            <div className="modal-top card-header-row">
              <h3 className="yellow-text">ROOM DEBT SUMMARY</h3>
              <X className="cursor-p" onClick={() => setShowSummaryModal(false)} size={24} />
            </div>
            <div className="summary-list-v3">
                <table className="history-table-v3">
                  <thead><tr><th>FRIEND</th><th>OWES YOU</th><th>YOU OWE</th><th>ACTION</th></tr></thead>
                  <tbody>
                    {summaryData.map((item, idx) => (
                      <tr key={idx}>
                        <td className="yellow-bold">@{item.username}</td>
                        <td style={{color: parseFloat(item.oweToYou) > 0 ? '#00ff88' : ''}}>${item.oweToYou}</td>
                        <td style={{color: parseFloat(item.youOweThem) > 0 ? '#ff4444' : ''}}>${item.youOweThem}</td>
                        <td>{parseFloat(item.oweToYou) > 0 && <button className="btn-yellow-mini" style={{background: '#00ff88', color: '#000'}} onClick={() => handleSettleDebt(item.username)}><Banknote size={14}/> SETTLE</button>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
            <button className="btn-yellow-solid full-w spacing-v" onClick={() => setShowSummaryModal(false)}>CLOSE</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomSplitManager;