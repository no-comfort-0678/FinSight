import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './logsignin.css';

function Login({ setUser }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        navigate('/home'); 
      } else {
        alert(data.message);
        
        if (response.status === 404) {
            navigate('/signup');
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div id="inp-box">
      <h2>Login</h2>
      <div id="info">
        <div className='row'>
          <span className='conf'>Username :</span>
          <div className="input-group">
            <input 
              type="text" 
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)} 
            />
          </div>
        </div>
        <div className='row'>
          <span className='conf'>Password :</span>
          <div className="input-group">
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>
        </div>
      </div>
      <button id='submit' onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;