/**
 * Comments: Clean Lobby with Multi-User Invitation Modal.
 * Logic: Invitation system mirrors the Room Creator UI for consistency.
 * Rules: Providing the whole code after changes [2026-03-08].
 */
import React, { useState, useEffect, useCallback } from "react";
import { 
  Users, Plus, Trash2, Zap, X, RefreshCw, 
  UserPlus, ArrowUpRight, TrendingUp, Hash, Send, UserCheck
} from "lucide-react";
import { useAuth } from "../../context/AuthContext"; 
import RoomSplitManager from "./RoomSplitManager"; 
import "./split.css";

const API = "http://localhost:5000/split";

const Split = () => {
  const { user } = useAuth(); 
  
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null); 
  const [roomName, setRoomName] = useState("");
  const [newMember, setNewMember] = useState("");
  const [tempMembers, setTempMembers] = useState([]);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // --- INVITATION MODAL STATES ---
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteRoom, setInviteRoom] = useState(null);
  const [inviteeInput, setInviteeInput] = useState("");
  const [inviteList, setInviteList] = useState([]);

  const fetchRooms = useCallback(async () => {
    if (!user?.username) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/rooms?username=${user.username}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      setRooms(data);
    } catch (err) {
      setError("Sync Error: Could not reach Database.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const handleCreateRoom = async () => {
    if (!roomName.trim()) return alert("Please enter a Group Name.");
    const payload = {
      roomName: roomName.trim(),
      members: [...tempMembers, user.username],
      ownerId: user.id,
      createdBy: user.username 
    };
    try {
      setLoading(true);
      const res = await fetch(`${API}/create-room`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowRoomModal(false);
        setRoomName("");
        setTempMembers([]);
        await fetchRooms();
      }
    } catch (err) { alert("Network Error."); } finally { setLoading(false); }
  };

  // --- MULTI-INVITE LOGIC ---
  const handleSendBatchInvites = async () => {
    if (inviteList.length === 0) return alert("Add at least one user.");
    setLoading(true);
    try {
      const res = await fetch(`${API}/invite-batch`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          targetUsernames: inviteList,
          roomId: inviteRoom.id,
          roomName: inviteRoom.roomName,
          senderName: user.username
        })
      });

      const data = await res.json();

      if (res.status === 404) {
        alert(`Error: User "${data.missingUser}" does not exist!`);
      } else if (res.ok) {
        alert("All invitations sent successfully!");
        setShowInviteModal(false);
        setInviteList([]);
      }
    } catch (err) {
      alert("System Error during invitation.");
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (roomId) => {
    if(!window.confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API}/delete-room/${roomId}`, { 
        method: 'DELETE',
        headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
      });
      if(res.ok) setRooms(prev => prev.filter(r => r.id !== roomId));
    } catch (err) { alert("Delete failed."); }
  };

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  if (!user) return null;

  if (activeRoom) {
    return <RoomSplitManager activeRoom={activeRoom} user={user} onBack={() => { setActiveRoom(null); fetchRooms(); }} />;
  }

  return (
    <div className="split-page-main">
      <div className="split-card-container">
        <div className="split-top-bar">
          <div className="brand-stack">
            <h1 className="yellow-title">FINSIGHT SPLIT <Zap size={24} style={{fill:'rgb(224, 198, 0)'}}/></h1>
            <p className="subtitle-text">Welcome {user.username} </p>
          </div>
          <div className="split-actions">
            <button title="Refresh Sync" className="icon-btn-sync" onClick={fetchRooms}>
              <RefreshCw size={18} className={loading ? "spin" : ""}/>
            </button>
            <button className="btn-create-new" onClick={() => setShowRoomModal(true)}>
              <Plus size={18} /> NEW ROOM
            </button>
          </div>
        </div>

        <div className="room-display-area">
          {rooms.length === 0 && !loading ? (
            <div className="no-rooms-msg"><Users size={48} className="fade-icon"/><p>No active rooms found.</p></div>
          ) : (
    <table className="split-table-ui">
  <thead>
    <tr>
      <th style={{ width: "40%" }}>Room Name</th>
      <th style={{ width: "25%" }}>Participants</th>
      <th style={{ width: "35%", textAlign: "right" }}>Actions</th>
    </tr>
  </thead>
  <tbody>
    {Array.isArray(rooms) && rooms.map(room => (
      <tr key={room.id}>
        <td className="room-name-bold" onClick={() => setActiveRoom(room)}>
          <div className="name-wrapper"><TrendingUp size={14} className="trend-icon"/>{room.roomName}</div>
        </td>
        <td>
          <div className="member-dropdown-container">
            <span className="member-trigger">
              <Users size={14} style={{marginRight:'8px'}}/>
              {room.members.length} Members
            </span>
            <div className="member-dropdown-content">
              {room.members.map((m, idx) => (
                <div key={idx} className="dropdown-member-item"><span className="user-dot"></span> @{m}</div>
              ))}
            </div>
          </div>
        </td>
        <td>
          <div className="table-actions">
            <button className="invite-friends-btn" onClick={() => { setInviteRoom(room); setShowInviteModal(true); }}>
               <UserPlus size={14}/> ADD
            </button>
            <button className="table-enter-btn" onClick={() => setActiveRoom(room)}>
              ENTER <ArrowUpRight size={14}/>
            </button>
            <button className="delete-room-btn" onClick={() => deleteRoom(room.id)}>
              <Trash2 size={16}/>
            </button>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>
          )}
        </div>
      </div>

      {/* --- INITIALIZE GROUP MODAL --- */}
      {showRoomModal && (
        <div className="split-modal-overlay">
          <div className="split-modal-box" style={{maxWidth: '500px'}}>
            <div className="modal-top card-header-row">
              <h3 className="yellow-text"><UserPlus size={20} style={{marginRight: '10px'}}/> INITIALIZE GROUP</h3>
              <X className="cursor-p" onClick={() => setShowRoomModal(false)} size={24} />
            </div>
            <div className="modal-content spacing-v">
              <div className="input-group-v3">
                <label><Hash size={12} /> GROUP IDENTITY (NAME)</label>
                <input className="split-input-v3" value={roomName} onChange={(e)=>setRoomName(e.target.value)} placeholder="e.g. Vacation 2026" />
              </div>
              <div className="input-group-v3">
                <label>ADD MEMBER USERNAME</label>
                <div style={{display: 'flex', gap: '10px'}}>
                  <input className="split-input-v3" value={newMember} onChange={(e)=>setNewMember(e.target.value)} placeholder="Search username..." />
                  <button className="btn-yellow-mini" style={{height: '50px', width: '50px'}} onClick={() => { if(newMember.trim()){ setTempMembers([...tempMembers, newMember.trim()]); setNewMember(""); } }}><Plus size={24}/></button>
                </div>
              </div>
              <div className="summary-list-v3">
                <div className="split-chip-container">
                  <span className="split-chip" style={{background: 'rgba(224, 198, 0, 0.1)', border: '1px solid rgba(224, 198, 0, 0.3)', color: '#e0c600'}}>
                    @{user.username} <small>(OWNER)</small>
                  </span>
                  {tempMembers.map((m, i) => (
                    <span key={i} className="split-chip">@{m} <X size={14} className="cursor-p" style={{color: '#ff4444'}} onClick={() => setTempMembers(tempMembers.filter((_, idx) => idx !== i))}/></span>
                  ))}
                </div>
              </div>
              <button className="btn-yellow-solid" onClick={handleCreateRoom} disabled={loading}>{loading ? "PROCESSING..." : "LAUNCH GROUP"}</button>
            </div>
          </div>
        </div>
      )}

      {/* --- INVITATION MODAL (THE NEW ADDITION) --- */}
      {showInviteModal && (
        <div className="split-modal-overlay">
          <div className="split-modal-box" style={{maxWidth: '500px'}}>
            <div className="modal-top card-header-row">
              <h3 className="yellow-text"><Send size={20} style={{marginRight: '10px'}}/> INVITE FRIENDS</h3>
              <X className="cursor-p" onClick={() => { setShowInviteModal(false); setInviteList([]); }} size={24} />
            </div>
            <div className="modal-content spacing-v">
              <p style={{fontSize: '0.8rem', color: '#888'}}>Inviting to: <strong>{inviteRoom?.roomName}</strong></p>
              
              <div className="input-group-v3">
                <label>SEARCH BY USERNAME</label>
                <div style={{display: 'flex', gap: '10px'}}>
                  <input 
                    className="split-input-v3" 
                    value={inviteeInput} 
                    onChange={(e)=>setInviteeInput(e.target.value)} 
                    placeholder="Type username..." 
                  />
                  <button className="btn-yellow-mini" style={{height: '50px', width: '50px'}} onClick={() => {
                    if(inviteeInput.trim()){
                      setInviteList([...inviteList, inviteeInput.trim()]);
                      setInviteeInput("");
                    }
                  }}>
                    <Plus size={24}/>
                  </button>
                </div>
              </div>

              <div className="summary-list-v3" style={{minHeight: '120px'}}>
                <small style={{color: '#666', fontSize: '0.65rem', textTransform: 'uppercase'}}>Pending Invites</small>
                <div className="split-chip-container" style={{marginTop: '10px'}}>
                  {inviteList.length === 0 && <p style={{color: '#bbb', fontSize: '0.8rem'}}>No users added yet.</p>}
                  {inviteList.map((m, i) => (
                    <span key={i} className="split-chip">
                      @{m} 
                      <X size={14} className="cursor-p" style={{color: '#ff4444'}} onClick={() => setInviteList(inviteList.filter((_, idx) => idx !== i))}/>
                    </span>
                  ))}
                </div>
              </div>

              <button className="btn-yellow-solid" onClick={handleSendBatchInvites} disabled={loading}>
                {loading ? "CHECKING USERS..." : "SEND ALL INVITES"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Split;