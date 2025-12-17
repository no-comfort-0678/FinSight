import React from 'react';
import './home.css';

function Home({ user }) {
  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Home</h1>
        <p className="welcome-text">
          Welcome back, <span className="username-highlight">{user?.username}</span>
        </p>
      </div>
    </div>
  );
}

export default Home;