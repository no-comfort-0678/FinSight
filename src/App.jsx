import './App.css'
import{ useState } from 'react'

function App(){
  const [login, setLogin] = useState(false);

  return(
  <>
    <img src="/bgimg.png" alt="bg-img" id='bg-img'/>
    <nav>
      <a href="/" className="title">
        <img src="/2.png" alt="FinSight Icon"/>
        <div id='text'>
          <h1>FinSight</h1>
          <h2>Your Personal Expense Tracker</h2>
        </div>
      </a>
      <div className="functions">
        <button>fn1</button>
        <button>fn2</button>
        <button>fn3</button>
        <button>fn4</button>
        <button>fn5</button>
      </div>
      <button id='cred' onClick={() => setLogin(!login)}>
        {login ? "Go to Sign Up" : "Go to Login"}
      </button>
    </nav>
    <div id="inp-box">
      <h2>{login ? "Login" : "Sign Up"}</h2>
      {login ? (
        <div id="info">
          <div className='row'>
            <span>Username :</span>
            <input type="text" placeholder="Username" />
          </div>

          <div className='row'>
            <span>Password :</span>
            <input type="password" placeholder="Password" />
          </div>
        </div>
      ) : (
        <div id="info">

          <div className='row'>
            <span>Username :</span>
            <input type="text" placeholder="Username" />
          </div>

          <div className='row'>
            <span>New Password :</span>
            <input type="password" placeholder="New Password" />
          </div>

          <div className='row'>
            <span>Confirm Password :</span>
            <input type="password" placeholder="Confirm Password" />
          </div>
        </div>
      )}
      <button id='submit'>{login ? "Login" : "Sign Up"}</button>
    </div>
  </>
);
}

export default App;
