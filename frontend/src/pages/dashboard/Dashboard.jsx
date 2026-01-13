import React from 'react';
import './dashboard.css';
import {useAuth} from '../../context/AuthContext';
function Dashboard() {
  const {user} = useAuth();
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="welcome-text">
          Welcome back, <span className="username-highlight">{user?.username}</span>
        </p>
      </div>
    </div>
  );
}

export default Dashboard;