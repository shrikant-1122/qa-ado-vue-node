<template>
  <div class="app">
    <header class="top">
      <h1>QA Chatbot + ADO Metrics</h1>
      <nav>
        <router-link to="/chat">Chat</router-link>
        <router-link to="/metrics">Metrics</router-link>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<style>
:root { --bg:#0b1220; --card:#0f172a; --ink:#e2e8f0; --muted:#94a3b8; --accent:#3b82f6; }
* { box-sizing: border-box; }
body { margin:0; background:var(--bg); color:var(--ink); font:14px/1.5 ui-sans-serif,system-ui; }
.app { max-width: 980px; margin: 0 auto; padding: 20px; }
.top { display:flex; align-items:center; justify-content:space-between; gap:10px; }
.top nav a { color: var(--ink); text-decoration: none; margin-left: 12px; padding: 6px 10px; border-radius: 8px; }
.top nav a.router-link-active { background: var(--accent); color: white; }
main { margin-top: 20px; }
.card { background: var(--card); border:1px solid #1f2937; border-radius: 14px; padding: 14px; }
.input, textarea { width: 100%; padding: 10px; border-radius: 12px; border:1px solid #334155; background:#0b1328; color: var(--ink); }
.button { background: var(--accent); color: white; border: none; padding: 8px 12px; border-radius: 10px; cursor: pointer; }
.row { display:flex; gap:10px; align-items:center; }
.grid { display:grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.kv { font-size:12px; color: var(--muted); }
</style>
