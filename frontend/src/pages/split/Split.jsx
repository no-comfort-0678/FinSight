/**
 * Comments: Clean Lobby focused on Room Management.
 * Logic: Removed global summary to focus on room navigation.
 * All debt calculations are now handled inside RoomSplitManager.
 */
import React, { useState, useEffect, useCallback } from "react";
import { 
  Users, Plus, Trash2, Zap, X, RefreshCw, 
  UserPlus, ArrowUpRight, TrendingUp
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

  const fetchRooms = useCallback(async () => {
    if (!user?.username) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/rooms?username=${user.username}`);
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
    if (tempMembers.length === 0) return alert("Please add members.");

    const payload = {
      roomName: roomName.trim(),
      members: [...tempMembers, user.username],
      ownerId: user.id
    };

    try {
      setLoading(true);
      const res = await fetch(`${API}/create-room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowRoomModal(false);
        setRoomName("");
        setTempMembers([]);
        await fetchRooms();
      }
    } catch (err) {
      alert("Network Error.");
    } finally {
      setLoading(false);
    }
  };

  const deleteRoom = async (roomId) => {
    if(!window.confirm("Are you sure?")) return;
    try {
      const res = await fetch(`${API}/delete-room/${roomId}`, { method: 'DELETE' });
      if(res.ok) setRooms(prev => prev.filter(r => r.id !== roomId));
    } catch (err) { alert("Delete failed."); }
  };

  useEffect(() => { fetchRooms(); }, [fetchRooms]);

  if (!user) return null;

  if (activeRoom) {
    return (
      <RoomSplitManager 
        activeRoom={activeRoom} 
        user={user} 
        onBack={() => {
          setActiveRoom(null);
          fetchRooms(); 
        }} 
      />
    );
  }

  return (
    <div className="split-page-main">
      <div className="split-card-container">
        <div className="split-top-bar">
          <div className="brand-stack">
            <h1 className="yellow-title">FINSIGHT SPLIT <Zap size={24} style={{fill:'rgb(224, 198, 0)'}}/></h1>
            <p className="subtitle-text">Collective expense management (PostgreSQL)</p>
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
            <div className="no-rooms-msg">
              <Users size={48} className="fade-icon"/>
              <p>No active rooms found.</p>
            </div>
          ) : (
            <table className="split-table-ui">
              <thead>
                <tr>
                  <th>Room Name</th>
                  <th>Participants</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(room => (
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
                    <td><span className="active-status-pill">Active</span></td>
                    <td>
                      <div className="table-actions">
                        <button className="table-enter-btn" onClick={() => setActiveRoom(room)}>
                          ENTER ROOM <ArrowUpRight size={14}/>
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

      {showRoomModal && (
        <div className="split-modal-overlay">
          <div className="split-modal-box">
            <div className="modal-top">
              <h3><UserPlus size={20}/> Initialize Group</h3>
              <X className="close-btn" onClick={() => setShowRoomModal(false)} />
            </div>
            <div className="modal-content">
              <div className="field-group">
                <label className="split-label">Group Identity (Name)</label>
                <input className="split-input-field" value={roomName} onChange={(e)=>setRoomName(e.target.value)} placeholder="e.g. Vacation 2026" />
              </div>
              <div className="field-group">
                <label className="split-label">Add Member Username</label>
                <div className="flex-row">
                  <input className="split-input-field" value={newMember} onChange={(e)=>setNewMember(e.target.value)} placeholder="Username" />
                  <button className="btn-add-square" onClick={() => {
                    if(newMember.trim()){
                      setTempMembers([...tempMembers, newMember.trim()]);
                      setNewMember("");
                    }
                  }}><Plus/></button>
                </div>
              </div>
              <div className="split-chip-container">
                <span className="split-chip owner">@{user.username} (You)</span>
                {tempMembers.map((m, i) => (
                  <span key={i} className="split-chip">
                    @{m} <X size={12} className="remove-chip" onClick={() => setTempMembers(tempMembers.filter((_, idx) => idx !== i))}/>
                  </span>
                ))}
              </div>
              <button className="btn-finalize-room" onClick={handleCreateRoom} disabled={loading}>
                {loading ? "Allocating Database Row..." : "LAUNCH GROUP"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Split;