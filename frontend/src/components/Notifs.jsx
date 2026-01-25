import React, { useState, useEffect } from "react";
import "./notifs.css";

function Notifs() {
  const [activeTab, setActiveTab] = useState("reminders");
  const [filter, setFilter] = useState("monthly");
  const [editingId, setEditingId] = useState(null);
  const [editingSubId, setEditingSubId] = useState(null);

  // Persistence: Load from LocalStorage
  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem("reminders");
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("notifications");
    return saved ? JSON.parse(saved) : [];
  });

  const [subscriptions, setSubscriptions] = useState(() => {
    const saved = localStorage.getItem("subscriptions");
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState({ title: "", date: "", time: "", amount: "" });

  // Updated subData to include notification date
  const [subData, setSubData] = useState({
    name: "",
    amount: "",
    billingCycle: "Monthly",
    nextDate: ""
  });

  const hasUnread = notifications.some((n) => n.unread);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem("reminders", JSON.stringify(reminders));
    localStorage.setItem("notifications", JSON.stringify(notifications));
    localStorage.setItem("subscriptions", JSON.stringify(subscriptions));
  }, [reminders, notifications, subscriptions]);

  // Background check logic for both Reminders and Subscriptions
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      // Check Reminders
      reminders.forEach((r) => {
        const reminderTime = new Date(`${r.date}T${r.time}`);
        if (now > reminderTime && !r.notified) {
          triggerNotification(`Reminder: ${r.title} (₹${r.amount})`);
          setReminders(prev => prev.map(item => item.id === r.id ? { ...item, notified: true } : item));
        }
      });

      // Check Subscriptions
      subscriptions.forEach((s) => {
        const subTime = new Date(`${s.nextDate}T09:00`); // Notifies at 9 AM on the set date
        if (now > subTime && !s.notified) {
          triggerNotification(`Subscription Due: ${s.name} (₹${s.amount})`);
          setSubscriptions(prev => prev.map(item => item.id === s.id ? { ...item, notified: true } : item));
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [reminders, subscriptions]);

  const triggerNotification = (text) => {
    setNotifications((prev) => [
      { id: Date.now(), createdAt: new Date(), text, unread: true, type: "monthly" },
      ...prev,
    ]);
  };

  useEffect(() => {
    if (activeTab === "notifications") {
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    }
  }, [activeTab]);

  // Reminder Handlers
  const handleSubmit = () => {
    if (!formData.title || !formData.date || !formData.time) return;
    if (editingId) {
      setReminders(prev => prev.map(r => r.id === editingId ? { ...r, ...formData, notified: false } : r));
    } else {
      setReminders(prev => [{ id: Date.now(), ...formData, notified: false }, ...prev]);
    }
    setFormData({ title: "", date: "", time: "", amount: "" });
    setEditingId(null);
  };

  // Subscription Handlers
  const handleSubSubmit = () => {
    if (!subData.name || !subData.nextDate) return;
    if (editingSubId) {
      setSubscriptions(prev => prev.map(s => s.id === editingSubId ? { ...s, ...subData, notified: false } : s));
    } else {
      setSubscriptions(prev => [{ id: Date.now(), ...subData, notified: false }, ...prev]);
    }
    setSubData({ name: "", amount: "", billingCycle: "Monthly", nextDate: "" });
    setEditingSubId(null);
  };

  return (
    <div className="notifs-container">
      <div id="notifs-box">
        <div className="tab-header">
          <h2 className={activeTab === "reminders" ? "active" : ""} onClick={() => setActiveTab("reminders")}>Reminders</h2>
          <h2 className={activeTab === "subscriptions" ? "active" : ""} onClick={() => setActiveTab("subscriptions")}>Subs</h2>
          <h2 className={`${activeTab === "notifications" ? "active" : ""} tab-with-dot`} onClick={() => setActiveTab("notifications")}>
            Inbox {hasUnread && <span className="unread-dot"></span>}
          </h2>
        </div>

        <div id="content-area">
          {activeTab === "reminders" && (
            <>
              <div className="notifs-row"><span className="notifs-label">Title</span><div className="notifs-input"><input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} /></div></div>
              <div className="notifs-row"><span className="notifs-label">Date</span><div className="notifs-input"><input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} /></div></div>
              <div className="notifs-row"><span className="notifs-label">Time</span><div className="notifs-input"><input type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} /></div></div>
              <div className="notifs-row"><span className="notifs-label">Amount</span><div className="notifs-input"><input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} /></div></div>
              <button id="submit-btn" onClick={handleSubmit}>{editingId ? "Update" : "Add"} Reminder</button>
              <hr className="divider" />
              <div className="list-container">
                {reminders.map((r) => (
                  <div className="list-item" key={r.id}>
                    <div><strong>{r.title}</strong><br /><small>{r.date} • {r.time}</small></div>
                    <div className="item-right"><span className="item-amount">₹{r.amount}</span><button className="edit-action-btn" onClick={() => { setEditingId(r.id); setFormData(r); }}>Edit</button></div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "subscriptions" && (
            <>
              <div className="notifs-row"><span className="notifs-label">Name</span><div className="notifs-input"><input value={subData.name} onChange={(e) => setSubData({ ...subData, name: e.target.value })} /></div></div>
              <div className="notifs-row"><span className="notifs-label">Amount</span><div className="notifs-input"><input type="number" value={subData.amount} onChange={(e) => setSubData({ ...subData, amount: e.target.value })} /></div></div>
              <div className="notifs-row"><span className="notifs-label">Notify On</span><div className="notifs-input"><input type="date" value={subData.nextDate} onChange={(e) => setSubData({ ...subData, nextDate: e.target.value })} /></div></div>
              <div className="notifs-row"><span className="notifs-label">Cycle</span><div className="notifs-input"><select value={subData.billingCycle} onChange={(e) => setSubData({ ...subData, billingCycle: e.target.value })}><option value="Monthly">Monthly</option><option value="Yearly">Yearly</option></select></div></div>
              <button id="submit-btn" onClick={handleSubSubmit}>{editingSubId ? "Update" : "Add"} Subscription</button>
              <hr className="divider" />
              <div className="list-container">
                {subscriptions.map((s) => (
                  <div className="list-item" key={s.id}>
                    <div><strong>{s.name}</strong><br /><small>Next: {s.nextDate} ({s.billingCycle})</small></div>
                    <div className="item-right">
                      <span className="item-amount">₹{s.amount}</span>
                      <button className="edit-action-btn" onClick={() => { setEditingSubId(s.id); setSubData(s); }}>Edit</button>
                      <button className="edit-action-btn" style={{ borderColor: '#ff6b6b', color: '#ff6b6b' }} onClick={() => setSubscriptions(prev => prev.filter(item => item.id !== s.id))}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "notifications" && (
            <div className="list-container">
              {notifications.map((n) => (
                <div key={n.id} className={`list-item clickable-notif ${n.unread ? "unread" : ""}`} onClick={() => setNotifications(prev => prev.filter(i => i.id !== n.id))}>{n.text}</div>
              ))}
              {notifications.length === 0 && <p className="empty-msg">No notifications available.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Notifs;