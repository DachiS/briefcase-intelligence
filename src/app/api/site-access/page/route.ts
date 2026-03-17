// src/app/api/site-access/page/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BRIEFCASE INTELLIGENCE — CLASSIFIED</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;800&family=Share+Tech+Mono&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      min-height: 100vh;
      background: #0d1117;
      color: #e8e6e1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      font-family: 'Share Tech Mono', monospace;
      position: relative;
      overflow: hidden;
    }

    /* Grid overlay */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      opacity: 0.03;
      background-image:
        linear-gradient(rgba(232,230,225,1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(232,230,225,1) 1px, transparent 1px);
      background-size: 50px 50px;
      pointer-events: none;
    }

    /* Red accent line */
    body::after {
      content: '';
      position: fixed;
      top: 0; right: 0;
      width: 40%; height: 3px;
      background: linear-gradient(to left, #cc1a2e, transparent);
    }

    .container {
      max-width: 480px;
      width: 100%;
      text-align: center;
      position: relative;
      z-index: 1;
    }

    .badge {
      display: inline-block;
      border: 1px solid rgba(204,26,46,0.4);
      color: #cc1a2e;
      font-size: 0.55rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      padding: 6px 16px;
      margin-bottom: 32px;
    }

    .logo {
      font-family: 'Barlow Condensed', sans-serif;
      font-size: clamp(3rem, 15vw, 5rem);
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      line-height: 0.9;
      margin-bottom: 8px;
    }

    .logo .c { color: #cc1a2e; }

    .subtitle {
      font-size: 0.6rem;
      letter-spacing: 0.5em;
      color: rgba(232,230,225,0.4);
      text-transform: uppercase;
      margin-bottom: 48px;
    }

    .status {
      font-size: 0.65rem;
      letter-spacing: 0.2em;
      color: rgba(232,230,225,0.3);
      margin-bottom: 40px;
      line-height: 1.8;
    }

    .status span {
      color: #cc1a2e;
    }

    .form-group {
      position: relative;
      margin-bottom: 16px;
    }

    input[type="text"] {
      width: 100%;
      background: #131920;
      border: 1px solid rgba(232,230,225,0.1);
      color: #e8e6e1;
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.85rem;
      letter-spacing: 0.15em;
      padding: 14px 20px;
      outline: none;
      transition: border-color 0.2s;
      text-align: center;
      text-transform: uppercase;
    }

    input[type="text"]:focus {
      border-color: rgba(204,26,46,0.5);
    }

    input[type="text"]::placeholder {
      color: rgba(232,230,225,0.2);
      letter-spacing: 0.3em;
    }

    button {
      width: 100%;
      background: #cc1a2e;
      color: #e8e6e1;
      border: none;
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.75rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      padding: 14px 24px;
      cursor: pointer;
      transition: background 0.2s;
    }

    button:hover { background: #a81525; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }

    .error {
      font-size: 0.6rem;
      color: #cc1a2e;
      letter-spacing: 0.15em;
      margin-top: 12px;
      display: none;
    }

    .error.visible { display: block; }

    .divider {
      border: none;
      border-top: 1px solid rgba(232,230,225,0.06);
      margin: 40px 0;
    }

    .footer {
      font-size: 0.5rem;
      letter-spacing: 0.2em;
      color: rgba(232,230,225,0.15);
    }

    /* Scanning line animation */
    @keyframes scan {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100vh); }
    }

    .scan-line {
      position: fixed;
      left: 0; right: 0;
      height: 2px;
      background: linear-gradient(to right, transparent, rgba(204,26,46,0.15), transparent);
      animation: scan 4s linear infinite;
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div class="scan-line"></div>

  <div class="container">
    <div class="badge">⬛ CLASSIFIED ACCESS REQUIRED</div>

    <div class="logo">
      BRIEF<span class="c">C</span>ASE
    </div>
    <div class="subtitle">Intelligence</div>

    <div class="status">
      SYSTEM STATUS: <span>OPERATIONAL</span><br>
      CLEARANCE REQUIRED TO PROCEED<br>
      ENTER ACCESS CODE BELOW
    </div>

    <div class="form-group">
      <input
        type="text"
        id="code"
        placeholder="Enter access code"
        autocomplete="off"
        autofocus
      />
    </div>

    <button id="submitBtn" onclick="submitCode()">
      REQUEST ACCESS →
    </button>

    <div class="error" id="error">
      ⚠ INVALID ACCESS CODE — CLEARANCE DENIED
    </div>

    <hr class="divider">

    <div class="footer">
      © ${new Date().getFullYear()} BRIEFCASE INTELLIGENCE · ALL CONTENT CLASSIFIED
    </div>
  </div>

  <script>
    const input = document.getElementById('code');
    const error = document.getElementById('error');
    const btn = document.getElementById('submitBtn');

    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') submitCode();
      error.classList.remove('visible');
    });

    async function submitCode() {
      const code = input.value.trim();
      if (!code) return;

      btn.disabled = true;
      btn.textContent = 'VERIFYING...';

      try {
        const res = await fetch('/api/site-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        const data = await res.json();

        if (data.success) {
          btn.textContent = 'ACCESS GRANTED ✓';
          setTimeout(() => window.location.reload(), 500);
        } else {
          error.classList.add('visible');
          btn.disabled = false;
          btn.textContent = 'REQUEST ACCESS →';
          input.value = '';
          input.focus();
        }
      } catch {
        error.classList.add('visible');
        btn.disabled = false;
        btn.textContent = 'REQUEST ACCESS →';
      }
    }
  </script>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  })
}
