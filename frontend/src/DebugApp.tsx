import React from 'react'

function DebugApp() {
  return (
    <div style={{ padding: '20px', background: 'white', color: 'black' }}>
      <h1>Debug App - Testing Basic Rendering</h1>
      <nav className="nav">
        <a className="logo" href="/">Kolabolab</a>
        <div>
          <a className="nav-link" href="/startups">Startups</a>
          <a className="nav-link" href="/collaborate">Collaborate</a>
        </div>
      </nav>
      <main>
        <p>If you can see this, React is working!</p>
      </main>
      <footer className="footer">
        <div className="footer-bottom">
          © 2025 Kolabolab. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

export default DebugApp