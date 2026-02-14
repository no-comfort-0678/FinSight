import React, { useState, useEffect } from "react";
import "./notifs.css";
import { useAuth } from "../../context/AuthContext";
function Notifs() {
  const [activeTab, setActiveTab] = useState("reminders");
  const [filter, setFilter] = useState("monthly");
  const [editingId, setEditingId] = useState(null);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
    amount: "",
  });

  const [reminders, setReminders] = useState([
    {
      id: 1,
      title: "Electricity Bill",
      date: "2025-01-20",
      time: "18:00",
      amount: 1200,
      notified: false,
    },
  ]);

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      reminders.forEach((r) => {
        const reminderTime = new Date(`${r.date}T${r.time}`);

        if (now > reminderTime && !r.notified) {
          setNotifications((prev) => [
            {
              id: Date.now(),
              createdAt: new Date(),
              text: `Reminder missed: ${r.title} (₹${r.amount})`,
              unread: true,
              type: "monthly",
            },
            ...prev,
          ]);

          setReminders((prev) =>
            prev.map((item) =>
              item.id === r.id ? { ...item, notified: true } : item
            )
          );
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [reminders]);

  const isWithinLastMonth = (notifDate) => {
    const now = new Date();
    const oneMonthInMs = 30 * 24 * 60 * 60 * 1000;
    return (now - new Date(notifDate)) < oneMonthInMs;
  };

  const removeNotif = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.date || !formData.time) return;

    if (editingId) {
      setReminders((prev) =>
        prev.map((r) =>
          r.id === editingId ? { ...r, ...formData, notified: false } : r
        )
      );
    } else {
      setReminders((prev) => [
        { id: Date.now(), ...formData, notified: false },
        ...prev,
      ]);
    }

    setFormData({ title: "", date: "", time: "", amount: "" });
    setEditingId(null);
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

  return (
    <div className="notifs-container">
      <div id="notifs-box">
        <div className="tab-header">
          <h2 className={activeTab === "reminders" ? "active" : ""} onClick={() => setActiveTab("reminders")}>
            Reminders
          </h2>
          <h2 className={activeTab === "notifications" ? "active" : ""} onClick={() => setActiveTab("notifications")}>
            Notifications
          </h2>
        </div>

        <div id="content-area">
          {activeTab === "reminders" && (
            <>
              <div className="notifs-row">
                <span className="notifs-label">Title</span>
                <div className="notifs-input">
                  <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                </div>
              </div>
              <div className="notifs-row">
                <span className="notifs-label">Date</span>
                <div className="notifs-input">
                  <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                </div>
              </div>
              <div className="notifs-row">
                <span className="notifs-label">Time</span>
                <div className="notifs-input">
                  <input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
                </div>
              </div>
              <div className="notifs-row">
                <span className="notifs-label">Amount</span>
                <div className="notifs-input">
                  <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                </div>
              </div>

              <button id="submit-btn" onClick={handleSubmit}>
                {editingId ? "Update Reminder" : "Add Reminder"}
              </button>

              <hr className="divider" />

              <div className="list-container">
                {reminders.map((r) => (
                  <div className="list-item" key={r.id}>
                    <div>
                      <strong>{r.title}</strong>
                      <small>{r.date} • {r.time}</small>
                    </div>
                    <div className="item-right">
                      <span className="item-amount">₹{r.amount}</span>
                      <button className="edit-action-btn" onClick={() => handleEdit(r)}>Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "notifications" && (
            <>
              <div className="filter-bar">
                <button className={filter === "monthly" ? "btn-active" : ""} onClick={() => setFilter("monthly")}>Monthly</button>
                <button className={filter === "lifetime" ? "btn-active" : ""} onClick={() => setFilter("lifetime")}>Lifetime</button>
              </div>

              <div className="list-container">
                {notifications
                  .filter((n) => {
                    if (filter === "lifetime") return true;
                    return n.type === "monthly" && isWithinLastMonth(n.createdAt);
                  })
                  .map((n) => (
                    <div
                      key={n.id}
                      className={`list-item clickable-notif ${n.unread ? "unread" : ""}`}
                      onClick={() => removeNotif(n.id)}
                      title="Click to dismiss"
                    >
                      {n.text}
                    </div>
                  ))}
                {notifications.length === 0 && <p className="empty-msg">No notifications available.</p>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Notifs;