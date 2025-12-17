import React from 'react';
import './transaction.css';

function Transaction({ user }) {
  return (
    <div className="transaction-container">
      <div className="transaction-header">
        <h1>Transactions</h1>
        <p className="welcome-text">
          Welcome back, <span className="username-highlight">{user?.username}</span>
        </p>
      </div>
    </div>
  );
}

export default Transaction;