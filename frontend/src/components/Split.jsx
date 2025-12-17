import React from 'react';
import './split.css';

function Split({ user }) {
  return (
    <div className="split-container">
      <div className="split-header">
        <h1>Split Expenses</h1>
        <p className="welcome-text">
          Welcome back, <span className="username-highlight">{user?.username}</span>
        </p>
      </div>
    </div>
  );
}

export default Split;