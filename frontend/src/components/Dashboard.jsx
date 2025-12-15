import React from 'react';
import './dash.css';

function Dashboard({ user }) {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Overview</h1>
        <p className="welcome-text">
          Welcome back, <span className="username-highlight">{user?.username}</span>
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Balance</h3>
          <h2>₹0.00</h2>
        </div>
        
        <div className="stat-card">
          <h3>Income</h3>
          <h2 className="income-text">₹0.00</h2>
        </div>
        
        <div className="stat-card">
          <h3>Expenses</h3>
          <h2 className="expense-text">₹0.00</h2>
        </div>
      </div>

      <div className="main-content">
        <h3 className="section-title">Recent Activity</h3>
        <div className="placeholder-box">
          <p>No transactions found.</p>
          <button className="add-btn">Add First Expense</button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;