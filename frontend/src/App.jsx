import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import './app.css';
import Login from './components/Login';
import Signup from './components/Signin';
import NotFound from './components/not';
import Dashboard from './components/Dashboard';

function App(){
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate('/login');
  };

  const isSignupPath = location.pathname === '/signup';
  let navBtnText;

  if (user) {
    navBtnText = "Logout";
  } else {
    navBtnText = isSignupPath ? "Go to Login" : "Go to Sign Up";
  }

  const handleAuthClick = () => {
    if (user) {
      handleLogout();
    } else {
      if (isSignupPath) {
        navigate('/login');
      } else {
        navigate('/signup');
      }
    }
  };

  if (isLoading) {
    return null;
  }

  return(
    <>
      <img src="/bgimg.png" alt="bg-img" id='bg-img'/>
      <nav>
        <div className="title" style={{cursor: 'pointer'}} onClick={() => navigate('/dashboard')}>
          <img src="/2.png" alt="FinSight Icon"/>
          <div id='text'>
            <h1>FinSight</h1>
            <h2>Your Personal Expense Tracker</h2>
          </div>
        </div>
        <div className="functions">
          <button>fn1</button>
          <button>fn2</button>
          <button>fn3</button>
          <button>fn4</button>
          <button>fn5</button>
        </div>
        <button id='cred' onClick={handleAuthClick}>
          {navBtnText}
        </button>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup />} />
        <Route 
          path="/dashboard" 
          element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;