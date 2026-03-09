import React, { useState, useEffect, useCallback } from "react";
import "./notifs.css";
import { useAuth } from "../../context/AuthContext";


const API_BASE = "http://localhost:5000/api/v1/reminders";


function Notifs() {
  const [activeTab, setActiveTab] = useState("reminders");
  const [filter, setFilter] = useState("monthly");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user, token } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    amount: "",
  });

  const [reminders, setReminders] = useState([]);
  const [notifications, setNotifications] = useState([]);


  // ─── Fetch reminders from backend ─────────────────────────────────────────
  const fetchReminders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch reminders");
      const data = await res.json();
      // Normalize backend fields to frontend format
      setReminders(
        data.map((r) => ({
          id: r.id,
          title: r.title,
          date: r.reminderDate,
          time: r.reminderTime,
          amount: r.amount,
          notified: r.notified,
        }))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);


  // --- NEW: FETCH ROOM NOTIFICATIONS ---
  useEffect(() => {
    const fetchMyNotifs = async () => {
      try {
        if (!user || !user.id) return;
        // Adjusted URL: removing /api if your base path is just /notifications
        const response = await fetch(`http://localhost:5000/api/notifications/personal/${user.id}`);
        const data = await response.json();
        
        const mapped = data.map(n => ({
          id: n.id,
          text: n.message,
          createdAt: n.createdAt,
          unread: !n.isRead,
          type: "lifetime" 
        }));

        setNotifications(prev => {
            // Simple filter to prevent duplicates in state during the same session
            const existingIds = new Set(prev.map(p => p.id));
            const newNotifs = mapped.filter(m => !existingIds.has(m.id));
            return [...newNotifs, ...prev];
        });
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    fetchMyNotifs();
  }, [user]);

  // --- HIS ORIGINAL REMINDER LOGIC (Untouched) ---

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  // ─── Fire notifications for past, unnotified reminders ────────────────────
  useEffect(() => {
    const interval = setInterval(async () => {
      const now = new Date();

      for (const r of reminders) {
        const reminderTime = new Date(`${r.date}T${r.time}`);
        if (now > reminderTime && !r.notified) {
          // Add to local notifications
          setNotifications((prev) => [
            {
              id: Date.now(),
              createdAt: new Date(),
              text: `Reminder: ${r.title} (₹${r.amount})`,
              unread: true,
              type: "monthly",
            },
            ...prev,
          ]);

          // Optimistically mark notified locally
          setReminders((prev) =>
            prev.map((item) =>
              item.id === r.id ? { ...item, notified: true } : item
            )
          );

          // Persist to backend
          try {
            await fetch(`${API_BASE}/${r.id}/notify`, {
              method: "PATCH",
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch (_) {
            // Silently fail — user already sees local notification
          }
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [reminders, token]);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const isWithinLastMonth = (notifDate) => {
    const now = new Date();
    const oneMonthInMs = 30 * 24 * 60 * 60 * 1000;
    return now - new Date(notifDate) < oneMonthInMs;
  };

  // --- UPDATED: REMOVE NOTIF (Syncs with DB) ---
  const removeNotif = async (id) => {
    // 1. Remove from local UI immediately
    setNotifications((prev) => prev.filter((n) => n.id !== id));

    try {
        // 2. Tell the database this is READ so it doesn't return on refresh
        // This uses the existing ID from your database results
        await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
            method: 'PATCH'
        });
    } catch (err) {
        console.error("Failed to mark as read in DB:", err);
    }
  };

  // ─── Create / Update reminder ─────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!formData.title || !formData.date || !formData.time) return;

    const payload = {
      title: formData.title,
      reminderDate: formData.date,
      reminderTime: formData.time,
      amount: formData.amount || "0",
    };

    try {
      setLoading(true);
      if (editingId) {
        const res = await fetch(`${API_BASE}/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to update reminder");
        const updated = await res.json();
        setReminders((prev) =>
          prev.map((r) =>
            r.id === editingId
              ? {
                id: updated.id,
                title: updated.title,
                date: updated.reminderDate,
                time: updated.reminderTime,
                amount: updated.amount,
                notified: updated.notified,
              }
              : r
          )
        );
      } else {
        const res = await fetch(API_BASE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to create reminder");
        const created = await res.json();
        setReminders((prev) => [
          {
            id: created.id,
            title: created.title,
            date: created.reminderDate,
            time: created.reminderTime,
            amount: created.amount,
            notified: created.notified,
          },
          ...prev,
        ]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setFormData({ title: "", date: "", time: "", amount: "" });
      setEditingId(null);
    }
  };

  // ─── Delete reminder ──────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete reminder");
      setReminders((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (reminder) => {
    setEditingId(reminder.id);
    setFormData({
      title: reminder.title,
      date: reminder.date,
      time: reminder.time,
      amount: reminder.amount,
    });
  };

  const hasUnread = notifications.some((n) => n.unread);

  return (
    <div className="notifs-container">
      <div id="notifs-box">
        <div className="tab-header">
          <h2
            className={activeTab === "reminders" ? "active" : ""}
            onClick={() => setActiveTab("reminders")}
          >
            Reminders
          </h2>
          <h2
            className={activeTab === "notifications" ? "active" : ""}
            onClick={() => setActiveTab("notifications")}
          >
            <span className="tab-with-dot">
              Notifications
              {hasUnread && <span className="unread-dot" />}
            </span>
          </h2>
        </div>

        {error && <p className="error-msg">⚠ {error}</p>}

        <div id="content-area">
          {activeTab === "reminders" && (
            <>
              <div className="notifs-row">
                <span className="notifs-label">Title</span>
                <div className="notifs-input">
                  <input
                    value={formData.title}
                    placeholder="e.g. Electricity Bill"
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="notifs-row">
                <span className="notifs-label">Date</span>
                <div className="notifs-input">
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="notifs-row">
                <span className="notifs-label">Time</span>
                <div className="notifs-input">
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="notifs-row">
                <span className="notifs-label">Amount</span>
                <div className="notifs-input">
                  <input
                    type="number"
                    placeholder="₹ 0"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                </div>
              </div>

              <button
                id="submit-btn"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : editingId
                    ? "Update Reminder"
                    : "Add Reminder"}
              </button>

              {editingId && (
                <button
                  id="cancel-btn"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ title: "", date: "", time: "", amount: "" });
                  }}
                >
                  Cancel
                </button>
              )}

              <hr className="divider" />

              {loading && reminders.length === 0 ? (
                <p className="empty-msg">Loading reminders…</p>
              ) : (
                <div className="list-container">
                  {reminders.length === 0 && (
                    <p className="empty-msg">No reminders yet. Add one above!</p>
                  )}
                  {reminders.map((r) => (
                    <div className="list-item" key={r.id}>
                      <div>
                        <strong>{r.title}</strong>
                        <small>
                          {r.date} • {r.time}
                          {r.notified && (
                            <span className="notified-badge"> ✓ Notified</span>
                          )}
                        </small>
                      </div>
                      <div className="item-right">
                        <span className="item-amount">₹{r.amount}</span>
                        <button
                          className="edit-action-btn"
                          onClick={() => handleEdit(r)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-action-btn"
                          onClick={() => handleDelete(r.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "notifications" && (
            <>
              <div className="filter-bar">
                <button
                  className={filter === "monthly" ? "btn-active" : ""}
                  onClick={() => setFilter("monthly")}
                >
                  Monthly
                </button>
                <button
                  className={filter === "lifetime" ? "btn-active" : ""}
                  onClick={() => setFilter("lifetime")}
                >
                  Lifetime
                </button>
              </div>

              <div className="list-container">
                {notifications
                  .filter((n) => {
                    if (filter === "lifetime") return true;
                    return (
                      n.type === "monthly" && isWithinLastMonth(n.createdAt)
                    );
                  })
                  .map((n) => (
                    <div
                      key={n.id}
                      className={`list-item clickable-notif ${n.unread ? "unread" : ""
                        }`}
                      onClick={() => removeNotif(n.id)}
                      title="Click to dismiss"
                    >
                      {n.text}
                    </div>
                  ))}
                {notifications.length === 0 && (
                  <p className="empty-msg">No notifications available.</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Notifs;