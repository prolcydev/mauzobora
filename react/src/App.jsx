import React, { useEffect, useState } from 'react';

export default function App() {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    document.title = 'Mauzobora | Shop Management';
    return () => {};
  }, []);

  return (
    <main className="app-frame" aria-label="Mauzobora application">
      {!ready && !failed && (
        <div className="boot-screen" role="status">
          <div className="boot-brand"><span className="brand-symbol">m</span><span>Mauzobora</span></div>
          <span className="boot-spinner" />
          <p>Preparing your workspace</p>
        </div>
      )}
      {failed ? (
        <section className="frame-error">
          <div className="error-mark">!</div>
          <h1>We couldn't open your workspace</h1>
          <p>Check your connection and try again.</p>
          <button onClick={() => { setFailed(false); setReady(false); document.getElementById('mauzobora-workspace')?.contentWindow?.location.reload(); }}>Try again</button>
        </section>
      ) : (
        <iframe
          id="mauzobora-workspace"
          className="workspace-frame"
          src="/legacy-app.html"
          title="Mauzobora workspace"
          onLoad={() => setReady(true)}
          onError={() => setFailed(true)}
          allow="clipboard-read; clipboard-write; microphone"
        />
      )}
    </main>
  );
}