import React from 'react';

function NotFound(){
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    color: '#b5d4ab',
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
    padding: '3rem',
    borderRadius: '2rem',
    backdropFilter: 'blur(15px)',
    border: '1px solid rgba(255, 255, 255, 0.342)'
  };

  return(
    <div style={style}>
      <h1 style={{fontSize: '4rem', margin: 0}}>404 :(</h1>
      <h2 style={{fontSize: '1.5rem', fontWeight: 300}}>Page Not Found</h2>
      <h3>The URL you entered does not exist.</h3>
    </div>
  );
}

export default NotFound;