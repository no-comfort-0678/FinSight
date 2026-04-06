import React, { useState, useEffect, useCallback } from "react";
import "./notifs.css";
import { useAuth } from "../../context/AuthContext";

const REMINDERS_API_BASE = "http://localhost:5000/api/v1/reminders";
const NOTIFS_API_BASE = "http://localhost:5000/api/notifications";

function Notifs() {
  const [activeTab, setActiveTab] = useState("reminders");
  const [filter, setFilter] = useState("monthly");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { token } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    amount: "",
  });

  const [reminders, setReminders] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const fetchReminders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(REMINDERS_API_BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch reminders");
      const data = await res.json();
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

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(NOTIFS_API_BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    }
  }, [token]);

  useEffect(() => {
    fetchReminders();
    fetchNotifications();
  }, [fetchReminders, fetchNotifications]);

  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      fetchNotifications();
      fetchReminders();
    }, 30000);
    return () => clearInterval(interval);
  }, [token, fetchNotifications, fetchReminders]);

  const isWithinLastMonth = (notifDate) => {
    const now = new Date();
    const oneMonthInMs = 30 * 24 * 60 * 60 * 1000;
    return now - new Date(notifDate) < oneMonthInMs;
  };

  const removeNotif = async (id) => {
    try {
      const res = await fetch(`${NOTIFS_API_BASE}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete notification");
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const markAsRead = async (id) => {
    try {
      const res = await fetch(`${NOTIFS_API_BASE}/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to mark notification as read");
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      setError(err.message);
    }
  };

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
        const res = await fetch(`${REMINDERS_API_BASE}/${editingId}`, {
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
        const res = await fetch(REMINDERS_API_BASE, {
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

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${REMINDERS_API_BASE}/${id}`, {
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

  const hasUnread = notifications.some((n) => !n.isRead);

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

        {error && <p className="error-msg">Warning: {error}</p>}

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
                    placeholder="INR 0"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                </div>
              </div>

              <button id="submit-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? "Saving..." : editingId ? "Update Reminder" : "Add Reminder"}
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
                <p className="empty-msg">Loading reminders...</p>
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
                          {r.date} | {r.time}
                          {r.notified && <span className="notified-badge"> | Notified</span>}
                        </small>
                      </div>
                      <div className="item-right">
                        <span className="item-amount">INR {r.amount}</span>
                        <button className="edit-action-btn" onClick={() => handleEdit(r)}>
                          Edit
                        </button>
                        <button className="delete-action-btn" onClick={() => handleDelete(r.id)}>
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
                    return isWithinLastMonth(n.createdAt);
                  })
                  .map((n) => (
                    <div
                      key={n.id}
                      className={`list-item clickable-notif ${!n.isRead ? "unread" : ""}`}
                      onClick={() => markAsRead(n.id)}
                      onDoubleClick={() => removeNotif(n.id)}
                      title="Click to mark read, double-click to delete"
                    >
                      {n.message}
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
