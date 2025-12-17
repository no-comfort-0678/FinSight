import React from 'react';
import './notifs.css';

function Notifs({ user }) {
  return (
    <div className="notifs-container">
      <div className="notifs-header">
        <h1>Notifications and Reminders</h1>
        <p className="welcome-text">
          Welcome back, <span className="username-highlight">{user?.username}</span>
        </p>
      </div>
    </div>
  );
}

export default Notifs;